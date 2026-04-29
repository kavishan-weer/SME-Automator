import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '../../../lib/supabaseAdmin';
import { sendWhatsAppMessage } from '../../../services/whatsapp';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log("✅ Webhook verified successfully!");
      return new NextResponse(challenge, { status: 200 });
    } else {
      console.log("❌ Webhook verification failed.");
      return new NextResponse("Forbidden", { status: 403 });
    }
  } catch (error) {
    console.error("🔥 Webhook GET Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256');

  if (process.env.WHATSAPP_APP_SECRET && signature) {
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', process.env.WHATSAPP_APP_SECRET)
      .update(rawBody)
      .digest('hex')}`;
    if (signature !== expectedSignature) {
      console.log("❌ Webhook signature verification failed!");
      return new NextResponse("Unauthorized", { status: 401 });
    }
  } else if (process.env.WHATSAPP_APP_SECRET && !signature) {
      console.log("❌ Webhook signature missing!");
      return new NextResponse("Unauthorized", { status: 401 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (e) {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  console.log("📩 Incoming Webhook Body:", JSON.stringify(body, null, 2)); // Incoming messages

  const supabase = createAdminClient();

  try {
    const value = body.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (message && message.type === 'text' && message.text) {
      const incomingPhoneId = value.metadata.phone_number_id;
      const senderNumber = message.from;
      const incomingText = message.text.body.toLowerCase().trim();
      const originalText = message.text.body;
      const profileName = value.contacts?.[0]?.profile?.name || null;

      console.log(`🔍 Searching profile for Phone ID: ${incomingPhoneId}`);

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('user_id, whatsapp_access_token')
        .eq('whatsapp_phone_number_id', incomingPhoneId)
        .single();

      if (!profile) {
        console.log("❌ Profile not found in database!");
        return NextResponse.json({ status: 'profile_missing' });
      }

      console.log(`✅ Profile found for User ID: ${profile.user_id}`);

      // --- Upsert contact ---
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('id, bot_active')
        .eq('phone_number', senderNumber)
        .eq('user_id', profile.user_id)
        .single();

      let contactId: string;
      let botActive = true;

      if (existingContact) {
        contactId = existingContact.id;
        botActive = existingContact.bot_active ?? true;

        // Update last message info and profile name
        await supabase
          .from('contacts')
          .update({
            last_message_at: new Date().toISOString(),
            last_message_snippet: originalText.substring(0, 100),
            unread_count: (existingContact as any).unread_count ? (existingContact as any).unread_count + 1 : 1,
            ...(profileName ? { name: profileName } : {}),
          })
          .eq('id', contactId);
      } else {
        const { data: newContact, error: contactErr } = await supabase
          .from('contacts')
          .insert({
            phone_number: senderNumber,
            user_id: profile.user_id,
            name: profileName,
            last_message_at: new Date().toISOString(),
            last_message_snippet: originalText.substring(0, 100),
            unread_count: 1,
            bot_active: true,
          })
          .select('id')
          .single();

        if (contactErr || !newContact) {
          console.error("❌ Failed to create contact:", contactErr);
          return NextResponse.json({ status: 'contact_creation_failed' });
        }
        contactId = newContact.id;
      }

      // --- Log the incoming message ---
      await supabase.from('messages').insert({
        contact_id: contactId,
        user_id: profile.user_id,
        direction: 'incoming',
        body: originalText,
      });

      console.log(`💬 Incoming message logged for contact: ${contactId}`);

      // --- Only auto-reply if bot is active for this contact ---
      if (botActive) {
        const { data: rule } = await supabase
          .from('automation_rules')
          .select('reply_text')
          .eq('keyword', incomingText)
          .eq('user_id', profile.user_id)
          .single();

        const finalReply = rule ? rule.reply_text : "Default Reply: Thank you!";
        console.log(`🤖 Reply matched: ${finalReply}`);

        // WhatsApp API Response  
        const waResponse = await sendWhatsAppMessage(
          senderNumber,
          finalReply,
          incomingPhoneId,
          profile.whatsapp_access_token
        );

        console.log("🚀 WhatsApp API Response:", JSON.stringify(waResponse, null, 2));

        // --- Log the outgoing auto-reply ---
        await supabase.from('messages').insert({
          contact_id: contactId,
          user_id: profile.user_id,
          direction: 'outgoing',
          body: finalReply,
        });

        // Update contact snippet with the reply
        await supabase
          .from('contacts')
          .update({
            last_message_at: new Date().toISOString(),
            last_message_snippet: finalReply.substring(0, 100),
          })
          .eq('id', contactId);
      } else {
        console.log("🔇 Bot is OFF for this contact — skipping auto-reply.");
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error("🔥 Webhook Crash:", error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}