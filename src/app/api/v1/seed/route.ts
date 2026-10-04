import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { Mission } from '@/models/Mission';
import { Evidence } from '@/models/Evidence';
import { VerificationResult } from '@/models/VerificationResult';
import { recordAuditEvent } from '@/lib/security/audit';
import { memoryStore } from '@/lib/db/memoryStore';

export async function POST() {
  try {
    const db = await connectToDatabase();

    // Memory Store Fallback Mode
    if (!db) {
      memoryStore.seedDefaults();
      return NextResponse.json({
        success: true,
        mode: 'MEMORY_STORE_FALLBACK',
        message: 'Seed database populated successfully in Memory Mode (MongoDB offline).',
        seedAccounts: [
          'seeker@example.test',
          'helper@example.test',
          'donor@example.test',
          'verifier@example.test',
          'csr@example.test',
          'admin@example.test',
        ],
        defaultPassword: 'password123',
      });
    }

    // MongoDB Mode
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const seedAccounts = [
      { name: 'Ananya Seeker', email: 'seeker@example.test', role: 'SEEKER', city: 'Mumbai', region: 'Maharashtra' },
      { name: 'Rohan Helper', email: 'helper@example.test', role: 'HELPER', city: 'Mumbai', region: 'Maharashtra', skills: ['Food Distribution', 'First Aid', 'Logistics'] },
      { name: 'Priya Donor', email: 'donor@example.test', role: 'DONOR', city: 'Delhi', region: 'NCR' },
      { name: 'Dr. Vikram Verifier', email: 'verifier@example.test', role: 'VERIFIER', city: 'Bengaluru', region: 'Karnataka' },
      { name: 'TechForGood CSR', email: 'csr@example.test', role: 'CSR_ORGANIZATION', city: 'Mumbai', region: 'Maharashtra' },
      { name: 'System Admin', email: 'admin@example.test', role: 'ADMIN', city: 'Mumbai', region: 'Maharashtra' },
    ];

    const createdUsers: Record<string, string> = {};

    for (const acc of seedAccounts) {
      let u = await User.findOne({ email: acc.email });
      if (!u) {
        u = await User.create({
          name: acc.name,
          email: acc.email,
          passwordHash,
          roles: [acc.role],
          status: 'ACTIVE',
          emailVerified: true,
          city: acc.city,
          region: acc.region,
          skills: acc.skills || [],
          reputationSummary: {
            points: acc.role === 'HELPER' ? 120 : 0,
            missionsCompleted: acc.role === 'HELPER' ? 4 : 0,
            communitiesHelped: acc.role === 'HELPER' ? 3 : 0,
            verifiedProofCount: acc.role === 'HELPER' ? 4 : 0,
          },
        });
      }
      createdUsers[acc.role] = u._id.toString();
    }

    // Seed Demo Missions
    const demoMissions = [
      {
        publicId: 'MSN-MUMBAI-FOOD-001',
        title: 'Emergency Ration Support for 40 Families in Dharavi',
        description: 'Heavy monsoon rains flooded local stores, leaving 40 families without clean drinking water and ration kits.',
        category: 'Food Support',
        urgency: 'HIGH',
        status: 'PUBLISHED',
        location: {
          addressApprox: 'Sector 3, Dharavi',
          city: 'Mumbai',
          region: 'Maharashtra',
          coordinates: { type: 'Point', coordinates: [72.8553, 19.0402] },
        },
        requiredSkills: ['Food Distribution', 'Logistics'],
        resourceRequirements: ['40 Ration Kits', 'Clean Drinking Water Cans'],
        affectedPeopleCount: 160,
        fundingEnabled: true,
        fundingTarget: 25000,
        fundingRaised: 18500,
        verificationStatus: 'PASS_AUTO_REVIEW',
        isDemo: true,
      },
      {
        publicId: 'MSN-MUMBAI-EDU-002',
        title: 'Study Materials and Solar Lamps for Night Study Center',
        description: 'Community evening learning center needs 30 sets of grade 5-10 textbooks, notebooks, and rechargeable solar study lamps.',
        category: 'Education',
        urgency: 'MEDIUM',
        status: 'PUBLISHED',
        location: {
          addressApprox: 'Kurla West',
          city: 'Mumbai',
          region: 'Maharashtra',
          coordinates: { type: 'Point', coordinates: [72.8797, 19.0657] },
        },
        requiredSkills: ['Teaching Support', 'Book Binding'],
        resourceRequirements: ['30 Textbook Sets', '15 Solar Study Lamps'],
        affectedPeopleCount: 45,
        fundingEnabled: true,
        fundingTarget: 15000,
        fundingRaised: 12000,
        verificationStatus: 'PASS_AUTO_REVIEW',
        isDemo: true,
      },
      {
        publicId: 'MSN-MUMBAI-ELDER-003',
        title: 'Wheelchair Ramp and Handrail Installation at Senior Center',
        description: 'The local community senior care center lacks wheelchair access ramp and stair handrails, causing fall risks.',
        category: 'Accessibility',
        urgency: 'CRITICAL',
        status: 'PUBLISHED',
        location: {
          addressApprox: 'Bandra West',
          city: 'Mumbai',
          region: 'Maharashtra',
          coordinates: { type: 'Point', coordinates: [72.8311, 19.0596] },
        },
        requiredSkills: ['Carpentry', 'Masonry', 'General Repair'],
        resourceRequirements: ['Steel Handrails', 'Cement & Ramp Materials'],
        affectedPeopleCount: 80,
        fundingEnabled: true,
        fundingTarget: 30000,
        fundingRaised: 30000,
        verificationStatus: 'PASS_AUTO_REVIEW',
        isDemo: true,
      },
      {
        publicId: 'MSN-MUMBAI-HEALTH-004',
        title: 'First Aid Medical Supplies & Digital Monitors for Mobile Clinic',
        description: 'Voluntary health camp requires 50 essential first aid kits, digital BP monitors, and antiseptic supplies for slum visits.',
        category: 'Healthcare Support',
        urgency: 'HIGH',
        status: 'PUBLISHED',
        location: {
          addressApprox: 'Chembur East',
          city: 'Mumbai',
          region: 'Maharashtra',
          coordinates: { type: 'Point', coordinates: [72.8988, 19.0622] },
        },
        requiredSkills: ['First Aid', 'Nursing Support'],
        resourceRequirements: ['50 First Aid Kits', '5 BP Monitors'],
        affectedPeopleCount: 200,
        fundingEnabled: true,
        fundingTarget: 20000,
        fundingRaised: 14500,
        verificationStatus: 'PASS_AUTO_REVIEW',
        isDemo: true,
      },
      {
        publicId: 'MSN-MUMBAI-CLEAN-005',
        title: 'Mithi River Waterfront Plastic & Waste Cleanup Drive',
        description: 'Community cleanup initiative to clear plastic debris, clogged drains, and trash along the Mahim waterfront.',
        category: 'Environmental Cleanup',
        urgency: 'MEDIUM',
        status: 'PUBLISHED',
        location: {
          addressApprox: 'Mahim Causeway',
          city: 'Mumbai',
          region: 'Maharashtra',
          coordinates: { type: 'Point', coordinates: [72.8423, 19.0435] },
        },
        requiredSkills: ['Waste Management', 'Volunteer Coordination'],
        resourceRequirements: ['100 Heavy Waste Bags', '50 Pair Gloves'],
        affectedPeopleCount: 500,
        fundingEnabled: true,
        fundingTarget: 10000,
        fundingRaised: 8500,
        verificationStatus: 'PASS_AUTO_REVIEW',
        isDemo: true,
      },
      {
        publicId: 'MSN-MUMBAI-EMERG-006',
        title: 'Emergency Waterproof Tarpaulins for Monsoon Displaced Families',
        description: 'Storm damaged roofs of 25 temporary shelters. Urgent need for heavy-duty waterproof tarpaulins and ropes.',
        category: 'Emergency Assistance',
        urgency: 'CRITICAL',
        status: 'PUBLISHED',
        location: {
          addressApprox: 'Dadar West',
          city: 'Mumbai',
          region: 'Maharashtra',
          coordinates: { type: 'Point', coordinates: [72.8378, 19.0178] },
        },
        requiredSkills: ['Shelter Assembly', 'Logistics'],
        resourceRequirements: ['25 Tarpaulin Sheets', 'Strong Ropes'],
        affectedPeopleCount: 110,
        fundingEnabled: true,
        fundingTarget: 18000,
        fundingRaised: 16000,
        verificationStatus: 'PASS_AUTO_REVIEW',
        isDemo: true,
      },
    ];

    for (const mData of demoMissions) {
      let m = await Mission.findOne({ publicId: mData.publicId });
      if (!m) {
        m = await Mission.create({
          ...mData,
          seekerId: createdUsers['SEEKER'],
          publishedAt: new Date(),
        });

        // Seed evidence record
        const ev = await Evidence.create({
          missionId: m._id,
          uploaderId: createdUsers['SEEKER'],
          type: 'IMAGE',
          storageKey: `demo/${m.publicId}/evidence.jpg`,
          url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop',
          mimeType: 'image/jpeg',
          size: 1024 * 400,
          sha256: `demo_sha256_${m.publicId.toLowerCase()}`,
          uploadedAt: new Date(),
          visibility: 'PUBLIC_APPROVED',
          processingStatus: 'PROCESSED',
        });

        // Seed verification record
        await VerificationResult.create({
          missionId: m._id,
          evidenceIds: [ev._id],
          provider: 'Way2Humanity AI Engine',
          model: 'gemini-2.0-flash-vision',
          status: 'COMPLETED',
          overallRisk: 'LOW_RISK',
          confidenceBand: 'HIGH',
          signals: [
            { type: 'FILE_INTEGRITY', status: 'PASS', score: 1.0, detail: 'File header and structure valid.' },
            { type: 'DUPLICATE_HASH', status: 'PASS', score: 1.0, detail: 'Unique image fingerprint verified.' },
            { type: 'CONTEXT_CONSISTENCY', status: 'PASS', score: 0.95, detail: 'Image matches reported category.' },
          ],
          reasons: ['Passed all automated trust verification checks.'],
          requiresHumanReview: false,
        });

        await recordAuditEvent({
          actorId: createdUsers['SEEKER'],
          actorRole: 'SEEKER',
          action: 'DEMO_MISSION_SEEDED',
          targetType: 'MISSION',
          targetId: m._id.toString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      mode: 'MONGODB',
      message: 'Seed database populated successfully.',
      seedAccounts: [
        'seeker@example.test',
        'helper@example.test',
        'donor@example.test',
        'verifier@example.test',
        'csr@example.test',
        'admin@example.test',
      ],
      defaultPassword: 'password123',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: { message: err instanceof Error ? err.message : 'Seed failed' } },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
