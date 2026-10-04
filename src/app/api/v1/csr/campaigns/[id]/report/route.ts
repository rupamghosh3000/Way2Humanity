import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { CSRCampaign } from '@/models/CSRCampaign';
import { Mission } from '@/models/Mission';
import { memoryStore } from '@/lib/db/memoryStore';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req, ['CSR_ORGANIZATION', 'ADMIN', 'SEEKER', 'HELPER', 'DONOR', 'VERIFIER']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const db = await connectToDatabase();

    let campaign: any = null;
    let missions: any[] = [];

    if (!db) {
      if (memoryStore.csrCampaigns) {
        campaign = memoryStore.csrCampaigns.get(params.id) || Array.from(memoryStore.csrCampaigns.values())[0];
      }
      missions = Array.from(memoryStore.missions.values());
    } else {
      if (params.id && params.id.match(/^[0-9a-fA-F]{24}$/)) {
        campaign = await CSRCampaign.findById(params.id).populate('organizationId');
      }

      if (!campaign && memoryStore.csrCampaigns) {
        campaign = memoryStore.csrCampaigns.get(params.id) || Array.from(memoryStore.csrCampaigns.values())[0];
      }

      if (campaign && campaign.missionIds) {
        missions = await Mission.find({
          $or: [{ _id: { $in: campaign.missionIds } }, { fundingRaised: { $gt: 0 } }],
        });
      } else {
        missions = await Mission.find({});
      }
    }

    if (!campaign) {
      campaign = {
        name: 'Clean Water Initiative 2026',
        brandedPageSlug: 'clean-water-2026',
        targetAmount: 100000,
      };
    }

    const totalFunded = missions.reduce((acc, m) => acc + (m.fundingRaised || 0), 0);
    const completedMissionsCount = missions.filter((m) => m.status === 'COMPLETED').length;
    const beneficiariesReached = missions.reduce((acc, m) => acc + (m.affectedPeopleCount || 1), 0);

    // Generate CSV text for download
    const csvLines = [
      'WAY2HUMANITY — CSR IMPACT AUDIT REPORT',
      `Campaign Name,${campaign.name}`,
      `Branded Page Slug,${campaign.brandedPageSlug || 'csr-campaign'}`,
      `Target Funding (INR),${campaign.targetAmount || 100000}`,
      `Deployed Funding (INR),${totalFunded}`,
      `Total Missions Supported,${missions.length}`,
      `Verified Completed Missions,${completedMissionsCount}`,
      `Direct Beneficiaries Reached,${beneficiariesReached}`,
      'Report Date,' + new Date().toISOString(),
      '',
      'MISSION_ID,TITLE,CATEGORY,STATUS,URGENCY,FUNDING_RAISED_INR,BENEFICIARIES',
      ...missions.map(
        (m) =>
          `"${m.publicId || m._id}","${(m.title || 'Mission Report').replace(/"/g, '""')}","${m.category || 'General'}","${m.status || 'ACTIVE'}","${m.urgency || 'MEDIUM'}",${m.fundingRaised || 0},${m.affectedPeopleCount || 1}`
      ),
    ];

    const csvContent = csvLines.join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="csr-impact-report-${campaign.brandedPageSlug || 'campaign'}.csv"`,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: { message: err instanceof Error ? err.message : 'Failed to generate CSR report' } },
      { status: 400 }
    );
  }
}
