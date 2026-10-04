import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditEvent extends Document {
  actorId?: mongoose.Types.ObjectId;
  actorRole?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipHash?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditEventSchema: Schema = new Schema<IAuditEvent>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    actorRole: { type: String, default: 'SYSTEM' },
    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true, index: true },
    targetId: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
    ipHash: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

AuditEventSchema.index({ createdAt: -1 });

export const AuditEvent: Model<IAuditEvent> =
  mongoose.models.AuditEvent || mongoose.model<IAuditEvent>('AuditEvent', AuditEventSchema);
