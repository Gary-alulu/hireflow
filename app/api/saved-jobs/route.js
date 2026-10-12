import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import SavedJob from '@/models/SavedJob';
import Job from '@/models/Job';
import Company from '@/models/Company';
import { getSession } from '@/lib/auth';

async function requireCandidate() {
  const session = await getSession();
  if (!session || session.role !== 'candidate') return null;
  return session;
}

// GET /api/saved-jobs           -> all saved jobs for the candidate
// GET /api/saved-jobs?jobId=... -> { saved } for one job
export async function GET(request) {
  try {
    const session = await requireCandidate();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return NextResponse.json({ error: 'Job ID is not a valid identifier' }, { status: 400 });
      }
      const saved = await SavedJob.exists({ userId: session.userId, jobId });
      return NextResponse.json({ saved: Boolean(saved) }, { status: 200 });
    }

    const saved = await SavedJob.find({ userId: session.userId }).sort({ createdAt: -1 }).lean();
    const jobs = await Job.find({ _id: { $in: saved.map((s) => s.jobId) } })
      .populate('companyId', 'name logo industry')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error) {
    console.error('Fetch saved jobs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await requireCandidate();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await request.json();
    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json({ error: 'Job ID is not a valid identifier' }, { status: 400 });
    }

    await connectToDatabase();

    const job = await Job.findById(jobId).select('_id');
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await SavedJob.updateOne(
      { userId: session.userId, jobId },
      { $setOnInsert: { userId: session.userId, jobId } },
      { upsert: true }
    );

    return NextResponse.json({ saved: true }, { status: 200 });
  } catch (error) {
    console.error('Save job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await requireCandidate();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json({ error: 'Job ID is not a valid identifier' }, { status: 400 });
    }

    await connectToDatabase();
    await SavedJob.deleteOne({ userId: session.userId, jobId });

    return NextResponse.json({ saved: false }, { status: 200 });
  } catch (error) {
    console.error('Unsave job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}