import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Train,
  Users,
  Store,
  Activity,
  Wrench,
  Radio,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  Lock,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const INITIAL_FLEET = [
  { train_no: '12952', name: 'Mumbai Tejas Rajdhani', depot: 'MMCT Coaching Depot', coaches: '1A:1, 2A:5, 3A:11', gps: 'Online', status: 'Active Service' },
  { train_no: '12964', name: 'Mewar Superfast Express', depot: 'UDZ Coaching Yard', coaches: '1A:1, 2A:2, 3A:6', gps: 'Online', status: 'Active Service' },
  { train_no: '12785', name: 'Kacheguda Mysuru Express', depot: 'SC Electric Shed', coaches: '2A:2, 3A:6, SL:10', gps: 'Online', status: 'Active Service' },
  { train_no: '12301', name: 'Howrah New Delhi Rajdhani', depot: 'HWH LHB Complex', coaches: '1A:1, 2A:5, 3A:12', gps: 'Online', status: 'Yard Maintenance' },
  { train_no: '20607', name: 'Chennai Mysuru Vande Bharat', depot: 'MAS Integral Shed', coaches: 'EC:2, CC:14', gps: 'Online', status: 'Active Service' },
];

const INITIAL_STAFF = [
  { id: 'TTE-401', name: 'Rajesh Meena', division: 'Kota Division (WCR)', train: '12952 Rajdhani', coaches: 'B1 - B5', hht: 'Synced', shift: 'On Duty' },
  { id: 'TTE-418', name: 'Sandeep Kulkarni', division: 'Mumbai Central (WR)', train: '12952 Rajdhani', coaches: 'A1 - A3, H1', hht: 'Synced', shift: 'On Duty' },
  { id: 'TTE-509', name: 'Priya Nair', division: 'Chennai Division (SR)', train: '20607 Vande Bharat', coaches: 'C1 - C8', hht: 'Synced', shift: 'On Duty' },
  { id: 'TTE-612', name: 'Vikram Rathore', division: 'Ajmer Division (NWR)', train: '12964 Mewar SF', coaches: 'B1 - B4', hht: 'Standby', shift: 'Reserve Pool' },
  { id: 'TTE-704', name: 'Anirban Ghosh', division: 'Howrah Division (ER)', train: '12301 Rajdhani', coaches: 'B6 - B12', hht: 'Offline', shift: 'Rest Cycle' },
];

const INITIAL_KITCHENS = [
  { id: 'K1', partner: 'Swiggy', station: 'Kota Jn (KOTA)', fssai: '12224026001182', sla_mins: 14, status: 'Approved' },
  { id: 'K2', partner: 'Zomato', station: 'Vadodara Jn (BRC)', fssai: '10724031000491', sla_mins: 15, status: 'Approved' },
  { id: 'K3', partner: 'Pizza Hut', station: 'Ratlam Jn (RTM)', fssai: '11424010002819', sla_mins: 16, status: 'Approved' },
  { id: 'K4', partner: "Domino's", station: 'Surat (ST)', fssai: '10724022008341', sla_mins: 15, status: 'Pending Audit' },
  { id: 'K5', partner: 'IRCTC eCatering', station: 'New Delhi (NDLS)', fssai: '13324001009912', sla_mins: 12, status: 'Approved' },
];

const INITIAL_USERS = [
  { email: 'ops.admin@railyatra.in', name: 'Divisional Control Officer', role: 'admin', verified_at: '2026-11-22 10:15 IST', status: 'Active' },
  { email: 'tte.west@railyatra.in', name: 'Rajesh Meena (HHT-402)', role: 'tte', verified_at: '2026-11-22 12:40 IST', status: 'Active' },
  { email: 'passenger.demo@gmail.com', name: 'Aaravind Sharma', role: 'passenger', verified_at: '2026-11-22 16:05 IST', status: 'Active' },
];

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('fleet');
  const [fleet, setFleet] = useState(INITIAL_FLEET);
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [kitchens, setKitchens] = useState(INITIAL_KITCHENS);
  const [verifiedUsers, setVerifiedUsers] = useState(() => {
    if (!user?.email) return INITIAL_USERS;
    const exists = INITIAL_USERS.some((u) => u.email === user.email);
    return exists
      ? INITIAL_USERS
      : [{ email: user.email, name: user.name, role: user.role, verified_at: user.verified_at || 'Just now', status: 'Active' }, ...INITIAL_USERS];
  });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let ignore = false;
    fetch(`${API_BASE}/api/admin/resources`, { headers: { 'x-role': 'admin' } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data) {
          if (data.fleet?.length) setFleet(data.fleet);
          if (data.kitchens?.length) setKitchens(data.kitchens);
          if (data.verified_users?.length) setVerifiedUsers(data.verified_users);
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  const flashNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const toggleRakeStatus = (trainNo) => {
    const order = ['Active Service', 'Yard Maintenance', 'Standby Reserve'];
    setFleet((prev) =>
      prev.map((rake) => {
        if (rake.train_no !== trainNo) return rake;
        const nextStatus = order[(order.indexOf(rake.status) + 1) % order.length];
        fetch(`${API_BASE}/api/admin/fleet/${trainNo}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        }).catch(() => {});
        flashNotice(`Updated rake ${trainNo} status to ${nextStatus}.`);
        return { ...rake, status: nextStatus };
      })
    );
  };

  const toggleStaffShift = (staffId) => {
    const order = ['On Duty', 'Reserve Pool', 'Rest Cycle'];
    setStaff((prev) =>
      prev.map((member) => {
        if (member.id !== staffId) return member;
        const nextShift = order[(order.indexOf(member.shift) + 1) % order.length];
        flashNotice(`Updated ${member.name} (${staffId}) roster to ${nextShift}.`);
        return { ...member, shift: nextShift };
      })
    );
  };

  const toggleKitchenApproval = (kitchenId) => {
    setKitchens((prev) =>
      prev.map((k) => {
        if (k.id !== kitchenId) return k;
        const nextStatus = k.status === 'Approved' ? 'Suspended' : 'Approved';
        fetch(`${API_BASE}/api/admin/kitchens/${kitchenId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        }).catch(() => {});
        flashNotice(`${k.partner} at ${k.station} marked ${nextStatus}.`);
        return { ...k, status: nextStatus };
      })
    );
  };

  const toggleUserAccess = (email) => {
    setVerifiedUsers((prev) =>
      prev.map((u) => {
        if (u.email !== email) return u;
        const nextStatus = u.status === 'Active' ? 'Revoked' : 'Active';
        flashNotice(`Session access for ${email} set to ${nextStatus}.`);
        return { ...u, status: nextStatus };
      })
    );
  };

  const activeRakes = fleet.filter((r) => r.status === 'Active Service').length;
  const onDutyStaff = staff.filter((s) => s.shift === 'On Duty').length;
  const approvedKitchens = kitchens.filter((k) => k.status === 'Approved').length;

  return (
    <div className="min-h-screen bg-[#f2f5fa] text-slate-900 pb-16">
      {/* Deep Navy Admin Operations Banner */}
      <div className="bg-[#07244d] pt-7 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-blue-100 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Railway Operations & Resource Control
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              RailYatra Admin Resource Console
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              Manage LHB rake allocations, onboard TTE duty rosters, FSSAI station kitchens, and verified OTP user sessions.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-xs text-blue-100">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              Control Telemetry: Operational
            </div>
            <div className="text-blue-200 mt-0.5">Signed in as {user?.email || 'Admin'}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12">
        {/* KPI Resource Cards (Strictly Operations — No Ticket Booking Counters) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active LHB Rakes</span>
              <Train className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {activeRakes} / {fleet.length}
            </div>
            <div className="text-xs text-emerald-700 font-medium mt-1">All GPS transponders online</div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">TTE Staff On Duty</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {onDutyStaff} / {staff.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">HHT handheld terminals synced</div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Approved Kitchens</span>
              <Store className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {approvedKitchens} / {kitchens.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Swiggy, Zomato, Pizza Hut & IRCTC</div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">OTP Verified Users</span>
              <Lock className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{verifiedUsers.length}</div>
            <div className="text-xs text-emerald-700 font-medium mt-1">Disposable domains blocked</div>
          </div>
        </div>

        {notice && (
          <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs font-semibold text-blue-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            {notice}
          </div>
        )}

        {/* Resource Management Tabs */}
        <div className="mt-6 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 p-4 border-b border-slate-200 bg-slate-50/70">
            {[
              { id: 'fleet', label: 'Fleet & Rake Allocation', icon: Wrench },
              { id: 'staff', label: 'TTE & Staff Roster', icon: Users },
              { id: 'kitchens', label: 'e-Catering Partner Audits', icon: Building2 },
              { id: 'security', label: 'Email OTP Identity Logs', icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-5 overflow-x-auto">
            {activeTab === 'fleet' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                    <th className="py-3 pr-4">Train No & Rake</th>
                    <th className="py-3 pr-4">Home Coaching Depot</th>
                    <th className="py-3 pr-4">LHB Composition</th>
                    <th className="py-3 pr-4">GPS Feed</th>
                    <th className="py-3 pr-4">Operational Status</th>
                    <th className="py-3 text-right">Resource Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fleet.map((rake) => (
                    <tr key={rake.train_no} className="hover:bg-slate-50/80">
                      <td className="py-3.5 pr-4 font-bold text-slate-900">
                        {rake.train_no} - {rake.name}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600">{rake.depot}</td>
                      <td className="py-3.5 pr-4 font-mono text-slate-700">{rake.coaches}</td>
                      <td className="py-3.5 pr-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                          {rake.gps}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                            rake.status === 'Active Service'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : rake.status === 'Yard Maintenance'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {rake.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => toggleRakeStatus(rake.train_no)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 font-semibold transition"
                        >
                          Cycle Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'staff' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                    <th className="py-3 pr-4">Staff ID & Name</th>
                    <th className="py-3 pr-4">Railway Division</th>
                    <th className="py-3 pr-4">Assigned Train</th>
                    <th className="py-3 pr-4">Coach Zone</th>
                    <th className="py-3 pr-4">HHT Sync</th>
                    <th className="py-3 pr-4">Roster Status</th>
                    <th className="py-3 text-right">Dispatch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 pr-4 font-bold text-slate-900">
                        {m.name} <span className="font-mono text-slate-500 font-normal">({m.id})</span>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600">{m.division}</td>
                      <td className="py-3.5 pr-4 text-slate-800 font-medium">{m.train}</td>
                      <td className="py-3.5 pr-4 font-mono text-slate-700">{m.coaches}</td>
                      <td className="py-3.5 pr-4 text-slate-700">{m.hht}</td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                            m.shift === 'On Duty'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {m.shift}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => toggleStaffShift(m.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 font-semibold transition"
                        >
                          Change Shift
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'kitchens' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                    <th className="py-3 pr-4">Partner Platform</th>
                    <th className="py-3 pr-4">Station Hub</th>
                    <th className="py-3 pr-4">FSSAI License No.</th>
                    <th className="py-3 pr-4">Avg Dispatch SLA</th>
                    <th className="py-3 pr-4">Compliance</th>
                    <th className="py-3 text-right">Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kitchens.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 pr-4 font-bold text-slate-900">{k.partner}</td>
                      <td className="py-3.5 pr-4 text-slate-700">{k.station}</td>
                      <td className="py-3.5 pr-4 font-mono text-slate-600">{k.fssai}</td>
                      <td className="py-3.5 pr-4 text-slate-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" /> {k.sla_mins} mins
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                            k.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : k.status === 'Pending Audit'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {k.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => toggleKitchenApproval(k.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 font-semibold transition"
                        >
                          {k.status === 'Approved' ? 'Suspend' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'security' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                    <th className="py-3 pr-4">Verified User</th>
                    <th className="py-3 pr-4">Email ID</th>
                    <th className="py-3 pr-4">Portal Role</th>
                    <th className="py-3 pr-4">OTP Verified At</th>
                    <th className="py-3 pr-4">Session Status</th>
                    <th className="py-3 text-right">Security Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {verifiedUsers.map((u) => (
                    <tr key={u.email} className="hover:bg-slate-50/80">
                      <td className="py-3.5 pr-4 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3.5 pr-4 font-mono text-slate-700">{u.email}</td>
                      <td className="py-3.5 pr-4 uppercase font-semibold text-blue-700">{u.role}</td>
                      <td className="py-3.5 pr-4 text-slate-600">{u.verified_at}</td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                            u.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => toggleUserAccess(u.email)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-600 text-slate-700 hover:text-white border border-slate-200 font-semibold transition"
                        >
                          {u.status === 'Active' ? 'Revoke Session' : 'Restore Access'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}