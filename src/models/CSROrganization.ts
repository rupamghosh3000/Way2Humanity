import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICSROrganization extends Document {
  ownerUserId: mongoose.Types.ObjectId;
  legalName: string;
  displayName: string;
  logoUrl?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  contactEmail: string;
  sector?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CSROrganizationSchema: Schema = new Schema<ICSROrganization>(
  {
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    legalName: { type: String, required: true },
    displayName: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
    contactEmail: { type: String, required: true },
    sector: { type: String, default: 'Technology & Social Good' },
    website: { type: String, default: '' },
  },
  { timestamps: true }
);

export const CSROrganization: Model<ICSROrganization> =
  mongoose.models.CSROrganization ||
  mongoose.model<ICSROrganization>('CSROrganization', CSROrganizationSchema);
