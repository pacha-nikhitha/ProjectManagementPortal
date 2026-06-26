import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon, CheckCircleIcon, ExclamationTriangleIcon,
  InformationCircleIcon, XMarkIcon, CheckIcon, TrashIcon
} from '@heroicons/react/24/outline';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      toast.success('Marked as read');
      load();
    } catch {
      toast.error('Action failed');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
      load();
    } catch {
      toast.error('Action failed');
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          icon: CheckCircleIcon,
          iconColor: 'text-emerald-400',
        };
      case 'alert':
      case 'error':
        return {
          bg: 'bg-red-500/10 border-red-500/20 text-red-400',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-red-400',
        };
      case 'reminder':
      case 'warning':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-amber-400',
        };
      default:
        return {
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
          icon: InformationCircleIcon,
          iconColor: 'text-blue-400',
        };
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
          <p className="text-slate-400 text-sm mt-1">
            Stay updated with your team's project milestones and task completion progress.
          </p>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:scale-105 transition shadow-lg"
          >
            <CheckIcon className="h-4 w-4 stroke-[2.5]" /> Mark All as Read
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-3xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="All caught up!"
          message="No new updates from your workspace. When activities occur on tasks or projects, they'll show up here."
          icon={BellIcon}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((n, i) => {
              const style = getTypeStyle(n.type);
              const Icon = style.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className={`rounded-3xl border p-5 flex items-start justify-between gap-4 backdrop-blur-sm transition ${
                    n.read ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-900 border-slate-700/60 shadow-lg'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Status Dot / Icon */}
                    <div className={`rounded-2xl p-3 flex-shrink-0 bg-slate-850 border border-slate-800`}>
                      <Icon className={`h-5 w-5 ${style.iconColor}`} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${n.read ? 'text-slate-400' : 'text-white'}`}>
                          {n.title || 'System Notification'}
                        </h4>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                        )}
                      </div>
                      <p className={`text-sm ${n.read ? 'text-slate-500' : 'text-slate-300'}`}>{n.message}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="rounded-xl border border-slate-705 hover:bg-slate-800 p-2 text-slate-400 hover:text-white transition"
                      title="Mark as Read"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
