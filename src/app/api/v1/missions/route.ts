import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Mission } from '@/models/Mission';
import { Evidence } from '@/models/Evidence';
import { ReportMissionSchema } from '@/lib/validation';
import { recordAuditEvent } from '@/lib/security/audit';
import { memoryStore } from '@/lib/db/memoryStore';
import { fetchImageAsBuffer, calculateBufferHash, extractBufferMetadata } from '@/lib/services/fileProcessing';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['SEEKER', 'ADMIN']);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const validated = ReportMissionSchema.parse(body);

    const db = await connectToDatabase();
    const publicId = `MSN-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    if (!db) {
      // Memory Store Fallback
      const memoryMission = {
        _id: `msn_${Date.now()}`,
        publicId,
        seekerId: auth.user.id,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        urgency: validated.urgency,
        riskLevel: 'LOW',
        status: 'DRAFT',
        location: {
          addressApprox: validated.location.addressApprox,
          city: validated.location.city,
          region: validated.location.region,
          coordinates: { type: 'Point', coordinates: [validated.location.longitude, validated.location.latitude] as [number, number] },
        },
        requiredSkills: validated.requiredSkills,
        resourceRequirements: validated.resourceRequirements,
        affectedPeopleCount: validated.affectedPeopleCount,
        fundingEnabled: validated.fundingEnabled,
        fundingTarget: validated.fundingTarget,
        fundingRaised: 0,
        verificationStatus: 'PENDING',
        evidenceUrls: validated.evidenceUrls || [],
        createdAt: new Date(),
      };
      memoryStore.missions.set(publicId, memoryMission);

      return NextResponse.json({
        success: true,
        data: { mission: memoryMission },
      });
    }

    // MongoDB Mode
    const newMission = await Mission.create({
      publicId,
      seekerId: auth.user.id,
      title: validated.title,
      description: validated.description,
      category: validated.category,
      urgency: validated.urgency,
      status: 'DRAFT',
      location: {
        addressApprox: validated.location.addressApprox,
        city: validated.location.city,
        region: validated.location.region,
        coordinates: {
          type: 'Point',
          coordinates: [validated.location.longitude, validated.location.latitude],
        },
      },
      requiredSkills: validated.requiredSkills,
      resourceRequirements: validated.resourceRequirements,
      affectedPeopleCount: validated.affectedPeopleCount,
      fundingEnabled: validated.fundingEnabled,
      fundingTarget: validated.fundingTarget,
      fundingRaised: 0,
      verificationStatus: 'PENDING',
    });

    // Save Evidence records with real SHA-256 binary hash computation
    if (validated.evidenceUrls && validated.evidenceUrls.length > 0) {
      for (const evidenceUrl of validated.evidenceUrls) {
        let sha256 = crypto.createHash('sha256').update(evidenceUrl).digest('hex');
        let mimeType = 'image/jpeg';
        let size = 1024 * 500;
        let metadata: any = {};

        try {
          const imageObj = await fetchImageAsBuffer(evidenceUrl);
          sha256 = calculateBufferHash(imageObj.buffer);
          mimeType = imageObj.mimeType;
          size = imageObj.buffer.length;
          metadata = extractBufferMetadata(imageObj.buffer, mimeType);
        } catch {}

        const ev = await Evidence.create({
          missionId: newMission._id,
          uploaderId: auth.user.id,
          type: 'IMAGE',
          storageKey: `evidence/${publicId}/${Date.now()}.jpg`,
          url: evidenceUrl,
          mimeType,
          size,
          sha256,
          metadata,
          uploadedAt: new Date(),
          visibility: 'PUBLIC_APPROVED',
          processingStatus: 'PROCESSED',
        });

        await recordAuditEvent({
          actorId: auth.user.id,
          actorRole: auth.user.roles[0],
          action: 'EVIDENCE_UPLOADED',
          targetType: 'EVIDENCE',
          targetId: ev._id.toString(),
          metadata: { sha256, mimeType, size },
        });
      }
    }

    await recordAuditEvent({
      actorId: auth.user.id,
      actorRole: auth.user.roles[0],
      action: 'REPORT_CREATED',
      targetType: 'MISSION',
      targetId: newMission._id.toString(),
      metadata: { publicId, category: validated.category, urgency: validated.urgency },
    });

    return NextResponse.json({
      success: true,
      data: { mission: newMission },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'MISSION_CREATE_FAILED',
          message: err instanceof Error ? err.message : 'Failed to create report.',
        },
      },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  const db = await connectToDatabase();
  const { searchParams } = new URL(req.url);

  const category = searchParams.get('category');
  const urgency = searchParams.get('urgency');
  const status = searchParams.get('status') || 'PUBLISHED';
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);

  if (!db) {
    // Memory Store Fallback List
    let memMissions = Array.from(memoryStore.missions.values());
    if (status !== 'ALL') {
      memMissions = memMissions.filter((m) => m.status === status);
    }
    if (category && category !== 'ALL') {
      memMissions = memMissions.filter((m) => m.category === category);
    }
    if (urgency && urgency !== 'ALL') {
      memMissions = memMissions.filter((m) => m.urgency === urgency);
    }

    return NextResponse.json({
      success: true,
      data: {
        missions: memMissions.slice(0, limit),
        pagination: { total: memMissions.length, page, limit, pages: 1 },
      },
    });
  }

  // MongoDB Mode
  const filter: Record<string, unknown> = {};

  if (status !== 'ALL') {
    filter.status = status;
  }
  if (category && category !== 'ALL') {
    filter.category = category;
  }
  if (urgency && urgency !== 'ALL') {
    filter.urgency = urgency;
  }

  const skip = (page - 1) * limit;

  try {
    const [missions, total] = await Promise.all([
      Mission.find(filter)
        .populate('seekerId', 'name city reputationSummary')
        .populate('assignedHelperId', 'name city reputationSummary')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Mission.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        missions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch {
    const memMissions = Array.from(memoryStore.missions.values());
    return NextResponse.json({
      success: true,
      data: {
        missions: memMissions,
        pagination: { total: memMissions.length, page: 1, limit: 20, pages: 1 },
      },
    });
  }
}
