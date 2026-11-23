import crypto from 'node:crypto';
import { getDb, hashPassword, getAuthSecret, signSessionToken } from '../netlify/functions/lib/db.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

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
    if (payload.email !== email || Date.now() > Number(payload.expiresAt)) {
      return res.status(400).json({ detail: 'Invalid or expired OTP request.' });
    }

    const expectedSig = crypto.createHmac('sha256', getAuthSecret()).update(`${payloadB64}:${otp}`).digest('hex');
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expectedSig, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ detail: 'Incorrect 6-digit OTP code.' });
    }

    const db = await getDb();
    const usersCol = db.collection('users');
    const logsCol = db.collection('auth_logs');
    const now = new Date();

    if (payload.purpose === 'reset') {
      if (newPassword.length < 6) {
        return res.status(400).json({ detail: 'New password must be at least 6 characters.' });
      }
      await usersCol.updateOne({ email }, { $set: { passwordHash: hashPassword(newPassword), updatedAt: now } });
      await logsCol.insertOne({ email, role: payload.role, action: 'PASSWORD_RESET', createdAt: now });
      return res.status(200).json({ reset: true, email });
    }

    let dbUser;
    if (payload.purpose === 'signup') {
      if (await usersCol.findOne({ email })) {
        return res.status(409).json({ detail: 'Account already exists.' });
      }
      const doc = {
        email,
        name: payload.name || email.split('@')[0],
        role: payload.role || 'passenger',
        passwordHash: payload.passwordHash,
        status: 'Active',
        verified: true,
        loginCount: 1,
        createdAt: now,
        lastLoginAt: now,
        updatedAt: now,
      };
      const inserted = await usersCol.insertOne(doc);
      dbUser = { ...doc, _id: inserted.insertedId };
      await logsCol.insertOne({ email, role: doc.role, action: 'SIGNUP', createdAt: now });
    } else {
      dbUser = await usersCol.findOne({ email });
      if (!dbUser) return res.status(404).json({ detail: 'Account no longer exists.' });
      if (dbUser.status === 'Suspended') return res.status(403).json({ detail: 'Account suspended.' });
      await usersCol.updateOne({ _id: dbUser._id }, { $set: { lastLoginAt: now }, $inc: { loginCount: 1 } });
      await logsCol.insertOne({ email, role: dbUser.role, action: 'LOGIN', createdAt: now });
    }

    const accessToken = signSessionToken({
      sub: dbUser.email,
      uid: String(dbUser._id),
      role: dbUser.role,
      iat: Math.floor(Date.now() / 1000),
    });

    return res.status(200).json({
      access_token: accessToken,
      user: {
        id: String(dbUser._id),
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        verified: true,
        verified_at: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
        status: dbUser.status || 'Active',
      },
    });
  } catch (err) {
    return res.status(500).json({ detail: err?.message || 'Verification failed.' });
  }
}