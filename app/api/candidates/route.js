import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import CandidateProfile from '@/models/CandidateProfile';
import Job from '@/models/Job';
import Application from '@/models/Application';
import { getSession } from '@/lib/auth';
import { computeYearsOfExperience } from '@/lib/utils';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Search all candidate profiles (proactive sourcing). Retained for backwards
// compatibility with the recruiter "Candidate Network" browse flow.
async function searchAllCandidates(search, limit) {
  const aggregate = [
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $match: { 'user.role': 'candidate' } },
  ];

  if (search) {
    const regex = new RegExp(escapeRegExp(search), 'i');
    aggregate.push({
      $match: {
        $or: [
          { 'user.name': regex },
          { skills: regex },
          { 'experience.title': regex },
        ],
      },
    });
  }

  aggregate.push(
    {
      $project: {
        candidateId: '$userId',
        userId: { name: '$user.name', email: '$user.email' },
        profilePhoto: 1,
        location: 1,
        skills: 1,
        experience: { $map: { input: '$experience', as: 'exp', in: { title: '$$exp.title' } } },
      },
    },
    { $limit: limit }
  );

  return CandidateProfile.aggregate(aggregate);
}

// Search the recruiter's candidate pool = candidates who applied to jobs owned by
// the recruiter. Combines the application snapshot, its match analysis and the
// candidate's live profile, then applies structured filters.
async function searchPool({ session, q, skills, minMatchScore, maxMatchScore, minExperience, stage, location, jobId, appliedAfter, appliedBefore, limit, skip }) {
  if (jobId) {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return { error: NextResponse.json({ error: 'Invalid jobId' }, { status: 400 }) };
    }
    const job = await Job.findById(jobId).select('recruiterId').lean();
    if (!job || job.recruiterId?.toString() !== session.userId) {
      return { error: NextResponse.json({ error: 'Forbidden: not your job' }, { status: 403 }) };
    }
  }

  const recruiterMatch = { 'j.recruiterId': new mongoose.Types.ObjectId(session.userId) };
  if (jobId) recruiterMatch['j._id'] = new mongoose.Types.ObjectId(jobId);

  const rows = await Application.aggregate([
    { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'j' } },
    { $unwind: { path: '$j', preserveNullAndEmptyArrays: false } },
    { $match: recruiterMatch },
    { $lookup: { from: 'users', localField: 'candidateId', foreignField: '_id', as: 'u' } },
    { $unwind: { path: '$u', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'candidateprofiles', localField: 'candidateId', foreignField: 'userId', as: 'p' } },
    { $unwind: { path: '$p', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } },
    { $limit: 500 },
  ]);

  const qChecks = q
    ? q.toLowerCase().split(/\s+/).filter(Boolean)
    : [];
  const requiredSkills = (skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  const requiredLocation = location ? new RegExp(escapeRegExp(location), 'i') : null;
  const requiredStage = stage || null;
  const minScore = minMatchScore == null || !Number.isFinite(Number(minMatchScore)) ? null : Number(minMatchScore);
  const maxScore = maxMatchScore == null || !Number.isFinite(Number(maxMatchScore)) ? null : Number(maxMatchScore);
  const minYears = minExperience == null || !Number.isFinite(Number(minExperience)) ? null : Number(minExperience);
  const minDate = appliedAfter ? new Date(appliedAfter) : null;
  const maxDate = appliedBefore ? new Date(appliedBefore) : null;

  const results = [];
  for (const row of rows) {
    const profile = row.p || {};
    const snapshot = row.candidateInfo || {};
    const experience = (profile.experience && profile.experience.length ? profile.experience : snapshot.experience) || [];
    const years = computeYearsOfExperience(experience);
    const skillsList = Array.from(
      new Set([...(profile.skills || []), ...(snapshot.skills || [])].map((s) => String(s || '').trim()).filter(Boolean))
    );
    const name = snapshot.name || row.u?.name || 'Candidate';
    const email = snapshot.email || row.u?.email || '';
    const headline = snapshot.headline || profile.headline || experience[0]?.title || '';
    const locationValue = profile.location || snapshot.location || '';
    const appliedAt = row.createdAt ? new Date(row.createdAt) : null;
    const matchScore = row.matchScore;

    const searchable = `${name} ${email} ${headline} ${skillsList.join(' ')} ${locationValue} ${experience
      .map((e) => `${e.title || ''} ${e.company || ''}`)
      .join(' ')}`.toLowerCase();

    if (qChecks.length && !qChecks.every((term) => searchable.includes(term))) continue;
    if (requiredSkills.length && !requiredSkills.every((skill) => skillsList.some((s) => s.toLowerCase() === skill))) continue;
    if (requiredStage && row.status !== requiredStage) continue;
    if (requiredLocation && !requiredLocation.test(locationValue)) continue;
    if (minScore != null && !(typeof matchScore === 'number' && matchScore >= minScore)) continue;
    if (maxScore != null && !(typeof matchScore === 'number' && matchScore <= maxScore)) continue;
    if (minYears != null && years < minYears) continue;
    if (minDate && (!appliedAt || appliedAt < minDate)) continue;
    if (maxDate && (!appliedAt || appliedAt > maxDate)) continue;

    results.push({
      candidateId: row.candidateId,
      name,
      email,
      headline,
      location: locationValue,
      skills: skillsList,
      experience,
      experienceYears: years,
      profilePhoto: profile.profilePhoto || '',
      cvUrl: snapshot.cvUrl || profile.cvUrl || '',
      applicationId: row._id,
      jobId: row.j?._id,
      jobTitle: row.j?.title || '',
      status: row.status,
      matchScore,
      matchStrengths: row.matchStrengths || [],
      appliedAt: appliedAt ? appliedAt.toISOString() : null,
      recruiterNotes: row.recruiterNotes || '',
      tags: row.tags || [],
    });
  }

  const total = results.length;
  const slice = results.slice(skip, skip + limit);
  return { results: slice, total };
}

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pool = searchParams.get('pool') === 'true' || searchParams.get('pool') === '1';
    const search = searchParams.get('search')?.trim() || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 100);
    const skip = Math.max(parseInt(searchParams.get('skip') || '0', 10) || 0, 0);

    await connectToDatabase();

    if (pool) {
      const out = await searchPool({
        session,
        q: search,
        skills: (searchParams.get('skill') || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        minMatchScore: searchParams.get('minMatchScore'),
        maxMatchScore: searchParams.get('maxMatchScore'),
        minExperience: searchParams.get('minExperience'),
        stage: searchParams.get('stage'),
        location: searchParams.get('location'),
        jobId: searchParams.get('jobId'),
        appliedAfter: searchParams.get('appliedAfter'),
        appliedBefore: searchParams.get('appliedBefore'),
        limit,
        skip,
      });
      if (out.error) return out.error;
      return NextResponse.json({ candidates: out.results, total: out.total }, { status: 200 });
    }

    const candidates = await searchAllCandidates(search, limit);
    return NextResponse.json({ candidates }, { status: 200 });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}