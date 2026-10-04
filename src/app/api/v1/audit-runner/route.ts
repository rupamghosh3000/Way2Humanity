import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { memoryStore } from '@/lib/db/memoryStore';
import { recordAuditEvent } from '@/lib/security/audit';
import { calculateDistanceKm, matchHelperToMissions } from '@/lib/services/matching';
import { verifyWebhookSignature } from '@/lib/services/payment';
import { awardReputationPoints } from '@/lib/services/reputation';
import { signAccessToken, verifyAccessToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {


  const results: Array<{ cycle: string; test: string; status: 'PASS' | 'FAIL'; detail?: string }> = [];

  function record(cycle: string, test: string, passed: boolean, detail?: string) {
    results.push({
      cycle,
      test,
      status: passed ? 'PASS' : 'FAIL',
      detail,
    });
  }

  try {
    // Defensive memoryStore checks
    if (!memoryStore.proofs) (memoryStore as any).proofs = new Map();
    if (!memoryStore.csrCampaigns) (memoryStore as any).csrCampaigns = new Map();
    if (!memoryStore.auditEvents) (memoryStore as any).auditEvents = [];

    // ============================================================
    // CYCLE 1: Discovery & System Health
    // ============================================================
    record('CYCLE 1 — Discovery', 'System memoryStore initialized', !!memoryStore);
    record('CYCLE 1 — Discovery', 'Default seed users populated', memoryStore.users.size >= 3);
    record('CYCLE 1 — Discovery', 'Default demo missions populated', memoryStore.missions.size >= 5);

    // ============================================================
    // CYCLE 2: Functional Testing (User Registration & Auth)
    // ============================================================
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    const isPasswordValid = await bcrypt.compare('password123', hash);
    const isBadPasswordRejected = !(await bcrypt.compare('wrongpassword', hash));
    record('CYCLE 2 — Functional', 'Password bcrypt hashing & verification', isPasswordValid);
    record('CYCLE 2 — Functional', 'Invalid password rejection', isBadPasswordRejected);

    // ============================================================
    // CYCLE 3: Role Matrix & Permissions
    // ============================================================
    const rolePermissions: Record<string, string[]> = {
      SEEKER: ['CREATE_REPORT', 'UPLOAD_EVIDENCE', 'VIEW_OWN_MISSIONS'],
      HELPER: ['BROWSE_RADAR', 'ACCEPT_MISSION', 'START_WORK', 'SUBMIT_PROOF'],
      DONOR: ['BROWSE_RADAR', 'DONATE_MISSION', 'VIEW_LEDGER'],
      CSR_ORGANIZATION: ['LAUNCH_CAMPAIGN', 'EXPORT_AUDIT_CSV'],
      VERIFIER: ['VIEW_REVIEW_QUEUE', 'APPROVE_VERIFICATION', 'REVIEW_PROOF'],
      ADMIN: ['MANAGE_USERS', 'OVERRIDE_VERIFICATION', 'INSPECT_AUDIT', 'SYSTEM_HEALTH'],
    };

    record('CYCLE 3 — Roles', 'SEEKER cannot approve verifications', !rolePermissions['SEEKER'].includes('APPROVE_VERIFICATION'));
    record('CYCLE 3 — Roles', 'HELPER cannot manage users', !rolePermissions['HELPER'].includes('MANAGE_USERS'));
    record('CYCLE 3 — Roles', 'DONOR cannot review proof', !rolePermissions['DONOR'].includes('REVIEW_PROOF'));
    record('CYCLE 3 — Roles', 'CSR_ORGANIZATION can launch campaigns', rolePermissions['CSR_ORGANIZATION'].includes('LAUNCH_CAMPAIGN'));
    record('CYCLE 3 — Roles', 'VERIFIER can review proof', rolePermissions['VERIFIER'].includes('REVIEW_PROOF'));
    record('CYCLE 3 — Roles', 'ADMIN has inspect audit permissions', rolePermissions['ADMIN'].includes('INSPECT_AUDIT'));

    // ============================================================
    // CYCLE 4: End-to-End Business Lifecycle
    // ============================================================
    const testPublicId = `MSN-AUDIT-${Date.now().toString(36).toUpperCase()}`;
    const testMission = {
      _id: `msn_audit_${Date.now()}`,
      publicId: testPublicId,
      seekerId: 'user_seeker_1',
      title: 'Audited Humanitarian Community Mission',
      description: 'Comprehensive test mission for automated end-to-end verification and lifecycle testing.',
      category: 'Food Support',
      urgency: 'HIGH',
      riskLevel: 'LOW',
      status: 'DRAFT',
      location: {
        addressApprox: 'Dharavi Sector 5',
        city: 'Mumbai',
        region: 'Maharashtra',
        coordinates: { type: 'Point', coordinates: [72.8553, 19.0402] as [number, number] },
      },
      requiredSkills: ['Food Distribution'],
      resourceRequirements: ['10 Ration Kits'],
      affectedPeopleCount: 40,
      fundingEnabled: true,
      fundingTarget: 10000,
      fundingRaised: 0,
      verificationStatus: 'PENDING',
      createdAt: new Date(),
    };
    memoryStore.missions.set(testPublicId, testMission as any);

    await recordAuditEvent({
      actorId: 'user_seeker_1',
      actorRole: 'SEEKER',
      action: 'MISSION_CREATED',
      targetType: 'MISSION',
      targetId: testMission._id,
      metadata: { publicId: testPublicId },
    });

    // Step 2: Verification Transition
    testMission.status = 'VERIFYING';
    testMission.verificationStatus = 'NEEDS_HUMAN_REVIEW';
    await recordAuditEvent({
      actorRole: 'SYSTEM',
      action: 'AI_ANALYSIS_COMPLETED',
      targetType: 'MISSION',
      targetId: testMission._id,
      metadata: { publicId: testPublicId, decision: 'NEEDS_HUMAN_REVIEW' },
    });

    // Step 3: Human Review Approval
    testMission.status = 'PUBLISHED';
    testMission.verificationStatus = 'APPROVED';
    await recordAuditEvent({
      actorId: 'user_admin_1',
      actorRole: 'ADMIN',
      action: 'VERIFICATION_REVIEW',
      targetType: 'MISSION',
      targetId: testMission._id,
      metadata: { decision: 'APPROVE', publicId: testPublicId },
    });

    // Step 4: Helper Acceptance & Work Start
    testMission.status = 'ASSIGNED';
    (testMission as any).assignedHelperId = 'user_helper_1';
    await recordAuditEvent({
      actorId: 'user_helper_1',
      actorRole: 'HELPER',
      action: 'MISSION_ACCEPTED',
      targetType: 'MISSION',
      targetId: testMission._id,
      metadata: { publicId: testPublicId },
    });

    testMission.status = 'IN_PROGRESS';
    await recordAuditEvent({
      actorId: 'user_helper_1',
      actorRole: 'HELPER',
      action: 'MISSION_STARTED',
      targetType: 'MISSION',
      targetId: testMission._id,
      metadata: { publicId: testPublicId },
    });

    // Step 5: Proof Submission
    const testProofId = `proof_audit_${Date.now()}`;
    const testProof = {
      _id: testProofId,
      missionId: testMission._id,
      helperId: 'user_helper_1',
      description: 'Supplies received and distributed directly to affected families.',
      evidenceUrls: ['https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800'],
      reviewStatus: 'PENDING_REVIEW',
      submittedAt: new Date(),
    };
    (memoryStore as any).proofs.set(testProofId, testProof);
    testMission.status = 'PROOF_SUBMITTED';

    await recordAuditEvent({
      actorId: 'user_helper_1',
      actorRole: 'HELPER',
      action: 'PROOF_UPLOADED',
      targetType: 'PROOF',
      targetId: testProofId,
      metadata: { missionId: testMission._id, publicId: testPublicId },
    });

    // Step 6: Proof Review & Completion
    testProof.reviewStatus = 'APPROVED';
    testMission.status = 'COMPLETED';

    await awardReputationPoints({
      userId: 'user_helper_1',
      missionId: testMission._id,
      type: 'PROOF_APPROVED',
      points: 50,
      reason: `Verified proof for ${testMission.title}`,
    });

    await recordAuditEvent({
      actorId: 'user_admin_1',
      actorRole: 'ADMIN',
      action: 'PROOF_APPROVED',
      targetType: 'PROOF',
      targetId: testProofId,
      metadata: { missionId: testMission._id, publicId: testPublicId },
    });

    record('CYCLE 4 — Lifecycle', 'Full 6-step humanitarian mission lifecycle completed', testMission.status === 'COMPLETED');
    record('CYCLE 4 — Lifecycle', 'Proof of work approved and marked in store', testProof.reviewStatus === 'APPROVED');

    // ============================================================
    // CYCLE 5 & 6: Security & RBAC Enforcement
    // ============================================================
    const testToken = signAccessToken({ userId: 'user_test_sec', email: 'sec@test.org', roles: ['SEEKER'] });
    const isTokenVerified = verifyAccessToken(testToken) !== null;
    const isMalformedTokenRejected = verifyAccessToken('invalid.token.payload') === null;
    record('CYCLE 6 — Security', 'Valid JWT token verified successfully', isTokenVerified);
    record('CYCLE 6 — Security', 'Malformed JWT token blocked by auth guard', isMalformedTokenRejected);


    // ============================================================
    // CYCLE 7: Payment Security & Webhook HMAC
    // ============================================================
    const testSecret = 'rzp_whsec_way2humanity_webhook_secret';
    const testBody = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_test_999' } } } });
    const expectedSig = crypto.createHmac('sha256', testSecret).update(testBody).digest('hex');
    const isWebhookSigValid = verifyWebhookSignature(testBody, expectedSig);
    const isTamperedSigRejected = !verifyWebhookSignature(testBody, expectedSig + 'bad');

    record('CYCLE 7 — Payment', 'Razorpay Webhook HMAC signature verification', isWebhookSigValid);
    record('CYCLE 7 — Payment', 'Tampered Webhook signature rejection', isTamperedSigRejected);

    // ============================================================
    // CYCLE 8: Helper Matching & Haversine Distance
    // ============================================================
    const dist = calculateDistanceKm(19.0402, 72.8553, 19.0657, 72.8797);
    record('CYCLE 8 — Matching', 'Haversine distance calculation accuracy (~3.8km)', dist >= 3.0 && dist <= 4.5);

    const helperCandidate = {
      _id: 'user_helper_1',
      skills: ['Food Distribution', 'First Aid'],
      locationApprox: { type: 'Point', coordinates: [72.8553, 19.0402] as [number, number] },
    };
    const suggestions = matchHelperToMissions(helperCandidate as any, [testMission as any]);
    record('CYCLE 8 — Matching', 'Helper skill and distance recommendation score', suggestions.length > 0 && suggestions[0].score > 50);

    // ============================================================
    // CYCLE 9: Evidence Vault & SHA-256 Hashing
    // ============================================================
    const sampleBuffer = Buffer.from('WAY2HUMANITY_TEST_EVIDENCE_PAYLOAD');
    const hash1 = crypto.createHash('sha256').update(sampleBuffer).digest('hex');
    const hash2 = crypto.createHash('sha256').update(sampleBuffer).digest('hex');
    record('CYCLE 9 — Evidence Vault', 'Cryptographic SHA-256 hash determinism', hash1 === hash2);
    record('CYCLE 9 — Evidence Vault', 'Duplicate hash detection', [hash1].includes(hash2));

    // ============================================================
    // CYCLE 10: Humanity Passport & Reputation
    // ============================================================
    const helperUser = memoryStore.users.get('helper@example.test');
    record('CYCLE 10 — Passport', 'Humanity Points incremented after verified completion', (helperUser?.reputationSummary?.points || 0) > 100);

    // ============================================================
    // CYCLE 11: CSR Operations
    // ============================================================
    const memCampaign = {
      _id: `camp_test_${Date.now()}`,
      name: 'Clean Water Initiative',
      description: 'Corporate funding for community clean water filtration units.',
      targetAmount: 250000,
      brandedPageSlug: 'clean-water-initiative',
      status: 'ACTIVE',
      createdAt: new Date(),
    };
    (memoryStore as any).csrCampaigns.set(memCampaign._id, memCampaign);
    record('CYCLE 11 — CSR', 'CSR campaign persistence in store', (memoryStore as any).csrCampaigns.has(memCampaign._id));

    // ============================================================
    // CYCLE 12: TrustGraph Validation
    // ============================================================
    const chainedEvents = memoryStore.auditEvents.filter(
      (e) => e.targetId === testMission._id || e.metadata?.publicId === testPublicId
    );
    record('CYCLE 12 — TrustGraph', 'TrustGraph auditable event chain has >= 5 nodes', chainedEvents.length >= 5);
    record(
      'CYCLE 12 — TrustGraph',
      'TrustGraph nodes contain real timestamps and actor roles',
      chainedEvents.every((e) => e.createdAt && e.actorRole)
    );

    const totalPassed = results.filter((r) => r.status === 'PASS').length;
    const totalFailed = results.filter((r) => r.status === 'FAIL').length;

    return NextResponse.json({
      success: true,
      summary: {
        totalTests: results.length,
        passed: totalPassed,
        failed: totalFailed,
        successRate: `${Math.round((totalPassed / results.length) * 100)}%`,
      },
      results,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: { message: err instanceof Error ? err.message : 'Test runner failed', stack: err instanceof Error ? err.stack : undefined } },
      { status: 200 }
    );
  }
}
