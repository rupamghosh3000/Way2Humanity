import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDispute extends Document {
  reporterId: mongoose.Types.ObjectId;
  targetType: 'MISSION' | 'USER' | 'PROOF' | 'DONATION';
  targetId: mongoose.Types.ObjectId;
  category: 'FALSE_MISSION' | 'FRAUDULENT_EVIDENCE' | 'INCORRECT_COMPLETION' | 'PAYMENT_ISSUE' | 'HARASSMENT' | 'MISUSE_OF_FUNDS';
  description: string;
  evidenceIds: mongoose.Types.ObjectId[];
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  assignedAdminId?: mongoose.Types.ObjectId;
  resolution?: string;
  messages: Array<{
    senderId: mongoose.Types.ObjectId;
    message: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  resolvedAt?: Date;
  updatedAt: Date;
}

const DisputeSchema: Schema = new Schema<IDispute>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: { type: String, enum: ['MISSION', 'USER', 'PROOF', 'DONATION'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    category: {
      type: String,
      enum: ['FALSE_MISSION', 'FRAUDULENT_EVIDENCE', 'INCORRECT_COMPLETION', 'PAYMENT_ISSUE', 'HARASSMENT', 'MISUSE_OF_FUNDS'],
      required: true,
    },
    description: { type: String, required: true },
    evidenceIds: [{ type: Schema.Types.ObjectId, ref: 'Evidence' }],
    status: { type: String, enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'], default: 'OPEN', index: true },
    assignedAdminId: { type: Schema.Types.ObjectId, ref: 'User' },
    resolution: { type: String, default: '' },
    messages: [
      {
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const Dispute: Model<IDispute> =
  mongoose.models.Dispute || mongoose.model<IDispute>('Dispute', DisputeSchema);
