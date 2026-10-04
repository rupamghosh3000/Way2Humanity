import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMissionAssignment extends Document {
  missionId: mongoose.Types.ObjectId;
  helperId: mongoose.Types.ObjectId;
  status: 'ACCEPTED' | 'IN_PROGRESS' | 'WITHDRAWN' | 'COMPLETED';
  acceptedAt: Date;
  startedAt?: Date;
  withdrawnAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MissionAssignmentSchema: Schema = new Schema<IMissionAssignment>(
  {
    missionId: { type: Schema.Types.ObjectId, ref: 'Mission', required: true, index: true },
    helperId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['ACCEPTED', 'IN_PROGRESS', 'WITHDRAWN', 'COMPLETED'], default: 'ACCEPTED' },
    acceptedAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    withdrawnAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

MissionAssignmentSchema.index({ missionId: 1, helperId: 1 });

export const MissionAssignment: Model<IMissionAssignment> =
  mongoose.models.MissionAssignment ||
  mongoose.model<IMissionAssignment>('MissionAssignment', MissionAssignmentSchema);
