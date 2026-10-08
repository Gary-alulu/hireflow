import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Application from '@/models/Application';
import CandidateProfile from '@/models/CandidateProfile';
import Job from '@/models/Job';
import { getSession } from '@/lib/auth';
import { calculateMatchScore } from '@/lib/ai';
import {
  DEFAULT_APPLICATION_STATUS,
  serializeApplicationStatuses,
} from '@/lib/pipeline';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized. Only candidates can apply.' }, { status: 401 });
    }

    const { jobId } = await request.json();
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    if (!Application.isValidObjectId(jobId)) {
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
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Calculate AI Match Score
    const matchAnalysis = await calculateMatchScore(job, profile);

    // Create application
    const application = await Application.create({
      jobId,
      candidateId: session.userId,
      cvUrl: profile.cvUrl || '',
      status: DEFAULT_APPLICATION_STATUS,
      matchScore: matchAnalysis.score,
      matchReasoning: matchAnalysis.reasoning,
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
      const applications = await Application.find({ candidateId: session.userId })
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
      if (!Application.isValidObjectId(jobId)) {
        return NextResponse.json(
          { error: 'jobId is not a valid identifier', statuses },
          { status: 400 }
        );
      }
      const applications = await Application.find({ jobId })
        .populate('candidateId', 'name email')
        .sort({ createdAt: -1 });
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
