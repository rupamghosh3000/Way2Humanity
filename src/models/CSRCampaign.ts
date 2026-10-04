import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICSRCampaign extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  missionIds: mongoose.Types.ObjectId[];
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  startDate?: Date;
  endDate?: Date;
  brandedPageSlug: string;
  createdAt: Date;
  updatedAt: Date;
}

const CSRCampaignSchema: Schema = new Schema<ICSRCampaign>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'CSROrganization', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    missionIds: [{ type: Schema.Types.ObjectId, ref: 'Mission' }],
    status: { type: String, enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'PAUSED'], default: 'ACTIVE' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    brandedPageSlug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export const CSRCampaign: Model<ICSRCampaign> =
  mongoose.models.CSRCampaign || mongoose.model<ICSRCampaign>('CSRCampaign', CSRCampaignSchema);
