import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVerificationSignal {
  type: 'FILE_INTEGRITY' | 'DUPLICATE_HASH' | 'METADATA_CONSISTENCY' | 'VISUAL_ANOMALY' | 'GEOLOCATION_CONSISTENCY' | 'CONTEXT_CONSISTENCY';
  status: 'PASS' | 'WARN' | 'FAIL' | 'UNAVAILABLE';
  score: number; // 0.0 to 1.0
  detail: string;
}

export interface IVerificationResult {
  _id?: mongoose.Types.ObjectId;
  missionId: mongoose.Types.ObjectId;
  evidenceIds: mongoose.Types.ObjectId[];
  provider: string;
  model: string;
  status: 'PROCESSING' | 'COMPLETED' | 'PROCESSING_FAILED';
  overallRisk: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'INSUFFICIENT_EVIDENCE';
  confidenceBand: 'HIGH' | 'MEDIUM' | 'LOW';
  signals: IVerificationSignal[];
  reasons: string[];
  requiresHumanReview: boolean;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationResultSchema: Schema = new Schema<IVerificationResult>(
  {
    missionId: { type: Schema.Types.ObjectId, ref: 'Mission', required: true, index: true },
    evidenceIds: [{ type: Schema.Types.ObjectId, ref: 'Evidence' }],
    provider: { type: String, default: 'Way2Humanity AI Pipeline' },
    model: { type: String, default: 'gemini-2.0-flash-vision' },
    status: { type: String, enum: ['PROCESSING', 'COMPLETED', 'PROCESSING_FAILED'], default: 'COMPLETED' },
    overallRisk: {
      type: String,
      enum: ['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'INSUFFICIENT_EVIDENCE'],
      default: 'LOW_RISK',
    },
    confidenceBand: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'HIGH' },
    signals: [
      {
        type: { type: String, required: true },
        status: { type: String, required: true },
        score: { type: Number, required: true },
        detail: { type: String, required: true },
      },
    ],
    reasons: [{ type: String }],
    requiresHumanReview: { type: Boolean, default: false },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export const VerificationResult: Model<IVerificationResult> =
  mongoose.models.VerificationResult ||
  mongoose.model<IVerificationResult>('VerificationResult', VerificationResultSchema);
