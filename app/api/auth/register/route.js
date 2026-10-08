import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Company from '@/models/Company';
import { setSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role, companyName } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['recruiter', 'candidate'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let companyId = null;

    // If recruiter, handle company creation/linking
    if (role === 'recruiter') {
      if (!companyName) {
        return NextResponse.json({ error: 'Company name is required for recruiters' }, { status: 400 });
      }
      
      // Basic check to see if company exists, if not create
      let company = await Company.findOne({ name: companyName });
      if (!company) {
        company = await Company.create({ name: companyName });
      }
      companyId = company._id;
    }

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      companyId,
    });

    // Create session
    await setSession(newUser);

    return NextResponse.json(
      { message: 'Registration successful', role: newUser.role },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
