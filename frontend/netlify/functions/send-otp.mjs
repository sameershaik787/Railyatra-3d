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
    const purpose = body.purpose === 'reset' ? 'reset' : 'login';
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
    const e164Mobile = `+91${rawMobile}`;
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
    const actionLabel = purpose === 'reset' ? 'password reset' : 'sign-in verification';
    const smsText = `RailYatra 3D: Your ${actionLabel} OTP is ${otp}. Valid for 5 minutes. Do not share this code.`;

    let sentViaSms = false;
    let sentViaEmail = false;
    let smsNote = '';
    let smtpNote = '';

    // 1A. Real Mobile SMS via Twilio (if TWILIO_* env vars are set in Netlify)
    const twilioSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
    const twilioToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
    const twilioFrom = (process.env.TWILIO_PHONE_NUMBER || '').trim();

    if (twilioSid && twilioToken && twilioFrom) {
      try {
        const authHeader = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
        const params = new URLSearchParams({
          To: e164Mobile,
          From: twilioFrom,
          Body: smsText,
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
          sentViaSms = true;
        } else {
          smsNote = twData.message || 'Twilio SMS rejected';
        }
      } catch (err) {
        smsNote = err?.message || 'Twilio connection error';
      }
    }

    // 1B. Real Mobile SMS via Fast2SMS (if FAST2SMS_API_KEY is set and Twilio wasn't used)
    const fast2smsKey = (process.env.FAST2SMS_API_KEY || '').trim();
    const fast2smsRoute = (process.env.FAST2SMS_ROUTE || 'q').trim();

    if (!sentViaSms && fast2smsKey) {
      try {
        const payload =
          fast2smsRoute === 'otp'
            ? { route: 'otp', variables_values: otp, numbers: rawMobile }
            : { route: 'q', message: smsText, language: 'english', flash: 0, numbers: rawMobile };

        const smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: fast2smsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const smsData = await smsRes.json().catch(() => ({}));
        if (smsRes.ok && smsData.return === true) {
          sentViaSms = true;
        } else {
          smsNote = Array.isArray(smsData.message)
            ? smsData.message.join(', ')
            : smsData.message || 'Fast2SMS rejected request';
        }
      } catch (err) {
        smsNote = err?.message || 'Fast2SMS connection error';
      }
    }

    // 2. Real Email OTP via Gmail/SMTP (for any valid recipient email)
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
          subject:
            purpose === 'reset'
              ? `RailYatra 3D Password Reset OTP: ${otp}`
              : `RailYatra 3D Verification Code: ${otp}`,
          text: `Hello ${name},\n\nYour RailYatra 3D ${actionLabel} code is: ${otp}\n\nMobile: ${formattedMobile}\nPortal Role: ${role.toUpperCase()}\nValid for: 5 minutes.`,
          html: `
            <div style="font-family:Segoe UI,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
              <h2 style="color:#07244d;margin:0 0 8px;">RailYatra 3D ${purpose === 'reset' ? 'Password Reset' : 'Verification'}</h2>
              <p style="color:#334155;font-size:14px;">Hello ${name}, use the code below for your <strong>${role.toUpperCase()}</strong> ${actionLabel} (${formattedMobile}):</p>
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;text-align:center;margin:20px 0;">
                <span style="font-size:28px;font-weight:700;letter-spacing:8px;color:#1d4ed8;font-family:monospace;">${otp}</span>
              </div>
              <p style="color:#64748b;font-size:12px;margin:0;">This code expires in 5 minutes. Do not share it with anyone.</p>
            </div>
          `,
        });
        sentViaEmail = true;
      } catch (err) {
        smtpNote = err?.message || 'SMTP delivery issue';
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
      if (smsNote) responsePayload.sms_note = smsNote;
      if (smtpNote) responsePayload.smtp_note = smtpNote;
    }

    return Response.json(responsePayload);
  } catch (err) {
    return Response.json(
      { detail: `Could not generate OTP: ${err?.message || 'Unexpected error'}` },
      { status: 400 }
    );
  }
};