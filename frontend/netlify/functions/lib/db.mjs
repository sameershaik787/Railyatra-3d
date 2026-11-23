import crypto from 'node:crypto';
import { MongoClient } from 'mongodb';

const DEFAULT_DB = 'railyatra3d';
let indexesReady = false;

export async function getDb() {
  const uri = (process.env.MONGODB_URI || '').trim();
  if (!uri) {
    throw new Error('Database not configured. Add MONGODB_URI in Netlify Environment Variables.');
  }

  if (!globalThis.__railyatraMongoPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 6000,
    });
    globalThis.__railyatraMongoPromise = client.connect().catch((err) => {
      globalThis.__railyatraMongoPromise = null;
      throw err;
    });
  }

  const client = await globalThis.__railyatraMongoPromise;
  const dbName = (process.env.MONGODB_DB || DEFAULT_DB).trim() || DEFAULT_DB;
  const db = client.db(dbName);

  if (!indexesReady) {
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('auth_logs').createIndex({ createdAt: -1 });
      indexesReady = true;
    } catch {
      // Index may already exist
    }
  }

  return db;
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, keyHex] = storedHash.split(':');
  const keyBuf = Buffer.from(keyHex, 'hex');
  const derivedBuf = crypto.scryptSync(String(password), salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

export function getAuthSecret() {
  return process.env.AUTH_SECRET || 'railyatra-3d-netlify-otp-secret';
}

export function signSessionToken(payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', getAuthSecret()).update(body).digest('hex');
  return `${body}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', getAuthSecret()).update(body).digest('hex');
  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}