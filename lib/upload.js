import { writeFile, mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';

const ALLOWED_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'rtf', 'txt']);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Resume files live OUTSIDE public/ so they are never served statically. They are
// streamed only through the authenticated /api/cv route (owner candidate or any
// recruiter on the hiring team). cvUrl values below are logical paths of the form
// "/uploads/<name>" — the exact public URL is /api/cv?file=<name>.
const RESUME_DIR = () => path.join(process.cwd(), 'data', 'uploads');
const LEGACY_PUBLIC_DIR = () => path.join(process.cwd(), 'public', 'uploads');

// Persists an uploaded resume into the private uploads dir and returns its logical
// public path. Throws a user-facing error message when the upload is invalid.
export async function persistResumeUpload(file, { userId }) {
  const originalName = String(file.name || '').replace(/[^a-zA-Z0-9._-]/g, '_');
  const ext = (originalName.split('.').pop() || '').toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error('Unsupported file type. Please upload a PDF, DOC, DOCX, RTF or TXT file.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File is too large. Maximum size is 5 MB.');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const savedName = `cv-${userId}-${Date.now()}.${ext}`;
  const dir = RESUME_DIR();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, savedName), buffer);

  return `/uploads/${savedName}`;
}

export const MAX_RESUME_BYTES = MAX_FILE_SIZE;

// Extracts plain text from a resume buffer so downstream AI/profile extraction has
// something to work with. Only .txt yields raw text without an external parser.
export function extractUploadText(buffer, originalName) {
  const ext = (String(originalName || '').split('.').pop() || '').toLowerCase();
  if (ext !== 'txt') return '';
  return buffer.toString('utf8');
}

// Best-effort removal of an uploaded resume from the private uploads dir (and the
// legacy public/uploads location, for files saved before storage was locked down).
// Missing files are tolerated so cleanup is safe on repeated runs.
export async function deleteUploadedResume(urlPath) {
  if (!urlPath || !urlPath.startsWith('/uploads/')) return;
  const safeName = path.basename(urlPath);
  for (const dir of [RESUME_DIR(), LEGACY_PUBLIC_DIR()]) {
    try {
      await unlink(path.join(dir, /* turbopackIgnore: true */ safeName));
    } catch (error) {
      if (error && error.code !== 'ENOENT') {
        console.error('Resume delete error:', error);
      }
    }
  }
}

// Absolute path of a stored resume (bundler/reserve logic; used by /api/cv).
export function resumeFilePaths(logicalPath) {
  const safeName = logicalPath && logicalPath.startsWith('/uploads/')
    ? path.basename(logicalPath)
    : '';
  if (!safeName) return [];
  return [path.join(RESUME_DIR(), safeName), path.join(LEGACY_PUBLIC_DIR(), safeName)];
}