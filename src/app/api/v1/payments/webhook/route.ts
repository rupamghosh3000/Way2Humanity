import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, handlePaymentSuccessWebhook } from '@/lib/services/payment';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid webhook signature.' } },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const result = await handlePaymentSuccessWebhook({
        orderId,
        paymentId,
      });

      return NextResponse.json({
        success: true,
        data: {
          event,
          processed: !result.alreadyProcessed,
          donationId: result.donation._id,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Event received but ignored.' });
  } catch (err: unknown) {
    console.error('Payment webhook error:', err);
    return NextResponse.json(
      {
        success: false,
        error: { message: err instanceof Error ? err.message : 'Webhook error' },
      },
      { status: 500 }
    );
  }
}
