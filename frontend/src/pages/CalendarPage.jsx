import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ClockIcon,
  ExclamationCircleIcon, FolderIcon,
} from '@heroicons/react/24/outline';
import { getTasks } from '../services/taskService';
import { getProjects } from '../services/projectService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import toast from 'react-hot-toast';

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month'); // month | week
  const [currentDate, setCurrentDate] = useState(new Date());

  const load = useCallback(async () => {
    try {
      const [tRes, pRes] = await Promise.all([getTasks(), getProjects()]);
      setTasks(tRes.data.tasks || []);
      setProjects(pRes.data.projects || []);
    } catch {
      toast.error('Failed to load deadlines for calendar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    if (view === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    }
  };

  const getMonthName = () => {
    return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Month Math
  const getMonthDays = () => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Prev month padding
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding (pad to fill 42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // Week Math
  const getWeekDays = () => {
    const days = [];
    const dayOfWeek = currentDate.getDay(); // 0-6
    const startOfWeek = new Date(currentDate.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 7; i++) {
      days.push(new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000));
    }
    return days;
  };

  const getTasksForDate = (date) => {
    return tasks.filter(t => {
      if (!t.deadline || t.archived) return false;
      const dDate = new Date(t.deadline);
      return (
        dDate.getDate() === date.getDate() &&
        dDate.getMonth() === date.getMonth() &&
        dDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getOverdueTasks = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return tasks.filter(t => {
      if (!t.deadline || t.status === 'Completed' || t.archived) return false;
      return new Date(t.deadline) < now;
    });
  };

  const getWeekName = () => {
    const days = getWeekDays();
    const start = days[0].toLocaleDateString('default', { month: 'short', day: 'numeric' });
    const end = days[6].toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Sidebar - Upcoming Deadlines */}
      <div className="space-y-6 lg:col-span-1">
        {/* Statistics or Overdue */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" /> Overdue Tasks
          </h3>
          {loading ? (
            <div className="skeleton h-24" />
          ) : getOverdueTasks().length > 0 ? (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {getOverdueTasks().map(t => (
                <div key={t.id} className="rounded-2xl bg-red-500/10 border border-red-500/20 p-3">
                  <h4 className="text-xs font-semibold text-red-400 line-clamp-1">{t.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Due {new Date(t.deadline).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No overdue tasks. Awesome! 🎉</p>
          )}
        </div>

        {/* Project Timeline Milestones */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <FolderIcon className="h-5 w-5 text-cyan-400" /> Project Timeline
          </h3>
          {loading ? (
            <div className="skeleton h-32" />
          ) : projects.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {projects.map(p => (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300 truncate max-w-[130px]">{p.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {p.deadline ? new Date(p.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No due date'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full" style={{ width: `${p.progress || 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No active projects found.</p>
          )}
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="space-y-6 lg:col-span-3">
        {/* Toolbar */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 flex flex-wrap gap-4 items-center justify-between backdrop-blur-sm">
          {/* Header navigation */}
          <div className="flex items-center gap-4">
            <div className="flex rounded-xl border border-slate-700 bg-slate-850 overflow-hidden">
              <button onClick={handlePrev} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white transition">
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button onClick={handleNext} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white transition">
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
            <h2 className="text-lg font-bold text-white leading-none">
              {view === 'month' ? getMonthName() : getWeekName()}
            </h2>
          </div>

          {/* Toggle Views */}
          <div className="flex rounded-2xl border border-slate-700 bg-slate-850 p-0.5 overflow-hidden">
            <button
              onClick={() => setView('month')}
              className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition ${view === 'month' ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition ${view === 'week' ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Week
            </button>
          </div>
        </div>

        {/* Calendar Body */}
        {loading ? (
          <div className="skeleton h-[500px] rounded-3xl" />
        ) : (
          <AnimatePresence mode="wait">
            {view === 'month' ? (
              <motion.div
                key="month-grid"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm"
              >
                {/* Weekdays */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {getMonthDays().map(({ date, isCurrentMonth }, i) => {
                    const dayTasks = getTasksForDate(date);
                    const isToday = new Date().toDateString() === date.toDateString();
                    return (
                      <div
                        key={i}
                        className={`min-h-[90px] rounded-2xl border p-2 flex flex-col justify-between transition-all ${
                          isCurrentMonth
                            ? 'border-slate-800 bg-slate-900/30'
                            : 'border-slate-900 bg-slate-950/20 text-slate-700'
                        } ${isToday ? 'gradient-border bg-violet-900/10' : ''}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-bold ${isToday ? 'text-violet-400' : isCurrentMonth ? 'text-slate-400' : 'text-slate-600'}`}>
                            {date.getDate()}
                          </span>
                          {dayTasks.length > 0 && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[9px] font-bold text-white">
                              {dayTasks.length}
                            </span>
                          )}
                        </div>

                        {/* List Tasks inside cells */}
                        <div className="mt-2 space-y-1 overflow-y-auto max-h-[60px] scrollbar-none">
                          {dayTasks.slice(0, 3).map(t => (
                            <div
                              key={t.id}
                              className={`text-[9px] rounded px-1 py-0.5 truncate font-medium border ${
                                t.status === 'Completed'
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : t.priority === 'Critical' || t.priority === 'High'
                                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                  : 'bg-slate-800/80 border-slate-700/50 text-slate-300'
                              }`}
                              title={t.title}
                            >
                              {t.title}
                            </div>
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="text-[8px] text-slate-500 text-center font-bold">
                              + {dayTasks.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              // WEEK VIEW
              <motion.div
                key="week-grid"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid gap-3 md:grid-cols-7"
              >
                {getWeekDays().map((date, i) => {
                  const dayTasks = getTasksForDate(date);
                  const isToday = new Date().toDateString() === date.toDateString();
                  const weekdayName = date.toLocaleDateString('default', { weekday: 'short' });
                  return (
                    <div
                      key={i}
                      className={`rounded-3xl border p-4 flex flex-col gap-3 min-h-[400px] transition ${
                        isToday
                          ? 'border-violet-500/40 bg-violet-950/15'
                          : 'border-slate-800 bg-slate-900/60'
                      }`}
                    >
                      <div className="text-center border-b border-slate-800/80 pb-2">
                        <p className="text-xs text-slate-500 font-semibold uppercase">{weekdayName}</p>
                        <p className={`text-xl font-black mt-1 ${isToday ? 'text-violet-400' : 'text-white'}`}>
                          {date.getDate()}
                        </p>
                      </div>

                      <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] pr-0.5">
                        {dayTasks.map(t => (
                          <div
                            key={t.id}
                            className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-left space-y-1.5"
                          >
                            <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">{t.title}</p>
                            <div className="flex flex-wrap gap-1">
                              <span className={`text-[8px] px-1 rounded-sm ${t.priority === 'Critical' ? 'bg-red-400/20 text-red-300' : 'bg-slate-800 text-slate-400'}`}>
                                {t.priority}
                              </span>
                              <span className={`text-[8px] px-1 rounded-sm ${t.status === 'Completed' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                                {t.status}
                              </span>
                            </div>
                          </div>
                        ))}
                        {dayTasks.length === 0 && (
                          <p className="text-[10px] text-slate-600 text-center py-8">No task deadlines</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
