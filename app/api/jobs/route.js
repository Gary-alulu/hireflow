import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Job from '@/models/Job';
import Application from '@/models/Application';
import { getSession } from '@/lib/auth';
import { JOB_STATUSES, normalizeJobFields } from '@/lib/jobs';

export async function POST(request) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    await connectToDatabase();

    const fields = normalizeJobFields(body);

    // Only new roles can be drafted or published immediately.
    if (fields.status !== undefined && fields.status !== 'draft' && fields.status !== 'active') {
      return NextResponse.json({ error: 'A new job can only be saved as a draft or published' }, { status: 400 });
    }

    const status = fields.status || 'draft';
    if (!JOB_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid job status' }, { status: 400 });
    }

    const job = await Job.create({
      ...fields,
      status,
      companyId: session.companyId,
      recruiterId: session.userId,
    });

    return NextResponse.json({ message: 'Job created successfully', job }, { status: 201 });
  } catch (error) {
    console.error('Job creation error:', error);
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

    const { searchParams } = new URL(request.url);
    const filter = {};

    // If recruiter, fetch their jobs. If candidate, maybe fetch active jobs.
    if (session.role === 'recruiter') {
      filter.recruiterId = session.userId;
    } else {
      filter.status = 'active'; // Candidates only see active jobs
    }

    const projection = {
      title: 1,
      department: 1,
      location: 1,
      workplaceType: 1,
      employmentType: 1,
      status: 1,
      createdAt: 1,
    };

    const jobs = await Job.find(filter, projection).sort({ createdAt: -1 }).lean();

    let recruiterJobs = jobs;
    if (session.role === 'recruiter' && jobs.length > 0) {
      const ids = jobs.map((j) => j._id);
      const counts = await Application.aggregate([
        { $match: { jobId: { $in: ids } } },
        { $group: { _id: '$jobId', count: { $sum: 1 } } },
      ]);
      const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
      recruiterJobs = jobs.map((j) => ({
        ...j,
        applicationCount: countMap[String(j._id)] || 0,
      }));
    }

    return NextResponse.json({ jobs: recruiterJobs }, { status: 200 });
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
