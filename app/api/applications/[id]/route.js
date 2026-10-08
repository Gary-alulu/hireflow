import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Application from '@/models/Application';
import { getSession } from '@/lib/auth';
import { isApplicationStatus, serializeApplicationStatuses } from '@/lib/pipeline';

export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status, recruiterNotes } = await request.json();

    if (status !== undefined && !isApplicationStatus(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (recruiterNotes !== undefined) updateFields.recruiterNotes = recruiterNotes;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: 'No updatable fields provided', statuses: serializeApplicationStatuses() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const application = await Application.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Application updated', application }, { status: 200 });
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await connectToDatabase();

    const application = await Application.findById(id)
      .populate('jobId', 'title location department companyId')
      .populate('candidateId', 'name email');

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ application }, { status: 200 });
  } catch (error) {
    console.error('Fetch application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
