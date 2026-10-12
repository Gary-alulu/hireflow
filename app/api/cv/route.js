import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import connectToDatabase from '@/lib/db';
import CandidateProfile from '@/models/CandidateProfile';
import Application from '@/models/Application';
import { getSession } from '@/lib/auth';
import { resumeFilePaths } from '@/lib/upload';

const RESUME_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'rtf', 'txt']);
const RESUME_MIME = {
  txt: 'text/plain; charset=utf-8',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  rtf: 'application/rtf',
};

// Streams a stored resume through an authenticated endpoint instead of exposing
// raw files under /public. Access rules:
//   - candidates: only their own resume (own profile or own applications)
//   - recruiters: any resume (the recruiting team reviews applicant CVs)
// Outside those roles the file is never served.
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file') || '';
    if (!fileName || path.basename(fileName) !== fileName) {
      return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
    }

    const ext = (fileName.split('.').pop() || '').toLowerCase();
    if (!RESUME_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: 'Unsupported file' }, { status: 400 });
    }

    if (session.role === 'candidate') {
      await connectToDatabase();
      const [profile, apps] = await Promise.all([
        CandidateProfile.findOne({ userId: session.userId }).select('cvUrl').lean(),
        Application.find({ candidateId: session.userId })
          .select('cvUrl candidateInfo.cvUrl')
          .lean(),
      ]);
      const owned = new Set();
      for (const value of [profile?.cvUrl, ...(apps || []).map((a) => a.cvUrl), ...(apps || []).map((a) => a.candidateInfo?.cvUrl)]) {
        if (!value) continue;
        owned.add(path.basename(String(value).split('?')[0]));
      }
      if (!owned.has(fileName)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    let buffer;
    for (const filePath of resumeFilePaths(`/uploads/${fileName}`)) {
      try {
        buffer = await readFile(filePath);
        break;
      } catch {
        // try next location
      }
    }
    if (!buffer) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': RESUME_MIME[ext],
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (error) {
    console.error('CV fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}