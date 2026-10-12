import mongoose from 'mongoose';
import {
  APPLICATION_STATUSES,
  DEFAULT_APPLICATION_STATUS,
} from '../lib/pipeline';

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cvUrl: { type: String }, // CV specific to this application
    coverLetter: { type: String },
    portfolioUrl: { type: String },
    answers: [
      {
        question: String,
        answer: String,
      },
    ],
    candidateInfo: {
      name: String,
      email: String,
      phone: String,
      location: String,
      headline: String,
      skills: [String],
      experience: [mongoose.Schema.Types.Mixed],
      portfolioUrl: String,
      linkedInUrl: String,
      githubUrl: String,
      cvUrl: String,
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: DEFAULT_APPLICATION_STATUS,
    },
    recruiterNotes: { type: String },
    tags: [{ type: String }],
    matchScore: { type: Number },
    matchReasoning: { type: String },
    matchStrengths: [String],
    matchGaps: [String],
    matchRecommendation: { type: String },
    hiredAt: { type: Date },
  },
  { timestamps: true }
);

ApplicationSchema.index({ jobId: 1, status: 1 });
ApplicationSchema.index({ jobId: 1, createdAt: -1 });
ApplicationSchema.index({ candidateId: 1, createdAt: -1 });

export default mongoose.models.Application ||
  mongoose.model('Application', ApplicationSchema);
