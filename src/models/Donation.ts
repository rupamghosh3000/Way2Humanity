import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDonation extends Document {
  missionId: mongoose.Types.ObjectId;
  donorId?: mongoose.Types.ObjectId;
  provider: 'razorpay' | 'stripe';
  providerOrderId: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  fee: number;
  netAmount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  anonymous: boolean;
  createdAt: Date;
  paidAt?: Date;
  refundedAt?: Date;
  updatedAt: Date;
}

const DonationSchema: Schema = new Schema<IDonation>(
  {
    missionId: { type: Schema.Types.ObjectId, ref: 'Mission', required: true, index: true },
    donorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    provider: { type: String, enum: ['razorpay', 'stripe'], default: 'razorpay' },
    providerOrderId: { type: String, required: true, index: true },
    providerPaymentId: { type: String, sparse: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    fee: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING', index: true },
    anonymous: { type: Boolean, default: false },
    paidAt: { type: Date },
    refundedAt: { type: Date },
  },
  { timestamps: true }
);

export const Donation: Model<IDonation> =
  mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema);
