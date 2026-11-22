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
    const name = String(body.name || (email ? email.split('@')[0] : `User ${rawMobile.slice(-4)}`)).trim();

    if (!/^[6-9]\d{9}$/.test(rawMobile)) {
      return Response.json(
        { detail: 'Enter a valid 10-digit Indian mobile number starting with 6-9.' },
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
    const otp = String(crypto.randomInt(100000, 1000000));
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const secret = process.env.AUTH_SECRET || 'railyatra-3d-netlify-otp-secret';

    const payloadB64 = Buffer.from(
      JSON.stringify({ mobile: rawMobile, formattedMobile, email, role, name, expiresAt }),
      'utf8'
    ).toString('base64url');

    const sig = crypto
      .createHmac('sha256', secret)
      .update(`${payloadB64}:${otp}`)
      .digest('hex');

    const challenge = `${payloadB64}.${sig}`;

    let sentViaEmail = false;
    let sentViaSms = false;
    let smtpError = '';

    // 1. Optional real SMS via Fast2SMS if FAST2SMS_API_KEY is set in Netlify
    const fast2smsKey = (process.env.FAST2SMS_API_KEY || '').trim();
    if (fast2smsKey) {
      try {
        const smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: fast2smsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: otp,
            numbers: rawMobile,
          }),
        });
        if (smsRes.ok) {
          sentViaSms = true;
        }
      } catch {
        // Continue to email or fallback smoothly
      }
    }

    // 2. Real Email delivery for ANY valid recipient email when email is provided & SMTP is configured
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
          text: `Hello ${name},\n\nYour RailYatra 3D one-time verification code is: ${otp}\n\nMobile: ${formattedMobile}\nPortal Role: ${role.toUpperCase()}\nValid for: 5 minutes.`,
          html: `
            <div style="font-family:Segoe UI,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
              <h2 style="color:#07244d;margin:0 0 8px;">RailYatra 3D Verification</h2>
              <p style="color:#334155;font-size:14px;">Hello ${name}, use the code below to verify your <strong>${role.toUpperCase()}</strong> sign-in for <strong>${formattedMobile}</strong>:</p>
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;text-align:center;margin:20px 0;">
                <span style="font-size:28px;font-weight:700;letter-spacing:8px;color:#1d4ed8;font-family:monospace;">${otp}</span>
              </div>
              <p style="color:#64748b;font-size:12px;margin:0;">This code expires in 5 minutes. Do not share it with anyone.</p>
            </div>
          `,
        });
        sentViaEmail = true;
      } catch (err) {
        smtpError = err?.message || 'SMTP delivery issue';
      }
    }

    const deliveredLive = sentViaSms || sentViaEmail;
    const responsePayload = {
      sent: true,
      mobile: formattedMobile,
      email,
      sent_via_sms: sentViaSms,
      sent_via_email: sentViaEmail,
      delivery_mode: deliveredLive ? 'live' : 'preview',
      challenge,
      expires_in: 300,
    };

    if (!deliveredLive) {
      responsePayload.preview_otp = otp;
      if (smtpError) {
        responsePayload.smtp_note = smtpError;
      }
    }

    return Response.json(responsePayload);
  } catch (err) {
    return Response.json(
      { detail: `Could not generate OTP: ${err?.message || 'Unexpected error'}` },
      { status: 400 }
    );
  }
};