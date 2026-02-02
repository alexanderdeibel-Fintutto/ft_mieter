import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// DocuSign for legally binding digital signatures
// This function creates envelope and tracks signature status

const DOCUSIGN_API_BASE = 'https://demo.docusign.net/restapi/v2.1'; // Use production for live
const DOCUSIGN_ACCOUNT_ID = Deno.env.get('DOCUSIGN_ACCOUNT_ID');
const DOCUSIGN_API_KEY = Deno.env.get('DOCUSIGN_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const {
      document_name,
      document_base64,
      signer_email,
      signer_name,
      document_type = 'lease',
    } = payload;

    // Create envelope for signing
    const envelopePayload = {
      emailSubject: `Please sign: ${document_name}`,
      documents: [
        {
          documentBase64: document_base64,
          name: document_name,
          fileExtension: 'pdf',
          documentId: '1',
        },
      ],
      recipients: {
        signers: [
          {
            email: signer_email,
            name: signer_name,
            recipientId: '1',
            routingOrder: '1',
            tabs: {
              signHereTabs: [
                {
                  documentId: '1',
                  pageNumber: '1',
                  recipientId: '1',
                  xPosition: '100',
                  yPosition: '100',
                },
              ],
            },
          },
        ],
      },
      status: 'sent',
    };

    const response = await fetch(
      `${DOCUSIGN_API_BASE}/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DOCUSIGN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(envelopePayload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`DocuSign error: ${error.message}`);
    }

    const result = await response.json();

    console.log(`✓ Signing envelope created: ${result.envelopeId}`);

    return Response.json({
      success: true,
      envelope_id: result.envelopeId,
      status: result.status,
      signer_email,
    });
  } catch (error) {
    console.error(`DocuSign error: ${error.message}`);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});