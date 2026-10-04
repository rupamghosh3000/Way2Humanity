import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILedgerEntry extends Document {
  donationId: mongoose.Types.ObjectId;
  missionId: mongoose.Types.ObjectId;
  entryType: 'CREDIT_DONATION' | 'PLATFORM_FEE' | 'DISBURSEMENT' | 'REFUND';
  amount: number;
  currency: string;
  reference: string;
  createdAt: Date;
}

const LedgerEntrySchema: Schema = new Schema<ILedgerEntry>(
  {
    donationId: { type: Schema.Types.ObjectId, ref: 'Donation', required: true, index: true },
    missionId: { type: Schema.Types.ObjectId, ref: 'Mission', required: true, index: true },
    entryType: { type: String, enum: ['CREDIT_DONATION', 'PLATFORM_FEE', 'DISBURSEMENT', 'REFUND'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    reference: { type: String, required: true },
  },
  { timestamps: true }
);

export const LedgerEntry: Model<ILedgerEntry> =
  mongoose.models.LedgerEntry || mongoose.model<ILedgerEntry>('LedgerEntry', LedgerEntrySchema);
