import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { RegisterSchema } from '@/lib/validation';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { recordAuditEvent } from '@/lib/security/audit';
import { memoryStore } from '@/lib/db/memoryStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RegisterSchema.parse(body);

    const db = await connectToDatabase();

    // Memory Store Fallback Mode
    if (!db) {
      const existingMemUser = memoryStore.users.get(validated.email);
      if (existingMemUser) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'EMAIL_EXISTS',
              message: 'An account with this email address already exists.',
            },
          },
          { status: 400 }
        );
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(validated.password, salt);
      const userId = `user_${Date.now()}`;

      const newMemUser = {
        _id: userId,
        name: validated.name,
        email: validated.email,
        passwordHash,
        roles: [validated.role],
        city: 'Mumbai',
        region: 'Maharashtra',
        status: 'ACTIVE',
        reputationSummary: {
          points: 0,
          missionsCompleted: 0,
          communitiesHelped: 0,
          verifiedProofCount: 0,
        },
        createdAt: new Date(),
      };

      memoryStore.users.set(validated.email, newMemUser);

      const tokenPayload = {
        userId,
        email: validated.email,
        roles: [validated.role],
      };

      const accessToken = signAccessToken(tokenPayload);

      const response = NextResponse.json({
        success: true,
        data: {
          user: {
            id: userId,
            name: validated.name,
            email: validated.email,
            roles: [validated.role],
            status: 'ACTIVE',
            reputationSummary: newMemUser.reputationSummary,
          },
          accessToken,
        },
      });

      response.cookies.set('w2h_access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400, // 1 day
        path: '/',
      });

      return response;
    }

    // MongoDB Mode
    const existing = await User.findOne({ email: validated.email });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'An account with this email address already exists.',
          },
        },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    const newUser = await User.create({
      name: validated.name,
      email: validated.email,
      passwordHash,
      roles: [validated.role],
      status: 'ACTIVE',
      emailVerified: true,
      city: 'Mumbai',
      region: 'Maharashtra',
    });

    const tokenPayload = {
      userId: newUser._id.toString(),
      email: newUser.email,
      roles: newUser.roles,
    };

    const accessToken = signAccessToken(tokenPayload);

    await recordAuditEvent({
      actorId: newUser._id.toString(),
      actorRole: validated.role,
      action: 'USER_REGISTERED',
      targetType: 'USER',
      targetId: newUser._id.toString(),
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          roles: newUser.roles,
        },
        accessToken,
      },
    });

    response.cookies.set('w2h_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 1 day
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: err instanceof Error ? err.message : 'Registration failed.',
        },
      },
      { status: 400 }
    );
  }
}
