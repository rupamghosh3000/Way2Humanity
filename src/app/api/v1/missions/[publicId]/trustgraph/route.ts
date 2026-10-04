import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Mission } from '@/models/Mission';
import { AuditEvent } from '@/models/AuditEvent';
import { Evidence } from '@/models/Evidence';
import { VerificationResult } from '@/models/VerificationResult';
import { ProofOfWork } from '@/models/ProofOfWork';
import { memoryStore } from '@/lib/db/memoryStore';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const db = await connectToDatabase();

    let mission: any = null;
    let events: any[] = [];
    let evidenceRecords: any[] = [];
    let verificationResult: any = null;
    let proofRecord: any = null;

    if (db) {
      try {
        mission = await Mission.findOne({ publicId: params.publicId });
        if (!mission && mongoose.Types.ObjectId.isValid(params.publicId)) {
          mission = await Mission.findById(params.publicId);
        }
        if (mission) {
          events = await AuditEvent.find({
            $or: [
              { targetId: mission._id.toString() },
              { 'metadata.missionId': mission._id.toString() },
              { 'metadata.publicId': mission.publicId },
            ],
          }).sort({ createdAt: 1 });

          evidenceRecords = await Evidence.find({ missionId: mission._id });
          verificationResult = await VerificationResult.findOne({ missionId: mission._id });
          proofRecord = await ProofOfWork.findOne({ missionId: mission._id });
        }
      } catch (dbErr) {
        console.warn('DB query in trustgraph failed, checking memoryStore:', dbErr);
      }
    }

    // MemoryStore fallback if not found in MongoDB
    if (!mission && memoryStore) {
      mission = memoryStore.missions?.get(params.publicId);
      if (!mission && memoryStore.missions) {
        for (const m of memoryStore.missions.values()) {
          if (m._id === params.publicId || m.publicId === params.publicId) {
            mission = m;
            break;
          }
        }
      }

      if (mission) {
        events = (memoryStore.auditEvents || []).filter((evt: any) =>
          evt && (
            evt.targetId === mission._id ||
            evt.metadata?.missionId === mission._id ||
            evt.metadata?.publicId === mission.publicId
          )
        );
        verificationResult = memoryStore.verificationResults?.get(mission._id) || null;
      }
    }

    if (!mission) {
      return NextResponse.json({ success: false, error: { message: 'Mission not found.' } }, { status: 404 });
    }

    const nodes = (events || []).map((evt, idx) => ({
      stepIndex: idx + 1,
      action: evt?.action || 'AUDIT_ACTION',
      actorRole: evt?.actorRole || 'SYSTEM',
      targetType: evt?.targetType || 'MISSION',
      timestamp: evt?.createdAt || new Date(),
      metadata: {
        ...(evt?.metadata || {}),
        evidenceHash: evidenceRecords[0]?.sha256 || 'hash_unspecified',
        modelProvider: verificationResult?.provider || 'Google Gemini Vision API',
        modelName: verificationResult?.model || 'gemini-1.5-flash',
      },
    }));

    // Build high-level trust status summary
    const isAiAnalyzed = !!verificationResult || (events || []).some((e: any) => e?.action?.includes('AI'));
    const isHumanVerified = (events || []).some((e: any) => e?.action?.includes('VERIFICATION_REVIEW') || e?.action?.includes('PROOF_APPROVED'));
    const isProofVerified = proofRecord?.reviewStatus === 'APPROVED';

    return NextResponse.json({
      success: true,
      data: {
        publicId: mission.publicId,
        title: mission.title,
        status: mission.status,
        verificationStatus: mission.verificationStatus,
        trustChainLength: nodes.length,
        integrity: {
          evidenceCount: evidenceRecords.length,
          primaryEvidenceSha256: evidenceRecords[0]?.sha256 || null,
          isAiAnalyzed,
          isHumanVerified,
          isProofVerified,
        },
        nodes,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: { message: err instanceof Error ? err.message : 'Unknown error', stack: err instanceof Error ? err.stack : undefined } },
      { status: 500 }
    );
  }
}

