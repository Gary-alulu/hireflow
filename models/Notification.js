import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['recruiter', 'candidate'], required: true },
    type: {
      type: String,
      enum: [
        'new_application',
        'application_received',
        'status_changed',
        'offer_received',
        'interview_scheduled',
        'interview_updated',
        'interview_reminder',
        'candidate_message',
        'recruiter_message',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model('Notification', NotificationSchema);