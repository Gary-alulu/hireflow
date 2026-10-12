import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Company from '@/models/Company';
import CandidateProfile from '@/models/CandidateProfile';
import Application from '@/models/Application';
import Job from '@/models/Job';
import Interview from '@/models/Interview';
import Message from '@/models/Message';
import Notification from '@/models/Notification';
import SavedJob from '@/models/SavedJob';
import SavedCandidate from '@/models/SavedCandidate';
import { getSession, clearSession } from '@/lib/auth';
import { deleteUploadedResume } from '@/lib/upload';

// Full right-to-be-forgotten: removes a user and every piece of recruitment data
// tied to them, including stored resume files. Works for candidates and recruiters.
export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const userId = session.userId;

    // --- Candidate: profile + resume files + applications (candidate side) ---
    const candidateProfile = await CandidateProfile.findOne({ userId }).lean();
    if (candidateProfile) {
      await deleteUploadedResume(candidateProfile.cvUrl);
      await CandidateProfile.deleteOne({ userId });
    }

    const ownApps = await Application.find({ candidateId: userId }).select('cvUrl').lean();
    for (const app of ownApps) await deleteUploadedResume(app.cvUrl);
    await Application.deleteMany({ candidateId: userId });

    // --- Recruiter: their jobs, applications on them, plus any saved talent ---
    const jobs = await Job.find({ recruiterId: userId }).select('_id').lean();
    const jobIds = jobs.map((j) => j._id);
    if (jobIds.length > 0) {
      const jobApps = await Application.find({ jobId: { $in: jobIds } }).select('cvUrl').lean();
      for (const app of jobApps) await deleteUploadedResume(app.cvUrl);
      await Application.deleteMany({ jobId: { $in: jobIds } });
      await Interview.deleteMany({ jobId: { $in: jobIds } });
      await Job.deleteMany({ _id: { $in: jobIds } });
    }

    await SavedCandidate.deleteMany({ recruiterId: userId });

    // --- Shared data keyed by this user ---
    await Interview.deleteMany({ candidateId: userId });
    await Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });
    await Notification.deleteMany({ userId });
    await SavedJob.deleteMany({ userId });

    // Recruiters created a company. Remove it when it's their company alone —
    // never while other recruiters still belong to it.
    if (session.role === 'recruiter' && session.companyId) {
      const otherRecruiter = await User.findOne({
        _id: { $ne: userId },
        companyId: session.companyId,
      }).select('_id').lean();
      if (!otherRecruiter) {
        const company = await Company.findById(session.companyId).lean();
        if (company?.createdBy && String(company.createdBy) !== userId) {
          // keep a company owned by a different user
        } else {
          await Company.findByIdAndDelete(session.companyId);
        }
      }
    }

    await User.deleteOne({ _id: userId });

    // Invalidate the deleted user's session cookie immediately.
    await clearSession();

    return NextResponse.json({ message: 'Account deleted' }, { status: 200 });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}