# Way2Humanity — AI Verification Specification

## 1. Purpose

AI verification is designed to identify evidence quality and risk signals.

It is not an oracle and must not be described as absolute proof of truth.

## 2. Pipeline

```text
Upload
  ↓
File Validation
  ↓
Hash + Metadata Extraction
  ↓
Duplicate Detection
  ↓
Vision Analysis
  ↓
Context Consistency
  ↓
Risk Aggregation
  ↓
Auto-Pass / Human Review / Flag
```

## 3. File Validation

Check:

- allowed MIME types
- actual file signature
- file size
- corrupted files
- image dimensions
- malicious payload patterns where supported

Reject:
- executable disguised as image
- unsupported format
- oversized upload

## 4. Metadata Analysis

Where metadata exists:

- EXIF timestamp
- GPS
- camera information
- software/editing tags

Absence of metadata is not proof of fraud.

## 5. Hashing

Calculate SHA-256 for every evidence file.

Use hashes to detect exact duplicates.

## 6. Similarity

For image reuse detection, optionally generate perceptual hashes/embeddings.

Potential signal:

`EXACT_DUPLICATE`
`HIGH_SIMILARITY`
`NO_MATCH`

Similarity is a signal, not a final fraud decision.

## 7. Visual Analysis

Analyze for potential:

- obvious editing artifacts
- inconsistent lighting/shadows
- image compositing indicators
- AI-generated image indicators
- context mismatch

The output must include uncertainty.

## 8. Context Consistency

Compare:

- user description
- category
- visible content
- location metadata where available
- timestamp where available

Example:

A report says "flooded road in Mumbai" while the uploaded image contains visual context inconsistent with the description. This becomes a review signal.

## 9. Risk Aggregation

Do not use one AI model score as truth.

Example conceptual bands:

```text
LOW_RISK
MEDIUM_RISK
HIGH_RISK
INSUFFICIENT_EVIDENCE
```

Aggregation can combine weighted signals, but weights must be versioned and testable.

## 10. Human Review

Mandatory when:

- high-value fundraising
- high-risk classification
- contradictory signals
- suspected manipulation
- repeat suspicious account behavior
- user dispute
- model uncertainty

## 11. AI Mission Copilot

The assistant can extract:

- category
- urgency suggestion
- required resources
- missing information
- concise mission description

It must ask for confirmation before submitting critical facts.

## 12. Explainability

Store:

- model/provider
- model version
- input evidence IDs
- signal results
- confidence band
- timestamp
- policy version

Do not store hidden chain-of-thought.

## 13. AI Failure

If the AI provider fails:

- mark verification `PROCESSING_FAILED`
- retry according to policy
- do not silently approve
- allow manual review
- alert operations if failure rate exceeds threshold

## 14. Model Versioning

Every result must identify:

- provider
- model
- prompt/config version
- verification policy version

This allows future reprocessing.

## 15. Privacy

Do not send more personal information to an AI provider than necessary.

Avoid sending:
- passwords
- payment data
- unnecessary phone/email information

## 16. Product Language

Use:

"AI-assisted verification"

not:

"AI guarantees authenticity."

Use:

"Evidence requires human review"

when appropriate.
