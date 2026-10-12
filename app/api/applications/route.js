import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Application from '@/models/Application';
import CandidateProfile from '@/models/CandidateProfile';
import Job from '@/models/Job';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import { calculateMatchScore } from '@/lib/ai';
import { persistResumeUpload } from '@/lib/upload';
import { createNotification } from '@/lib/notify';
import {
  DEFAULT_APPLICATION_STATUS,
  serializeApplicationStatuses,
} from '@/lib/pipeline';

const MAX_COVER_LETTER = 4000;

// Accepts either multipart/form-data (with an optional CV file) or plain JSON.
async function parseApplicationBody(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const fd = await request.formData();
    const body = {
      jobId: fd.get('jobId') || '',
      coverLetter: fd.get('coverLetter') || '',
      cvUrl: fd.get('cvUrl') || '',
      portfolioUrl: fd.get('portfolioUrl') || '',
    };
    const answers = fd.get('answers');
    if (answers) {
      try {
        body.answers = JSON.parse(answers);
      } catch {
        body.answers = null;
      }
    }
    const cvFile = fd.get('cvFile');
    const file = cvFile && cvFile.size > 0 ? cvFile : null;
    return { body, file };
  }
  return { body: await request.json(), file: null };
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized. Only candidates can apply.' }, { status: 401 });
    }

    const { body, file } = await parseApplicationBody(request);
    const { jobId } = body;
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json({ error: 'Job ID is not a valid identifier' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if profile exists, otherwise force them to create one? 
    // For Phase 1, we allow applying and they can update profile later, or we require it.
    // Let's check if they have a profile, if not, create an empty one.
    let profile = await CandidateProfile.findOne({ userId: session.userId });
    if (!profile) {
      profile = await CandidateProfile.create({ userId: session.userId });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      candidateId: session.userId,
    });

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 });
    }

    // Fetch job details for AI matching
    const job = await Job.findById(jobId).select(
      'status title applicationDeadline skills department experienceLevel location recruiterId customQuestions'
    );
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'active') {
      return NextResponse.json({ error: 'This job is no longer accepting applications' }, { status: 400 });
    }

    if (job.applicationDeadline && new Date(job.applicationDeadline).getTime() < Date.now()) {
      return NextResponse.json({ error: 'The application deadline for this job has passed' }, { status: 400 });
    }

    // Resolve which resume this application carries: an uploaded file wins, then a
    // manual link, then the candidate's resume on file.
    let cvUrl = body.cvUrl || profile.cvUrl || '';
    if (file) {
      try {
        cvUrl = await persistResumeUpload(file, { userId: session.userId });
      } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    const coverLetter = typeof body.coverLetter === 'string' ? body.coverLetter.trim().slice(0, MAX_COVER_LETTER) : '';
    const portfolioUrl = typeof body.portfolioUrl === 'string' ? body.portfolioUrl.trim().slice(0, 2000) : '';

    const answers = Array.isArray(body.answers)
      ? body.answers
          .map((a) => ({
            question: String((a || {}).question || '').trim().slice(0, 500),
            answer: String((a || {}).answer || '').trim().slice(0, 4000),
          }))
          .filter((a) => a.question && a.answer)
      : [];

    // Custom application questions: required ones must be answered.
    const requiredQuestions = (job.customQuestions || []).filter((q) => q.required);
    if (requiredQuestions.length > 0) {
      const givenQuestionSet = new Set(answers.map((a) => a.question.trim().toLowerCase()));
      const unanswered = requiredQuestions.filter(
        (q) => !givenQuestionSet.has(String(q.question).trim().toLowerCase())
      );
      if (unanswered.length > 0) {
        return NextResponse.json(
          { error: `Please answer all required application questions (${unanswered.length} missing).` },
          { status: 400 }
        );
      }
    }

    // Snapshot the profile used at apply time so the application stays readable
    // even if the candidate changes their profile later.
    const candidateInfo = {
      name: session.name,
      email: session.email,
      phone: profile.phone || '',
      location: profile.location || '',
      headline: profile.headline || '',
      skills: profile.skills || [],
      experience: profile.experience || [],
      portfolioUrl: profile.portfolioUrl || '',
      linkedInUrl: profile.linkedInUrl || '',
      githubUrl: profile.githubUrl || '',
      cvUrl,
    };

    // Calculate AI Match Score
    const matchAnalysis = await calculateMatchScore(job, profile);

    // Create application
    const application = await Application.create({
      jobId,
      candidateId: session.userId,
      cvUrl,
      coverLetter,
      portfolioUrl,
      answers,
      candidateInfo,
      status: DEFAULT_APPLICATION_STATUS,
      matchScore: matchAnalysis.score,
      matchReasoning: matchAnalysis.reasoning,
      matchStrengths: matchAnalysis.strengths || [],
      matchGaps: matchAnalysis.gaps || [],
      matchRecommendation: matchAnalysis.recommendation || matchAnalysis.reasoning,
    });

    // Notify both sides: the candidate gets an "application received" confirmation,
    // the recruiter learns a new application landed.
    const recruiter = job.recruiterId
      ? await User.findById(job.recruiterId).select('name email').lean()
      : null;
    await createNotification({
      userId: job.recruiterId,
      role: 'recruiter',
      type: 'new_application',
      title: `New application for ${job.title}`,
      message: `${session.name} applied for ${job.title}.`,
      link: `/dashboard/recruiter/jobs/${jobId}/applicants`,
      email: recruiter?.email,
    });
    await createNotification({
      userId: session.userId,
      role: 'candidate',
      type: 'application_received',
      title: 'Application received',
      message: `Your application for ${job.title} has been received.`,
      link: '/dashboard/candidate/applications',
    });

    return NextResponse.json(
      { message: 'Application submitted', application, statuses: serializeApplicationStatuses() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const statuses = serializeApplicationStatuses();

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (session.role === 'candidate') {
      // Never expose internal recruiter notes or tags to candidates.
      const applications = await Application.find({ candidateId: session.userId })
        .select('-recruiterNotes -tags')
        .populate('jobId', 'title companyId location department')
        .sort({ createdAt: -1 });
      return NextResponse.json({ applications, statuses }, { status: 200 });
    }

    if (session.role === 'recruiter') {
      if (!jobId) {
        return NextResponse.json(
          { error: 'jobId is required for recruiters', statuses },
          { status: 400 }
        );
      }
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return NextResponse.json(
          { error: 'jobId is not a valid identifier', statuses },
          { status: 400 }
        );
      }
      const job = await Job.findById(jobId).select('recruiterId').lean();
      if (!job || job.recruiterId?.toString() !== session.userId) {
        return NextResponse.json(
          { error: 'Forbidden: you do not own this job', statuses },
          { status: 403 }
        );
      }
      const applications = await Application.find({ jobId })
        .select(
          'candidateId status matchScore matchReasoning matchStrengths matchGaps matchRecommendation cvUrl coverLetter portfolioUrl answers candidateInfo recruiterNotes tags createdAt'
        )
        .populate('candidateId', 'name email')
        .sort({ createdAt: -1 })
        .lean();
      return NextResponse.json({ applications, statuses }, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Forbidden', statuses },
      { status: 403 }
    );
  } catch (error) {
    console.error('Fetch applications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
