// src/services/whatsapp.ts

export async function sendWhatsAppMessage(
  toNumber: string,
  textMessage: string,
  phoneId: string,
  accessToken: string
) {
  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toNumber,
      type: "text", 
      text: { 
        body: textMessage 
      },
    }),
  });

  return response.json();
}