import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load .env.local
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (key && !process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
} catch {}

import { connectToDatabase } from '../lib/db/mongoose';
import { User } from '../models/User';
import { Mission } from '../models/Mission';
import { memoryStore } from '../lib/db/memoryStore';

async function seed() {
  console.log('====================================================');
  console.log('  WAY2HUMANITY — SEEDING DATABASE');
  console.log('====================================================\n');

  try {
    const db = await connectToDatabase();

    if (!db) {
      console.log('MongoDB connection unavailable. Populating in-memory store defaults...');
      memoryStore.seedDefaults();
      console.log('In-memory seed data populated successfully.');
      console.log(`Users count: ${memoryStore.users.size}`);
      console.log(`Missions count: ${memoryStore.missions.size}`);
      process.exit(0);
    }

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

    for (const acc of seedAccounts) {
      const existing = await User.findOne({ email: acc.email });
      if (!existing) {
        await User.create({
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
        console.log(`Created user: ${acc.email} (${acc.role})`);
      } else {
        console.log(`User already exists: ${acc.email}`);
      }
    }

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
          coordinates: { type: 'Point', coordinates: [72.8553, 19.0402] as [number, number] },
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
          addressApprox: 'Kurla West Community Center',
          city: 'Mumbai',
          region: 'Maharashtra',
          coordinates: { type: 'Point', coordinates: [72.8797, 19.0657] as [number, number] },
        },
        requiredSkills: ['Teaching', 'Mentorship'],
        resourceRequirements: ['30 Textbook Sets', '15 Solar Lamps'],
        affectedPeopleCount: 60,
        fundingEnabled: true,
        fundingTarget: 15000,
        fundingRaised: 12000,
        verificationStatus: 'PASS_AUTO_REVIEW',
        isDemo: true,
      },
    ];

    const seekerUser = await User.findOne({ email: 'seeker@example.test' });
    const seekerId = seekerUser ? seekerUser._id : null;

    if (seekerId) {
      for (const m of demoMissions) {
        const existing = await Mission.findOne({ publicId: m.publicId });
        if (!existing) {
          await Mission.create({ ...m, seekerId });
          console.log(`Created mission: ${m.publicId} - ${m.title}`);
        } else {
          console.log(`Mission already exists: ${m.publicId}`);
        }
      }
    }

    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
