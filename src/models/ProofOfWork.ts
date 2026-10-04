import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProofOfWork extends Document {
  missionId: mongoose.Types.ObjectId;
  helperId: mongoose.Types.ObjectId;
  evidenceIds: mongoose.Types.ObjectId[];
  evidenceUrls?: string[];
  description: string;
  aiAnalysis?: {
    workVerified: boolean;
    beforeAfterMatch: string;
    confidence: number;
    observations: string[];
    concerns: string[];
    recommendedAction: string;
  };
  completionLocation?: {
    address: string;
    coordinates: [number, number]; // [lng, lat]
  };
  submittedAt: Date;
  reviewStatus: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProofOfWorkSchema: Schema = new Schema<IProofOfWork>(
  {
    missionId: { type: Schema.Types.ObjectId, ref: 'Mission', required: true, index: true },
    helperId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    evidenceIds: [{ type: Schema.Types.ObjectId, ref: 'Evidence' }],
    evidenceUrls: [{ type: String }],
    description: { type: String, required: true },
    aiAnalysis: {
      workVerified: { type: Boolean },
      beforeAfterMatch: { type: String },
      confidence: { type: Number },
      observations: [{ type: String }],
      concerns: [{ type: String }],
      recommendedAction: { type: String },
    },
    completionLocation: {
      address: { type: String },
      coordinates: { type: [Number] },
    },
    submittedAt: { type: Date, default: Date.now },
    reviewStatus: { type: String, enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED'], default: 'PENDING_REVIEW', index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const ProofOfWork: Model<IProofOfWork> =
  mongoose.models.ProofOfWork || mongoose.model<IProofOfWork>('ProofOfWork', ProofOfWorkSchema);
