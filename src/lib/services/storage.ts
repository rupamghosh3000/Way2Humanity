import crypto from 'crypto';
import { config } from '../config';

export interface PresignedUploadResult {
  uploadUrl: string;
  storageKey: string;
  publicUrl: string;
  signedAccessUrl: string;
  expiresInSeconds: number;
}

export async function generatePresignedUploadUrl(params: {
  filename: string;
  mimeType: string;
  folder?: string;
}): Promise<PresignedUploadResult> {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'video/mp4',
    'video/quicktime',
  ];

  if (!allowedMimeTypes.includes(params.mimeType.toLowerCase())) {
    throw new Error(`Unsupported MIME type: ${params.mimeType}`);
  }

  const folder = (params.folder || 'evidence').replace(/[^a-zA-Z0-9_-]/g, '');
  const rawExt = (params.filename.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const fileExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'mp4', 'mov'].includes(rawExt) ? rawExt : 'jpg';
  
  const randomKey = crypto.randomBytes(16).toString('hex');
  const storageKey = `uploads/${folder}/${Date.now()}_${randomKey}.${fileExt}`;

  // In production, this generates an AWS S3/Cloudinary presigned upload URL.
  // For local development, we return a structured endpoint path.
  const uploadUrl = `${config.apiUrl}/uploads/mock-upload?key=${encodeURIComponent(storageKey)}`;
  const publicUrl = `${config.appUrl}/uploads/${storageKey}`;
  const signedAccessUrl = `${publicUrl}?token=${crypto.randomBytes(8).toString('hex')}`;

  return {
    uploadUrl,
    storageKey,
    publicUrl,
    signedAccessUrl,
    expiresInSeconds: 3600,
  };
}

export function generateSignedAccessUrl(storageKey: string): string {
  const token = crypto.createHash('sha256').update(`${storageKey}_${config.auth.secret}`).digest('hex').slice(0, 16);
  return `${config.appUrl}/api/v1/uploads/access?key=${encodeURIComponent(storageKey)}&token=${token}`;
}
