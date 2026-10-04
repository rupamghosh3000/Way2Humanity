import { NextRequest, NextResponse } from 'next/server';
import { parseUnstructuredReport } from '@/lib/services/ai';

export async function POST(req: NextRequest) {
  try {
    const { rawText } = await req.json();

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Raw text description is required.' },
        },
        { status: 400 }
      );
    }

    const copilotResult = await parseUnstructuredReport(rawText);

    return NextResponse.json({
      success: true,
      data: { copilot: copilotResult },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'COPILOT_FAILED', message: err instanceof Error ? err.message : 'AI Copilot failed.' },
      },
      { status: 500 }
    );
  }
}
