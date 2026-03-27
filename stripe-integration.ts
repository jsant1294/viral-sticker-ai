// lib/stripe.ts
/**
 * Stripe Client & Server Setup for ViralStickerAI
 * Handles payment processing and webhook verification
 */

import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;

if (!stripeSecret) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(stripeSecret, {
  apiVersion: '2023-10-16' as any,
});

// Webhook secret for signature verification
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Create a Stripe Checkout Session
 * Used for processing orders through Stripe
 */
export async function createCheckoutSession(orderData: {
  orderId: string;
  amount: number;
  currency: string;
  items: {
    name: string;
    amount: number;
    currency: string;
    quantity: number;
  }[];
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: orderData.items.map((item) => ({
        price_data: {
          currency: orderData.currency.toLowerCase(),
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.amount * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      customer_email: orderData.customerEmail,
      client_reference_id: orderData.orderId,
      metadata: {
        order_id: orderData.orderId,
      },
      success_url: orderData.successUrl,
      cancel_url: orderData.cancelUrl,
      mode: 'payment',
    });

    return session;
  } catch (error) {
    console.error('Failed to create Stripe session:', error);
    throw error;
  }
}

/**
 * Retrieve a Stripe Session by ID
 */
export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Failed to retrieve Stripe session:', error);
    throw error;
  }
}

/**
 * Handle Stripe Webhook Events
 */
export async function handleStripeWebhook(rawBody: Buffer | string, signature: string) {
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET
    ) as Stripe.Event;
  } catch (error: any) {
    console.error(`Webhook signature verification failed:`, error.message);
    throw new Error(`Webhook Error: ${error.message}`);
  }

  return event;
}

/**
 * Refund a Stripe Charge
 */
export async function refundCharge(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount, // Amount in cents (leave empty for full refund)
    });

    return refund;
  } catch (error) {
    console.error('Failed to refund charge:', error);
    throw error;
  }
}

// ============================================================================
// app/api/checkout/route.ts
// ============================================================================
/**
 * POST /api/checkout
 * Creates a Stripe checkout session from cart data
 */

/*
import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { supabaseServer } from '@/lib/supabase';
import type { CreateOrderPayload } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderPayload = await request.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Validate request
    if (!body.user_id || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: missing user_id or items' },
        { status: 400 }
      );
    }

    // Create order in database
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate totals
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of body.items) {
      // Get product details
      const { data: product } = await supabaseServer()
        .from('products')
        .select('price')
        .eq('id', item.product_id)
        .single();

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.product_id} not found` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
        custom_text: item.custom_text,
        custom_logo_url: item.custom_logo_url,
        custom_color: item.custom_color,
      });
    }

    // Calculate shipping (simplified)
    const shippingCost = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    // Create order record
    const { data: order, error: orderError } = await supabaseServer()
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: body.user_id,
        status: 'pending',
        subtotal,
        shipping_cost: shippingCost,
        tax,
        total_amount: total,
        shipping_method: body.shipping_method,
        shipping_address_line1: body.shipping_address.line1,
        shipping_address_line2: body.shipping_address.line2,
        shipping_city: body.shipping_address.city,
        shipping_state: body.shipping_address.state,
        shipping_postal_code: body.shipping_address.postal_code,
        shipping_country: body.shipping_address.country,
        billing_address_line1: body.billing_address.line1,
        billing_address_line2: body.billing_address.line2,
        billing_city: body.billing_address.city,
        billing_state: body.billing_address.state,
        billing_postal_code: body.billing_address.postal_code,
        billing_country: body.billing_address.country,
        notes: body.notes,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Add order items
    const { error: itemsError } = await supabaseServer()
      .from('order_items')
      .insert(orderItems.map(item => ({ ...item, order_id: order.id })));

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to add order items' },
        { status: 500 }
      );
    }

    // Get user email
    const { data: { user } } = await supabaseServer().auth.admin.getUserById(body.user_id);
    const userEmail = user?.email || 'customer@example.com';

    // Create Stripe session
    const session = await createCheckoutSession({
      orderId: order.id,
      amount: total,
      currency: 'USD',
      items: orderItems.map(item => ({
        name: `Order Item - ${item.product_id}`,
        amount: item.unit_price * item.quantity,
        currency: 'USD',
        quantity: 1,
      })),
      customerEmail: userEmail,
      successUrl: `${appUrl}/checkout/confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/checkout?canceled=true`,
    });

    return NextResponse.json({
      sessionId: session.id,
      orderId: order.id,
      clientSecret: session.client_secret,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// app/api/webhook/route.ts
// ============================================================================
/**
 * POST /api/webhook
 * Stripe webhook handler for payment confirmation
 */

/*
import { NextRequest, NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/lib/stripe';
import { supabaseServer } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature') || '';
  const body = await request.text();

  try {
    const event = await handleStripeWebhook(body, signature);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderId = session.client_reference_id;

      if (!orderId) {
        console.error('No order ID in webhook');
        return NextResponse.json({ error: 'No order ID' }, { status: 400 });
      }

      // Update order status
      const { error } = await supabaseServer()
        .from('orders')
        .update({
          status: 'confirmed',
          payment_method: 'stripe',
          payment_intent_id: session.payment_intent,
          paid_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) {
        console.error('Failed to update order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
      }

      // Clear user's cart
      const { data: order } = await supabaseServer()
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single();

      if (order?.user_id) {
        await supabaseServer()
          .from('cart')
          .delete()
          .eq('user_id', order.user_id);
      }
    }

    // Handle charge.refunded event
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as any;
      // Find order by payment_intent_id and update status
      const { error } = await supabaseServer()
        .from('orders')
        .update({ status: 'refunded' })
        .eq('payment_intent_id', charge.payment_intent);

      if (error) {
        console.error('Failed to update refund status:', error);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook failed' },
      { status: 400 }
    );
  }
}
*/
