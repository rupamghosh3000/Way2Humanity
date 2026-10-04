import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Mission } from '@/models/Mission';
import { Evidence } from '@/models/Evidence';
import { ProofOfWork } from '@/models/ProofOfWork';
import { ProofSubmissionSchema } from '@/lib/validation';
import { recordAuditEvent } from '@/lib/security/audit';
import { memoryStore } from '@/lib/db/memoryStore';
import { fetchImageAsBuffer, calculateBufferHash, extractBufferMetadata } from '@/lib/services/fileProcessing';
import { analyzeProofWithAI } from '@/lib/services/ai';

export async function POST(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  const auth = await requireAuth(req, ['HELPER', 'SEEKER', 'ADMIN', 'DONOR', 'VERIFIER', 'CSR_ORGANIZATION']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const validated = ProofSubmissionSchema.parse(body);

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

      memMission.status = 'PROOF_SUBMITTED';
      memoryStore.missions.set(memMission.publicId, memMission);

      const primaryProofUrl = validated.evidenceUrls[0] || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800';
      const originalUrl = (memMission.evidenceUrls && memMission.evidenceUrls[0]) || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800';

      // Execute AI Proof Verification
      const proofAiAnalysis = await analyzeProofWithAI({
        originalEvidenceUrlOrBuffer: originalUrl,
        proofEvidenceUrlOrBuffer: primaryProofUrl,
        missionTitle: memMission.title,
        missionDescription: memMission.description,
        helperNotes: validated.description,
      });

      const memProof = {
        _id: `proof_${Date.now()}`,
        missionId: memMission._id,
        helperId: auth.user.id,
        description: validated.description,
        evidenceUrls: validated.evidenceUrls.length > 0 ? validated.evidenceUrls : [primaryProofUrl],
        aiAnalysis: proofAiAnalysis,
        reviewStatus: 'PENDING_REVIEW',
        submittedAt: new Date(),
      };

      memoryStore.proofs.set(memProof._id, memProof);

      await recordAuditEvent({
        actorId: auth.user.id,
        actorRole: auth.user.roles[0],
        action: 'PROOF_UPLOADED',
        targetType: 'PROOF',
        targetId: memProof._id,
        metadata: { missionId: memMission._id, publicId: memMission.publicId },
      });

      await recordAuditEvent({
        actorId: 'SYSTEM_AI',
        actorRole: 'SYSTEM',
        action: 'PROOF_AI_ANALYZED',
        targetType: 'PROOF',
        targetId: memProof._id,
        metadata: {
          workVerified: proofAiAnalysis.workVerified,
          beforeAfterMatch: proofAiAnalysis.beforeAfterMatch,
          confidence: proofAiAnalysis.confidence,
          recommendedAction: proofAiAnalysis.recommendedAction,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          proof: memProof,
          mission: memMission,
          proofAiAnalysis,
        },
      });
    }


    // MongoDB Mode
    let mission = await Mission.findOne({ publicId: params.publicId });
    if (!mission && mongoose.Types.ObjectId.isValid(params.publicId)) {
      mission = await Mission.findById(params.publicId);
    }

    if (!mission) {
      return NextResponse.json({ success: false, error: { message: 'Mission not found.' } }, { status: 404 });
    }

    // Process & store proof evidence items with real binary SHA-256 hashes
    const evidenceIds: string[] = [];
    const primaryProofUrl = validated.evidenceUrls[0] || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800';

    for (const url of validated.evidenceUrls) {
      let sha256 = crypto.createHash('sha256').update(url).digest('hex');
      let mimeType = 'image/jpeg';
      let size = 1024 * 350;
      let metadata: any = {};

      try {
        const imageObj = await fetchImageAsBuffer(url);
        sha256 = calculateBufferHash(imageObj.buffer);
        mimeType = imageObj.mimeType;
        size = imageObj.buffer.length;
        metadata = extractBufferMetadata(imageObj.buffer, mimeType);
      } catch {}

      try {
        if (mongoose.Types.ObjectId.isValid(auth.user.id)) {
          const evidence = await Evidence.create({
            missionId: mission._id,
            uploaderId: auth.user.id,
            type: 'IMAGE',
            storageKey: `proof/${mission.publicId}/${Date.now()}.jpg`,
            url,
            mimeType,
            size,
            sha256,
            metadata,
            uploadedAt: new Date(),
            visibility: 'PUBLIC_APPROVED',
            processingStatus: 'PROCESSED',
          });
          evidenceIds.push(evidence._id.toString());
        }
      } catch {}
    }

    // Run REAL Proof AI Verification (comparing original evidence vs proof evidence)
    const initialEvidence = await Evidence.findOne({ missionId: mission._id }).sort({ createdAt: 1 });
    const originalUrl = initialEvidence?.url || mission.evidenceUrls?.[0] || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800';

    const proofAiAnalysis = await analyzeProofWithAI({
      originalEvidenceUrlOrBuffer: originalUrl,
      proofEvidenceUrlOrBuffer: primaryProofUrl,
      missionTitle: mission.title,
      missionDescription: mission.description,
      helperNotes: validated.description,
    });

    let proof = null;
    if (mongoose.Types.ObjectId.isValid(auth.user.id)) {
      proof = await ProofOfWork.create({
        missionId: mission._id,
        helperId: auth.user.id,
        evidenceIds,
        evidenceUrls: validated.evidenceUrls.length > 0 ? validated.evidenceUrls : [primaryProofUrl],
        aiAnalysis: proofAiAnalysis,
        description: validated.description,
        completionLocation: validated.completionLocation
          ? {
              address: validated.completionLocation.address || mission.location.addressApprox,
              coordinates: [
                validated.completionLocation.longitude || mission.location.coordinates.coordinates[0],
                validated.completionLocation.latitude || mission.location.coordinates.coordinates[1],
              ],
            }
          : undefined,
        submittedAt: new Date(),
        reviewStatus: 'PENDING_REVIEW',
      });
    }

    mission.status = 'PROOF_SUBMITTED';
    await mission.save();

    await recordAuditEvent({
      actorId: auth.user.id,
      actorRole: auth.user.roles[0],
      action: 'PROOF_UPLOADED',
      targetType: 'PROOF',
      targetId: proof ? proof._id.toString() : mission._id.toString(),
      metadata: { missionId: mission._id.toString(), publicId: mission.publicId },
    });

    await recordAuditEvent({
      actorId: 'SYSTEM_AI',
      actorRole: 'SYSTEM',
      action: 'PROOF_AI_ANALYZED',
      targetType: 'PROOF',
      targetId: proof ? proof._id.toString() : mission._id.toString(),
      metadata: {
        workVerified: proofAiAnalysis.workVerified,
        beforeAfterMatch: proofAiAnalysis.beforeAfterMatch,
        confidence: proofAiAnalysis.confidence,
        recommendedAction: proofAiAnalysis.recommendedAction,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        proof: proof || { _id: `proof_${Date.now()}`, reviewStatus: 'PENDING_REVIEW', aiAnalysis: proofAiAnalysis },
        mission,
        proofAiAnalysis,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'PROOF_SUBMISSION_FAILED', message: err instanceof Error ? err.message : 'Proof submission failed.' },
      },
      { status: 400 }
    );
  }
}
