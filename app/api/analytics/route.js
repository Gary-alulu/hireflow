import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Job from '@/models/Job';
import Application from '@/models/Application';
import Interview from '@/models/Interview';
import { getSession } from '@/lib/auth';
import { APPLICATION_STATUSES } from '@/lib/pipeline';

const EMPTY_PIPELINE = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0]));
const GROWTH_DAYS = 30;

function isoDay(date) {
  return new Date(date).toISOString().slice(0, 10);
}

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const jobs = await Job.find({ recruiterId: session.userId }).select('title status').lean();
    const jobIds = jobs.map((job) => job._id);
    const totalJobs = jobs.length;
    const publishedJobs = jobs.filter((job) => job.status !== 'draft').length;

    const pipeline = { ...EMPTY_PIPELINE };
    const perJob = new Map(
      jobs.map((job) => [
        String(job._id),
        {
          jobId: String(job._id),
          title: job.title,
          status: job.status,
          applications: 0,
          byStage: { ...EMPTY_PIPELINE },
          interviews: 0,
        },
      ])
    );

    let totalApplications = 0;
    let averageMatchScore = 0;
    let timeToHireDays = null;

    if (totalJobs > 0) {
      const growthStart = new Date(Date.now() - GROWTH_DAYS * 24 * 60 * 60 * 1000);
      const [statusAgg, scoreAgg, growthAgg, hireAgg, interviewAgg] = await Promise.all([
        Application.aggregate([
          { $match: { jobId: { $in: jobIds } } },
          { $group: { _id: { jobId: '$jobId', status: '$status' }, count: { $sum: 1 } } },
        ]),
        Application.aggregate([
          { $match: { jobId: { $in: jobIds }, matchScore: { $type: 'number' } } },
          { $group: { _id: null, total: { $sum: '$matchScore' }, count: { $sum: 1 } } },
        ]),
        Application.aggregate([
          { $match: { jobId: { $in: jobIds }, createdAt: { $gte: growthStart } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Application.aggregate([
          { $match: { jobId: { $in: jobIds }, status: 'Hired' } },
          {
            $project: {
              days: {
                $divide: [
                  { $subtract: [{ $ifNull: ['$hiredAt', '$updatedAt'] }, '$createdAt'] },
                  86400000,
                ],
              },
            },
          },
          { $group: { _id: null, avgDays: { $avg: '$days' } } },
        ]),
        Interview.aggregate([
          { $match: { recruiterId: new mongoose.Types.ObjectId(session.userId) } },
          { $group: { _id: '$jobId', count: { $sum: 1 } } },
        ]),
      ]);

      statusAgg.forEach(({ _id, count }) => {
        const { jobId, status } = _id;
        pipeline[status] = (pipeline[status] || 0) + count;
        totalApplications += count;
        const job = perJob.get(String(jobId));
        if (job) {
          job.applications += count;
          job.byStage[status] = count;
        }
      });

      if (scoreAgg.length > 0) {
        averageMatchScore = Math.round(scoreAgg[0].total / scoreAgg[0].count);
      }

      interviewAgg.forEach(({ _id, count }) => {
        const job = perJob.get(String(_id));
        if (job) job.interviews = count;
      });

      if (hireAgg.length > 0) {
        timeToHireDays = Math.round(hireAgg[0].avgDays * 10) / 10;
      }

      const growthByDay = new Map(growthAgg.map(({ _id, count }) => [_id, count]));
      const growth = [];
      for (let i = GROWTH_DAYS - 1; i >= 0; i--) {
        const day = isoDay(Date.now() - i * 24 * 60 * 60 * 1000);
        growth.push({ date: day, count: growthByDay.get(day) || 0 });
      }

      return NextResponse.json({
        totalJobs,
        publishedJobs,
        totalApplications,
        averageMatchScore,
        timeToHireDays,
        interviews: interviewAgg.reduce((sum, row) => sum + row.count, 0),
        offers: pipeline.Offer,
        hires: pipeline.Hired,
        pipeline,
        applicationsPerJob: [...perJob.values()].sort((a, b) => b.applications - a.applications),
        growth,
      });
    }

    return NextResponse.json({
      totalJobs,
      publishedJobs,
      totalApplications,
      averageMatchScore,
      timeToHireDays,
      interviews: 0,
      offers: 0,
      hires: 0,
      pipeline,
      applicationsPerJob: [],
      growth: [],
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}