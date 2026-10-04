import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, TokenPayload } from './jwt';
import { connectToDatabase } from '../db/mongoose';
import { User, UserRole } from '@/models/User';
import { memoryStore } from '../db/memoryStore';

export interface AuthResult {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    roles: UserRole[];
    name: string;
  };
  errorResponse?: NextResponse;
}

export async function requireAuth(
  req: NextRequest,
  allowedRoles?: UserRole[]
): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization');
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    const cookieToken = req.cookies.get('w2h_access_token')?.value;
    if (cookieToken) {
      token = cookieToken;
    }
  }

  if (!token) {
    return {
      authenticated: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication token is missing or invalid.',
          },
        },
        { status: 401 }
      ),
    };
  }

  const payload: TokenPayload | null = verifyAccessToken(token);

  if (!payload) {
    return {
      authenticated: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED_OR_INVALID',
            message: 'Session has expired or token is invalid.',
          },
        },
        { status: 401 }
      ),
    };
  }

  const db = await connectToDatabase();
  let userRecord: { id: string; email: string; roles: UserRole[]; name: string; status: string } | null = null;

  if (!db) {
    // Memory Store Fallback
    const memUser = memoryStore.users.get(payload.email);
    if (memUser) {
      userRecord = {
        id: memUser._id,
        email: memUser.email,
        roles: memUser.roles as UserRole[],
        name: memUser.name,
        status: memUser.status,
      };
    } else {
      userRecord = {
        id: payload.userId,
        email: payload.email,
        roles: payload.roles as UserRole[],
        name: payload.email.split('@')[0],
        status: 'ACTIVE',
      };
    }
  } else {
    // MongoDB Mode
    try {
      const dbUser = await User.findById(payload.userId);
      if (dbUser) {
        userRecord = {
          id: dbUser._id.toString(),
          email: dbUser.email,
          roles: dbUser.roles,
          name: dbUser.name,
          status: dbUser.status,
        };
      }
    } catch {
      userRecord = {
        id: payload.userId,
        email: payload.email,
        roles: payload.roles as UserRole[],
        name: payload.email.split('@')[0],
        status: 'ACTIVE',
      };
    }
  }

  if (!userRecord || userRecord.status === 'SUSPENDED') {
    return {
      authenticated: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Account is suspended or no longer exists.',
          },
        },
        { status: 403 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = userRecord.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return {
        authenticated: false,
        errorResponse: NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have required permissions to perform this action.',
            },
          },
          { status: 403 }
        ),
      };
    }
  }

  return {
    authenticated: true,
    user: {
      id: userRecord.id,
      email: userRecord.email,
      roles: userRecord.roles,
      name: userRecord.name,
    },
  };
}
