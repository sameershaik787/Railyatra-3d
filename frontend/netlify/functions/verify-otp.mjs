import crypto from 'node:crypto';

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ detail: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const otp = String(body.otp || '').replace(/\D/g, '');
    const challenge = String(body.challenge || '');

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

    const secret = process.env.AUTH_SECRET || 'railyatra-3d-netlify-otp-secret';
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${payloadB64}:${otp}`)
      .digest('hex');

    const sigBuf = Buffer.from(sig, 'hex');
    const expectedBuf = Buffer.from(expectedSig, 'hex');

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return Response.json({ detail: 'Incorrect 6-digit OTP code.' }, { status: 401 });
    }

    const sessionBody = Buffer.from(
      JSON.stringify({ sub: email, role: payload.role, iat: Math.floor(Date.now() / 1000) }),
      'utf8'
    ).toString('base64url');
    const sessionSig = crypto.createHmac('sha256', secret).update(sessionBody).digest('hex');

    return Response.json({
      access_token: `${sessionBody}.${sessionSig}`,
      user: {
        email,
        name: payload.name || email.split('@')[0],
        role: payload.role,
        verified: true,
        verified_at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
        status: 'Active',
      },
    });
  } catch {
    return Response.json({ detail: 'OTP verification failed. Please request a new code.' }, { status: 400 });
  }
};