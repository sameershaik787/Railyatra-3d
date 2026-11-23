import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import express from 'express';
import nodemailer from 'nodemailer';
import { ObjectId } from 'mongodb';
import {
  getDb,
  hashPassword,
  verifyPassword,
  getAuthSecret,
  signSessionToken,
  verifySessionToken,
} from './netlify/functions/lib/db.mjs';

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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'railyatra-3d-render' });
});

app.post('/api/send-otp', async (req, res) => {
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
      return res.status(503).json({ detail: 'Email server not configured on Render.' });
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

    return res.json({ sent: true, email, role, challenge, expires_in: 300 });
  } catch (err) {
    return res.status(500).json({ detail: err?.message || 'Failed to send OTP.' });
  }
});

app.post('/api/verify-otp', async (req, res) => {
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
      return res.json({ reset: true, email });
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

    return res.json({
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
});

app.all('/api/admin/users', async (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const decoded = verifySessionToken(token);
  if (!decoded) return res.status(401).json({ detail: 'Unauthorized session.' });
  if (decoded.role !== 'admin') return res.status(403).json({ detail: 'Railway Admin privileges required.' });

  try {
    const db = await getDb();
    const usersCol = db.collection('users');
    const logsCol = db.collection('auth_logs');

    if (req.method === 'GET') {
      const usersRaw = await usersCol.find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).limit(500).toArray();
      const logsRaw = await logsCol.find({}).sort({ createdAt: -1 }).limit(25).toArray();
      const users = usersRaw.map((u) => ({
        id: String(u._id),
        email: u.email,
        name: u.name,
        role: u.role,
        status: u.status || 'Active',
        loginCount: u.loginCount || 1,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
      }));
      return res.json({
        connected: true,
        dbName: db.databaseName,
        stats: {
          total: users.length,
          passengers: users.filter((u) => u.role === 'passenger').length,
          tte: users.filter((u) => u.role === 'tte').length,
          admins: users.filter((u) => u.role === 'admin').length,
          suspended: users.filter((u) => u.status === 'Suspended').length,
        },
        users,
        logs: logsRaw.map((l) => ({
          id: String(l._id),
          email: l.email,
          role: l.role,
          action: l.action,
          actor: l.actor || null,
          createdAt: l.createdAt,
        })),
      });
    }

    if (req.method === 'PATCH') {
      const id = String(req.body?.id || '');
      if (!ObjectId.isValid(id)) return res.status(400).json({ detail: 'Invalid user ID.' });
      const target = await usersCol.findOne({ _id: new ObjectId(id) });
      if (!target) return res.status(404).json({ detail: 'User not found.' });
      const updates = { updatedAt: new Date() };
      if (req.body?.role && ['passenger', 'tte', 'admin'].includes(req.body.role)) updates.role = req.body.role;
      if (req.body?.status && ['Active', 'Suspended'].includes(req.body.status)) updates.status = req.body.status;
      await usersCol.updateOne({ _id: target._id }, { $set: updates });
      await logsCol.insertOne({ email: target.email, role: updates.role || target.role, action: 'USER_UPDATED', actor: decoded.sub, createdAt: new Date() });
      return res.json({ updated: true });
    }

    if (req.method === 'DELETE') {
      const id = String(req.body?.id || '');
      if (!ObjectId.isValid(id)) return res.status(400).json({ detail: 'Invalid user ID.' });
      const target = await usersCol.findOne({ _id: new ObjectId(id) });
      if (!target) return res.status(404).json({ detail: 'User not found.' });
      await usersCol.deleteOne({ _id: target._id });
      await logsCol.insertOne({ email: target.email, role: target.role, action: 'USER_DELETED', actor: decoded.sub, createdAt: new Date() });
      return res.json({ deleted: true });
    }

    return res.status(405).json({ detail: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ detail: err?.message || 'Admin database operation failed.' });
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