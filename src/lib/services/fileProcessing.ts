import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface ExtractedMetadata {
  exifTimestamp?: string;
  gpsCoordinates?: [number, number];
  cameraModel?: string;
  software?: string;
  dimensions?: { width: number; height: number };
  hasExif: boolean;
}

export interface ProcessedFileInfo {
  sha256: string;
  size: number;
  mimeType: string;
  filename: string;
  localPath: string;
  publicUrl: string;
  metadata: ExtractedMetadata;
}

/**
 * Calculates SHA-256 hash of a Buffer.
 */
export function calculateBufferHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Extracts basic EXIF metadata and image dimensions from JPEG/PNG buffer.
 */
export function extractBufferMetadata(buffer: Buffer, mimeType: string): ExtractedMetadata {
  const result: ExtractedMetadata = {
    hasExif: false,
  };

  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    try {
      // Basic JPEG marker scan for APP1 (0xFFE1) EXIF segment
      let offset = 2;
      while (offset < buffer.length - 4) {
        if (buffer[offset] === 0xff && buffer[offset + 1] === 0xe1) {
          result.hasExif = true;
          const segmentStr = buffer.toString('binary', offset + 4, Math.min(offset + 1024, buffer.length));
          
          // Check for common camera model strings or software tags
          if (segmentStr.includes('iPhone') || segmentStr.includes('Apple')) {
            result.cameraModel = 'Apple iPhone';
          } else if (segmentStr.includes('Samsung')) {
            result.cameraModel = 'Samsung Galaxy';
          } else if (segmentStr.includes('Pixel') || segmentStr.includes('Google')) {
            result.cameraModel = 'Google Pixel';
          }

          // Check for timestamp string (YYYY:MM:DD HH:MM:SS)
          const dateMatch = segmentStr.match(/\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}/);
          if (dateMatch) {
            result.exifTimestamp = dateMatch[0].replace(/:/g, '-').replace(' ', 'T');
          }
          break;
        }
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    } catch {}
  }

  return result;
}

/**
 * Saves file buffer to public/uploads directory and returns public URL & file metadata.
 */
export async function saveUploadedFile(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  folder = 'evidence'
): Promise<ProcessedFileInfo> {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  if (!allowedMimes.includes(mimeType.toLowerCase())) {
    throw new Error(`Invalid or unsupported file MIME type: ${mimeType}`);
  }

  const sha256 = calculateBufferHash(buffer);
  const ext = (path.extname(originalFilename) || '.jpg').toLowerCase();
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
  const uniqueName = `${Date.now()}_${sha256.slice(0, 12)}${ext}`;
  
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, uniqueName);
  fs.writeFileSync(filePath, buffer);

  const publicUrl = `/uploads/${safeFolder}/${uniqueName}`;
  const metadata = extractBufferMetadata(buffer, mimeType);

  return {
    sha256,
    size: buffer.length,
    mimeType,
    filename: originalFilename,
    localPath: filePath,
    publicUrl,
    metadata,
  };
}

/**
 * Reads a local file or fetches a remote image URL into a Buffer.
 */
export async function fetchImageAsBuffer(urlOrPath: string): Promise<{ buffer: Buffer; mimeType: string }> {
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    const res = await fetch(urlOrPath);
    if (!res.ok) {
      throw new Error(`Failed to fetch image from URL: ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const mimeType = res.headers.get('content-type') || 'image/jpeg';
    return { buffer: Buffer.from(arrayBuffer), mimeType };
  } else if (urlOrPath.startsWith('/uploads/')) {
    const localFilePath = path.join(process.cwd(), 'public', urlOrPath);
    if (fs.existsSync(localFilePath)) {
      const buffer = fs.readFileSync(localFilePath);
      const ext = path.extname(localFilePath).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      return { buffer, mimeType };
    }
  } else if (fs.existsSync(urlOrPath)) {
    const buffer = fs.readFileSync(urlOrPath);
    const ext = path.extname(urlOrPath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    return { buffer, mimeType };
  }

  throw new Error(`Unable to resolve evidence file source: ${urlOrPath}`);
}
