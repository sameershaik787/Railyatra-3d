import crypto from 'node:crypto';
import { getDb, hashPassword, getAuthSecret, signSessionToken } from './lib/db.mjs';

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ detail: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const otp = String(body.otp || '').replace(/\D/g, '');
    const challenge = String(body.challenge || '');
    const newPassword = String(body.newPassword || '');

    if (otp.length !== 6 || !challenge.includes('.')) {
      return Response.json({ detail: 'Enter a valid 6-digit OTP.' }, { status: 400 });
    }

    const [payloadB64, sig] = challenge.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));

    if (payload.email !== email) {
      return Response.json({ detail: 'Email does not match the OTP request.' }, { status: 400 });
    }
    if (Date.now() > Number(payload.expiresAt)) {
      return Response.json({ detail: 'OTP has expired. Request a new code.' }, { status: 400 });
    }

    const expectedSig = crypto
      .createHmac('sha256', getAuthSecret())
      .update(`${payloadB64}:${otp}`)
      .digest('hex');

    const sigBuf = Buffer.from(sig, 'hex');
    const expectedBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return Response.json({ detail: 'Incorrect 6-digit OTP code.' }, { status: 401 });
    }

    const db = await getDb();
    const usersCol = db.collection('users');
    const logsCol = db.collection('auth_logs');
    const now = new Date();

    if (payload.purpose === 'reset') {
      if (newPassword.length < 6) {
        return Response.json({ detail: 'New password must be at least 6 characters.' }, { status: 400 });
      }
      await usersCol.updateOne(
        { email },
        { $set: { passwordHash: hashPassword(newPassword), updatedAt: now } }
      );
      await logsCol.insertOne({ email, role: payload.role, action: 'PASSWORD_RESET', createdAt: now });
      return Response.json({ reset: true, email });
    }

    let dbUser;

    if (payload.purpose === 'signup') {
      const existing = await usersCol.findOne({ email });
      if (existing) {
        return Response.json({ detail: 'Account already exists. Please sign in.' }, { status: 409 });
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
      if (!dbUser) {
        return Response.json({ detail: 'Account no longer exists.' }, { status: 404 });
      }
      if (dbUser.status === 'Suspended') {
        return Response.json({ detail: 'Account suspended by Railway Admin.' }, { status: 403 });
      }
      await usersCol.updateOne(
        { _id: dbUser._id },
        { $set: { lastLoginAt: now }, $inc: { loginCount: 1 } }
      );
      await logsCol.insertOne({ email, role: dbUser.role, action: 'LOGIN', createdAt: now });
    }

    const accessToken = signSessionToken({
      sub: dbUser.email,
      uid: String(dbUser._id),
      role: dbUser.role,
      iat: Math.floor(Date.now() / 1000),
    });

    return Response.json({
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
    return Response.json(
      { detail: err?.message || 'OTP verification failed. Please request a new code.' },
      { status: 500 }
    );
  }
};