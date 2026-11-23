import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { getDb, hashPassword, verifyPassword, getAuthSecret } from '../netlify/functions/lib/db.mjs';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'yopmail.com',
  'trashmail.com',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const purpose = ['login', 'signup', 'reset'].includes(body.purpose) ? body.purpose : 'login';
    let role = String(body.role || 'passenger').trim().toLowerCase();
    let name = String(body.name || '').trim();

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ detail: 'Enter a valid email address.' });
    }
    if (DISPOSABLE_DOMAINS.has(email.split('@')[1])) {
      return res.status(400).json({ detail: 'Disposable email addresses are blocked.' });
    }

    const db = await getDb();
    const usersCol = db.collection('users');
    const existing = await usersCol.findOne({ email });
    let signupPasswordHash = '';

    if (purpose === 'signup') {
      if (existing) {
        return res.status(409).json({ detail: 'This email is already registered.' });
      }
      if (name.length < 2) {
        return res.status(400).json({ detail: 'Enter your full name to create an account.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ detail: 'Password must be at least 6 characters.' });
      }
      if (!['passenger', 'tte', 'admin'].includes(role)) {
        return res.status(400).json({ detail: 'Invalid portal role selected.' });
      }
      signupPasswordHash = hashPassword(password);
    } else if (purpose === 'login') {
      if (!existing) {
        return res.status(404).json({ detail: 'No account found for this email.' });
      }
      if (existing.status === 'Suspended') {
        return res.status(403).json({ detail: 'This account has been suspended by a Railway Admin.' });
      }
      if (!verifyPassword(password, existing.passwordHash)) {
        return res.status(401).json({ detail: 'Incorrect password.' });
      }
      name = existing.name;
      role = existing.role;
    } else if (purpose === 'reset') {
      if (!existing) {
        return res.status(404).json({ detail: 'No registered account found for this email.' });
      }
      name = existing.name;
      role = existing.role;
    }

    const smtpUser = (process.env.SMTP_USER || '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const smtpPort = Number(process.env.SMTP_PORT || 587);

    if (!smtpUser || !smtpPass) {
      return res.status(503).json({ detail: 'Email server not configured on Vercel.' });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const payloadObj = { email, role, name, purpose, expiresAt };
    if (purpose === 'signup') payloadObj.passwordHash = signupPasswordHash;

    const payloadB64 = Buffer.from(JSON.stringify(payloadObj), 'utf8').toString('base64url');
    const sig = crypto.createHmac('sha256', getAuthSecret()).update(`${payloadB64}:${otp}`).digest('hex');
    const challenge = `${payloadB64}.${sig}`;

    const transporter =
      smtpHost === 'smtp.gmail.com'
        ? nodemailer.createTransport({ service: 'gmail', auth: { user: smtpUser, pass: smtpPass } })
        : nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPass },
          });

    await transporter.sendMail({
      from: `"RailYatra 3D Security" <${smtpUser}>`,
      to: email,
      subject: `Your RailYatra 3D Verification Code: ${otp}`,
      text: `Hello ${name},\n\nYour 6-digit RailYatra 3D OTP is: ${otp}\nValid for 5 minutes.`,
    });

    return res.status(200).json({ sent: true, email, role, challenge, expires_in: 300 });
  } catch (err) {
    return res.status(500).json({ detail: err?.message || 'Failed to send OTP.' });
  }
}