import { NextResponse } from 'next/server';
import { getSession, clearSession } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

// Reports the current user. Verifies the account still exists so a cookie that
// outlives a deleted or deactivated account can never impersonate it.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const user = await User.findById(session.userId).select('_id email role name').lean();
    if (!user) {
      await clearSession();
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } catch (error) {
    console.error('Session user lookup error:', error);
  }

  return NextResponse.json({ user: session }, { status: 200 });
}