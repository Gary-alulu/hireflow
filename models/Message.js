import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, maxlength: 4000 },
    readAt: { type: Date },
  },
  { timestamps: true }
);

MessageSchema.index({ applicationId: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);