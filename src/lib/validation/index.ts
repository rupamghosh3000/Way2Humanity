import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['SEEKER', 'HELPER', 'DONOR', 'CSR_ORGANIZATION', 'VERIFIER', 'ADMIN']).default('SEEKER'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ReportMissionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum([
    'Food Support',
    'Education',
    'Healthcare Support',
    'Infrastructure',
    'Emergency Assistance',
    'Elder Support',
    'Accessibility',
    'Environmental Cleanup',
    'Community Resources',
    'Other',
  ]),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  location: z.object({
    addressApprox: z.string().min(3),
    city: z.string().min(2),
    region: z.string().min(2),
    latitude: z.number(),
    longitude: z.number(),
  }),
  requiredSkills: z.array(z.string()).default([]),
  resourceRequirements: z.array(z.string()).default([]),
  affectedPeopleCount: z.number().min(1).default(1),
  fundingEnabled: z.boolean().default(false),
  fundingTarget: z.number().min(0).default(0),
  evidenceUrls: z.array(z.string()).default([]),
});

export const ReviewDecisionSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT', 'NEEDS_MORE_INFO']),
  reasonCode: z.string().min(2),
  notes: z.string().default(''),
});

export const ProofSubmissionSchema = z.object({
  description: z.string().min(10, 'Proof description must be at least 10 characters'),
  evidenceUrls: z.array(z.string()).min(1, 'At least one proof photo or evidence item is required'),
  completionLocation: z.object({
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
});

export const DonationOrderSchema = z.object({
  amount: z.number().positive('Donation amount must be greater than zero'),
  anonymous: z.boolean().default(false),
});

export const DisputeSchema = z.object({
  targetType: z.enum(['MISSION', 'USER', 'PROOF', 'DONATION']),
  targetId: z.string().min(1),
  category: z.enum([
    'FALSE_MISSION',
    'FRAUDULENT_EVIDENCE',
    'INCORRECT_COMPLETION',
    'PAYMENT_ISSUE',
    'HARASSMENT',
    'MISUSE_OF_FUNDS',
  ]),
  description: z.string().min(15),
  evidenceUrls: z.array(z.string()).default([]),
});

export const CSRCampaignSchema = z.object({
  name: z.string().min(5),
  description: z.string().min(20),
  targetAmount: z.number().positive(),
  missionIds: z.array(z.string()).default([]),
  brandedPageSlug: z.string().min(3),
});
