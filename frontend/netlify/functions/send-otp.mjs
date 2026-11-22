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
    const purpose = ['login', 'signup', 'reset'].includes(body.purpose) ? body.purpose : 'login';
    const name = String(body.name || email.split('@')[0] || 'RailYatra User').trim();

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return Response.json({ detail: 'Enter a valid email address.' }, { status: 400 });
    }
    if (DISPOSABLE_DOMAINS.has(email.split('@')[1])) {
      return Response.json(
        { detail: 'Disposable email addresses are not permitted. Use a genuine email ID.' },
        { status: 400 }
      );
    }
    if (!['passenger', 'tte', 'admin'].includes(role)) {
      return Response.json({ detail: 'Invalid portal role selected.' }, { status: 400 });
    }

    const smtpUser = (process.env.SMTP_USER || '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const smtpPort = Number(process.env.SMTP_PORT || 587);

    if (!smtpUser || !smtpPass) {
      return Response.json(
        { detail: 'Email server not configured. Add SMTP_USER and SMTP_PASS in Netlify Environment Variables.' },
        { status: 503 }
      );
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const secret = process.env.AUTH_SECRET || 'railyatra-3d-netlify-otp-secret';

    const payloadB64 = Buffer.from(
      JSON.stringify({ email, role, name, purpose, expiresAt }),
      'utf8'
    ).toString('base64url');

    const sig = crypto
      .createHmac('sha256', secret)
      .update(`${payloadB64}:${otp}`)
      .digest('hex');

    const challenge = `${payloadB64}.${sig}`;
    const subjectTitle =
      purpose === 'reset'
        ? 'Password Reset Verification Code'
        : purpose === 'signup'
        ? 'Verify Your New RailYatra 3D Account'
        : 'Your RailYatra 3D Sign-In Code';

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
      subject: `${subjectTitle}: ${otp}`,
      text: `Hello ${name},\n\nYour 6-digit RailYatra 3D verification code is: ${otp}\n\nPortal Role: ${role.toUpperCase()}\nValid for: 5 minutes.\n\nIf you did not request this, you can safely ignore this email.`,
      html: `
        <div style="font-family:Segoe UI,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:14px;background:#ffffff;">
          <div style="font-size:12px;font-weight:700;color:#1d4ed8;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:6px;">RailYatra 3D Security</div>
          <h2 style="color:#07244d;margin:0 0 10px;font-size:20px;">${subjectTitle}</h2>
          <p style="color:#334155;font-size:14px;line-height:1.5;margin:0 0 18px;">
            Hello <strong>${name}</strong>, enter the verification code below to continue to your <strong>${role.toUpperCase()}</strong> portal:
          </p>
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px;text-align:center;margin:20px 0;">
            <span style="font-size:30px;font-weight:700;letter-spacing:10px;color:#1d4ed8;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#64748b;font-size:12px;margin:0;">This code expires in 5 minutes. Never share your OTP with anyone.</p>
        </div>
      `,
    });

    return Response.json({
      sent: true,
      email,
      challenge,
      expires_in: 300,
    });
  } catch (err) {
    return Response.json(
      { detail: `Could not send verification email: ${err?.message || 'Check SMTP settings in Netlify.'}` },
      { status: 502 }
    );
  }
};