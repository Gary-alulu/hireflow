import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Message from '@/models/Message';
import Application from '@/models/Application';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notify';

const MAX_MESSAGE = 4000;

// Both participants of an application may send/read messages for it.
async function assertParticipant({ applicationId, session }) {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    return { error: NextResponse.json({ error: 'Invalid application id' }, { status: 400 }) };
  }
  const application = await Application.findById(applicationId)
    .select('jobId candidateId')
    .populate('jobId', 'recruiterId');
  if (!application) {
    return { error: NextResponse.json({ error: 'Application not found' }, { status: 404 }) };
  }

  const candidateOk = session.userId === application.candidateId?.toString();
  const recruiterOk = application.jobId?.recruiterId?.toString() === session.userId;
  if (!candidateOk && !recruiterOk) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { application };
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const applicationId = body.applicationId;
    const text = typeof body.body === 'string' ? body.body.trim() : '';

    if (!text) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }
    if (text.length > MAX_MESSAGE) {
      return NextResponse.json({ error: `Message is too long (max ${MAX_MESSAGE} characters)` }, { status: 400 });
    }

    await connectToDatabase();
    const { application, error } = await assertParticipant({ applicationId, session });
    if (error) return error;

    // The other side of the conversation is the target.
    const isCandidate = application.candidateId?.toString() === session.userId;
    const receiverId = isCandidate ? application.jobId.recruiterId : application.candidateId;

    const message = await Message.create({
      applicationId,
      senderId: session.userId,
      receiverId,
      body: text,
    });

    const receiver = await User.findById(receiverId).select('name email role');
    if (receiver) {
      const isRecruiterTarget = receiver.role === 'recruiter';
      await createNotification({
        userId: receiverId,
        role: receiver.role,
        type: isRecruiterTarget ? 'candidate_message' : 'recruiter_message',
        title: isRecruiterTarget ? `New candidate response from ${session.name}` : `New message from ${session.name}`,
        message: text,
        email: receiver.email,
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    if (!applicationId) {
      return NextResponse.json({ error: 'applicationId is required' }, { status: 400 });
    }

    await connectToDatabase();
    const { application, error } = await assertParticipant({ applicationId, session });
    if (error) return error;

    const messages = await Message.find({ applicationId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name role')
      .lean();

    return NextResponse.json({ messages, applicationId }, { status: 200 });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}