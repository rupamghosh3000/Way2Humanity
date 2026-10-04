import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { memoryStore } from '@/lib/db/memoryStore';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  const db = await connectToDatabase();

  if (!db) {
    const memUser = memoryStore.users.get(auth.user.email);
    if (memUser) {
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: memUser._id,
            name: memUser.name,
            email: memUser.email,
            roles: memUser.roles,
            city: memUser.city,
            region: memUser.region,
            reputationSummary: memUser.reputationSummary,
          },
        },
      });
    }
    return NextResponse.json({
      success: true,
      data: { user: auth.user },
    });
  }

  const dbUser = await User.findById(auth.user.id).select('-passwordHash');

  return NextResponse.json({
    success: true,
    data: { user: dbUser || auth.user },
  });
}
