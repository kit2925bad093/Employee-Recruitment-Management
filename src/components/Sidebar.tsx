import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Calendar,
  Award,
  UserCheck,
  BarChart3,
  Shield,
  Building2,
  User,
  Code2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type TabType =
  | 'dashboard'
  | 'vacancies'
  | 'applications'
  | 'candidates'
  | 'interviews'
  | 'offers'
  | 'employees'
  | 'reports'
  | 'audit'
  | 'admin_settings'
  | 'candidate_profile';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenSpringDocs: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenSpringDocs }) => {
  const { user } = useAuth();
  const role = user?.role || 'CANDIDATE';

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'HR', 'INTERVIEWER', 'CANDIDATE'],
    },
    {
      id: 'vacancies' as TabType,
      label: role === 'CANDIDATE' ? 'Job Listings' : 'Job Vacancies',
      icon: Briefcase,
      roles: ['ADMIN', 'HR', 'INTERVIEWER', 'CANDIDATE'],
    },
    {
      id: 'applications' as TabType,
      label: role === 'CANDIDATE' ? 'My Applications' : 'Applications',
      icon: FileText,
      roles: ['ADMIN', 'HR', 'INTERVIEWER', 'CANDIDATE'],
    },
    {
      id: 'candidates' as TabType,
      label: 'Candidate Pool',
      icon: Users,
      roles: ['ADMIN', 'HR', 'INTERVIEWER'],
    },
    {
      id: 'interviews' as TabType,
      label: role === 'INTERVIEWER' ? 'Assigned Interviews' : 'Interviews',
      icon: Calendar,
      roles: ['ADMIN', 'HR', 'INTERVIEWER', 'CANDIDATE'],
    },
    {
      id: 'offers' as TabType,
      label: 'Job Offers',
      icon: Award,
      roles: ['ADMIN', 'HR', 'CANDIDATE'],
    },
    {
      id: 'employees' as TabType,
      label: 'Onboarding & Staff',
      icon: UserCheck,
      roles: ['ADMIN', 'HR'],
    },
    {
      id: 'reports' as TabType,
      label: 'Recruitment Analytics',
      icon: BarChart3,
      roles: ['ADMIN', 'HR'],
    },
    {
      id: 'audit' as TabType,
      label: 'Audit Trail',
      icon: Shield,
      roles: ['ADMIN'],
    },
    {
      id: 'admin_settings' as TabType,
      label: 'Admin Settings',
      icon: Building2,
      roles: ['ADMIN'],
    },
    {
      id: 'candidate_profile' as TabType,
      label: 'My Candidate Profile',
      icon: User,
      roles: ['CANDIDATE'],
    },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between p-3.5 hidden md:flex">
      <div className="space-y-6">
        {/* Navigation Category */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {role === 'CANDIDATE' ? 'Candidate Portal' : role === 'INTERVIEWER' ? 'Evaluation Suite' : 'Recruitment Hub'}
          </div>
          <nav className="space-y-1">
            {visibleItems.map(item => {
              const active = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/80'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-indigo-50/30 to-white dark:border-slate-800 dark:from-slate-800/90 dark:via-slate-800/50 dark:to-slate-900 p-3.5 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 text-xs font-bold">
          <Code2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Full-Stack Architecture</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Spring Security, JWT Auth, JPA Entities, MySQL schemas & AI resume screening.
        </p>
        <button
          onClick={onOpenSpringDocs}
          className="w-full rounded-md bg-indigo-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors shadow-2xs"
        >
          View Spring Boot Specs
        </button>
      </div>
    </aside>
  );
};
