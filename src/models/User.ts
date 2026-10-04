import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'SEEKER' | 'HELPER' | 'DONOR' | 'CSR_ORGANIZATION' | 'VERIFIER' | 'ADMIN';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  roles: UserRole[];
  phone?: string;
  city?: string;
  region?: string;
  locationApprox?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  skills: string[];
  availability?: string;
  emailVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  reputationSummary: {
    points: number;
    missionsCompleted: number;
    communitiesHelped: number;
    verifiedProofCount: number;
  };
  privacySettings: {
    showFullName: boolean;
    showCityOnly: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    roles: {
      type: [String],
      enum: ['SEEKER', 'HELPER', 'DONOR', 'CSR_ORGANIZATION', 'VERIFIER', 'ADMIN'],
      default: ['SEEKER'],
    },
    phone: { type: String, default: '' },
    city: { type: String, default: 'Mumbai' },
    region: { type: String, default: 'Maharashtra' },
    locationApprox: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [72.8777, 19.0760] }, // Default Mumbai coordinates
    },
    skills: [{ type: String }],
    availability: { type: String, default: 'AVAILABLE' },
    emailVerified: { type: Boolean, default: true },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'], default: 'ACTIVE' },
    reputationSummary: {
      points: { type: Number, default: 0 },
      missionsCompleted: { type: Number, default: 0 },
      communitiesHelped: { type: Number, default: 0 },
      verifiedProofCount: { type: Number, default: 0 },
    },
    privacySettings: {
      showFullName: { type: Boolean, default: true },
      showCityOnly: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

UserSchema.index({ status: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ locationApprox: '2dsphere' });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
