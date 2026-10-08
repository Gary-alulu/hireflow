import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Job from '@/models/Job';
import Application from '@/models/Application';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get all jobs for this recruiter
    const jobs = await Job.find({ recruiterId: session.userId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    // Get all applications for those jobs
    const applications = await Application.find({ jobId: { $in: jobIds } });

    // Calculate metrics
    const totalJobs = jobs.length;
    const totalApplications = applications.length;

    // Pipeline distribution
    const pipeline = {
      Applied: 0,
      Screening: 0,
      Shortlisted: 0,
      Interview: 0,
      Assessment: 0,
      Offer: 0,
      Hired: 0,
      Rejected: 0
    };

    let totalScore = 0;
    let scoredCount = 0;

    applications.forEach(app => {
      // Pipeline
      if (pipeline[app.status] !== undefined) {
        pipeline[app.status]++;
      } else {
        pipeline[app.status] = 1;
      }

      // Match Score Avg
      if (app.matchScore && typeof app.matchScore === 'number') {
        totalScore += app.matchScore;
        scoredCount++;
      }
    });

    const averageMatchScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;

    return NextResponse.json({
      totalJobs,
      totalApplications,
      averageMatchScore,
      pipeline
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
