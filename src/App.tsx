import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { SpringArchitectureModal } from './components/SpringArchitectureModal';
import { AuthModal } from './views/AuthModal';
import { DashboardView } from './views/DashboardView';
import { VacanciesView } from './views/VacanciesView';
import { ApplicationsView } from './views/ApplicationsView';
import { CandidatesView } from './views/CandidatesView';
import { InterviewsView } from './views/InterviewsView';
import { OffersView } from './views/OffersView';
import { EmployeesView } from './views/EmployeesView';
import { ReportsView } from './views/ReportsView';
import { AuditLogsView } from './views/AuditLogsView';
import { AdminSettingsView } from './views/AdminSettingsView';
import { CandidateProfileView } from './views/CandidateProfileView';
import { Application } from './types';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Calendar,
  Users,
  Award,
  UserCheck,
  BarChart3,
  Shield,
  Building2,
  User,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [showSpringDocs, setShowSpringDocs] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [targetInterviewApp, setTargetInterviewApp] = useState<Application | null>(null);

  useEffect(() => {
    if (!loading && !user) setShowAuthModal(true);
  }, [loading, user]);

  const handleScheduleForApp = (app: Application) => {
    setTargetInterviewApp(app);
    setCurrentTab('interviews');
  };

  const renderView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigate={tab => setCurrentTab(tab)} />;
      case 'vacancies':
        return <VacanciesView />;
      case 'applications':
        return <ApplicationsView onScheduleInterviewForApp={handleScheduleForApp} />;
      case 'candidates':
        return <CandidatesView />;
      case 'interviews':
        return <InterviewsView initialScheduleApp={targetInterviewApp} />;
      case 'offers':
        return <OffersView />;
      case 'employees':
        return <EmployeesView />;
      case 'reports':
        return <ReportsView />;
      case 'audit':
        return <AuditLogsView />;
      case 'admin_settings':
        return <AdminSettingsView />;
      case 'candidate_profile':
        return <CandidateProfileView />;
      default:
        return <DashboardView onNavigate={tab => setCurrentTab(tab)} />;
    }
  };

  const role = user?.role || 'CANDIDATE';

  // Mobile navigation tabs
  const mobileNavItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vacancies' as TabType, label: 'Jobs', icon: Briefcase },
    { id: 'applications' as TabType, label: 'Apps', icon: FileText },
    { id: 'interviews' as TabType, label: 'Interviews', icon: Calendar },
    ...(role === 'CANDIDATE'
      ? [{ id: 'candidate_profile' as TabType, label: 'Profile', icon: User }]
      : [{ id: 'reports' as TabType, label: 'Reports', icon: BarChart3 }]),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onOpenSpringDocs={() => setShowSpringDocs(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => {
            setTargetInterviewApp(null);
            setCurrentTab(tab);
          }}
          onOpenSpringDocs={() => setShowSpringDocs(true)}
        />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          {renderView()}
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2 px-3 flex justify-around items-center md:hidden shadow-lg">
        {mobileNavItems.map(item => {
          const active = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
                active ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Spring Boot Architecture & Postman Modal */}
      {showSpringDocs && <SpringArchitectureModal onClose={() => setShowSpringDocs(false)} />}

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
