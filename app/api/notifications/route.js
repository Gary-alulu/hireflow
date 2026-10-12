import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Notification from '@/models/Notification';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 30, 100);

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: session.userId }).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({ userId: session.userId, read: false }),
    ]);

    return NextResponse.json({ notifications, unreadCount }, { status: 200 });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (body.markAllRead !== true) {
      return NextResponse.json({ error: 'Only markAllRead is supported' }, { status: 400 });
    }

    await connectToDatabase();
    await Notification.updateMany({ userId: session.userId, read: false }, { $set: { read: true } });

    return NextResponse.json({ message: 'All notifications marked read' }, { status: 200 });
  } catch (error) {
    console.error('Mark all notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}