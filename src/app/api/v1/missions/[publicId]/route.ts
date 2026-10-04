import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Mission } from '@/models/Mission';
import { requireAuth } from '@/lib/auth/guards';
import { memoryStore } from '@/lib/db/memoryStore';

export async function GET(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const db = await connectToDatabase();

    if (!db) {
      const memMission =
        memoryStore.missions.get(params.publicId) ||
        Array.from(memoryStore.missions.values()).find(
          (m) => m.publicId === params.publicId || m._id === params.publicId
        );

      if (!memMission) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSION_NOT_FOUND', message: 'Mission not found.' } },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { mission: memMission },
      });
    }

    let mission = await Mission.findOne({ publicId: params.publicId })
      .populate('seekerId', 'name city reputationSummary')
      .populate('assignedHelperId', 'name city reputationSummary');

    if (!mission && mongoose.Types.ObjectId.isValid(params.publicId)) {
      mission = await Mission.findById(params.publicId)
        .populate('seekerId', 'name city reputationSummary')
        .populate('assignedHelperId', 'name city reputationSummary');
    }

    if (!mission) {
      const memMission =
        memoryStore.missions.get(params.publicId) ||
        Array.from(memoryStore.missions.values()).find(
          (m) => m.publicId === params.publicId || m._id === params.publicId
        );

      if (memMission) {
        return NextResponse.json({ success: true, data: { mission: memMission } });
      }

      return NextResponse.json(
        { success: false, error: { code: 'MISSION_NOT_FOUND', message: 'Mission not found.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { mission },
    });
  } catch {
    const memMission =
      memoryStore.missions.get(params.publicId) ||
      Array.from(memoryStore.missions.values()).find(
        (m) => m.publicId === params.publicId || m._id === params.publicId
      );

    if (memMission) {
      return NextResponse.json({ success: true, data: { mission: memMission } });
    }

    return NextResponse.json(
      { success: false, error: { code: 'MISSION_NOT_FOUND', message: 'Mission not found.' } },
      { status: 404 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  const auth = await requireAuth(req);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const db = await connectToDatabase();
    if (!db) {
      const memMission = memoryStore.missions.get(params.publicId);
      if (!memMission) {
        return NextResponse.json({ success: false, error: { message: 'Mission not found' } }, { status: 404 });
      }

      // Enforce ownership or admin permission
      const isOwner = memMission.seekerId === auth.user.id;
      const isAdmin = auth.user.roles.includes('ADMIN');
      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'You are not authorized to update this mission.' } },
          { status: 403 }
        );
      }

      const updates = await req.json();
      delete updates.publicId;
      delete updates.seekerId;
      delete updates.status;
      delete updates.verificationStatus;
      delete updates.fundingRaised;

      Object.assign(memMission, updates);
      return NextResponse.json({ success: true, data: { mission: memMission } });
    }

    let mission = await Mission.findOne({ publicId: params.publicId });
    if (!mission && mongoose.Types.ObjectId.isValid(params.publicId)) {
      mission = await Mission.findById(params.publicId);
    }

    if (!mission) {
      return NextResponse.json({ success: false, error: { message: 'Mission not found' } }, { status: 404 });
    }

    // Enforce ownership or admin permission
    const isOwner = mission.seekerId.toString() === auth.user.id;
    const isAdmin = auth.user.roles.includes('ADMIN');
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'You are not authorized to update this mission.' } },
        { status: 403 }
      );
    }

    const updates = await req.json();
    delete updates.publicId;
    delete updates.seekerId;
    delete updates.status;
    delete updates.verificationStatus;
    delete updates.fundingRaised;

    Object.assign(mission, updates);
    await mission.save();

    return NextResponse.json({
      success: true,
      data: { mission },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: { message: err instanceof Error ? err.message : 'Update failed' } },
      { status: 400 }
    );
  }
}
