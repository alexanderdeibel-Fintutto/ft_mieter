import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const LETTERXPRESS_API_KEY = Deno.env.get('LETTERXPRESS_API_KEY');

async function callLetterXpressAPI(payload) {
  const response = await fetch('https://api.letterxpress.de/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LETTERXPRESS_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`LetterXpress error: ${error.message}`);
  }

  return await response.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const {
      letter_id,
      recipient_name,
      recipient_address,
      sender_name,
      sender_address,
      subject,
      content,
      letter_type = 'standard',
      send_method = 'standard',
    } = payload;

    // Prepare LetterXpress payload
    const lxPayload = {
      letter_type: send_method === 'einschreiben' ? 'registered' : 'standard',
      recipient: {
        name: recipient_name,
        address: recipient_address,
      },
      sender: {
        name: sender_name,
        address: sender_address,
      },
      subject,
      content, // Must be PDF or HTML
    };

    // Call LetterXpress API
    const result = await callLetterXpressAPI(lxPayload);

    // Update letter_orders record
    if (letter_id) {
      await base44.asServiceRole.entities.LetterOrder.update(letter_id, {
        letterxpress_order_id: result.order_id,
        letterxpress_status: result.status,
        sent_at: new Date().toISOString(),
        status: 'sent',
      });
    }

    console.log(`✓ Letter sent via LetterXpress: ${result.order_id}`);

    return Response.json({
      success: true,
      order_id: result.order_id,
      status: result.status,
      tracking_id: result.tracking_id,
    });
  } catch (error) {
    console.error(`LetterXpress error: ${error.message}`);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});