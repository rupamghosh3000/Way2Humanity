import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Dispute } from '@/models/Dispute';
import { DisputeSchema } from '@/lib/validation';
import { recordAuditEvent } from '@/lib/security/audit';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const validated = DisputeSchema.parse(body);

    await connectToDatabase();

    const dispute = await Dispute.create({
      reporterId: auth.user.id,
      targetType: validated.targetType,
      targetId: validated.targetId,
      category: validated.category,
      description: validated.description,
      status: 'OPEN',
    });

    await recordAuditEvent({
      actorId: auth.user.id,
      actorRole: auth.user.roles[0],
      action: 'DISPUTE_OPENED',
      targetType: 'DISPUTE',
      targetId: dispute._id.toString(),
    });

    return NextResponse.json({
      success: true,
      data: { dispute },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: { message: err instanceof Error ? err.message : 'Dispute creation failed' } },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  await connectToDatabase();

  const filter = auth.user.roles.includes('ADMIN') ? {} : { reporterId: auth.user.id };
  const disputes = await Dispute.find(filter).sort({ createdAt: -1 });

  return NextResponse.json({
    success: true,
    data: { disputes },
  });
}
