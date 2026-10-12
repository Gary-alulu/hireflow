import mongoose from 'mongoose';

// A recruiter's saved candidate (Talent Pool). Lets recruiters keep candidates
// they may want to hire later — even without a live application or job. Private:
// the candidate is never told they were saved.
const SavedCandidateSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    candidateProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CandidateProfile',
      default: null,
    },
    note: { type: String, default: '' },
    tags: [{ type: String }],
    // Where the save came from: 'search' (network browse), 'application' (pool card).
    source: { type: String, default: 'search' },
  },
  { timestamps: true }
);

SavedCandidateSchema.index({ recruiterId: 1, candidateId: 1 }, { unique: true });
SavedCandidateSchema.index({ recruiterId: 1, createdAt: -1 });

export default mongoose.models.SavedCandidate ||
  mongoose.model('SavedCandidate', SavedCandidateSchema);