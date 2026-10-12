import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Interview from '@/models/Interview';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notify';

const INTERVIEW_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'];

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid interview id' }, { status: 400 });
    }

    await connectToDatabase();
    const interview = await Interview.findById(id)
      .populate('jobId', 'title companyId location')
      .populate('candidateId', 'name email')
      .populate('recruiterId', 'name email');

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    // Only the recruiter who scheduled it or the candidate can view it.
    const isRecruiterOwner = session.role === 'recruiter' && interview.recruiterId?._id?.toString() === session.userId;
    const isCandidate = session.role === 'candidate' && interview.candidateId?._id?.toString() === session.userId;
    if (!isRecruiterOwner && !isCandidate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ interview }, { status: 200 });
  } catch (error) {
    console.error('Fetch interview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid interview id' }, { status: 400 });
    }

    const body = await request.json();
    const { status, scheduledDate, locationOrLink, notes, interviewerName, interviewType } = body;

    if (status !== undefined && !INTERVIEW_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid interview status' }, { status: 400 });
    }

    await connectToDatabase();
    const existing = await Interview.findOne({ _id: id, recruiterId: session.userId });
    if (!existing) {
      return NextResponse.json({ error: 'Forbidden: not your interview' }, { status: 403 });
    }

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (scheduledDate !== undefined) {
      const next = new Date(scheduledDate);
      if (Number.isNaN(next.getTime())) {
        return NextResponse.json({ error: 'Invalid scheduled date' }, { status: 400 });
      }
      updateFields.scheduledDate = next;
      // Changing the date reschedules the interview unless an explicit status was supplied.
      if (status === undefined && existing.status === 'Cancelled') {
        updateFields.status = 'Rescheduled';
      }
      const millisChanged = next.getTime() !== new Date(existing.scheduledDate).getTime();
      if (millisChanged && (status === undefined || status === 'Scheduled' || status === 'Rescheduled')) {
        updateFields.status = 'Rescheduled';
      }
    }
    if (locationOrLink !== undefined) updateFields.locationOrLink = locationOrLink;
    if (notes !== undefined) updateFields.notes = notes;
    if (interviewerName !== undefined) updateFields.interviewerName = interviewerName;
    if (interviewType !== undefined) updateFields.interviewType = interviewType;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: 'No updatable fields provided', statuses: INTERVIEW_STATUSES },
        { status: 400 }
      );
    }

    const interview = await Interview.findByIdAndUpdate(id, { $set: updateFields }, { returnDocument: 'after' })
      .populate('jobId', 'title')
      .populate('candidateId', 'name email');

    // Keep the candidate in the loop when an interview is rescheduled or cancelled.
    if (status === 'Rescheduled' || updateFields.status === 'Rescheduled') {
      await createNotification({
        userId: interview.candidateId?._id,
        role: 'candidate',
        type: 'interview_updated',
        title: 'Interview rescheduled',
        message: `Your interview for ${interview.jobId?.title || 'the position'} has been rescheduled to ${new Date(
          interview.scheduledDate
        ).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}.`,
        link: '/dashboard/candidate/interviews',
        email: interview.candidateId?.email,
      });
    } else if (status === 'Cancelled') {
      await createNotification({
        userId: interview.candidateId?._id,
        role: 'candidate',
        type: 'interview_updated',
        title: 'Interview cancelled',
        message: `Your interview for ${interview.jobId?.title || 'the position'} has been cancelled.`,
        link: '/dashboard/candidate/interviews',
        email: interview.candidateId?.email,
      });
    }

    return NextResponse.json({ message: 'Interview updated', interview }, { status: 200 });
  } catch (error) {
    console.error('Update interview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid interview id' }, { status: 400 });
    }

    await connectToDatabase();
    const interview = await Interview.findOneAndDelete({ _id: id, recruiterId: session.userId });
    if (!interview) {
      return NextResponse.json({ error: 'Forbidden: not your interview' }, { status: 403 });
    }

    return NextResponse.json({ message: 'Interview deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete interview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}