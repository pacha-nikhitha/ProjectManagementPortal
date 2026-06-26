import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SectionCard from '../components/SectionCard';
import toast from 'react-hot-toast';
import {
  PaintBrushIcon, BellIcon, WindowIcon,
  ArchiveBoxArrowDownIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  // Load preferences from local storage
  const [prefs, setPrefs] = useState(() => {
    const stored = localStorage.getItem('projectnest_preferences');
    return stored ? JSON.parse(stored) : {
      emailAlerts: true,
      desktopAlerts: false,
      autoArchive: false,
      compactSidebar: false,
      activityLog: true
    };
  });

  useEffect(() => {
    localStorage.setItem('projectnest_preferences', JSON.stringify(prefs));
  }, [prefs]);

  const toggle = (field) => () => {
    setPrefs(p => {
      const next = { ...p, [field]: !p[field] };
      toast.success('Workspace setting updated');
      return next;
    });
  };

  const handleClearCache = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1000)),
      {
        loading: 'Cleaning workspace cache...',
        success: 'Workspace assets flushed successfully!',
        error: 'Cleanup failed.'
      }
    );
  };

  const switchTheme = (val) => {
    setTheme(val);
    toast.success(`Theme updated to ${val} mode`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Configure your personal workspace preferences and dashboard layout.</p>
      </div>

      {/* Theme Settings Panel */}
      <SectionCard title="Visual Theme">
        <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <PaintBrushIcon className="h-5 w-5 text-violet-400" /> Apply Appearance
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { id: 'light', label: 'Light Mode', desc: 'Clean white visual style' },
            { id: 'dark', label: 'Dark Mode', desc: 'Vibrant neon workspace' },
            { id: 'system', label: 'System Mode', desc: 'Syncs with your OS' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => switchTheme(item.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                theme === item.id
                  ? 'border-violet-500 bg-violet-950/10 text-white'
                  : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              <p className="font-semibold text-sm text-white">{item.label}</p>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Settings Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Notifications Panel */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-5">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <BellIcon className="h-5 w-5 text-cyan-400" /> Workspace Notifications
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-white">Email updates</p>
                <p className="text-xs text-slate-500">Receive daily summary digests of deadlines.</p>
              </div>
              <input type="checkbox" checked={prefs.emailAlerts} onChange={toggle('emailAlerts')} className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-violet-500 focus:ring-violet-500" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-white">Desktop alerts</p>
                <p className="text-xs text-slate-500">Enable real-time HTML5 browser push updates.</p>
              </div>
              <input type="checkbox" checked={prefs.desktopAlerts} onChange={toggle('desktopAlerts')} className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-violet-500 focus:ring-violet-500" />
            </label>
          </div>
        </div>

        {/* Layout Preference Panel */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-5">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <WindowIcon className="h-5 w-5 text-fuchsia-400" /> Interface Layout
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-white">Compact Sidebar</p>
                <p className="text-xs text-slate-500">Reduce navigation sidebar to icon grid.</p>
              </div>
              <input type="checkbox" checked={prefs.compactSidebar} onChange={toggle('compactSidebar')} className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-violet-500 focus:ring-violet-500" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-white">Auto-Archive Tasks</p>
                <p className="text-xs text-slate-500">Automatically transfer completed cards to archive.</p>
              </div>
              <input type="checkbox" checked={prefs.autoArchive} onChange={toggle('autoArchive')} className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-violet-500 focus:ring-violet-500" />
            </label>
          </div>
        </div>
      </div>

      {/* Advanced Clean up Panel */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6">
        <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-red-400" /> Workspace Management
        </h3>
        <p className="text-sm text-slate-400 mb-4">Resetting cache removes transient browser bundle logs but keeps your database storage.</p>
        <button
          onClick={handleClearCache}
          className="rounded-2xl border border-slate-700 hover:border-red-500/30 hover:bg-red-500/10 px-5 py-2.5 text-xs text-slate-300 hover:text-red-400 transition"
        >
          Flush Workspace Cache
        </button>
      </div>
    </div>
  );
}
