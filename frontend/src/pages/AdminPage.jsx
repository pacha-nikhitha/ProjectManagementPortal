import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAdminUsers, updateUserRole, deleteUser } from '../services/adminService';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';
import {
  UsersIcon, TrashIcon, LockClosedIcon, FingerPrintIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ROLES = ['Student', 'Working Professional', 'Freelancer', 'Team Leader', 'Faculty', 'Startup Founder', 'Admin'];

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, rolesBreakdown: {} });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await getAdminUsers();
      setUsers(res.data.users || []);
      setStats(res.data.stats || { totalUsers: 0, rolesBreakdown: {} });
    } catch (err) {
      toast.error(err?.message || 'Access denied or failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'Admin') {
      load();
    } else {
      setLoading(false);
    }
  }, [user, load]);

  const handleChangeRole = async (targetUserId, newRole) => {
    try {
      await updateUserRole(targetUserId, newRole);
      toast.success('User role updated!');
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (targetUserId) => {
    if (window.confirm('Are you sure you want to delete this user? This action is permanent.')) {
      try {
        await deleteUser(targetUserId);
        toast.success('User deleted successfully');
        load();
      } catch (err) {
        toast.error(err?.message || 'Failed to delete user');
      }
    }
  };

  // Unauthorized page state
  if (user?.role !== 'Admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-3xl border border-red-500/20 bg-red-950/5 p-8 text-center backdrop-blur-xl"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-6 border border-red-500/20">
            <LockClosedIcon className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-sm text-slate-400 mb-6">
            You require administrator privileges to access system statistics, user catalogs, and core tenant tables.
          </p>
          <p className="text-xs text-slate-500 font-mono">Current role: {user?.role || 'Guest'}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheckIcon className="h-7 w-7 text-cyan-400" /> Admin Workspace Management
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Perform administrative user role updates, account lifecycle overrides, and analyze user statistics.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 flex items-center gap-4">
          <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-400"><UsersIcon className="h-6 w-6" /></div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Registered Users</p>
            <p className="text-xl font-bold text-white mt-1">{stats.totalUsers}</p>
          </div>
        </div>

        {/* Dynamic Role Breakdown Widgets */}
        {Object.entries(stats.rolesBreakdown).slice(0, 2).map(([role, count]) => (
          <div key={role} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 flex items-center gap-4">
            <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-400"><FingerPrintIcon className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">{role}s</p>
              <p className="text-xl font-bold text-white mt-1">{count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* User Table Card */}
      <SectionCard title="System Users Database">
        {loading ? (
          <div className="skeleton h-48" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Change Role</th>
                  <th className="px-6 py-4 text-right">Delete Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-900/20 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.profilePicture ? (
                          <img src={u.profilePicture} alt="avatar" className="h-8 w-8 rounded-lg object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-slate-850 flex items-center justify-center text-xs font-bold text-white border border-slate-700">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white text-sm">{u.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{u.profession || 'No profession'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.role === 'Admin' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className="rounded-xl border border-slate-700 bg-slate-850 px-3 py-1.5 text-xs text-white"
                        disabled={user.id === u.id} // Can't change own role from UI directly
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.id !== u.id ? (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="rounded-xl bg-red-500/10 hover:bg-red-500/25 p-2 text-red-400 transition"
                          title="Delete User"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">You (Active)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </motion.div>
  );
}
