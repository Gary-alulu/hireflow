import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    company: { type: String, trim: true, maxlength: 160 },
    topic: { type: String, required: true, maxlength: 60 },
    subject: { type: String, trim: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 5000 },
    status: {
      type: String,
      enum: ['new', 'read', 'archived'],
      default: 'new',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ContactMessage ||
  mongoose.model('ContactMessage', ContactMessageSchema);
