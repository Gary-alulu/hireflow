import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Job from '@/models/Job';
import { getSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, department, employmentType, location, workplaceType, 
      salaryRange, description, responsibilities, requirements, 
      skills, experienceLevel, status 
    } = body;

    await connectToDatabase();

    const job = await Job.create({
      title,
      department,
      employmentType,
      location,
      workplaceType,
      salaryRange,
      description,
      responsibilities: responsibilities.split('\n').filter(r => r.trim()),
      requirements: requirements.split('\n').filter(r => r.trim()),
      skills: skills.split(',').map(s => s.trim()).filter(s => s),
      experienceLevel,
      status: status || 'draft',
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

    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
