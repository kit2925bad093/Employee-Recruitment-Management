import React, { useState } from 'react';
import {
  Briefcase,
  Bell,
  Code2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationCenter } from './NotificationCenter';
import { ThemeToggleCompact } from './ThemeToggle';

interface NavbarProps {
  onOpenSpringDocs: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSpringDocs, onOpenAuthModal }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-200 dark:shadow-none">
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">TalentPulse</span>
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800/60">
              ERMS
            </span>
          </div>
          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">Employee Recruitment Management System</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Spring Boot & Postman Architecture Button */}
        <button
          onClick={onOpenSpringDocs}
          className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-indigo-300 hover:text-indigo-600 transition-all dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400 lg:flex"
        >
          <Code2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Spring & Postman Specs</span>
        </button>

        {/* Dark Mode Toggle Compact */}
        <ThemeToggleCompact />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900"></span>
          </button>
          {showNotifications && (
            <NotificationCenter onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* User Pill / Account */}
        {user ? (
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover bg-slate-100 dark:bg-slate-800"
            />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{user.fullName}</p>
              <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 capitalize leading-tight">
                {user.role.toLowerCase()}
              </p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
