import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { ReputationEvent } from '@/models/ReputationEvent';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  const events = await ReputationEvent.find({ userId: auth.user.id }).sort({ createdAt: -1 });

  return NextResponse.json({
    success: true,
    data: { events },
  });
}
