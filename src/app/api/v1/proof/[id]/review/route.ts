import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { ProofOfWork } from '@/models/ProofOfWork';
import { Mission } from '@/models/Mission';
import { Review } from '@/models/Review';
import { ReviewDecisionSchema } from '@/lib/validation';
import { awardReputationPoints } from '@/lib/services/reputation';
import { recordAuditEvent } from '@/lib/security/audit';
import { memoryStore } from '@/lib/db/memoryStore';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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
      const memProof = memoryStore.proofs.get(params.id);
      if (!memProof) {
        return NextResponse.json({ success: false, error: { message: 'Proof record not found.' } }, { status: 404 });
      }

      const memMission = Array.from(memoryStore.missions.values()).find(
        (m) => m._id === memProof.missionId || m.publicId === memProof.missionId
      );
      if (!memMission) {
        return NextResponse.json({ success: false, error: { message: 'Associated mission not found.' } }, { status: 404 });
      }

      if (validated.decision === 'APPROVE') {
        memProof.reviewStatus = 'APPROVED';
        memProof.reviewedBy = auth.user.id;
        memProof.reviewedAt = new Date();
        memProof.reviewNotes = validated.notes;
        memMission.status = 'COMPLETED';
        memMission.completedAt = new Date();
        memoryStore.missions.set(memMission.publicId, memMission);

        await awardReputationPoints({
          userId: memProof.helperId.toString(),
          missionId: memMission._id.toString(),
          type: 'PROOF_APPROVED',
          points: 50,
          reason: `Verified proof of work for mission: ${memMission.title}`,
        });

        await recordAuditEvent({
          actorId: auth.user.id,
          actorRole: auth.user.roles[0],
          action: 'PROOF_APPROVED',
          targetType: 'PROOF',
          targetId: memProof._id.toString(),
          metadata: { missionId: memMission._id, publicId: memMission.publicId },
        });
      } else {
        memProof.reviewStatus = 'REJECTED';
        memProof.reviewedBy = auth.user.id;
        memProof.reviewedAt = new Date();
        memProof.reviewNotes = validated.notes;
        memMission.status = 'PROOF_REJECTED';
        memoryStore.missions.set(memMission.publicId, memMission);

        await recordAuditEvent({
          actorId: auth.user.id,
          actorRole: auth.user.roles[0],
          action: 'PROOF_REJECTED',
          targetType: 'PROOF',
          targetId: memProof._id.toString(),
          metadata: { missionId: memMission._id, publicId: memMission.publicId },
        });
      }

      return NextResponse.json({
        success: true,
        data: { proof: memProof, mission: memMission },
      });
    }

    const proof = await ProofOfWork.findById(params.id);
    if (!proof) {
      return NextResponse.json({ success: false, error: { message: 'Proof record not found.' } }, { status: 404 });
    }

    const mission = await Mission.findById(proof.missionId);
    if (!mission) {
      return NextResponse.json({ success: false, error: { message: 'Associated mission not found.' } }, { status: 404 });
    }


    const review = await Review.create({
      targetType: 'PROOF_OF_WORK',
      targetId: proof._id,
      reviewerId: auth.user.id,
      decision: validated.decision,
      reasonCode: validated.reasonCode,
      notes: validated.notes,
    });

    if (validated.decision === 'APPROVE') {
      proof.reviewStatus = 'APPROVED';
      proof.reviewedBy = auth.user.id as any;
      proof.reviewedAt = new Date();
      proof.reviewNotes = validated.notes;
      await proof.save();

      mission.status = 'COMPLETED';
      mission.completedAt = new Date();
      await mission.save();

      // Award 50 Humanity Points for verified mission proof
      await awardReputationPoints({
        userId: proof.helperId.toString(),
        missionId: mission._id.toString(),
        type: 'PROOF_APPROVED',
        points: 50,
        reason: `Verified proof of work for mission: ${mission.title}`,
      });

      await recordAuditEvent({
        actorId: auth.user.id,
        actorRole: auth.user.roles[0],
        action: 'PROOF_APPROVED',
        targetType: 'PROOF',
        targetId: proof._id.toString(),
      });
    } else {
      proof.reviewStatus = 'REJECTED';
      proof.reviewedBy = auth.user.id as any;
      proof.reviewedAt = new Date();
      proof.reviewNotes = validated.notes;
      await proof.save();

      mission.status = 'PROOF_REJECTED';
      await mission.save();

      await recordAuditEvent({
        actorId: auth.user.id,
        actorRole: auth.user.roles[0],
        action: 'PROOF_REJECTED',
        targetType: 'PROOF',
        targetId: proof._id.toString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: { proof, mission, review },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'PROOF_REVIEW_FAILED', message: err instanceof Error ? err.message : 'Proof review failed.' },
      },
      { status: 400 }
    );
  }
}
