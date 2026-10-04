import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  targetType: 'MISSION_VERIFICATION' | 'PROOF_OF_WORK';
  targetId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  decision: 'APPROVE' | 'REJECT' | 'NEEDS_MORE_INFO';
  reasonCode: string;
  notes: string;
  evidenceReferences: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema<IReview>(
  {
    targetType: { type: String, enum: ['MISSION_VERIFICATION', 'PROOF_OF_WORK'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    decision: { type: String, enum: ['APPROVE', 'REJECT', 'NEEDS_MORE_INFO'], required: true },
    reasonCode: { type: String, required: true },
    notes: { type: String, default: '' },
    evidenceReferences: [{ type: Schema.Types.ObjectId, ref: 'Evidence' }],
  },
  { timestamps: true }
);

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
