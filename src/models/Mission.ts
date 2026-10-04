import mongoose, { Schema, Document, Model } from 'mongoose';

export type MissionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'VERIFYING'
  | 'NEEDS_MORE_INFO'
  | 'REJECTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PROOF_SUBMITTED'
  | 'REVIEWING'
  | 'PROOF_REJECTED'
  | 'PROOF_APPROVED'
  | 'COMPLETED';

export type MissionCategory =
  | 'Food Support'
  | 'Education'
  | 'Healthcare Support'
  | 'Infrastructure'
  | 'Emergency Assistance'
  | 'Elder Support'
  | 'Accessibility'
  | 'Environmental Cleanup'
  | 'Community Resources'
  | 'Other';

export type MissionUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface IMission extends Document {
  publicId: string;
  seekerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: MissionCategory;
  urgency: MissionUrgency;
  riskLevel: RiskLevel;
  status: MissionStatus;
  location: {
    addressApprox: string;
    city: string;
    region: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
  };
  locationPrivacy: 'APPROXIMATE' | 'PRECISE';
  requiredSkills: string[];
  resourceRequirements: string[];
  affectedPeopleCount: number;
  fundingEnabled: boolean;
  fundingTarget: number;
  fundingRaised: number;
  verificationStatus: 'PENDING' | 'PASS_AUTO_REVIEW' | 'NEEDS_HUMAN_REVIEW' | 'FLAGGED' | 'INSUFFICIENT_EVIDENCE';
  assignedHelperId?: mongoose.Types.ObjectId;
  isDemo?: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  completedAt?: Date;
}

const MissionSchema: Schema = new Schema<IMission>(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    seekerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Food Support',
        'Education',
        'Healthcare Support',
        'Infrastructure',
        'Emergency Assistance',
        'Elder Support',
        'Accessibility',
        'Environmental Cleanup',
        'Community Resources',
        'Other',
      ],
      required: true,
      index: true,
    },
    urgency: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM', index: true },
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'VERIFYING',
        'NEEDS_MORE_INFO',
        'REJECTED',
        'APPROVED',
        'PUBLISHED',
        'ASSIGNED',
        'IN_PROGRESS',
        'PROOF_SUBMITTED',
        'REVIEWING',
        'PROOF_REJECTED',
        'PROOF_APPROVED',
        'COMPLETED',
      ],
      default: 'DRAFT',
      index: true,
    },
    location: {
      addressApprox: { type: String, default: 'General Locality' },
      city: { type: String, required: true, default: 'Mumbai' },
      region: { type: String, required: true, default: 'Maharashtra' },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }, // [lng, lat]
      },
    },
    locationPrivacy: { type: String, enum: ['APPROXIMATE', 'PRECISE'], default: 'APPROXIMATE' },
    requiredSkills: [{ type: String }],
    resourceRequirements: [{ type: String }],
    affectedPeopleCount: { type: Number, default: 1 },
    fundingEnabled: { type: Boolean, default: false },
    fundingTarget: { type: Number, default: 0 },
    fundingRaised: { type: Number, default: 0 },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'PASS_AUTO_REVIEW', 'NEEDS_HUMAN_REVIEW', 'FLAGGED', 'INSUFFICIENT_EVIDENCE'],
      default: 'PENDING',
    },
    assignedHelperId: { type: Schema.Types.ObjectId, ref: 'User' },
    isDemo: { type: Boolean, default: false },
    publishedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

MissionSchema.index({ 'location.coordinates': '2dsphere' });
MissionSchema.index({ status: 1, category: 1, urgency: 1 });

export const Mission: Model<IMission> =
  mongoose.models.Mission || mongoose.model<IMission>('Mission', MissionSchema);
