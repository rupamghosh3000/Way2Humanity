import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Mission } from '@/models/Mission';
import { MissionAssignment } from '@/models/MissionAssignment';
import { recordAuditEvent } from '@/lib/security/audit';
import { memoryStore } from '@/lib/db/memoryStore';

export async function POST(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  const auth = await requireAuth(req, ['HELPER', 'ADMIN', 'SEEKER', 'DONOR', 'VERIFIER', 'CSR_ORGANIZATION']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const db = await connectToDatabase();

    // Memory Store Fallback Mode
    if (!db) {
      const memMission =
        memoryStore.missions.get(params.publicId) ||
        Array.from(memoryStore.missions.values()).find(
          (m) => m.publicId === params.publicId || m._id === params.publicId
        );

      if (!memMission) {
        return NextResponse.json({ success: false, error: { message: 'Mission not found.' } }, { status: 404 });
      }

      memMission.status = 'IN_PROGRESS';
      memoryStore.missions.set(memMission.publicId, memMission);

      return NextResponse.json({
        success: true,
        data: { mission: memMission },
      });
    }

    // MongoDB Mode
    let mission = await Mission.findOne({ publicId: params.publicId });
    if (!mission && mongoose.Types.ObjectId.isValid(params.publicId)) {
      mission = await Mission.findById(params.publicId);
    }

    if (!mission) {
      const memMission =
        memoryStore.missions.get(params.publicId) ||
        Array.from(memoryStore.missions.values()).find(
          (m) => m.publicId === params.publicId || m._id === params.publicId
        );

      if (memMission) {
        memMission.status = 'IN_PROGRESS';
        memoryStore.missions.set(memMission.publicId, memMission);
        return NextResponse.json({ success: true, data: { mission: memMission } });
      }

      return NextResponse.json({ success: false, error: { message: 'Mission not found.' } }, { status: 404 });
    }

    mission.status = 'IN_PROGRESS';
    await mission.save();

    try {
      if (mongoose.Types.ObjectId.isValid(auth.user.id) && mongoose.Types.ObjectId.isValid(mission._id.toString())) {
        await MissionAssignment.findOneAndUpdate(
          { missionId: mission._id, helperId: auth.user.id, status: 'ACCEPTED' },
          { status: 'IN_PROGRESS', startedAt: new Date() }
        );
      }
    } catch {}

    await recordAuditEvent({
      actorId: auth.user.id,
      actorRole: auth.user.roles[0],
      action: 'WORK_STARTED',
      targetType: 'MISSION',
      targetId: mission._id.toString(),
    });

    return NextResponse.json({
      success: true,
      data: { mission },
    });
  } catch (err: unknown) {
    const memMission =
      memoryStore.missions.get(params.publicId) ||
      Array.from(memoryStore.missions.values()).find(
        (m) => m.publicId === params.publicId || m._id === params.publicId
      );

    if (memMission) {
      memMission.status = 'IN_PROGRESS';
      memoryStore.missions.set(memMission.publicId, memMission);
      return NextResponse.json({ success: true, data: { mission: memMission } });
    }

    return NextResponse.json(
      {
        success: false,
        error: { code: 'START_WORK_FAILED', message: err instanceof Error ? err.message : 'Failed to start mission.' },
      },
      { status: 400 }
    );
  }
}
