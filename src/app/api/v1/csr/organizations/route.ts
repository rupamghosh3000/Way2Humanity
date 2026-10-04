import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { CSROrganization } from '@/models/CSROrganization';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['CSR_ORGANIZATION', 'ADMIN']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const { legalName, displayName, contactEmail, sector, website } = await req.json();

    await connectToDatabase();

    const org = await CSROrganization.create({
      ownerUserId: auth.user.id,
      legalName,
      displayName,
      contactEmail: contactEmail || auth.user.email,
      sector: sector || 'Social Impact',
      website: website || '',
      verificationStatus: 'VERIFIED',
    });

    return NextResponse.json({
      success: true,
      data: { organization: org },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: { message: err instanceof Error ? err.message : 'Org creation failed' } },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  await connectToDatabase();
  const orgs = await CSROrganization.find({ ownerUserId: auth.user.id });

  return NextResponse.json({
    success: true,
    data: { organizations: orgs },
  });
}
