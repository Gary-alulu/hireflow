import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
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
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    interviewType: {
      type: String,
      enum: ['Phone', 'Video', 'In-Person', 'Technical'],
      required: true,
    },
    interviewerName: { type: String },
    scheduledDate: { type: Date, required: true },
    locationOrLink: { type: String, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
    },
  },
  { timestamps: true }
);

InterviewSchema.index({ recruiterId: 1, scheduledDate: 1 });
InterviewSchema.index({ candidateId: 1, scheduledDate: 1 });

export default mongoose.models.Interview || mongoose.model('Interview', InterviewSchema);
