import type {ActionFunctionArgs} from 'react-router';

/**
 * API route to send contact form emails via Resend.
 * POST /api/contact
 *
 * Emails are sent using Resend's REST API (https://resend.com)
 * Free tier: 100 emails/day, 3000/month
 */

const SUBJECT_MAP: Record<string, string> = {
  order: 'Bestellanfrage',
  return: 'Retoure',
  product: 'Produktfrage',
  complaint: 'Reklamation',
  other: 'Sonstiges',
};

const RECIPIENT_EMAIL = 'nazibsayed31@gmail.com';

export async function action({request, context}: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Response.json(
      {success: false, error: 'Method not allowed'},
      {status: 405},
    );
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };
    const {name, email, subject, message} = body;

    // Server-side validation
    if (!name?.trim() || !email?.trim() || !subject || !message?.trim()) {
      return Response.json(
        {success: false, error: 'Alle Pflichtfelder müssen ausgefüllt werden.'},
        {status: 400},
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        {success: false, error: 'Ungültige E-Mail-Adresse.'},
        {status: 400},
      );
    }

    if (message.trim().length < 10) {
      return Response.json(
        {
          success: false,
          error: 'Nachricht muss mindestens 10 Zeichen lang sein.',
        },
        {status: 400},
      );
    }

    // Check for API key
    const apiKey = context.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not configured');
      return Response.json(
        {success: false, error: 'E-Mail-Service ist nicht konfiguriert.'},
        {status: 500},
      );
    }

    // Build the subject line
    const subjectLabel = SUBJECT_MAP[subject] || subject;

    // Send email via Resend REST API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'ZEHN Kontaktformular <onboarding@resend.dev>',
        to: [RECIPIENT_EMAIL],
        reply_to: email.trim(),
        subject: `[${subjectLabel}] Neue Kontaktanfrage von ${name.trim()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #e5a43a; padding-bottom: 10px;">
              Neue Kontaktanfrage
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 120px;">Name:</td>
                <td style="padding: 8px 12px; color: #333;">${name.trim()}</td>
              </tr>
              <tr style="background-color: #f9f9f9;">
                <td style="padding: 8px 12px; font-weight: bold; color: #555;">E-Mail:</td>
                <td style="padding: 8px 12px; color: #333;">
                  <a href="mailto:${email.trim()}" style="color: #e5a43a;">${email.trim()}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #555;">Betreff:</td>
                <td style="padding: 8px 12px; color: #333;">${subjectLabel}</td>
              </tr>
            </table>
            <div style="background-color: #f5f5f5; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h3 style="color: #555; margin-top: 0;">Nachricht:</h3>
              <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message.trim()}</p>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
              Diese Nachricht wurde über das Kontaktformular auf zehnfashion.de gesendet.
            </p>
          </div>
        `,
      }),
    });

    if (resendResponse.ok) {
      return Response.json({success: true});
    }

    // Log error for debugging
    const errorData = await resendResponse.text().catch(() => '');
    console.error('Resend API error:', resendResponse.status, errorData);

    return Response.json(
      {success: false, error: 'Fehler beim Senden der Nachricht.'},
      {status: 500},
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return Response.json(
      {
        success: false,
        error: 'Ein unerwarteter Fehler ist aufgetreten.',
      },
      {status: 500},
    );
  }
}
