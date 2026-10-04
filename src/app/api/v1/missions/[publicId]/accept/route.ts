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

      memMission.status = 'ASSIGNED';
      memMission.assignedHelperId = auth.user.id;
      memoryStore.missions.set(memMission.publicId, memMission);

      return NextResponse.json({
        success: true,
        data: { mission: memMission, assignment: { status: 'ACCEPTED', acceptedAt: new Date() } },
      });
    }

    // MongoDB Mode
    let mission = await Mission.findOne({ publicId: params.publicId });
    if (!mission && mongoose.Types.ObjectId.isValid(params.publicId)) {
      mission = await Mission.findById(params.publicId);
    }

    if (!mission) {
      // Check MemoryStore as secondary fallback
      const memMission =
        memoryStore.missions.get(params.publicId) ||
        Array.from(memoryStore.missions.values()).find(
          (m) => m.publicId === params.publicId || m._id === params.publicId
        );

      if (memMission) {
        memMission.status = 'ASSIGNED';
        memMission.assignedHelperId = auth.user.id;
        memoryStore.missions.set(memMission.publicId, memMission);
        return NextResponse.json({
          success: true,
          data: { mission: memMission, assignment: { status: 'ACCEPTED', acceptedAt: new Date() } },
        });
      }

      return NextResponse.json({ success: false, error: { message: 'Mission not found.' } }, { status: 404 });
    }

    if (mission.status !== 'PUBLISHED' && mission.status !== 'ASSIGNED') {
      return NextResponse.json(
        { success: false, error: { message: `Mission cannot be accepted in status ${mission.status}` } },
        { status: 400 }
      );
    }

    mission.status = 'ASSIGNED';
    if (mongoose.Types.ObjectId.isValid(auth.user.id)) {
      mission.assignedHelperId = auth.user.id as any;
    }
    await mission.save();

    let assignment = null;
    try {
      if (mongoose.Types.ObjectId.isValid(auth.user.id) && mongoose.Types.ObjectId.isValid(mission._id.toString())) {
        assignment = await MissionAssignment.create({
          missionId: mission._id,
          helperId: auth.user.id,
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        });
      }
    } catch {}

    await recordAuditEvent({
      actorId: auth.user.id,
      actorRole: auth.user.roles[0],
      action: 'HELPER_ACCEPTED',
      targetType: 'MISSION',
      targetId: mission._id.toString(),
    });

    return NextResponse.json({
      success: true,
      data: { mission, assignment: assignment || { status: 'ACCEPTED', acceptedAt: new Date() } },
    });
  } catch (err: unknown) {
    // Graceful fallback to MemoryStore
    const memMission =
      memoryStore.missions.get(params.publicId) ||
      Array.from(memoryStore.missions.values()).find(
        (m) => m.publicId === params.publicId || m._id === params.publicId
      );

    if (memMission) {
      memMission.status = 'ASSIGNED';
      memMission.assignedHelperId = auth.user.id;
      memoryStore.missions.set(memMission.publicId, memMission);
      return NextResponse.json({
        success: true,
        data: { mission: memMission, assignment: { status: 'ACCEPTED', acceptedAt: new Date() } },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: { code: 'ACCEPT_FAILED', message: err instanceof Error ? err.message : 'Failed to accept mission.' },
      },
      { status: 400 }
    );
  }
}
