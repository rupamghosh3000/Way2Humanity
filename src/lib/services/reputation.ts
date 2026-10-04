import { User } from '@/models/User';
import { ReputationEvent, ReputationEventType } from '@/models/ReputationEvent';
import { connectToDatabase } from '../db/mongoose';
import { recordAuditEvent } from '../security/audit';
import { memoryStore } from '../db/memoryStore';

export async function awardReputationPoints(params: {
  userId: string;
  missionId?: string;
  type: ReputationEventType;
  points: number;
  reason: string;
}) {
  const db = await connectToDatabase();

  if (!db) {
    let memUser = memoryStore.users.get(params.userId);
    if (!memUser) {
      for (const u of memoryStore.users.values()) {
        if (u._id === params.userId || u.email === params.userId) {
          memUser = u;
          break;
        }
      }
    }

    if (memUser) {
      memUser.reputationSummary.points += params.points;
      if (params.type === 'MISSION_COMPLETED' || params.type === 'PROOF_APPROVED') {
        memUser.reputationSummary.missionsCompleted += 1;
        memUser.reputationSummary.communitiesHelped += 1;
      }
      if (params.type === 'PROOF_APPROVED') {
        memUser.reputationSummary.verifiedProofCount += 1;
      }
    }

    await recordAuditEvent({
      actorId: params.userId,
      action: 'REPUTATION_AWARDED',
      targetType: 'USER',
      targetId: params.userId,
      metadata: {
        points: params.points,
        type: params.type,
        reason: params.reason,
        missionId: params.missionId,
      },
    });

    return {
      _id: `rep_${Date.now()}`,
      userId: params.userId,
      missionId: params.missionId,
      type: params.type,
      points: params.points,
      reason: params.reason,
      createdAt: new Date(),
    };
  }

  const event = await ReputationEvent.create({
    userId: params.userId,
    missionId: params.missionId || undefined,
    type: params.type,
    points: params.points,
    reason: params.reason,
  });

  const user = await User.findById(params.userId);
  if (user) {
    user.reputationSummary.points += params.points;
    if (params.type === 'MISSION_COMPLETED' || params.type === 'PROOF_APPROVED') {
      user.reputationSummary.missionsCompleted += 1;
      user.reputationSummary.communitiesHelped += 1;
    }
    if (params.type === 'PROOF_APPROVED') {
      user.reputationSummary.verifiedProofCount += 1;
    }
    await user.save();
  }

  await recordAuditEvent({
    actorId: params.userId,
    action: 'REPUTATION_AWARDED',
    targetType: 'USER',
    targetId: params.userId,
    metadata: {
      points: params.points,
      type: params.type,
      reason: params.reason,
      missionId: params.missionId,
    },
  });

  return event;
}

