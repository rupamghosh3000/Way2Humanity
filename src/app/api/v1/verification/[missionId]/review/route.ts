import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Mission } from '@/models/Mission';
import { VerificationResult } from '@/models/VerificationResult';
import { Review } from '@/models/Review';
import { ReviewDecisionSchema } from '@/lib/validation';
import { recordAuditEvent } from '@/lib/security/audit';
import { memoryStore } from '@/lib/db/memoryStore';

export async function POST(
  req: NextRequest,
  { params }: { params: { missionId: string } }
) {
  const auth = await requireAuth(req, ['VERIFIER', 'ADMIN']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const validated = ReviewDecisionSchema.parse(body);

    const db = await connectToDatabase();

    if (!db) {
      const memMission =
        memoryStore.missions.get(params.missionId) ||
        Array.from(memoryStore.missions.values()).find(
          (m) => m.publicId === params.missionId || m._id === params.missionId
        );

      if (!memMission) {
        return NextResponse.json({ success: false, error: { message: 'Mission not found.' } }, { status: 404 });
      }

      if (validated.decision === 'APPROVE') {
        memMission.status = 'PUBLISHED';
        memMission.verificationStatus = 'PASS_AUTO_REVIEW';
      } else if (validated.decision === 'REJECT') {
        memMission.status = 'REJECTED';
        memMission.verificationStatus = 'FLAGGED';
      } else if (validated.decision === 'NEEDS_MORE_INFO') {
        memMission.status = 'NEEDS_MORE_INFO';
        memMission.verificationStatus = 'INSUFFICIENT_EVIDENCE';
      }

      memoryStore.missions.set(memMission.publicId, memMission);

      return NextResponse.json({
        success: true,
        data: {
          review: { _id: `rev_${Date.now()}`, decision: validated.decision },
          mission: memMission,
        },
      });
    }

    let mission = await Mission.findOne({ publicId: params.missionId });
    if (!mission && params.missionId.match(/^[0-9a-fA-F]{24}$/)) {
      mission = await Mission.findById(params.missionId);
    }

    if (!mission) {
      const memMission =
        memoryStore.missions.get(params.missionId) ||
        Array.from(memoryStore.missions.values()).find(
          (m) => m.publicId === params.missionId || m._id === params.missionId
        );

      if (memMission) {
        if (validated.decision === 'APPROVE') {
          memMission.status = 'PUBLISHED';
          memMission.verificationStatus = 'PASS_AUTO_REVIEW';
        } else if (validated.decision === 'REJECT') {
          memMission.status = 'REJECTED';
          memMission.verificationStatus = 'FLAGGED';
        } else if (validated.decision === 'NEEDS_MORE_INFO') {
          memMission.status = 'NEEDS_MORE_INFO';
          memMission.verificationStatus = 'INSUFFICIENT_EVIDENCE';
        }
        memoryStore.missions.set(memMission.publicId, memMission);

        return NextResponse.json({
          success: true,
          data: { review: { _id: `rev_${Date.now()}`, decision: validated.decision }, mission: memMission },
        });
      }

      return NextResponse.json({ success: false, error: { message: 'Mission not found.' } }, { status: 404 });
    }

    let review = null;
    try {
      review = await Review.create({
        targetType: 'MISSION_VERIFICATION',
        targetId: mission._id,
        reviewerId: auth.user.id,
        decision: validated.decision,
        reasonCode: validated.reasonCode,
        notes: validated.notes,
      });
    } catch {}

    if (validated.decision === 'APPROVE') {
      mission.status = 'PUBLISHED';
      mission.verificationStatus = 'PASS_AUTO_REVIEW';
      mission.publishedAt = new Date();
    } else if (validated.decision === 'REJECT') {
      mission.status = 'REJECTED';
      mission.verificationStatus = 'FLAGGED';
    } else if (validated.decision === 'NEEDS_MORE_INFO') {
      mission.status = 'NEEDS_MORE_INFO';
      mission.verificationStatus = 'INSUFFICIENT_EVIDENCE';
    }

    await mission.save();

    try {
      await VerificationResult.findOneAndUpdate(
        { missionId: mission._id },
        {
          reviewedBy: auth.user.id,
          reviewedAt: new Date(),
          requiresHumanReview: false,
        }
      );
    } catch {}

    await recordAuditEvent({
      actorId: auth.user.id,
      actorRole: auth.user.roles[0],
      action: `VERIFICATION_REVIEW_${validated.decision}`,
      targetType: 'MISSION',
      targetId: mission._id.toString(),
      metadata: { reasonCode: validated.reasonCode, notes: validated.notes },
    });

    return NextResponse.json({
      success: true,
      data: { review: review || { decision: validated.decision }, mission },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'REVIEW_FAILED', message: err instanceof Error ? err.message : 'Review failed.' },
      },
      { status: 400 }
    );
  }
}
