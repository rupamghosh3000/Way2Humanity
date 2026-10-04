import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'v1.0.0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
