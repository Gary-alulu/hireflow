import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import CandidateProfile from '@/models/CandidateProfile';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Parse query params for search filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    // We need to fetch profiles and populate the associated User (for name/email)
    let profiles = await CandidateProfile.find()
      .populate('userId', 'name email')
      .lean();

    // Filter profiles based on search
    if (search) {
      profiles = profiles.filter(profile => {
        const nameMatch = profile.userId?.name?.toLowerCase().includes(search);
        const skillMatch = profile.skills?.some(skill => skill.toLowerCase().includes(search));
        const titleMatch = profile.experience?.some(exp => exp.title?.toLowerCase().includes(search));
        
        return nameMatch || skillMatch || titleMatch;
      });
    }

    return NextResponse.json({ candidates: profiles });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
