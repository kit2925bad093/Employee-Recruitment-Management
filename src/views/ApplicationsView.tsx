import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Sparkles,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  ChevronRight,
  User,
  Building2,
  Check,
  X,
  AlertCircle,
  History,
  MessageSquare,
  Eye,
} from 'lucide-react';
import { Application, Interview } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { AiScreeningModal } from '../components/AiScreeningModal';
import { OfferLetterModal } from '../components/OfferLetterModal';

interface ApplicationsViewProps {
  onScheduleInterviewForApp?: (app: Application) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({ onScheduleInterviewForApp }) => {
  const { user } = useAuth();
  const isCandidate = user?.role === 'CANDIDATE';
  const isHR = user?.role === 'HR' || user?.role === 'ADMIN';

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // Modals & Drawers
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [screeningApp, setScreeningApp] = useState<Application | null>(null);
  const [offerApp, setOfferApp] = useState<Application | null>(null);
  const [showHistoryApp, setShowHistoryApp] = useState<Application | null>(null);

  // Quick Note editing
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  const fetchApps = async () => {
    setLoading(true);
    try {
      const data = await api.getApplications({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        department: deptFilter !== 'All' ? deptFilter : undefined,
      });
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [statusFilter, deptFilter]);

  const handleStatusChange = async (appId: string, newStatus: string, note?: string) => {
    try {
      const updated = await api.updateApplicationStatus(appId, { status: newStatus, note });
      setApplications(prev => prev.map(a => (a.id === appId ? updated : a)));
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(updated);
      }
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleSaveNotes = async (appId: string) => {
    try {
      const updated = await api.updateApplicationNotes(appId, tempNotes);
      setApplications(prev => prev.map(a => (a.id === appId ? updated : a)));
      setEditingNotesId(null);
    } catch (err: any) {
      alert('Error saving notes: ' + err.message);
    }
  };

  const filteredApps = applications.filter(a => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      a.applicationId.toLowerCase().includes(q) ||
      a.candidateName.toLowerCase().includes(q) ||
      a.jobTitle.toLowerCase().includes(q) ||
      a.departmentName.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'Under Review':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Shortlisted':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Interview Scheduled':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Interview Completed':
        return 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'Selected':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold';
      case 'Rejected':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Withdrawn':
        return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isCandidate ? 'My Job Applications' : 'Candidate Applications Pipeline'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isCandidate
              ? 'Track stages, interview invitations, and status timelines for your applications'
              : 'Screen applicants, view AI match ratings, manage hiring stages, and progress candidates'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search candidate name, ID, job role..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800"
            >
              <option value="All">All Pipeline Stages</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Interview Completed">Interview Completed</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Data & AI">Data & AI</option>
              <option value="Sales & Growth">Sales & Growth</option>
              <option value="Human Resources & Talent">Human Resources & Talent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No applications found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try clearing filters or search query.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">App ID</th>
                  <th className="px-4 py-3.5">Candidate</th>
                  <th className="px-4 py-3.5">Vacancy Role</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">AI Match</th>
                  <th className="px-4 py-3.5">Current Stage</th>
                  <th className="px-4 py-3.5">Applied Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-white">{app.applicationId}</td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{app.candidateName}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 block">{app.candidateEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{app.jobTitle}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{app.departmentName}</td>
                    <td className="px-4 py-3">
                      {app.matchScore ? (
                        <button
                          onClick={() => setScreeningApp(app)}
                          className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                        >
                          <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                          {app.matchScore}%
                        </button>
                      ) : (
                        <button
                          onClick={() => setScreeningApp(app)}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          Screen AI
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(app.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Timeline / History Icon */}
                        <button
                          onClick={() => setShowHistoryApp(app)}
                          title="View Status History Timeline"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          <History className="h-4 w-4" />
                        </button>

                        {/* AI Screening Modal Button */}
                        <button
                          onClick={() => setScreeningApp(app)}
                          title="Open AI Resume Screening"
                          className="rounded-lg p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        >
                          <Sparkles className="h-4 w-4" />
                        </button>

                        {/* Recruiter Controls */}
                        {isHR && (
                          <>
                            {app.status === 'Under Review' || app.status === 'Applied' ? (
                              <button
                                onClick={() => handleStatusChange(app.id, 'Shortlisted')}
                                className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800"
                              >
                                Shortlist
                              </button>
                            ) : null}

                            {app.status === 'Shortlisted' ? (
                              <button
                                onClick={() => {
                                  if (onScheduleInterviewForApp) {
                                    onScheduleInterviewForApp(app);
                                  } else {
                                    alert('Proceed to Interviews tab to schedule.');
                                  }
                                }}
                                className="rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800"
                              >
                                Interview
                              </button>
                            ) : null}

                            {app.status === 'Interview Completed' ? (
                              <button
                                onClick={() => setOfferApp(app)}
                                className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800"
                              >
                                Extend Offer
                              </button>
                            ) : null}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status History Timeline Modal */}
      {showHistoryApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-900 px-6 py-4 text-white">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="h-4 w-4 text-indigo-400" />
                  Application Lifecycle Timeline
                </h2>
                <p className="text-xs text-slate-300">
                  {showHistoryApp.candidateName} • {showHistoryApp.applicationId}
                </p>
              </div>
              <button onClick={() => setShowHistoryApp(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {showHistoryApp.statusHistory.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pl-1">
                    <div className="h-5 w-5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-white">{step.status}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(step.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{step.note}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1">Updated by: {step.changedBy}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cover Note Section */}
              {showHistoryApp.coverNote && (
                <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/40 p-4 text-xs">
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider text-[11px] mb-1">
                    Candidate Cover Note
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300">{showHistoryApp.coverNote}</p>
                </div>
              )}

              {/* Recruiter Notes Section */}
              {isHR && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-xs space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                    Internal Recruiter Notes
                  </h4>
                  <textarea
                    rows={3}
                    defaultValue={showHistoryApp.recruiterNotes}
                    onBlur={e => handleSaveNotes(showHistoryApp.id)}
                    onChange={e => setTempNotes(e.target.value)}
                    placeholder="Add recruiter notes regarding interview readiness, salary expectations, or manager feedback..."
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs focus:border-indigo-500 focus:ring-1"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Click outside textarea to auto-save notes.</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3.5 text-right">
              <button
                onClick={() => setShowHistoryApp(null)}
                className="rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-700"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Screening Modal */}
      {screeningApp && (
        <AiScreeningModal
          application={screeningApp}
          onClose={() => setScreeningApp(null)}
          onStatusUpdate={newStatus => {
            handleStatusChange(screeningApp.id, newStatus);
            setScreeningApp(null);
          }}
          onScheduleInterview={() => {
            const app = screeningApp;
            setScreeningApp(null);
            if (onScheduleInterviewForApp) {
              onScheduleInterviewForApp(app);
            }
          }}
        />
      )}

      {/* Offer Letter Generator Modal */}
      {offerApp && (
        <OfferLetterModal
          application={offerApp}
          onClose={() => setOfferApp(null)}
          onOfferUpdated={() => {
            fetchApps();
            setOfferApp(null);
          }}
        />
      )}
    </div>
  );
};
