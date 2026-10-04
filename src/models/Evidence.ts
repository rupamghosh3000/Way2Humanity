import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvidence extends Document {
  missionId: mongoose.Types.ObjectId;
  uploaderId: mongoose.Types.ObjectId;
  type: 'IMAGE' | 'DOCUMENT' | 'VIDEO';
  storageKey: string;
  url: string;
  mimeType: string;
  size: number;
  sha256: string;
  metadata?: {
    exifTimestamp?: string;
    gpsCoordinates?: [number, number];
    cameraModel?: string;
    software?: string;
  };
  capturedAt?: Date;
  uploadedAt: Date;
  visibility: 'PRIVATE' | 'PUBLIC_APPROVED';
  processingStatus: 'PENDING' | 'PROCESSED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema: Schema = new Schema<IEvidence>(
  {
    missionId: { type: Schema.Types.ObjectId, ref: 'Mission', required: true, index: true },
    uploaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['IMAGE', 'DOCUMENT', 'VIDEO'], default: 'IMAGE' },
    storageKey: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    sha256: { type: String, required: true, index: true },
    metadata: {
      exifTimestamp: { type: String },
      gpsCoordinates: { type: [Number] },
      cameraModel: { type: String },
      software: { type: String },
    },
    capturedAt: { type: Date },
    uploadedAt: { type: Date, default: Date.now },
    visibility: { type: String, enum: ['PRIVATE', 'PUBLIC_APPROVED'], default: 'PRIVATE' },
    processingStatus: { type: String, enum: ['PENDING', 'PROCESSED', 'FAILED'], default: 'PENDING', index: true },
  },
  { timestamps: true }
);

export const Evidence: Model<IEvidence> =
  mongoose.models.Evidence || mongoose.model<IEvidence>('Evidence', EvidenceSchema);
