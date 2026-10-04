import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { AuditEvent } from '@/models/AuditEvent';
import { memoryStore } from '@/lib/db/memoryStore';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['ADMIN']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const db = await connectToDatabase();

    if (!db) {
      const memEvents = memoryStore.auditEvents.slice(0, 100);
      return NextResponse.json({
        success: true,
        data: {
          count: memEvents.length,
          events: memEvents,
        },
      });
    }

    const events = await AuditEvent.find({}).populate('actorId', 'name email roles').sort({ createdAt: -1 }).limit(100);

    return NextResponse.json({
      success: true,
      data: { count: events.length, events },
    });
  } catch {
    const memEvents = memoryStore.auditEvents.slice(0, 100);
    return NextResponse.json({
      success: true,
      data: {
        count: memEvents.length,
        events: memEvents,
      },
    });
  }
}

