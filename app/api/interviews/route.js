import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Interview from '@/models/Interview';
import Application from '@/models/Application';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notify';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, jobId, candidateId, interviewType, scheduledDate, locationOrLink, notes, interviewerName } = body;

    await connectToDatabase();

    // candidateId is optional from the client: when omitted (or not a valid id),
    // derive it from the application so the interview is always linked correctly.
    let resolvedCandidateId = candidateId;
    if (!mongoose.Types.ObjectId.isValid(resolvedCandidateId)) {
      const application = await Application.findById(applicationId).select('candidateId').lean();
      resolvedCandidateId = application?.candidateId;
    }
    if (!resolvedCandidateId) {
      return NextResponse.json({ error: 'candidateId is required' }, { status: 400 });
    }

    const interview = await Interview.create({
      applicationId,
      jobId,
      candidateId: resolvedCandidateId,
      recruiterId: session.userId,
      interviewType,
      scheduledDate,
      locationOrLink,
      notes,
      interviewerName,
      status: 'Scheduled',
    });

    // Notify the candidate + email them with the details, and surface the
    // interview on their dashboard right away.
    const candidate = await User.findById(resolvedCandidateId).select('email name jobTitle').lean();
    await createNotification({
      userId: resolvedCandidateId,
      role: 'candidate',
      type: 'interview_scheduled',
      title: 'Interview scheduled',
      message: `You have an interview scheduled. Check your interview dashboard for details.`,
      link: '/dashboard/candidate/interviews',
      email: candidate?.email,
    });

    return NextResponse.json({ message: 'Interview scheduled', interview }, { status: 201 });
  } catch (error) {
    console.error('Interview creation error:', error);
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
    
    let filter = {};
    if (session.role === 'recruiter') {
      filter.recruiterId = session.userId;
    } else {
      filter.candidateId = session.userId;
    }

    const interviews = await Interview.find(filter)
      .populate('jobId', 'title companyId location')
      .populate('candidateId', 'name email')
      .populate('recruiterId', 'name email')
      .sort({ scheduledDate: 1 }) // Sort by soonest
      .lean();

    return NextResponse.json({ interviews }, { status: 200 });
  } catch (error) {
    console.error('Fetch interviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
