import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'yopmail.com',
  'trashmail.com',
]);

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ detail: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const rawMobile = String(body.mobile || '').replace(/\D/g, '');
    const email = String(body.email || '').trim().toLowerCase();
    const role = String(body.role || 'passenger').trim().toLowerCase();
    const purpose = ['login', 'signup', 'reset'].includes(body.purpose) ? body.purpose : 'login';
    const name = String(body.name || (email ? email.split('@')[0] : `User ${rawMobile.slice(-4)}`)).trim();

    if (!/^[6-9]\d{9}$/.test(rawMobile)) {
      return Response.json(
        { detail: 'Enter a valid 10-digit Indian WhatsApp mobile number starting with 6-9.' },
        { status: 400 }
      );
    }

    if (email) {
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        return Response.json({ detail: 'Enter a valid email address or leave Email blank.' }, { status: 400 });
      }
      if (DISPOSABLE_DOMAINS.has(email.split('@')[1])) {
        return Response.json(
          { detail: 'Disposable email domains are blocked. Use a genuine email ID or leave it optional.' },
          { status: 400 }
        );
      }
    }

    if (!['passenger', 'tte', 'admin'].includes(role)) {
      return Response.json({ detail: 'Invalid role selected.' }, { status: 400 });
    }

    const formattedMobile = `+91 ${rawMobile.slice(0, 5)} ${rawMobile.slice(5)}`;
    const waNumber = `91${rawMobile}`;
    const otp = String(crypto.randomInt(100000, 1000000));
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const secret = process.env.AUTH_SECRET || 'railyatra-3d-netlify-otp-secret';

    const payloadB64 = Buffer.from(
      JSON.stringify({ mobile: rawMobile, formattedMobile, email, role, name, purpose, expiresAt }),
      'utf8'
    ).toString('base64url');

    const sig = crypto
      .createHmac('sha256', secret)
      .update(`${payloadB64}:${otp}`)
      .digest('hex');

    const challenge = `${payloadB64}.${sig}`;
    const actionLabel =
      purpose === 'reset'
        ? 'password reset'
        : purpose === 'signup'
        ? 'new account signup'
        : 'sign-in';
    const waText = `RailYatra 3D: Your WhatsApp ${actionLabel} verification code is *${otp}*. Valid for 5 minutes. Do not share this code.`;

    let sentViaWhatsapp = false;
    let sentViaEmail = false;
    let waNote = '';

    // 1A. Meta WhatsApp Cloud API (WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID)
    const waToken = (process.env.WHATSAPP_TOKEN || '').trim();
    const waPhoneId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();

    if (waToken && waPhoneId) {
      try {
        const metaRes = await fetch(`https://graph.facebook.com/v20.0/${waPhoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${waToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: waNumber,
            type: 'text',
            text: { body: waText },
          }),
        });
        const metaData = await metaRes.json().catch(() => ({}));
        if (metaRes.ok && metaData.messages?.length) {
          sentViaWhatsapp = true;
        } else {
          waNote = metaData?.error?.message || 'WhatsApp Cloud API rejected message';
        }
      } catch (err) {
        waNote = err?.message || 'WhatsApp Cloud API error';
      }
    }

    // 1B. Twilio WhatsApp API (TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_WHATSAPP_FROM)
    const twilioSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
    const twilioToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
    const twilioWaFrom = (process.env.TWILIO_WHATSAPP_FROM || '').trim();

    if (!sentViaWhatsapp && twilioSid && twilioToken && twilioWaFrom) {
      try {
        const authHeader = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
        const fromFormatted = twilioWaFrom.startsWith('whatsapp:')
          ? twilioWaFrom
          : `whatsapp:${twilioWaFrom}`;
        const params = new URLSearchParams({
          To: `whatsapp:+${waNumber}`,
          From: fromFormatted,
          Body: waText,
        });
        const twRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${authHeader}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          }
        );
        const twData = await twRes.json().catch(() => ({}));
        if (twRes.ok && twData.sid) {
          sentViaWhatsapp = true;
        } else {
          waNote = twData.message || 'Twilio WhatsApp rejected message';
        }
      } catch (err) {
        waNote = err?.message || 'Twilio WhatsApp error';
      }
    }

    // 2. Optional Email backup if Email ID is provided and SMTP is configured
    const smtpUser = (process.env.SMTP_USER || '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const smtpPort = Number(process.env.SMTP_PORT || 587);

    if (email && smtpUser && smtpPass) {
      try {
        const transporter =
          smtpHost === 'smtp.gmail.com'
            ? nodemailer.createTransport({
                service: 'gmail',
                auth: { user: smtpUser, pass: smtpPass },
              })
            : nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: { user: smtpUser, pass: smtpPass },
              });

        await transporter.sendMail({
          from: `"RailYatra 3D Security" <${smtpUser}>`,
          to: email,
          subject: `RailYatra 3D Verification Code: ${otp}`,
          text: `Hello ${name},\n\nYour RailYatra 3D ${actionLabel} verification code is: ${otp}\n\nWhatsApp Mobile: ${formattedMobile}\nPortal Role: ${role.toUpperCase()}\nValid for: 5 minutes.`,
        });
        sentViaEmail = true;
      } catch {
        // Non-blocking
      }
    }

    const deliveredLive = sentViaWhatsapp || sentViaEmail;
    const responsePayload = {
      sent: true,
      mobile: formattedMobile,
      email,
      sent_via_whatsapp: sentViaWhatsapp,
      sent_via_email: sentViaEmail,
      delivery_mode: deliveredLive ? 'live' : 'preview',
      challenge,
      expires_in: 300,
    };

    if (!deliveredLive) {
      responsePayload.preview_otp = otp;
      if (waNote) responsePayload.wa_note = waNote;
    }

    return Response.json(responsePayload);
  } catch (err) {
    return Response.json(
      { detail: `Could not generate WhatsApp OTP: ${err?.message || 'Unexpected error'}` },
      { status: 400 }
    );
  }
};