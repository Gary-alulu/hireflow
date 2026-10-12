import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import { isApplicationStatus, serializeApplicationStatuses } from '@/lib/pipeline';
import { createNotification } from '@/lib/notify';
import { normalizeTags } from '@/lib/tags';

async function assertCanManage({ id }) {
  const session = await getSession();
  if (!session) return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  await connectToDatabase();
  const application = await Application.findById(id).select('jobId candidateId status hiredAt');
  if (!application) {
    return { session, error: NextResponse.json({ error: 'Application not found' }, { status: 404 }) };
  }

  if (session.role === 'recruiter') {
    const job = await Job.findOne({ _id: application.jobId, recruiterId: session.userId }).select('_id');
    if (!job) {
      return { session, error: NextResponse.json({ error: 'Forbidden: not your job posting' }, { status: 403 }) };
    }
  }

  return { session, application };
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { session, application, error } = await assertCanManage({ id });
    if (error) return error;
    if (session.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized. Only recruiters can update applications.' }, { status: 401 });
    }

    const { status, recruiterNotes, tags } = await request.json();

    if (status !== undefined && !isApplicationStatus(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (recruiterNotes !== undefined) updateFields.recruiterNotes = recruiterNotes;
    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return NextResponse.json({ error: 'tags must be an array' }, { status: 400 });
      }
      updateFields.tags = normalizeTags(tags);
    }

    if (status === 'Hired' && application && application.status !== 'Hired' && !application.hiredAt) {
      updateFields.hiredAt = new Date();
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: 'No updatable fields provided', statuses: serializeApplicationStatuses() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updated = await Application.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    // Notify the candidate whenever a recruiter moves their application along
    // the pipeline (including an offer), but not for routine recruiter-notes.
    if (status !== undefined && status !== application.status) {
      const [jobTitle, candidate] = await Promise.all([
        Job.findById(application.jobId).select('title').lean(),
        User.findById(application.candidateId).select('email name').lean(),
      ]);
      if (candidate) {
        await createNotification({
          userId: application.candidateId,
          role: 'candidate',
          type: status === 'Offer' ? 'offer_received' : 'status_changed',
          title:
            status === 'Offer'
              ? 'You have an offer!'
              : `Application status: ${status}`,
          message:
            status === 'Offer'
              ? `Great news! ${jobTitle?.title || 'your application'} has been moved to Offer. Next steps are on the way.`
              : `Your application for ${jobTitle?.title || 'the position'} was updated to ${status}.`,
          link: '/dashboard/candidate/applications',
          email: candidate.email,
        });
      }
    }

    return NextResponse.json({ message: 'Application updated', application: updated }, { status: 200 });
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { session, application, error } = await assertCanManage({ id });
    if (error) return error;

    if (session.role === 'candidate' && application && application.candidateId) {
      const isOwner = application.candidateId.toString() === session.userId;
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    await connectToDatabase();

    const full = await Application.findById(id)
      .select(session.role === 'candidate' ? '-recruiterNotes -tags' : '')
      .populate('jobId', 'title location department companyId')
      .populate('candidateId', 'name email');

    if (!full) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ application: full }, { status: 200 });
  } catch (error) {
    console.error('Fetch application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
