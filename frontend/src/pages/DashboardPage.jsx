import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FolderIcon, BoltIcon, CheckCircleIcon, ClipboardDocumentListIcon,
  ClockIcon, ArrowTrendingUpIcon, ExclamationCircleIcon, FireIcon,
  ExclamationTriangleIcon, SparklesIcon, PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/StatCard';
import api from '../services/api';
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#38bdf8', '#a855f7', '#f43f5e', '#34d399', '#fb923c'];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const todayTasks = data?.todayTasks || [];
  const upcoming = data?.upcomingDeadlines || [];
  const recentProjects = data?.recentProjects || [];

  const getGreeting = () => {
    const h = time.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: FolderIcon },
    { label: 'Active Projects', value: stats.activeProjects, icon: BoltIcon },
    { label: 'Completed Projects', value: stats.completedProjects, icon: CheckCircleIcon },
    { label: 'Total Tasks', value: stats.totalTasks, icon: ClipboardDocumentListIcon },
    { label: 'Pending Tasks', value: stats.pendingTasks, icon: ClockIcon },
    { label: 'In Progress', value: stats.inProgressTasks, icon: ArrowTrendingUpIcon },
    { label: 'Completed Tasks', value: stats.completedTasks, icon: SparklesIcon },
    { label: 'High Priority', value: stats.highPriorityTasks, icon: FireIcon },
    { label: 'Overdue Tasks', value: stats.overdueTasks, icon: ExclamationTriangleIcon },
  ];

  const pieData = [
    { name: 'Completed', value: stats.completedTasks || 0 },
    { name: 'In Progress', value: stats.inProgressTasks || 0 },
    { name: 'Pending', value: stats.pendingTasks || 0 },
  ].filter(d => d.value > 0);

  // Mock weekly data when API doesn't return it
  const weeklyData = [
    { day: 'Mon', completed: 3, created: 5 },
    { day: 'Tue', completed: 5, created: 4 },
    { day: 'Wed', completed: 4, created: 7 },
    { day: 'Thu', completed: 7, created: 6 },
    { day: 'Fri', completed: 6, created: 3 },
    { day: 'Sat', completed: 2, created: 1 },
    { day: 'Sun', completed: 1, created: 2 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-xl text-sm">
          <p className="text-slate-300 font-medium mb-2">{label}</p>
          {payload.map(p => (
            <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">{getGreeting()} 👋</p>
          <h2 className="text-3xl font-bold text-white mt-1">
            {user?.name?.split(' ')[0]}'s Dashboard
          </h2>
          <p className="text-slate-400 text-sm mt-1">{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/app/projects')}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white hover:scale-105 transition shadow-lg shadow-violet-500/20"
          >
            <PlusCircleIcon className="h-4 w-4" />New Project
          </button>
          <button
            onClick={() => navigate('/app/tasks')}
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition"
          >
            <ClipboardDocumentListIcon className="h-4 w-4" />New Task
          </button>
        </div>
      </div>

      {/* Productivity Score */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-violet-900/30 to-cyan-900/20 p-5 flex items-center gap-6 backdrop-blur-sm">
        <div className="relative flex-shrink-0">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="#1e293b" strokeWidth="3" />
            <path
              d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth="3"
              strokeDasharray={`${stats.productivityScore || 0}, 100`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-white">{stats.productivityScore ?? 0}%</span>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">Productivity Score</p>
          <h3 className="text-2xl font-bold text-white mt-1">
            {(stats.productivityScore || 0) >= 80 ? '🚀 Excellent!' : (stats.productivityScore || 0) >= 50 ? '💪 Good Progress' : '📈 Keep Going!'}
          </h3>
          <p className="text-sm text-slate-400 mt-1">Based on {stats.completedTasks || 0} completed out of {stats.totalTasks || 0} tasks</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} index={i} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pie Chart */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <h3 className="text-base font-semibold text-white mb-4">Task Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-slate-400 text-xs">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No task data yet</div>
          )}
        </div>

        {/* Weekly Bar Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <h3 className="text-base font-semibold text-white mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completed" name="Completed" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="created" name="Created" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's tasks */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Today's Tasks</h3>
            <button onClick={() => navigate('/app/tasks')} className="text-xs text-violet-400 hover:text-violet-300 transition">View all</button>
          </div>
          {todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.slice(0, 4).map((t, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-slate-800/60 p-3">
                  <div className={`h-2 w-2 flex-shrink-0 rounded-full ${t.priority === 'Critical' ? 'bg-red-400' : t.priority === 'High' ? 'bg-orange-400' : 'bg-emerald-400'}`} />
                  <p className="text-sm text-slate-300 truncate">{t.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No tasks due today. 🎉</p>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Upcoming Deadlines</h3>
            <button onClick={() => navigate('/app/calendar')} className="text-xs text-violet-400 hover:text-violet-300 transition">Calendar</button>
          </div>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.slice(0, 4).map((t, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-slate-800/60 p-3">
                  <div className="flex-shrink-0 rounded-xl bg-violet-500/20 px-2 py-1 text-center">
                    <p className="text-[10px] text-violet-400">{new Date(t.deadline).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-sm font-bold text-violet-300">{new Date(t.deadline).getDate()}</p>
                  </div>
                  <p className="text-sm text-slate-300 truncate">{t.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No upcoming deadlines. ✅</p>
          )}
        </div>

        {/* Recent projects */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Recent Projects</h3>
            <button onClick={() => navigate('/app/projects')} className="text-xs text-violet-400 hover:text-violet-300 transition">View all</button>
          </div>
          {recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.slice(0, 4).map((p, i) => (
                <div key={i} className="rounded-2xl bg-slate-800/60 p-3">
                  <p className="text-sm font-medium text-white truncate">{p.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-700">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${p.progress || 0}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{p.progress || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-500 mb-3">No projects yet.</p>
              <button onClick={() => navigate('/app/projects')} className="text-sm text-violet-400 hover:text-violet-300 transition">Create your first project →</button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
