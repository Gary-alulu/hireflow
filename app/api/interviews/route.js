import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Interview from '@/models/Interview';
import { getSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, jobId, candidateId, interviewType, scheduledDate, locationOrLink, notes } = body;

    await connectToDatabase();

    const interview = await Interview.create({
      applicationId,
      jobId,
      candidateId,
      recruiterId: session.userId,
      interviewType,
      scheduledDate,
      locationOrLink,
      notes,
      status: 'Scheduled',
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
      .sort({ scheduledDate: 1 }); // Sort by soonest

    return NextResponse.json({ interviews }, { status: 200 });
  } catch (error) {
    console.error('Fetch interviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
