import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Job from '@/models/Job';
import { getSession } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    // params needs to be awaited in Next.js 15+ but we'll stick to Next.js 14 conventions for this phase
    const id = params.id;
    
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
    const id = params.id;
    const body = await request.json();

    const job = await Job.findOneAndUpdate(
      { _id: id, recruiterId: session.userId },
      { $set: body },
      { new: true }
    );

    if (!job) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Job updated', job }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
