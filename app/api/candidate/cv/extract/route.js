import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import CandidateProfile from '@/models/CandidateProfile';
import { getSession } from '@/lib/auth';
import { extractResumeInfo } from '@/lib/ai';
import { extractUploadText } from '@/lib/upload';

const MAX_TEXT = 15000;

// Returns structured profile suggestions (skills, experience, education, summary)
// extracted from resume text. The candidate reviews these before merging them into
// their profile — extraction never writes to the profile on its own.
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const profile = await CandidateProfile.findOne({ userId: session.userId }).lean();
    if (!profile?.cvText) {
      return NextResponse.json(
        { error: 'No CV text available. Upload a .txt CV first.' },
        { status: 400 }
      );
    }

    const suggestions = await extractResumeInfo(profile.cvText);
    return NextResponse.json({ suggestions, fromStored: true }, { status: 200 });
  } catch (error) {
    console.error('Extract CV error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let text = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('cv');
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        text = extractUploadText(buffer, file.name || '');
      }
    } else {
      const body = await request.json().catch(() => ({}));
      text = String(body.text || '').trim();
      if (!text && body.useStoredText) {
        await connectToDatabase();
        const profile = await CandidateProfile.findOne({ userId: session.userId }).lean();
        text = profile?.cvText || '';
      }
    }

    if (!text) {
      return NextResponse.json(
        { error: 'No resume text to extract from. Upload a .txt resume or paste its text.' },
        { status: 400 }
      );
    }

    const suggestions = await extractResumeInfo(text.slice(0, MAX_TEXT));
    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error) {
    console.error('Extract CV error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}