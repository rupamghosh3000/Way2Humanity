export interface DecisionInput {
  providerStatus: 'COMPLETED' | 'AI_VERIFICATION_UNAVAILABLE' | 'PROCESSING_FAILED';
  claimConsistency?: {
    status: 'MATCH' | 'PARTIAL' | 'MISMATCH' | 'UNKNOWN';
    confidence: number;
    reasoning?: string;
    [key: string]: unknown;
  };
  evidenceQuality?: {
    status: 'HIGH' | 'MEDIUM' | 'LOW';
    confidence: number;
    clarityNotes?: string;
    [key: string]: unknown;
  };
  manipulationRisk?: {
    status: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
    confidence: number;
    indicatorsDetected?: string[];
    [key: string]: unknown;
  };
  locationConsistency?: {
    status: 'MATCH' | 'PARTIAL' | 'MISMATCH' | 'UNKNOWN';
    confidence: number;
    observations?: string;
    [key: string]: unknown;
  };
  overallRisk?: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'INSUFFICIENT_EVIDENCE';
  overallConfidence?: number;
  isDuplicateHash?: boolean;
  fileIntegrityPass?: boolean;
  reasons?: string[];
  observations?: string[];
  concerns?: string[];
  [key: string]: unknown;
}

export interface DecisionResult {
  decision: 'PASS_AUTO_REVIEW' | 'NEEDS_HUMAN_REVIEW' | 'NEEDS_MORE_INFO' | 'REJECTED';
  recommendedAction: 'APPROVE' | 'REQUEST_MORE_EVIDENCE' | 'HUMAN_REVIEW' | 'REJECT';
  overallRisk: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'INSUFFICIENT_EVIDENCE';
  requiresHumanReview: boolean;
  explanation: string;
}

/**
 * Deterministic Decision Engine for AI Verification.
 * Evaluates AI structured analysis + file integrity + duplicate signals against configured rules.
 */
export function evaluateVerificationDecision(input: DecisionInput): DecisionResult {
  // 1. Check AI Provider Availability
  if (input.providerStatus === 'AI_VERIFICATION_UNAVAILABLE' || input.providerStatus === 'PROCESSING_FAILED') {
    return {
      decision: 'NEEDS_HUMAN_REVIEW',
      recommendedAction: 'HUMAN_REVIEW',
      overallRisk: 'INSUFFICIENT_EVIDENCE',
      requiresHumanReview: true,
      explanation: 'AI VERIFICATION UNAVAILABLE: Provider is unconfigured or unreachable. Mandatory human verifier review required.',
    };
  }

  // 2. Check Cryptographic File Integrity & Duplicates
  if (input.fileIntegrityPass === false) {
    return {
      decision: 'REJECTED',
      recommendedAction: 'REJECT',
      overallRisk: 'HIGH_RISK',
      requiresHumanReview: true,
      explanation: 'File integrity constraint violated (unsupported MIME type or corrupt payload).',
    };
  }

  if (input.isDuplicateHash) {
    return {
      decision: 'NEEDS_HUMAN_REVIEW',
      recommendedAction: 'HUMAN_REVIEW',
      overallRisk: 'HIGH_RISK',
      requiresHumanReview: true,
      explanation: 'Exact SHA-256 duplicate evidence detected across platform history.',
    };
  }

  // 3. Evaluate Manipulation Risk & Claim Mismatch Signals
  if (input.manipulationRisk?.status === 'HIGH' || input.claimConsistency?.status === 'MISMATCH') {
    return {
      decision: 'NEEDS_HUMAN_REVIEW',
      recommendedAction: 'HUMAN_REVIEW',
      overallRisk: 'HIGH_RISK',
      requiresHumanReview: true,
      explanation: `High risk detected: Manipulation Risk [${input.manipulationRisk?.status || 'UNKNOWN'}] or Claim Match [${input.claimConsistency?.status || 'UNKNOWN'}].`,
    };
  }

  // 4. Low Evidence Quality
  if (input.evidenceQuality?.status === 'LOW') {
    return {
      decision: 'NEEDS_MORE_INFO',
      recommendedAction: 'REQUEST_MORE_EVIDENCE',
      overallRisk: 'INSUFFICIENT_EVIDENCE',
      requiresHumanReview: true,
      explanation: 'Evidence visual quality is low, obstructed, or unclear. Additional evidence requested.',
    };
  }

  // 5. Eligible for Automatic Approval (Deterministic Thresholds)
  const isHighQuality = input.evidenceQuality?.status === 'HIGH' || input.evidenceQuality?.status === 'MEDIUM';
  const isClaimMatched = input.claimConsistency?.status === 'MATCH' || input.claimConsistency?.status === 'PARTIAL';
  const isLowManipulation = input.manipulationRisk?.status === 'LOW' || input.manipulationRisk?.status === 'MEDIUM';
  const isConfident = (input.overallConfidence || 0) >= 0.70;

  if (isHighQuality && isClaimMatched && isLowManipulation && isConfident && input.overallRisk === 'LOW_RISK') {
    return {
      decision: 'PASS_AUTO_REVIEW',
      recommendedAction: 'APPROVE',
      overallRisk: 'LOW_RISK',
      requiresHumanReview: false,
      explanation: 'All multimodal visual signals passed low-risk automated thresholds.',
    };
  }

  // 6. Default Fallback -> Human Review
  return {
    decision: 'NEEDS_HUMAN_REVIEW',
    recommendedAction: 'HUMAN_REVIEW',
    overallRisk: input.overallRisk || 'MEDIUM_RISK',
    requiresHumanReview: true,
    explanation: 'Evidence requires human verifier review due to moderate confidence or subtle visual ambiguity.',
  };
}
