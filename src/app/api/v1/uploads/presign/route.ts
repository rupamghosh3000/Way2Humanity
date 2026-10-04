import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { generatePresignedUploadUrl } from '@/lib/services/storage';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const { filename, mimeType, folder } = await req.json();

    if (!filename || !mimeType) {
      return NextResponse.json(
        { success: false, error: { message: 'Filename and mimeType are required.' } },
        { status: 400 }
      );
    }

    const presignedResult = await generatePresignedUploadUrl({
      filename,
      mimeType,
      folder: folder || 'evidence',
    });

    return NextResponse.json({
      success: true,
      data: presignedResult,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: { message: err instanceof Error ? err.message : 'Presign failed' } },
      { status: 500 }
    );
  }
}
