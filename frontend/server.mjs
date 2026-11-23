import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import express from 'express';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'yopmail.com',
  'trashmail.com',
]);

function getOtpSecret() {
  return process.env.AUTH_SECRET || 'railyatra-3d-stateless-otp-secret';
}

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'railyatra-3d-render-otp' });
});

app.post('/api/send-otp', async (req, res) => {
  try {
    const body = req.body || {};
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const purpose = ['login', 'signup', 'reset'].includes(body.purpose) ? body.purpose : 'login';
    const role = ['passenger', 'tte', 'admin'].includes(String(body.role || '').toLowerCase())
      ? String(body.role).toLowerCase()
      : 'passenger';
    const name = String(body.name || '').trim() || email.split('@')[0];

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ detail: 'Enter a valid email address.' });
    }
    if (DISPOSABLE_DOMAINS.has(email.split('@')[1])) {
      return res.status(400).json({ detail: 'Disposable email addresses are blocked.' });
    }
    if (purpose !== 'reset' && password.length < 6) {
      return res.status(400).json({ detail: 'Password must be at least 6 characters.' });
    }

    const smtpUser = (process.env.SMTP_USER || '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const smtpPort = Number(process.env.SMTP_PORT || 587);

    if (!smtpUser || !smtpPass) {
      return res.status(503).json({
        detail: 'SMTP_USER or SMTP_PASS not set in Render Environment Variables.',
      });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const payloadObj = { email, role, name, purpose, expiresAt };

    const payloadB64 = Buffer.from(JSON.stringify(payloadObj), 'utf8').toString('base64url');
    const sig = crypto
      .createHmac('sha256', getOtpSecret())
      .update(`${payloadB64}:${otp}`)
      .digest('hex');
    const challenge = `${payloadB64}.${sig}`;

    const subjectTitle =
      purpose === 'reset'
        ? 'Password Reset Verification Code'
        : purpose === 'signup'
        ? 'Verify Your RailYatra 3D Account'
        : 'Your RailYatra 3D Sign-In Code';

    const transportOpts = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    };

    const transporter = nodemailer.createTransport(transportOpts);

    await transporter.sendMail({
      from: `"RailYatra 3D Security" <${smtpUser}>`,
      to: email,
      subject: `${subjectTitle}: ${otp}`,
      text: `Hello ${name},\n\nYour 6-digit RailYatra 3D verification code is: ${otp}\n\nPortal Role: ${role.toUpperCase()}\nValid for: 5 minutes.`,
    });

    return res.status(200).json({
      sent: true,
      email,
      role,
      challenge,
      expires_in: 300,
    });
  } catch (err) {
    return res.status(504).json({
      detail: err?.message || 'SMTP connection timed out or failed.',
    });
  }
});

app.post('/api/verify-otp', (req, res) => {
  try {
    const body = req.body || {};
    const email = String(body.email || '').trim().toLowerCase();
    const otp = String(body.otp || '').replace(/\D/g, '');
    const challenge = String(body.challenge || '');
    const newPassword = String(body.newPassword || '');

    if (otp.length !== 6 || !challenge.includes('.')) {
      return res.status(400).json({ detail: 'Enter a valid 6-digit OTP.' });
    }

    const [payloadB64, sig] = challenge.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));

    if (payload.email !== email) {
      return res.status(400).json({ detail: 'Email does not match the OTP request.' });
    }
    if (Date.now() > Number(payload.expiresAt)) {
      return res.status(400).json({ detail: 'OTP has expired. Request a new code.' });
    }

    const expectedSig = crypto
      .createHmac('sha256', getOtpSecret())
      .update(`${payloadB64}:${otp}`)
      .digest('hex');

    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expectedSig, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ detail: 'Incorrect 6-digit OTP code.' });
    }

    if (payload.purpose === 'reset') {
      if (newPassword.length < 6) {
        return res.status(400).json({ detail: 'New password must be at least 6 characters.' });
      }
      return res.status(200).json({ reset: true, email });
    }

    const tokenBody = Buffer.from(
      JSON.stringify({ sub: payload.email, role: payload.role, iat: Math.floor(Date.now() / 1000) }),
      'utf8'
    ).toString('base64url');
    const tokenSig = crypto.createHmac('sha256', getOtpSecret()).update(tokenBody).digest('hex');

    return res.status(200).json({
      access_token: `${tokenBody}.${tokenSig}`,
      user: {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        role: payload.role || 'passenger',
        verified: true,
        verified_at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
        status: 'Active',
      },
    });
  } catch (err) {
    return res.status(500).json({ detail: err?.message || 'OTP verification failed.' });
  }
});

const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));
app.use((_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = Number(process.env.PORT || 10000);
app.listen(port, () => {
  console.log(`RailYatra 3D Render server listening on port ${port}`);
});