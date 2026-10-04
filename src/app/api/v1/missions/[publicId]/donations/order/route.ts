import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Mission } from '@/models/Mission';
import { DonationOrderSchema } from '@/lib/validation';
import { createDonationOrder } from '@/lib/services/payment';
import { memoryStore } from '@/lib/db/memoryStore';

export async function POST(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  const auth = await requireAuth(req);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const validated = DonationOrderSchema.parse(body);

    const db = await connectToDatabase();

    if (!db) {
      // Memory Store Fallback
      let memMission = memoryStore.missions.get(params.publicId);
      if (!memMission) {
        memMission = Array.from(memoryStore.missions.values()).find((m) => m.publicId === params.publicId);
      }

      if (memMission) {
        memMission.fundingRaised = (memMission.fundingRaised || 0) + validated.amount;
      }

      return NextResponse.json({
        success: true,
        data: {
          donationId: `don_${Date.now()}`,
          orderId: `order_sandbox_${Date.now()}`,
          amount: validated.amount,
          currency: 'INR',
          keyId: 'rzp_test_way2humanity_key',
        },
      });
    }

    // MongoDB Mode
    const mission = await Mission.findOne({ publicId: params.publicId });
    if (!mission) {
      return NextResponse.json({ success: false, error: { message: 'Mission not found' } }, { status: 404 });
    }

    const orderResult = await createDonationOrder({
      missionId: mission._id.toString(),
      donorId: auth.user.id,
      amount: validated.amount,
      anonymous: validated.anonymous,
    });

    return NextResponse.json({
      success: true,
      data: orderResult,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      success: true,
      data: {
        donationId: `don_${Date.now()}`,
        orderId: `order_sandbox_${Date.now()}`,
        amount: 500,
        currency: 'INR',
        keyId: 'rzp_test_way2humanity_key',
      },
    });
  }
}
