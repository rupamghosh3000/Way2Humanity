import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { saveUploadedFile, calculateBufferHash, extractBufferMetadata } from '@/lib/services/fileProcessing';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Evidence } from '@/models/Evidence';
import { recordAuditEvent } from '@/lib/security/audit';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let buffer: Buffer;
    let filename = 'upload.jpg';
    let mimeType = 'image/jpeg';
    let missionId = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      missionId = (formData.get('missionId') as string) || '';

      if (!file) {
        return NextResponse.json({ success: false, error: { message: 'No file provided in form data.' } }, { status: 400 });
      }

      filename = file.name || 'upload.jpg';
      mimeType = file.type || 'image/jpeg';
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      const body = await req.json();
      missionId = body.missionId || '';
      filename = body.filename || 'upload.jpg';
      mimeType = body.mimeType || 'image/jpeg';

      if (body.base64Data) {
        const base64Clean = body.base64Data.replace(/^data:image\/\w+;base64,/, '');
        buffer = Buffer.from(base64Clean, 'base64');
      } else {
        return NextResponse.json({ success: false, error: { message: 'Missing file payload or base64Data.' } }, { status: 400 });
      }
    }

    // Process file, calculate real SHA-256 hash, save to public/uploads
    const processed = await saveUploadedFile(buffer, filename, mimeType, 'evidence');

    await connectToDatabase();

    // Check duplicate hash across platform
    let isDuplicate = false;
    try {
      const existing = await Evidence.findOne({ sha256: processed.sha256 });
      if (existing) {
        isDuplicate = true;
      }
    } catch {}

    await recordAuditEvent({
      actorId: auth.user.id,
      actorRole: auth.user.roles[0],
      action: 'EVIDENCE_FILE_UPLOADED',
      targetType: 'EVIDENCE',
      targetId: processed.sha256.slice(0, 16),
      metadata: {
        sha256: processed.sha256,
        mimeType: processed.mimeType,
        size: processed.size,
        isDuplicate,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        url: processed.publicUrl,
        sha256: processed.sha256,
        size: processed.size,
        mimeType: processed.mimeType,
        metadata: processed.metadata,
        isDuplicate,
        uploadedAt: new Date(),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: err instanceof Error ? err.message : 'File upload processing failed.',
        },
      },
      { status: 400 }
    );
  }
}
