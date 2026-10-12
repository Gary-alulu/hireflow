import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import SavedCandidate from '@/models/SavedCandidate';
import User from '@/models/User';
import CandidateProfile from '@/models/CandidateProfile';
import { getSession } from '@/lib/auth';
import { normalizeTags } from '@/lib/tags';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function assertRecruiter() {
  const session = await getSession();
  if (!session || session.role !== 'recruiter') {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, error: null };
}

function serialize(saved) {
  const candidate = saved.candidateId || {};
  const profile = saved.candidateProfileId || {};
  return {
    _id: saved._id,
    savedAt: saved.createdAt,
    note: saved.note || '',
    tags: saved.tags || [],
    source: saved.source || 'search',
    candidate: {
      _id: candidate._id,
      name: candidate.name || 'Candidate',
      email: candidate.email || '',
    },
    profile: {
      headline: profile.headline || '',
      location: profile.location || '',
      skills: profile.skills || [],
      cvUrl: profile.cvUrl || '',
      experience: (profile.experience || []).map((e) => ({ title: e?.title || '', company: e?.company || '' })),
    },
  };
}

export async function GET(request) {
  try {
    const { session, error } = await assertRecruiter();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const tag = searchParams.get('tag')?.trim() || '';

    await connectToDatabase();
    const query = { recruiterId: session.userId };

    const docQuery = SavedCandidate.find(query)
      .populate('candidateId', 'name email role')
      .populate('candidateProfileId', 'headline location skills cvUrl experience')
      .sort({ createdAt: -1 })
      .lean();

    let items = await docQuery;

    const searchable = (item) => {
      const candidate = item.candidateId || {};
      const profile = item.candidateProfileId || {};
      return `${candidate.name || ''} ${profile.headline || ''} ${(profile.skills || []).join(' ')} ${profile.location || ''} ${item.note || ''} ${(item.tags || []).join(' ')}`
        .toLowerCase();
    };
    const qTerms = q ? q.toLowerCase().split(/\s+/).filter(Boolean) : [];
    if (qTerms.length) items = items.filter((item) => qTerms.every((term) => searchable(item).includes(term)));
    if (tag) items = items.filter((item) => (item.tags || []).some((t) => t.toLowerCase() === tag.toLowerCase()));

    const saved = items.map(serialize);
    return NextResponse.json({ saved }, { status: 200 });
  } catch (err) {
    console.error('Talent pool fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { session, error } = await assertRecruiter();
    if (error) return error;

    const { candidateId } = await request.json().catch(() => ({}));
    if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
      return NextResponse.json({ error: 'candidateId is required' }, { status: 400 });
    }

    await connectToDatabase();
    const candidate = await User.findById(candidateId).select('role name email').lean();
    if (!candidate || candidate.role !== 'candidate') {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const profile = await CandidateProfile.findOne({ userId: candidateId }).select('headline location skills cvUrl experience').lean();

    const saved = await SavedCandidate.findOneAndUpdate(
      { recruiterId: session.userId, candidateId },
      {
        $setOnInsert: {
          recruiterId: session.userId,
          companyId: session.companyId,
          candidateId,
          candidateProfileId: profile?._id || null,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    const doc = saved && typeof saved.toObject === 'function' ? saved.toObject() : saved;
    const serialized = serialize({ ...doc, candidateId: candidate, candidateProfileId: profile });
    return NextResponse.json(
      { message: 'Candidate saved to your talent pool', saved: serialized },
      { status: 201 }
    );
  } catch (err) {
    console.error('Save candidate error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { session, error } = await assertRecruiter();
    if (error) return error;

    const body = await request.json().catch(() => ({}));
    const id = body.savedId;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'savedId is required' }, { status: 400 });
    }

    await connectToDatabase();
    const update = {};
    if (typeof body.note === 'string') update.note = body.note.slice(0, 2000);
    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags)) {
        return NextResponse.json({ error: 'tags must be an array' }, { status: 400 });
      }
      update.tags = normalizeTags(body.tags);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const found = await SavedCandidate.findOneAndUpdate(
      { _id: id, recruiterId: session.userId },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!found) {
      return NextResponse.json({ error: 'Saved candidate not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Updated', saved: found }, { status: 200 });
  } catch (err) {
    console.error('Update saved candidate error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { session, error } = await assertRecruiter();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const savedId = searchParams.get('savedId');
    const candidateId = searchParams.get('candidateId');

    await connectToDatabase();
    const query = { recruiterId: session.userId };
    if (savedId) query._id = savedId;
    else if (candidateId) query.candidateId = candidateId;
    else return NextResponse.json({ error: 'savedId or candidateId required' }, { status: 400 });

    const result = await SavedCandidate.deleteOne(query);
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Saved candidate not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Candidate removed from talent pool' }, { status: 200 });
  } catch (err) {
    console.error('Remove candidate error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}