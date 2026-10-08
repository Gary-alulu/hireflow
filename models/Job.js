import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    employmentType: { type: String, required: true }, // Full-time, Part-time, Contract
    location: { type: String, required: true },
    workplaceType: { type: String, enum: ['remote', 'hybrid', 'on-site'], required: true },
    salaryRange: { type: String },
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    skills: [{ type: String }],
    experienceLevel: { type: String, required: true },
    applicationDeadline: { type: Date },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'closed'],
      default: 'draft',
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Job || mongoose.model('Job', JobSchema);
