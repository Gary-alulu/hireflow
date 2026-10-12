import mongoose from 'mongoose';

const CandidateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    phone: { type: String },
    location: { type: String },
    profilePhoto: { type: String },
    headline: { type: String },
    professionalSummary: { type: String },
    skills: [{ type: String }],
    experience: [
      {
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    certifications: [{ name: String, issuer: String, date: Date }],
    portfolioUrl: { type: String },
    linkedInUrl: { type: String },
    githubUrl: { type: String },
    cvUrl: { type: String }, // Link to uploaded CV file
    cvText: { type: String }, // Extracted plain text of the uploaded CV (txt uploads only)
  },
  { timestamps: true }
);

export default mongoose.models.CandidateProfile ||
  mongoose.model('CandidateProfile', CandidateProfileSchema);
