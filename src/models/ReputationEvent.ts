import mongoose, { Schema, Document, Model } from 'mongoose';

export type ReputationEventType =
  | 'MISSION_COMPLETED'
  | 'PROOF_APPROVED'
  | 'VERIFIED_ASSISTANCE'
  | 'COMMUNITY_REVIEW';

export interface IReputationEvent extends Document {
  userId: mongoose.Types.ObjectId;
  missionId?: mongoose.Types.ObjectId;
  type: ReputationEventType;
  points: number;
  reason: string;
  createdAt: Date;
}

const ReputationEventSchema: Schema = new Schema<IReputationEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    missionId: { type: Schema.Types.ObjectId, ref: 'Mission', index: true },
    type: { type: String, enum: ['MISSION_COMPLETED', 'PROOF_APPROVED', 'VERIFIED_ASSISTANCE', 'COMMUNITY_REVIEW'], required: true },
    points: { type: Number, required: true },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

export const ReputationEvent: Model<IReputationEvent> =
  mongoose.models.ReputationEvent ||
  mongoose.model<IReputationEvent>('ReputationEvent', ReputationEventSchema);
