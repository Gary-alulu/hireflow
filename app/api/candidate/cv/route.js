import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import CandidateProfile from '@/models/CandidateProfile';
import { getSession } from '@/lib/auth';
import { persistResumeUpload, extractUploadText, deleteUploadedResume } from '@/lib/upload';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    let profile = await CandidateProfile.findOne({ userId: session.userId });
    if (!profile) {
      profile = await CandidateProfile.create({ userId: session.userId });
    }

    return NextResponse.json(
      {
        cv: {
          cvUrl: profile.cvUrl || '',
          cvTextPresent: Boolean(profile.cvText),
          updatedAt: profile.updatedAt || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch CV error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('cv');
    if (!file) {
      return NextResponse.json({ error: 'No CV file provided' }, { status: 400 });
    }

    await connectToDatabase();
    const existing = await CandidateProfile.findOne({ userId: session.userId });

    const cvUrl = await persistResumeUpload(file, { userId: session.userId });

    // Replacing a CV: drop the previous upload and its parsed text.
    if (existing) {
      await deleteUploadedResume(existing.cvUrl);
      existing.cvText = undefined;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cvText = extractUploadText(buffer, file.name);

    const update = cvText ? { $set: { cvUrl, cvText } } : { $set: { cvUrl }, $unset: { cvText: 1 } };
    await CandidateProfile.findOneAndUpdate({ userId: session.userId }, update, { upsert: true });

    return NextResponse.json(
      { message: 'CV uploaded', cvUrl, fileName: String(file.name || ''), textExtracted: Boolean(cvText) },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload CV error:', error);
    const clientError =
      error && typeof error.message === 'string' &&
      (error.message.startsWith('Unsupported') || error.message.includes('too large'));
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: clientError ? 400 : 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const profile = await CandidateProfile.findOne({ userId: session.userId });
    if (profile) {
      // Unset first, then remove the stored file using the previously saved url.
      const previousUrl = profile.cvUrl;
      await CandidateProfile.updateOne({ userId: session.userId }, { $unset: { cvUrl: 1, cvText: 1 } });
      await deleteUploadedResume(previousUrl);
    }

    return NextResponse.json({ message: 'CV deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete CV error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}