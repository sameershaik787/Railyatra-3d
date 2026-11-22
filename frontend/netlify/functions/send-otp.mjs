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
    const email = String(body.email || '').trim().toLowerCase();
    const role = String(body.role || 'passenger').trim().toLowerCase();
    const name = String(body.name || email.split('@')[0] || 'RailYatra User').trim();

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return Response.json({ detail: 'Enter a valid email address.' }, { status: 400 });
    }
    if (DISPOSABLE_DOMAINS.has(email.split('@')[1])) {
      return Response.json(
        { detail: 'Disposable email domains are blocked. Use a genuine email ID.' },
        { status: 400 }
      );
    }
    if (!['passenger', 'tte', 'admin'].includes(role)) {
      return Response.json({ detail: 'Invalid role selected.' }, { status: 400 });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const secret = process.env.AUTH_SECRET || 'railyatra-3d-netlify-otp-secret';

    const payloadB64 = Buffer.from(
      JSON.stringify({ email, role, name, expiresAt }),
      'utf8'
    ).toString('base64url');

    const sig = crypto
      .createHmac('sha256', secret)
      .update(`${payloadB64}:${otp}`)
      .digest('hex');

    const challenge = `${payloadB64}.${sig}`;

    const smtpUser = (process.env.SMTP_USER || '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const smtpPort = Number(process.env.SMTP_PORT || 465);

    if (!smtpUser || !smtpPass) {
      return Response.json({
        sent: true,
        email,
        delivery_mode: 'preview',
        preview_otp: otp,
        challenge,
        expires_in: 300,
      });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"RailYatra 3D Security" <${smtpUser}>`,
      to: email,
      subject: `RailYatra 3D Verification Code: ${otp}`,
      text: `Hello ${name},\n\nYour RailYatra 3D one-time verification code is: ${otp}\n\nPortal Role: ${role.toUpperCase()}\nValid for: 5 minutes.\n\nIf you did not request this login, please ignore this email.`,
      html: `
        <div style="font-family:Segoe UI,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
          <h2 style="color:#07244d;margin:0 0 8px;">RailYatra 3D Verification</h2>
          <p style="color:#334155;font-size:14px;">Hello ${name}, use the code below to verify your <strong>${role.toUpperCase()}</strong> sign-in:</p>
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;text-align:center;margin:20px 0;">
            <span style="font-size:28px;font-weight:700;letter-spacing:8px;color:#1d4ed8;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#64748b;font-size:12px;margin:0;">This code expires in 5 minutes. Do not share it with anyone.</p>
        </div>
      `,
    });

    return Response.json({
      sent: true,
      email,
      delivery_mode: 'email',
      challenge,
      expires_in: 300,
    });
  } catch (err) {
    return Response.json(
      { detail: `Email delivery error: ${err?.message || 'Check SMTP credentials in Netlify.'}` },
      { status: 502 }
    );
  }
};