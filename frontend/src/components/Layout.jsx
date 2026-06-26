import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  HomeIcon, ClipboardDocumentListIcon, CalendarDaysIcon, ChartPieIcon,
  UserCircleIcon, QuestionMarkCircleIcon, InformationCircleIcon, ShieldCheckIcon,
  BellIcon, Cog6ToothIcon, Bars3Icon, XMarkIcon, MoonIcon, SunIcon,
  ComputerDesktopIcon, CheckCircleIcon, ArrowRightOnRectangleIcon,
  ChevronLeftIcon, MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';

const navItems = [
  { path: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { path: 'projects', label: 'Projects', icon: ClipboardDocumentListIcon },
  { path: 'tasks', label: 'Tasks', icon: CheckCircleIcon },
  { path: 'calendar', label: 'Calendar', icon: CalendarDaysIcon },
  { path: 'reports', label: 'Reports', icon: ChartPieIcon },
  { path: 'notifications', label: 'Notifications', icon: BellIcon },
  { path: 'profile', label: 'Profile', icon: UserCircleIcon },
  { path: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  { path: 'admin', label: 'Admin', icon: ShieldCheckIcon },
  { path: 'help', label: 'Help', icon: QuestionMarkCircleIcon },
  { path: 'about', label: 'About', icon: InformationCircleIcon },
];

function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [time, setTime] = useState(new Date());
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.get('/notifications').then(r => setUnreadCount(r.data.unreadCount || 0)).catch(() => {});
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const themeIcons = { dark: MoonIcon, light: SunIcon, system: ComputerDesktopIcon };
  const ThemeIcon = themeIcons[theme] || MoonIcon;
  const nextTheme = { dark: 'light', light: 'system', system: 'dark' };

  const SidebarContent = () => (
    <div className="flex h-full flex-col px-3 py-5">
      {/* Logo */}
      <div className={`flex items-center gap-3 mb-8 px-2 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 shadow-glow flex items-center justify-center text-lg font-bold text-white">
          PN
        </div>
        {!collapsed && (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Project</p>
            <h1 className="text-base font-bold text-white leading-tight">Nest</h1>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.endsWith('/' + item.path) || pathname.endsWith('/app') && item.path === 'dashboard';
          return (
            <button
              key={item.path}
              id={`nav-${item.path}`}
              onClick={() => { navigate(`/app/${item.path}`); setMobileOpen(false); }}
              className={`sidebar-item flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-200 ${
                active
                  ? 'active bg-gradient-to-r from-violet-500/20 to-cyan-500/10 text-white font-medium'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-violet-400' : ''}`} />
              {!collapsed && (
                <span className="text-sm">{item.label}</span>
              )}
              {!collapsed && item.path === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(nextTheme[theme])}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white transition ${collapsed ? 'justify-center' : ''}`}
          title={`Theme: ${theme}`}
        >
          <ThemeIcon className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm capitalize">{theme} mode</span>}
        </button>

        {/* User card */}
        {!collapsed && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition ${collapsed ? 'justify-center' : ''}`}
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col bg-slate-950/95 border-r border-slate-800/60 backdrop-blur-xl transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(p => !p)}
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 hover:text-white transition shadow-lg"
        >
          <ChevronLeftIcon className={`h-3 w-3 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 lg:hidden overflow-y-auto"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className={`min-h-screen transition-all duration-300 ${collapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
          <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition lg:hidden"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>

            {/* Greeting */}
            <div className="hidden sm:block">
              <p className="text-xs text-slate-500">{getGreeting()}, <span className="text-violet-400 font-medium">{user?.name?.split(' ')[0]}</span></p>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Time */}
            <div className="hidden md:block rounded-xl bg-slate-900 px-3 py-1.5 text-xs text-slate-400 font-mono border border-slate-800">
              {time.toLocaleTimeString()}
            </div>

            {/* Notifications bell */}
            <button
              onClick={() => navigate('/app/notifications')}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            {/* Avatar */}
            <button
              onClick={() => navigate('/app/profile')}
              className="h-9 w-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-sm font-bold text-white hover:scale-105 transition"
            >
              {user?.profilePicture
                ? <img src={user.profilePicture} alt="avatar" className="h-9 w-9 rounded-xl object-cover" />
                : user?.name?.charAt(0)?.toUpperCase() || 'U'
              }
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
