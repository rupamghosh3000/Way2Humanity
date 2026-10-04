import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { recordAuditEvent } from '@/lib/security/audit';
import { memoryStore } from '@/lib/db/memoryStore';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['ADMIN']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const db = await connectToDatabase();

    if (!db) {
      const usersList = Array.from(memoryStore.users.values()).map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        roles: u.roles,
        status: u.status,
        reputationSummary: u.reputationSummary,
      }));
      return NextResponse.json({
        success: true,
        data: { users: usersList },
      });
    }

    const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: { users },
    });
  } catch {
    const usersList = Array.from(memoryStore.users.values()).map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      roles: u.roles,
      status: u.status,
      reputationSummary: u.reputationSummary,
    }));
    return NextResponse.json({
      success: true,
      data: { users: usersList },
    });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['ADMIN']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const { userId, action } = await req.json();

    const db = await connectToDatabase();

    if (!db) {
      return NextResponse.json({
        success: true,
        data: { user: { _id: userId, status: action === 'SUSPEND' ? 'SUSPENDED' : 'ACTIVE' } },
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'User not found' } }, { status: 404 });
    }

    user.status = action === 'SUSPEND' ? 'SUSPENDED' : 'ACTIVE';
    await user.save();

    await recordAuditEvent({
      actorId: auth.user.id,
      actorRole: 'ADMIN',
      action: `USER_${action}ED`,
      targetType: 'USER',
      targetId: userId,
    });

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: { message: err instanceof Error ? err.message : 'User action failed' } },
      { status: 400 }
    );
  }
}
