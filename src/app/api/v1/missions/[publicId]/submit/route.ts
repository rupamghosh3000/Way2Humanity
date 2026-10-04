import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Mission } from '@/models/Mission';
import { Evidence } from '@/models/Evidence';
import { VerificationResult } from '@/models/VerificationResult';
import { analyzeEvidenceItem } from '@/lib/services/ai';
import { recordAuditEvent } from '@/lib/security/audit';
import { memoryStore } from '@/lib/db/memoryStore';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  const auth = await requireAuth(req);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  const db = await connectToDatabase();

  // Memory Store Fallback
  if (!db) {
    const memMission =
      memoryStore.missions.get(params.publicId) ||
      Array.from(memoryStore.missions.values()).find(
        (m) => m.publicId === params.publicId || m._id === params.publicId
      );

    if (!memMission) {
      return NextResponse.json({ success: false, error: { message: 'Mission not found.' } }, { status: 404 });
    }

    if (memMission.seekerId !== auth.user.id && !auth.user.roles.includes('ADMIN')) {
      return NextResponse.json({ success: false, error: { message: 'Forbidden.' } }, { status: 403 });
    }

    // Run AI Verification for MemoryStore
    const analysis = await analyzeEvidenceItem({
      evidenceUrlOrPath: memMission.evidenceUrls?.[0] || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
      sha256: 'mem_sha256_' + Date.now(),
      mimeType: 'image/jpeg',
      size: 1024 * 400,
      existingHashes: [],
      description: memMission.description,
      category: memMission.category,
      claimedLocation: memMission.location?.addressApprox,
    });

    if (analysis.status === 'AI_VERIFICATION_UNAVAILABLE' || analysis.requiresHumanReview) {
      memMission.status = 'VERIFYING';
      memMission.verificationStatus = 'NEEDS_HUMAN_REVIEW';
    } else if (analysis.decision === 'PASS_AUTO_REVIEW') {
      memMission.status = 'PUBLISHED';
      memMission.verificationStatus = 'PASS_AUTO_REVIEW';
      memMission.publishedAt = new Date();
    } else {
      memMission.status = 'VERIFYING';
      memMission.verificationStatus = 'NEEDS_HUMAN_REVIEW';
    }

    memoryStore.missions.set(memMission.publicId, memMission);

    return NextResponse.json({
      success: true,
      data: {
        mission: memMission,
        verificationResult: {
          provider: analysis.provider,
          model: analysis.model,
          status: analysis.status,
          overallRisk: analysis.overallRisk,
          confidenceBand: analysis.confidenceBand,
          signals: analysis.signals,
          reasons: analysis.reasons,
          requiresHumanReview: analysis.requiresHumanReview,
          structuredAnalysis: analysis.structuredAnalysis,
        },
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

  if (mission.seekerId.toString() !== auth.user.id && !auth.user.roles.includes('ADMIN')) {
    return NextResponse.json({ success: false, error: { message: 'Forbidden.' } }, { status: 403 });
  }

  mission.status = 'VERIFYING';
  await mission.save();

  await recordAuditEvent({
    actorId: auth.user.id,
    actorRole: auth.user.roles[0],
    action: 'MISSION_SUBMITTED',
    targetType: 'MISSION',
    targetId: mission._id.toString(),
  });

  // Fetch evidence records for this mission
  const evidenceList = await Evidence.find({ missionId: mission._id });
  const allOtherHashes = (await Evidence.find({ missionId: { $ne: mission._id } }).select('sha256')).map((e) => e.sha256);

  const primaryEvidence = evidenceList[0];
  const evidenceSource = primaryEvidence?.url || primaryEvidence?.storageKey;

  // Execute REAL Multimodal AI Verification Analysis
  const analysis = await analyzeEvidenceItem({
    evidenceUrlOrPath: evidenceSource,
    sha256: primaryEvidence?.sha256 || 'hash_' + Date.now(),
    mimeType: primaryEvidence?.mimeType || 'image/jpeg',
    size: primaryEvidence?.size || 1024 * 500,
    existingHashes: allOtherHashes,
    description: mission.description,
    category: mission.category,
    claimedLocation: mission.location?.addressApprox,
    hasExif: !!primaryEvidence?.metadata?.exifTimestamp,
  });

  const verificationRecord = await VerificationResult.create({
    missionId: mission._id,
    evidenceIds: evidenceList.map((e) => e._id),
    provider: analysis.provider,
    model: analysis.model,
    status: analysis.status,
    overallRisk: analysis.overallRisk,
    confidenceBand: analysis.confidenceBand,
    signals: analysis.signals,
    reasons: analysis.reasons,
    requiresHumanReview: analysis.requiresHumanReview,
  });

  await recordAuditEvent({
    actorId: 'SYSTEM_AI',
    actorRole: 'SYSTEM',
    action: 'AI_ANALYSIS_COMPLETED',
    targetType: 'VERIFICATION_RESULT',
    targetId: verificationRecord._id.toString(),
    metadata: {
      provider: analysis.provider,
      model: analysis.model,
      overallRisk: analysis.overallRisk,
      requiresHumanReview: analysis.requiresHumanReview,
    },
  });

  if (!analysis.requiresHumanReview && analysis.decision === 'PASS_AUTO_REVIEW') {
    mission.status = 'PUBLISHED';
    mission.verificationStatus = 'PASS_AUTO_REVIEW';
    mission.publishedAt = new Date();
    await mission.save();

    await recordAuditEvent({
      actorId: 'SYSTEM_AI',
      actorRole: 'SYSTEM',
      action: 'MISSION_APPROVED_AUTO',
      targetType: 'MISSION',
      targetId: mission._id.toString(),
    });
  } else {
    mission.verificationStatus = 'NEEDS_HUMAN_REVIEW';
    await mission.save();

    await recordAuditEvent({
      actorId: 'SYSTEM_AI',
      actorRole: 'SYSTEM',
      action: 'MISSION_VERIFICATION_ROUTED_HUMAN',
      targetType: 'MISSION',
      targetId: mission._id.toString(),
      metadata: { reasons: analysis.reasons },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      mission,
      verificationResult: verificationRecord,
    },
  });
}
