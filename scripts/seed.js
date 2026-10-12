/**
 * HireFlow Database Seed Script
 * Run with: MONGODB_URI=<your-uri> node --experimental-vm-modules scripts/seed.js
 * Or set MONGODB_URI in .env.local and run: npm run seed
 *
 * Requires dotenv: npm install -D dotenv
 * The script uses dynamic import to work with ES module models.
 */

const path = require('path');

// Load .env.local
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
} catch (e) {
  // dotenv not installed, continue with process.env
}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Same stage list the application uses — JSON so this CommonJS script can read it.
const APPLICATION_STATUSES = require('../lib/application-statuses.json');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not set. Create a .env.local file with MONGODB_URI=your_connection_string');
  process.exit(1);
}

// Define schemas inline (CommonJS-compatible) for the seed script
const CompanySchema = new mongoose.Schema({ name: String, industry: String, location: String }, { timestamps: true });
const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String,
  role: { type: String, enum: ['recruiter', 'candidate'] },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });
const CandidateProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  phone: String, location: String, professionalSummary: String,
  skills: [String], portfolioUrl: String, linkedInUrl: String, cvUrl: String,
  experience: [{ title: String, company: String, description: String, current: Boolean }],
}, { timestamps: true });
const JobSchema = new mongoose.Schema({
  title: String, department: String, employmentType: String, location: String,
  workplaceType: String, salaryRange: String, description: String,
  responsibilities: [String], requirements: [String], skills: [String],
  experienceLevel: String, status: String, companyId: mongoose.Schema.Types.ObjectId, recruiterId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });
const ApplicationSchema = new mongoose.Schema({
  jobId: mongoose.Schema.Types.ObjectId, candidateId: mongoose.Schema.Types.ObjectId,
  cvUrl: String, coverLetter: String, recruiterNotes: String,
  status: { type: String, enum: APPLICATION_STATUSES, default: APPLICATION_STATUSES[0] },
  matchScore: Number, matchReasoning: String,
}, { timestamps: true });
const InterviewSchema = new mongoose.Schema({
  applicationId: mongoose.Schema.Types.ObjectId, jobId: mongoose.Schema.Types.ObjectId,
  candidateId: mongoose.Schema.Types.ObjectId, recruiterId: mongoose.Schema.Types.ObjectId,
  interviewType: String, scheduledDate: Date, locationOrLink: String, notes: String, status: String,
}, { timestamps: true });

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[OK] Connected to MongoDB');

    // Register models
    const Company = mongoose.model('Company', CompanySchema);
    const User = mongoose.model('User', UserSchema);
    const CandidateProfile = mongoose.model('CandidateProfile', CandidateProfileSchema);
    const Job = mongoose.model('Job', JobSchema);
    const Application = mongoose.model('Application', ApplicationSchema);
    const Interview = mongoose.model('Interview', InterviewSchema);

    // Clear existing data
    await Promise.all([
      Company.deleteMany({}),
      User.deleteMany({}),
      CandidateProfile.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      Interview.deleteMany({}),
    ]);
    console.log('[OK] Cleared existing data');

    // Seed Companies
    const company1 = await Company.create({ name: 'Acme Corp', industry: 'Technology', location: 'San Francisco, CA' });
    const company2 = await Company.create({ name: 'Stark Industries', industry: 'Engineering', location: 'New York, NY' });
    console.log('[OK] Companies created');

    // Seed Users
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const recruiter1 = await User.create({ name: 'Jane Smith', email: 'jane@acme.com', password, role: 'recruiter', companyId: company1._id });
    const recruiter2 = await User.create({ name: 'Tom Stark', email: 'tom@stark.com', password, role: 'recruiter', companyId: company2._id });

    const candidate1 = await User.create({ name: 'Alice Johnson', email: 'alice@example.com', password, role: 'candidate' });
    const candidate2 = await User.create({ name: 'Bob Williams', email: 'bob@example.com', password, role: 'candidate' });
    const candidate3 = await User.create({ name: 'Carlos Rivera', email: 'carlos@example.com', password, role: 'candidate' });
    console.log('[OK] Users created (password: password123)');

    // Seed Candidate Profiles
    await CandidateProfile.create({
      userId: candidate1._id,
      location: 'Remote',
      professionalSummary: 'Senior full-stack engineer with 5+ years of React and Node.js experience.',
      skills: ['React', 'Next.js', 'Node.js', 'MongoDB', 'TypeScript'],
      cvUrl: 'https://example.com/alice-cv.pdf',
      experience: [{ title: 'Senior Frontend Developer', company: 'TechCo', description: 'Led React migration.', current: true }],
    });
    await CandidateProfile.create({
      userId: candidate2._id,
      location: 'New York, NY',
      professionalSummary: 'Product designer with a focus on SaaS UX and design systems.',
      skills: ['Figma', 'UI/UX', 'Prototyping', 'CSS', 'User Research'],
      cvUrl: 'https://example.com/bob-cv.pdf',
    });
    await CandidateProfile.create({
      userId: candidate3._id,
      location: 'Austin, TX',
      professionalSummary: 'Data analyst skilled in Python, SQL, and dashboarding.',
      skills: ['Python', 'SQL', 'Tableau', 'Excel'],
      cvUrl: 'https://example.com/carlos-cv.pdf',
    });
    console.log('[OK] Candidate profiles created');

    // Seed Jobs
    const job1 = await Job.create({
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      employmentType: 'Full-time',
      location: 'Remote',
      workplaceType: 'remote',
      salaryRange: '$110k – $140k',
      description: 'We are looking for an experienced frontend developer to lead our React architecture and mentor junior developers.',
      responsibilities: ['Lead frontend architecture decisions', 'Mentor junior developers', 'Collaborate with design team', 'Conduct code reviews'],
      requirements: ['5+ years of React experience', 'Proficient in Next.js', 'Understanding of accessibility standards'],
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      experienceLevel: 'Senior',
      status: 'active',
      companyId: company1._id,
      recruiterId: recruiter1._id,
    });

    const job2 = await Job.create({
      title: 'Product Designer',
      department: 'Design',
      employmentType: 'Full-time',
      location: 'New York, NY',
      workplaceType: 'hybrid',
      salaryRange: '$90k – $115k',
      description: 'Join our design team to shape the visual identity and user experience of our flagship SaaS product.',
      responsibilities: ['Create wireframes and prototypes', 'Run user research sessions', 'Build and maintain design system'],
      requirements: ['3+ years of product design experience', 'Proficient in Figma', 'Strong portfolio'],
      skills: ['Figma', 'UI/UX', 'Prototyping', 'User Research'],
      experienceLevel: 'Mid-Level',
      status: 'active',
      companyId: company1._id,
      recruiterId: recruiter1._id,
    });

    const job3 = await Job.create({
      title: 'Data Analyst',
      department: 'Analytics',
      employmentType: 'Full-time',
      location: 'Austin, TX',
      workplaceType: 'on-site',
      salaryRange: '$80k – $100k',
      description: 'Help us make data-driven decisions by building dashboards and performing deep analyses.',
      responsibilities: ['Build dashboards in Tableau', 'Write complex SQL queries', 'Present findings to stakeholders'],
      requirements: ['2+ years data analysis experience', 'Proficient in SQL and Python', 'Experience with BI tools'],
      skills: ['Python', 'SQL', 'Tableau', 'Excel'],
      experienceLevel: 'Mid-Level',
      status: 'active',
      companyId: company2._id,
      recruiterId: recruiter2._id,
    });

    const job4 = await Job.create({
      title: 'Backend Engineer',
      department: 'Engineering',
      employmentType: 'Full-time',
      location: 'Remote',
      workplaceType: 'remote',
      salaryRange: '$120k – $150k',
      description: 'Build scalable backend services and APIs for our growing platform.',
      responsibilities: ['Design and build REST APIs', 'Optimize database queries', 'Implement security best practices'],
      requirements: ['4+ years backend experience', 'Node.js or Python expertise', 'Experience with MongoDB or PostgreSQL'],
      skills: ['Node.js', 'MongoDB', 'AWS', 'Docker'],
      experienceLevel: 'Senior',
      status: 'draft',
      companyId: company2._id,
      recruiterId: recruiter2._id,
    });

    console.log('[OK] Jobs created (3 active, 1 draft)');

    // Seed Applications
    const app1 = await Application.create({
      jobId: job1._id, candidateId: candidate1._id,
      status: 'Interview', matchScore: 92,
      matchReasoning: 'Match: 92%.\n\nReasons:\n- Candidate possesses 3 of 4 required skills.\n- Candidate has documented professional experience.\n- CV is available for review.',
      cvUrl: 'https://example.com/alice-cv.pdf',
    });
    const app2 = await Application.create({
      jobId: job2._id, candidateId: candidate2._id,
      status: 'Shortlisted', matchScore: 85,
      matchReasoning: 'Match: 85%.\n\nReasons:\n- Candidate possesses 4 of 4 required skills.\n- Strong design background.',
      cvUrl: 'https://example.com/bob-cv.pdf',
    });
    await Application.create({
      jobId: job3._id, candidateId: candidate3._id,
      status: 'Applied', matchScore: 78,
      matchReasoning: 'Match: 78%.\n\nReasons:\n- Candidate possesses 4 of 4 required skills.',
      cvUrl: 'https://example.com/carlos-cv.pdf',
    });
    await Application.create({
      jobId: job1._id, candidateId: candidate2._id,
      status: 'Screening', matchScore: 45,
      matchReasoning: 'Match: 45%.\n\nReasons:\n- Missing key required skills: React, Next.js, TypeScript, Tailwind CSS.',
    });
    console.log('[OK] Applications created');

    // Seed Interviews
    await Interview.create({
      applicationId: app1._id,
      jobId: job1._id,
      candidateId: candidate1._id,
      recruiterId: recruiter1._id,
      interviewType: 'Video',
      scheduledDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      locationOrLink: 'https://zoom.us/j/123456789',
      notes: 'Discuss past project experience and React architecture decisions.',
      status: 'Scheduled',
    });
    await Interview.create({
      applicationId: app2._id,
      jobId: job2._id,
      candidateId: candidate2._id,
      recruiterId: recruiter1._id,
      interviewType: 'In-Person',
      scheduledDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
      locationOrLink: '123 Fifth Ave, New York, NY 10001',
      notes: 'Portfolio review and whiteboard design challenge.',
      status: 'Scheduled',
    });
    console.log('[OK] Interviews created');

    console.log('\nSeed completed successfully!');
    console.log('\nTest Accounts (all passwords: password123):');
    console.log('  Recruiter: jane@acme.com');
    console.log('  Recruiter: tom@stark.com');
    console.log('  Candidate: alice@example.com');
    console.log('  Candidate: bob@example.com');
    console.log('  Candidate: carlos@example.com');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
