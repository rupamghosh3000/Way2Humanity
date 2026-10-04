import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Mission } from '@/models/Mission';
import { MissionAssignment } from '@/models/MissionAssignment';
import { recordAuditEvent } from '@/lib/security/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  const auth = await requireAuth(req, ['HELPER', 'ADMIN']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  await connectToDatabase();

  const mission = await Mission.findOne({ publicId: params.publicId });

  if (!mission) {
    return NextResponse.json(
      { success: false, error: { message: 'Mission not found.' } },
      { status: 404 }
    );
  }

  if (mission.assignedHelperId?.toString() !== auth.user.id && !auth.user.roles.includes('ADMIN')) {
    return NextResponse.json(
      { success: false, error: { message: 'You are not the assigned helper for this mission.' } },
      { status: 403 }
    );
  }

  mission.status = 'PUBLISHED';
  mission.assignedHelperId = undefined;
  await mission.save();

  await MissionAssignment.findOneAndUpdate(
    { missionId: mission._id, helperId: auth.user.id, status: { $in: ['ACCEPTED', 'IN_PROGRESS'] } },
    { status: 'WITHDRAWN', withdrawnAt: new Date() }
  );

  await recordAuditEvent({
    actorId: auth.user.id,
    actorRole: auth.user.roles[0],
    action: 'HELPER_WITHDRAWN',
    targetType: 'MISSION',
    targetId: mission._id.toString(),
  });

  return NextResponse.json({
    success: true,
    data: { mission },
  });
}
