import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    website: { type: String },
    logo: { type: String },
    industry: { type: String },
    size: { type: String },
    location: { type: String },
    socialLinks: {
      linkedIn: { type: String },
      twitter: { type: String },
      facebook: { type: String },
      instagram: { type: String },
      github: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);
