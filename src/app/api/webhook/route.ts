import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase';
import { sendWhatsAppMessage } from '../../../services/whatsapp';

// 1. GET: Webhook Verification (Meta check)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Verification failed', { status: 403 });
}

// 2. POST: Handle Incoming Messages
export async function POST(req: Request) {
  const body = await req.json();
  const supabase = createClient();

  try {
    // Extracting message details from WhatsApp JSON
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message) {
      const incomingPhoneId = value.metadata.phone_number_id;
      const senderNumber = message.from;
      const incomingText = message.text.body.toLowerCase().trim();

      // Step A: Find the SME Owner (User) from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, whatsapp_access_token')
        .eq('whatsapp_phone_number_id', incomingPhoneId)
        .single();

      if (profile) {
        // Step B: Search for a matching Keyword Rule
        const { data: rule } = await supabase
          .from('automation_rules')
          .select('reply_text')
          .eq('keyword', incomingText)
          .eq('user_id', profile.user_id)
          .single();

        // Default reply if no keyword matches
        const finalReply = rule ? rule.reply_text : "Thank you for your message! Our team will contact you soon.";

        // Step C: Send the reply back to the customer
        await sendWhatsAppMessage(
          senderNumber,
          finalReply,
          incomingPhoneId,
          profile.whatsapp_access_token
        );
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}