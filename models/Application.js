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
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: DEFAULT_APPLICATION_STATUS,
    },
    recruiterNotes: { type: String },
    matchScore: { type: Number },
    matchReasoning: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Application ||
  mongoose.model('Application', ApplicationSchema);
