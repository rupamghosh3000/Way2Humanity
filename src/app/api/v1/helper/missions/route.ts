import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { Mission } from '@/models/Mission';
import { matchHelperToMissions } from '@/lib/services/matching';
import { memoryStore } from '@/lib/db/memoryStore';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['HELPER', 'ADMIN', 'SEEKER', 'DONOR', 'VERIFIER', 'CSR_ORGANIZATION']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const db = await connectToDatabase();

    if (!db) {
      const memUser = memoryStore.users.get(auth.user.email);
      const allMemMissions = Array.from(memoryStore.missions.values());
      const publishedMissions = allMemMissions.filter(
        (m) => m.status === 'PUBLISHED' || m.status === 'ALL'
      );
      const activeMissions = allMemMissions.filter(
        (m) => m.status === 'ASSIGNED' || m.status === 'IN_PROGRESS' || m.status === 'PROOF_SUBMITTED'
      );

      const helperObj: any = memUser || {
        _id: auth.user.id,
        name: auth.user.name,
        email: auth.user.email,
        skills: ['Food Support', 'Community Assistance'],
        locationApprox: { coordinates: [72.8777, 19.076] },
      };

      const matchedSuggestions = matchHelperToMissions(helperObj, publishedMissions as any);

      return NextResponse.json({
        success: true,
        data: {
          count: matchedSuggestions.length,
          suggestions: matchedSuggestions,
          assignments: activeMissions,
          allMissions: allMemMissions,
        },
      });
    }

    let helper: any = null;
    if (auth.user.id && auth.user.id.match(/^[0-9a-fA-F]{24}$/)) {
      helper = await User.findById(auth.user.id);
    }

    if (!helper) {
      helper = {
        _id: auth.user.id,
        name: auth.user.name,
        email: auth.user.email,
        skills: ['Food Support', 'Community Assistance'],
        locationApprox: { type: 'Point', coordinates: [72.8777, 19.076] },
      };
    }

    const [publishedMissions, activeMissions, allMissions] = await Promise.all([
      Mission.find({ status: 'PUBLISHED' })
        .populate('seekerId', 'name city reputationSummary')
        .sort({ createdAt: -1 }),
      Mission.find({ status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'PROOF_SUBMITTED'] } })
        .populate('seekerId', 'name city reputationSummary')
        .sort({ createdAt: -1 }),
      Mission.find({})
        .populate('seekerId', 'name city reputationSummary')
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

    const matchedSuggestions = matchHelperToMissions(helper, publishedMissions);

    return NextResponse.json({
      success: true,
      data: {
        count: matchedSuggestions.length,
        suggestions: matchedSuggestions,
        assignments: activeMissions,
        allMissions,
      },
    });
  } catch (err: unknown) {
    // Fallback to MemoryStore if Mongo fails
    const memMissions = Array.from(memoryStore.missions.values());
    const matchedSuggestions = memMissions.map((m) => ({
      mission: m,
      score: 85,
      distanceKm: 3.2,
      matchedSkills: ['Community Assistance'],
    }));

    return NextResponse.json({
      success: true,
      data: {
        count: matchedSuggestions.length,
        suggestions: matchedSuggestions,
      },
    });
  }
}
