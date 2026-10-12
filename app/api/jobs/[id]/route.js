import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Job from '@/models/Job';
import Company from '@/models/Company';
import Application from '@/models/Application';
import { getSession } from '@/lib/auth';
import { isJobFieldAllowed, normalizeJobFields, validateJobStatusTransition } from '@/lib/jobs';

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    const job = await Job.findById(id).populate('companyId', 'name logo');
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const job = await Job.findOne({ _id: id, recruiterId: session.userId }).select('status');
    if (!job) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
    }

    if (body.status !== undefined && !validateJobStatusTransition(job.status, body.status)) {
      return NextResponse.json(
        { error: `Cannot change job status from "${job.status}" to "${body.status}"` },
        { status: 400 }
      );
    }

    const fields = normalizeJobFields(body);
    for (const key of Object.keys(fields)) {
      if (!isJobFieldAllowed(key)) {
        return NextResponse.json({ error: `Field "${key}" cannot be updated` }, { status: 400 });
      }
    }

    const updated = await Job.findOneAndUpdate(
      { _id: id, recruiterId: session.userId },
      { $set: fields },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Job updated', job: updated }, { status: 200 });
  } catch (error) {
    console.error('Job update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    const job = await Job.findOneAndDelete({ _id: id, recruiterId: session.userId });
    if (!job) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
    }

    await Application.deleteMany({ jobId: id });

    return NextResponse.json({ message: 'Job deleted' }, { status: 200 });
  } catch (error) {
    console.error('Job delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
