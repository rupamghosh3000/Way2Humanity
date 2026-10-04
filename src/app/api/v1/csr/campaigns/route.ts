import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { CSRCampaign } from '@/models/CSRCampaign';
import { CSROrganization } from '@/models/CSROrganization';
import { CSRCampaignSchema } from '@/lib/validation';
import { memoryStore } from '@/lib/db/memoryStore';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['CSR_ORGANIZATION', 'ADMIN']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const validated = CSRCampaignSchema.parse(body);

    const db = await connectToDatabase();

    if (!db) {
      const memCampaign = {
        _id: `camp_${Date.now()}`,
        organizationId: { displayName: 'Global Impact Corporate', logoUrl: '' },
        name: validated.name,
        description: validated.description,
        targetAmount: validated.targetAmount,
        missionIds: validated.missionIds,
        brandedPageSlug: validated.brandedPageSlug,
        status: 'ACTIVE',
        createdAt: new Date(),
      };
      memoryStore.csrCampaigns = memoryStore.csrCampaigns || new Map();
      memoryStore.csrCampaigns.set(memCampaign._id, memCampaign);

      return NextResponse.json({
        success: true,
        data: { campaign: memCampaign },
      });
    }

    let org = await CSROrganization.findOne({ ownerUserId: auth.user.id });
    if (!org) {
      org = await CSROrganization.create({
        ownerUserId: auth.user.id,
        legalName: 'Global Impact Corporate Ltd',
        displayName: 'Impact Fund',
        contactEmail: auth.user.email,
        verificationStatus: 'VERIFIED',
      });
    }

    const campaign = await CSRCampaign.create({
      organizationId: org._id,
      name: validated.name,
      description: validated.description,
      targetAmount: validated.targetAmount,
      missionIds: validated.missionIds,
      brandedPageSlug: validated.brandedPageSlug,
      status: 'ACTIVE',
    });

    return NextResponse.json({
      success: true,
      data: { campaign },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: { message: err instanceof Error ? err.message : 'Campaign creation failed' } },
      { status: 400 }
    );
  }
}

export async function GET() {
  const db = await connectToDatabase();

  if (!db) {
    const memCampaigns = memoryStore.csrCampaigns ? Array.from(memoryStore.csrCampaigns.values()) : [];
    return NextResponse.json({
      success: true,
      data: { campaigns: memCampaigns },
    });
  }

  try {
    const campaigns = await CSRCampaign.find({ status: 'ACTIVE' }).populate('organizationId', 'displayName logoUrl');
    return NextResponse.json({
      success: true,
      data: { campaigns },
    });
  } catch {
    const memCampaigns = memoryStore.csrCampaigns ? Array.from(memoryStore.csrCampaigns.values()) : [];
    return NextResponse.json({
      success: true,
      data: { campaigns: memCampaigns },
    });
  }
}
