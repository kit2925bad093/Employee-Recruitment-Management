import React, { useState, useEffect } from 'react';
import { Bell, Check, Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { api } from '../api';
import { NotificationItem } from '../types';

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'ALERT':
        return <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-800/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Notifications</h3>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 dark:border dark:border-indigo-800">
            {notifications.filter(n => !n.read).length} new
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            Mark all read
          </button>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">No new notifications</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                n.read
                  ? 'bg-white opacity-70 hover:opacity-100 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                  : 'bg-indigo-50/30 hover:bg-indigo-50/60 dark:bg-indigo-950/25 dark:hover:bg-indigo-950/50'
              }`}
            >
              <div className="mt-0.5">{getIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">{n.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {!n.read && (
                <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 p-2 text-center">
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Real-time alerts for interviews, status & offers</p>
      </div>
    </div>
  );
};
