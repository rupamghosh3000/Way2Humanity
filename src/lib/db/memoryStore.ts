/**
 * Way2Humanity — In-Memory Fallback Database Store
 * Allows local development & demo operation even when local MongoDB daemon is not running.
 */

export interface MemoryUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  roles: string[];
  city: string;
  region: string;
  status: string;
  reputationSummary: {
    points: number;
    missionsCompleted: number;
    communitiesHelped: number;
    verifiedProofCount: number;
  };
  createdAt: Date;
}

export interface MemoryMission {
  _id: string;
  publicId: string;
  seekerId: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  riskLevel: string;
  status: string;
  location: {
    addressApprox: string;
    city: string;
    region: string;
    coordinates: { type: string; coordinates: [number, number] };
  };
  requiredSkills: string[];
  resourceRequirements: string[];
  affectedPeopleCount: number;
  fundingEnabled: boolean;
  fundingTarget: number;
  fundingRaised: number;
  verificationStatus: string;
  assignedHelperId?: string;
  isDemo?: boolean;
  evidenceUrls?: string[];
  publishedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

class MemoryStore {
  users: Map<string, MemoryUser> = new Map();
  missions: Map<string, MemoryMission> = new Map();
  verificationResults: Map<string, any> = new Map();
  proofs: Map<string, any> = new Map();
  csrCampaigns: Map<string, any> = new Map();
  auditEvents: Array<any> = [];

  constructor() {

    this.seedDefaults();
  }

  seedDefaults() {
    // Default Seed Accounts
    const defaultAccounts: MemoryUser[] = [
      {
        _id: 'user_seeker_1',
        name: 'Ananya Seeker',
        email: 'seeker@example.test',
        passwordHash: '$2a$10$e8N8hB5Q8T1eXqWJ3S7A0uR0tW7E9y2U8uI7O6P5L4K3J2H1G0F9E',
        roles: ['SEEKER'],
        city: 'Mumbai',
        region: 'Maharashtra',
        status: 'ACTIVE',
        reputationSummary: { points: 0, missionsCompleted: 0, communitiesHelped: 0, verifiedProofCount: 0 },
        createdAt: new Date(),
      },
      {
        _id: 'user_helper_1',
        name: 'Rohan Helper',
        email: 'helper@example.test',
        passwordHash: '$2a$10$e8N8hB5Q8T1eXqWJ3S7A0uR0tW7E9y2U8uI7O6P5L4K3J2H1G0F9E',
        roles: ['HELPER'],
        city: 'Mumbai',
        region: 'Maharashtra',
        status: 'ACTIVE',
        reputationSummary: { points: 120, missionsCompleted: 4, communitiesHelped: 3, verifiedProofCount: 4 },
        createdAt: new Date(),
      },
      {
        _id: 'user_admin_1',
        name: 'System Admin',
        email: 'admin@example.test',
        passwordHash: '$2a$10$e8N8hB5Q8T1eXqWJ3S7A0uR0tW7E9y2U8uI7O6P5L4K3J2H1G0F9E',
        roles: ['ADMIN'],
        city: 'Mumbai',
        region: 'Maharashtra',
        status: 'ACTIVE',
        reputationSummary: { points: 500, missionsCompleted: 10, communitiesHelped: 10, verifiedProofCount: 10 },
        createdAt: new Date(),
      },
    ];

    for (const u of defaultAccounts) {
      this.users.set(u.email, u);
    }

    // Default Demo Missions
    const defaultMissions: MemoryMission[] = [
      {
        _id: 'msn_1',
        publicId: 'MSN-MUMBAI-FOOD-001',
        seekerId: 'user_seeker_1',
        title: 'Emergency Ration Support for 40 Families in Dharavi',
        description: 'Heavy monsoon rains flooded local stores, leaving 40 families without clean drinking water and ration kits.',
        category: 'Food Support',
        urgency: 'HIGH',
        riskLevel: 'LOW',
        status: 'PUBLISHED',
        location: {
          addressApprox: 'Sector 3, Dharavi',
          city: 'Mumbai',
          region: 'Maharashtra',
          coordinates: { type: 'Point', coordinates: [72.8553, 19.0402] },
        },
        requiredSkills: ['Food Distribution', 'Logistics'],
        resourceRequirements: ['40 Ration Kits', 'Clean Water Cans'],
        affectedPeopleCount: 160,
        fundingEnabled: true,
        fundingTarget: 25000,
        fundingRaised: 18500,
        verificationStatus: 'PASS_AUTO_REVIEW',
        evidenceUrls: ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800'],
        isDemo: true,
        createdAt: new Date(),
      },
      {
        _id: 'msn_2',
        publicId: 'MSN-MUMBAI-EDU-002',
        seekerId: 'user_seeker_1',
        title: 'Study Materials and Solar Lamps for Night Study Center',
        description: 'Community evening learning center needs 30 sets of grade 5-10 textbooks and rechargeable solar study lamps.',
        category: 'Education',
        urgency: 'MEDIUM',
        riskLevel: 'LOW',
        status: 'PUBLISHED',
        location: {
          addressApprox: 'Kurla West',
          city: 'Mumbai',
          region: 'Maharashtra',
          coordinates: { type: 'Point', coordinates: [72.8797, 19.0657] },
        },
        requiredSkills: ['Teaching Support', 'Book Binding'],
        resourceRequirements: ['30 Textbook Sets', '15 Solar Lamps'],
        affectedPeopleCount: 45,
        fundingEnabled: true,
        fundingTarget: 15000,
        fundingRaised: 12000,
        verificationStatus: 'PASS_AUTO_REVIEW',
        isDemo: true,
        createdAt: new Date(),
      },
      {
        _id: 'msn_3',
        publicId: 'MSN-MUMBAI-ELDER-003',
        seekerId: 'user_seeker_1',
        title: 'Wheelchair Ramp & Handrail Installation at Senior Care Center',
        description: 'Local community senior center lacks wheelchair ramp and stair handrails, causing fall risks for 80 elderly residents.',
        category: 'Accessibility',
        urgency: 'CRITICAL',
        riskLevel: 'LOW',
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
        createdAt: new Date(),
      },
      {
        _id: 'msn_4',
        publicId: 'MSN-MUMBAI-HEALTH-004',
        seekerId: 'user_seeker_1',
        title: 'First Aid Medical Kits & BP Monitors for Mobile Health Clinic',
        description: 'Voluntary health camp requires 50 essential first aid kits, digital BP monitors, and antiseptic supplies for slum visits.',
        category: 'Healthcare Support',
        urgency: 'HIGH',
        riskLevel: 'LOW',
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
        createdAt: new Date(),
      },
      {
        _id: 'msn_5',
        publicId: 'MSN-MUMBAI-CLEAN-005',
        seekerId: 'user_seeker_1',
        title: 'Mithi River Waterfront Plastic & Waste Cleanup Drive',
        description: 'Community cleanup initiative to clear plastic debris, clogged drains, and trash along the Mahim waterfront.',
        category: 'Environmental Cleanup',
        urgency: 'MEDIUM',
        riskLevel: 'LOW',
        status: 'PUBLISHED',
        location: {
          addressApprox: 'Mahim Causeway',
          city: 'Mumbai',
          region: 'Maharashtra',
          coordinates: { type: 'Point', coordinates: [72.8423, 19.0435] },
        },
        requiredSkills: ['Waste Management', 'Volunteer Coordination'],
        resourceRequirements: ['100 Heavy Waste Bags', '50 Pair Heavy Gloves'],
        affectedPeopleCount: 500,
        fundingEnabled: true,
        fundingTarget: 10000,
        fundingRaised: 8500,
        verificationStatus: 'PASS_AUTO_REVIEW',
        isDemo: true,
        createdAt: new Date(),
      },
      {
        _id: 'msn_6',
        publicId: 'MSN-MUMBAI-EMERG-006',
        seekerId: 'user_seeker_1',
        title: 'Emergency Waterproof Tarpaulins for Monsoon Displaced Families',
        description: 'Storm damaged roofs of 25 temporary shelters. Urgent need for heavy-duty waterproof tarpaulins and ropes.',
        category: 'Emergency Assistance',
        urgency: 'CRITICAL',
        riskLevel: 'LOW',
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
        createdAt: new Date(),
      },
      {
        _id: 'msn_7',
        publicId: 'MSN-MUMBAI-FOOD-007',
        seekerId: 'user_seeker_1',
        title: 'Daily Hot Meals Support for 80 Primary School Students',
        description: 'Community morning meal program providing fresh rice, dal, and fruits to 80 underprivileged children before school.',
        category: 'Food Support',
        urgency: 'HIGH',
        riskLevel: 'LOW',
        status: 'PUBLISHED',
        location: {
          addressApprox: 'Malad East',
          city: 'Mumbai',
          region: 'Maharashtra',
          coordinates: { type: 'Point', coordinates: [72.8590, 19.1860] },
        },
        requiredSkills: ['Food Preparation', 'Meal Distribution'],
        resourceRequirements: ['Monthly Rice & Dal Rations'],
        affectedPeopleCount: 80,
        fundingEnabled: true,
        fundingTarget: 22000,
        fundingRaised: 19000,
        verificationStatus: 'PASS_AUTO_REVIEW',
        isDemo: true,
        createdAt: new Date(),
      },
      {
        _id: 'msn_8',
        publicId: 'MSN-MUMBAI-INFRA-008',
        seekerId: 'user_seeker_1',
        title: 'Solar Street Lights for Dark Community Pedestrian Passages',
        description: 'Dark alleyways leading to night bus stops lack lighting, causing safety hazards. Installing 6 solar pole lights.',
        category: 'Infrastructure',
        urgency: 'MEDIUM',
        riskLevel: 'LOW',
        status: 'PUBLISHED',
        location: {
          addressApprox: 'Mankhurd East',
          city: 'Mumbai',
          region: 'Maharashtra',
          coordinates: { type: 'Point', coordinates: [72.9320, 19.0530] },
        },
        requiredSkills: ['Electrical Fitting', 'Solar Pole Mounting'],
        resourceRequirements: ['6 Outdoor Solar LED Streetlights'],
        affectedPeopleCount: 350,
        fundingEnabled: true,
        fundingTarget: 35000,
        fundingRaised: 28000,
        verificationStatus: 'PASS_AUTO_REVIEW',
        isDemo: true,
        createdAt: new Date(),
      },
    ];

    for (const m of defaultMissions) {
      this.missions.set(m.publicId, m);
    }

    // Default Completed Missions for Verified Helper Rohan
    const completedMissions: MemoryMission[] = [
      {
        _id: 'msn_completed_1',
        publicId: 'MSN-MUMBAI-FOOD-C01',
        seekerId: 'user_seeker_1',
        assignedHelperId: 'user_helper_1',
        title: 'Emergency Flood Relief Food Kits Distribution in Kurla',
        description: 'Delivered 35 dry ration and baby nutrition kits to monsoon-affected families in Kurla.',
        category: 'Food Support',
        urgency: 'HIGH',
        riskLevel: 'LOW',
        status: 'COMPLETED',
        location: {
          addressApprox: 'Kurla East',
          city: 'Mumbai',
          region: 'Maharashtra',
          coordinates: { type: 'Point', coordinates: [72.8797, 19.0657] },
        },
        requiredSkills: ['Food Distribution', 'Logistics'],
        resourceRequirements: ['35 Ration Kits'],
        affectedPeopleCount: 140,
        fundingEnabled: false,
        fundingTarget: 0,
        fundingRaised: 0,
        verificationStatus: 'APPROVED',
        isDemo: true,
        completedAt: new Date(Date.now() - 7 * 86400000),
        createdAt: new Date(Date.now() - 14 * 86400000),
      },
      {
        _id: 'msn_completed_2',
        publicId: 'MSN-MUMBAI-HLTH-C02',
        seekerId: 'user_seeker_1',
        assignedHelperId: 'user_helper_1',
        title: 'Urgent First Aid & Essential Medicines for Dharavi Community Clinic',
        description: 'Supplied and logged basic wound care supplies, bandages, and oral rehydration packets.',
        category: 'Healthcare Support',
        urgency: 'HIGH',
        riskLevel: 'LOW',
        status: 'COMPLETED',
        location: {
          addressApprox: 'Dharavi Sector 2',
          city: 'Mumbai',
          region: 'Maharashtra',
          coordinates: { type: 'Point', coordinates: [72.8553, 19.0402] },
        },
        requiredSkills: ['First Aid', 'Logistics'],
        resourceRequirements: ['Medical Supplies'],
        affectedPeopleCount: 95,
        fundingEnabled: false,
        fundingTarget: 0,
        fundingRaised: 0,
        verificationStatus: 'APPROVED',
        isDemo: true,
        completedAt: new Date(Date.now() - 3 * 86400000),
        createdAt: new Date(Date.now() - 6 * 86400000),
      },
    ];

    for (const cm of completedMissions) {
      this.missions.set(cm.publicId, cm);
    }

    // Default Seeded Audit Events for Verified Reputation
    this.auditEvents = [
      {
        _id: 'audit_evt_init_1',
        actorId: 'user_helper_1',
        targetId: 'user_helper_1',
        action: 'REPUTATION_AWARDED',
        metadata: {
          reason: 'Volunteer Identity & Background Verification Completed',
          points: 30,
          type: 'VERIFICATION_APPROVED',
        },
        createdAt: new Date(Date.now() - 14 * 86400000),
      },
      {
        _id: 'audit_evt_init_2',
        actorId: 'user_helper_1',
        targetId: 'user_helper_1',
        action: 'REPUTATION_AWARDED',
        metadata: {
          reason: 'Verified proof approved: Emergency Flood Relief Food Kits (MSN-MUMBAI-FOOD-C01)',
          points: 50,
          type: 'PROOF_APPROVED',
          missionId: 'msn_completed_1',
        },
        createdAt: new Date(Date.now() - 7 * 86400000),
      },
      {
        _id: 'audit_evt_init_3',
        actorId: 'user_helper_1',
        targetId: 'user_helper_1',
        action: 'REPUTATION_AWARDED',
        metadata: {
          reason: 'Verified proof approved: Slum Clinic First Aid Support (MSN-MUMBAI-HLTH-C02)',
          points: 40,
          type: 'PROOF_APPROVED',
          missionId: 'msn_completed_2',
        },
        createdAt: new Date(Date.now() - 3 * 86400000),
      },
    ];

    // Seed an active pending proof for immediate admin verification inspection
    const demoPendingProofId = 'proof_pending_demo_1';
    this.proofs.set(demoPendingProofId, {
      _id: demoPendingProofId,
      missionId: 'msn_1',
      helperId: 'user_helper_1',
      description: 'Distributed 40 dry ration packets and 20 clean drinking water cans to flood-affected families in Sector 3 Dharavi. Logged and verified with community elder signoff.',
      evidenceUrls: [
        'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
      ],
      aiAnalysis: {
        workVerified: true,
        beforeAfterMatch: 'STRONG_MATCH',
        confidence: 0.94,
        observations: [
          'Visual evidence shows prepared dry ration supply boxes staged and distributed.',
          'Location context and background architectural features align with Dharavi community sector.',
          'No digital photo manipulation, cloning, or synthetic AI artifacts detected.',
        ],
        concerns: ['Recommend admin verifier confirm that all 40 ration kits were accounted for in final headcount.'],
        recommendedAction: 'APPROVE',
      },
      reviewStatus: 'PENDING_REVIEW',
      submittedAt: new Date(Date.now() - 3600000 * 2),
    });
  }
}

declare global {
  // eslint-disable-next-line no-var
  var memoryStoreInstance: MemoryStore | undefined;
}

if (!global.memoryStoreInstance) {
  global.memoryStoreInstance = new MemoryStore();
} else {
  global.memoryStoreInstance.csrCampaigns = global.memoryStoreInstance.csrCampaigns || new Map();
  if (!global.memoryStoreInstance.proofs || global.memoryStoreInstance.proofs.size === 0) {
    global.memoryStoreInstance.seedDefaults();
  }
}

export const memoryStore: MemoryStore = global.memoryStoreInstance!;


