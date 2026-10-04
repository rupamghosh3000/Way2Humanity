import { AuditEvent } from '@/models/AuditEvent';
import { connectToDatabase } from '../db/mongoose';
import { memoryStore } from '../db/memoryStore';

export async function recordAuditEvent(params: {
  actorId?: string;
  actorRole?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipHash?: string;
  userAgent?: string;
}) {
  const eventData = {
    _id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    actorId: params.actorId || undefined,
    actorRole: params.actorRole || 'SYSTEM',
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId || undefined,
    metadata: params.metadata || {},
    ipHash: params.ipHash || '',
    userAgent: params.userAgent || '',
    createdAt: new Date(),
  };

  try {
    const db = await connectToDatabase();
    if (!db) {
      memoryStore.auditEvents.unshift(eventData);
      return;
    }

    await AuditEvent.create({
      actorId: params.actorId || undefined,
      actorRole: params.actorRole || 'SYSTEM',
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId || undefined,
      metadata: params.metadata || {},
      ipHash: params.ipHash || '',
      userAgent: params.userAgent || '',
    });
    // Also keep in memoryStore for unified fast access
    memoryStore.auditEvents.unshift(eventData);
  } catch (error) {
    // If DB write fails, ensure event is not lost by recording in memoryStore
    memoryStore.auditEvents.unshift(eventData);
    console.error('Database audit event write failed, saved to memoryStore fallback:', error);
  }
}

