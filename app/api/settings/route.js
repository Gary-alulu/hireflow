import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Company from '@/models/Company';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const user = await User.findById(session.userId).lean();
    let company = null;
    
    if (user.companyId) {
      company = await Company.findById(user.companyId).lean();
    }

    return NextResponse.json({ user, company });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    await connectToDatabase();

    const user = await User.findById(session.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Update user info
    if (data.name) user.name = data.name;
    await user.save();

    // Update company info
    if (user.companyId) {
      const company = await Company.findById(user.companyId);
      if (company) {
        if (data.companyName) company.name = data.companyName;
        if (data.description) company.description = data.description;
        if (data.website) company.website = data.website;
        if (data.industry) company.industry = data.industry;
        if (data.size) company.size = data.size;
        if (data.location) company.location = data.location;
        await company.save();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
