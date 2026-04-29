import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase';
import { sendWhatsAppMessage } from '../../../services/whatsapp';

export async function POST(req: Request) {
  const body = await req.json();
  console.log("📩 Incoming Webhook Body:", JSON.stringify(body, null, 2)); // Incoming messages

  const supabase = createClient();

  try {
    const value = body.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (message) {
      const incomingPhoneId = value.metadata.phone_number_id;
      const senderNumber = message.from;
      const incomingText = message.text.body.toLowerCase().trim();

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
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error("🔥 Webhook Crash:", error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}