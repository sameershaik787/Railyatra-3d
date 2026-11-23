import { ObjectId } from 'mongodb';
import { getDb, verifySessionToken } from './lib/db.mjs';

function authenticateAdmin(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const decoded = verifySessionToken(token);
  if (!decoded) return { error: 'Unauthorized session. Sign in again.', status: 401 };
  if (decoded.role !== 'admin') return { error: 'Railway Admin privileges required.', status: 403 };
  return { admin: decoded };
}

export default async (req) => {
  const check = authenticateAdmin(req);
  if (check.error) {
    return Response.json({ detail: check.error }, { status: check.status });
  }

  try {
    const db = await getDb();
    const usersCol = db.collection('users');
    const logsCol = db.collection('auth_logs');

    if (req.method === 'GET') {
      const usersRaw = await usersCol
        .find({}, { projection: { passwordHash: 0 } })
        .sort({ createdAt: -1 })
        .limit(500)
        .toArray();

      const logsRaw = await logsCol
        .find({})
        .sort({ createdAt: -1 })
        .limit(25)
        .toArray();

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

      const logs = logsRaw.map((l) => ({
        id: String(l._id),
        email: l.email,
        role: l.role,
        action: l.action,
        actor: l.actor || null,
        createdAt: l.createdAt,
      }));

      const stats = {
        total: users.length,
        passengers: users.filter((u) => u.role === 'passenger').length,
        tte: users.filter((u) => u.role === 'tte').length,
        admins: users.filter((u) => u.role === 'admin').length,
        suspended: users.filter((u) => u.status === 'Suspended').length,
      };

      return Response.json({
        connected: true,
        dbName: db.databaseName,
        stats,
        users,
        logs,
      });
    }

    if (req.method === 'PATCH') {
      const body = await req.json();
      const id = String(body.id || '');
      if (!ObjectId.isValid(id)) {
        return Response.json({ detail: 'Invalid user ID.' }, { status: 400 });
      }

      const target = await usersCol.findOne({ _id: new ObjectId(id) });
      if (!target) {
        return Response.json({ detail: 'User not found.' }, { status: 404 });
      }

      const updates = { updatedAt: new Date() };
      let action = 'USER_UPDATED';

      if (body.role && ['passenger', 'tte', 'admin'].includes(body.role)) {
        if (target.email === check.admin.sub && body.role !== 'admin') {
          return Response.json({ detail: 'You cannot demote your own active admin session.' }, { status: 400 });
        }
        updates.role = body.role;
        action = `ROLE_SET_${body.role.toUpperCase()}`;
      }

      if (body.status && ['Active', 'Suspended'].includes(body.status)) {
        if (target.email === check.admin.sub && body.status === 'Suspended') {
          return Response.json({ detail: 'You cannot suspend your own active admin account.' }, { status: 400 });
        }
        updates.status = body.status;
        action = body.status === 'Suspended' ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_ACTIVATED';
      }

      await usersCol.updateOne({ _id: target._id }, { $set: updates });
      await logsCol.insertOne({
        email: target.email,
        role: updates.role || target.role,
        action,
        actor: check.admin.sub,
        createdAt: new Date(),
      });

      return Response.json({ updated: true });
    }

    if (req.method === 'DELETE') {
      const body = await req.json();
      const id = String(body.id || '');
      if (!ObjectId.isValid(id)) {
        return Response.json({ detail: 'Invalid user ID.' }, { status: 400 });
      }

      const target = await usersCol.findOne({ _id: new ObjectId(id) });
      if (!target) {
        return Response.json({ detail: 'User not found.' }, { status: 404 });
      }
      if (target.email === check.admin.sub) {
        return Response.json({ detail: 'You cannot delete your own active admin account.' }, { status: 400 });
      }

      await usersCol.deleteOne({ _id: target._id });
      await logsCol.insertOne({
        email: target.email,
        role: target.role,
        action: 'USER_DELETED',
        actor: check.admin.sub,
        createdAt: new Date(),
      });

      return Response.json({ deleted: true });
    }

    return Response.json({ detail: 'Method not allowed' }, { status: 405 });
  } catch (err) {
    return Response.json(
      { detail: err?.message || 'Database operation failed.' },
      { status: 500 }
    );
  }
};