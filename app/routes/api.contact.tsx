import type {ActionFunctionArgs} from 'react-router';
import {checkRateLimit, getClientIp} from '~/lib/rate-limit';
import type {ActionResult} from '~/lib/action-types';

/**
 * API route to send contact form emails via Resend.
 * POST /api/contact
 *
 * Rate limit: 5 requests per 15 minutes per IP (Workers Cache sliding window).
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
      {success: false, error: 'Method not allowed'} satisfies ActionResult,
      {status: 405},
    );
  }

  /* Rate limit: 5 requests per 15 min per IP — protects Resend free-tier quota */
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`contact:${ip}`, {
    max: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    const retryAfterSec = Math.ceil((rateLimit.retryAfterMs ?? 0) / 1000);
    return Response.json(
      {
        success: false,
        error: `Zu viele Anfragen. Bitte warten Sie ${retryAfterSec} Sekunden.`,
        status: 429,
      } satisfies ActionResult,
      {
        status: 429,
        headers: {'Retry-After': String(retryAfterSec)},
      },
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

    /* Server-side validation */
    if (!name?.trim() || !email?.trim() || !subject || !message?.trim()) {
      return Response.json(
        {success: false, error: 'Alle Pflichtfelder müssen ausgefüllt werden.'} satisfies ActionResult,
        {status: 400},
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        {success: false, error: 'Ungültige E-Mail-Adresse.'} satisfies ActionResult,
        {status: 400},
      );
    }

    if (message.trim().length < 10) {
      return Response.json(
        {success: false, error: 'Nachricht muss mindestens 10 Zeichen lang sein.'} satisfies ActionResult,
        {status: 400},
      );
    }

    /* Resend API key — required in production, set in Oxygen env */
    const apiKey = context.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[api.contact] RESEND_API_KEY is not configured');
      return Response.json(
        {success: false, error: 'E-Mail-Service ist nicht konfiguriert.'} satisfies ActionResult,
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
      return Response.json({success: true} satisfies ActionResult);
    }

    const errorData = await resendResponse.text().catch(() => '');
    console.error('[api.contact] Resend API error:', resendResponse.status, errorData);

    return Response.json(
      {success: false, error: 'Fehler beim Senden der Nachricht.'} satisfies ActionResult,
      {status: 500},
    );
  } catch (error) {
    console.error('[api.contact] Unexpected error:', error);
    return Response.json(
      {success: false, error: 'Ein unerwarteter Fehler ist aufgetreten.'} satisfies ActionResult,
      {status: 500},
    );
  }
}
