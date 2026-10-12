import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import CandidateProfile from '@/models/CandidateProfile';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    let profile = await CandidateProfile.findOne({ userId: session.userId });
    
    if (!profile) {
      // Create empty profile if it doesn't exist yet
      profile = await CandidateProfile.create({ userId: session.userId });
    }

    return NextResponse.json({ profile, email: session.email, name: session.name }, { status: 200 });
  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await connectToDatabase();

    const profile = await CandidateProfile.findOneAndUpdate(
      { userId: session.userId },
      { $set: body },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: 'Profile updated', profile }, { status: 200 });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
