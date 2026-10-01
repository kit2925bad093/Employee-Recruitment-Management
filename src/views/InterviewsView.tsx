import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Award,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Interview, Application, User as AppUser, InterviewFeedback } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { InterviewScorecardModal } from '../components/InterviewScorecardModal';

interface InterviewsViewProps {
  initialScheduleApp?: Application | null;
}

export const InterviewsView: React.FC<InterviewsViewProps> = ({ initialScheduleApp }) => {
  const { user } = useAuth();
  const isInterviewer = user?.role === 'INTERVIEWER';
  const isHR = user?.role === 'HR' || user?.role === 'ADMIN';

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [interviewers, setInterviewers] = useState<AppUser[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [scorecardInterview, setScorecardInterview] = useState<Interview | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(!!initialScheduleApp);

  // Scheduling Form
  const [selectedAppId, setSelectedAppId] = useState(initialScheduleApp?.id || '');
  const [selectedInterviewerId, setSelectedInterviewerId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-10-15');
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [interviewType, setInterviewType] = useState('Technical');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/talent-interview-room');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [intList, apps] = await Promise.all([
        api.getInterviews({ status: statusFilter !== 'All' ? statusFilter : undefined }),
        api.getApplications(),
      ]);
      setInterviews(intList);
      setApplications(apps);

      // Fetch potential interviewers
      if (isHR) {
        try {
          const users = await api.getAdminUsers();
          setInterviewers(users.filter(u => u.role === 'INTERVIEWER' || u.role === 'HR' || u.role === 'ADMIN'));
          if (users.length > 0 && !selectedInterviewerId) {
            const defaultInterviewer = users.find(u => u.role === 'INTERVIEWER') || users[0];
            setSelectedInterviewerId(defaultInterviewer.id);
          }
        } catch (e) {
          setInterviewers([]);
          setSelectedInterviewerId('');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.scheduleInterview({
        applicationId: selectedAppId,
        interviewerId: selectedInterviewerId,
        scheduledDate,
        scheduledTime,
        durationMinutes,
        type: interviewType,
        meetingLinkOrLocation: meetingLink,
        notes,
      });
      setShowScheduleModal(false);
      fetchData();
    } catch (err: any) {
      alert('Error scheduling interview: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelInterview = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this interview?')) return;
    try {
      await api.cancelInterview(id);
      fetchData();
    } catch (err: any) {
      alert('Error cancelling interview: ' + err.message);
    }
  };

  const filteredInterviews = interviews.filter(i => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      i.interviewId.toLowerCase().includes(q) ||
      i.candidateName.toLowerCase().includes(q) ||
      i.jobTitle.toLowerCase().includes(q) ||
      i.interviewerName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isInterviewer ? 'My Assigned Interviews & Evaluation Dashboard' : 'Interview Scheduling & Coordination'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isInterviewer
              ? 'Join scheduled candidate sessions and submit structured evaluation scorecards'
              : 'Coordinate technical, HR, and culture panels, manage meeting links, and track verdicts'}
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Schedule New Interview
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search interview ID, candidate, interviewer, role..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800"
            >
              <option value="All">All Interview Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interviews Grid / Cards */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No scheduled interviews</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Schedule candidate interviews from shortlisted applications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInterviews.map(item => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/80">
                    {item.interviewId}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                      item.status === 'Completed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : item.status === 'Scheduled'
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                        : item.status === 'Cancelled'
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.candidateName}</h3>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{item.jobTitle}</p>
                </div>

                <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.scheduledDate} at {item.scheduledTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">Duration: {item.durationMinutes} min • Type: {item.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">Interviewer: {item.interviewerName}</span>
                  </div>
                  {item.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                      &quot;{item.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Scorecard verdict summary if completed */}
                {item.feedback && (
                  <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/40 p-3 space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-emerald-900 dark:text-emerald-300">
                      <span>Recommendation:</span>
                      <span className="text-emerald-700 dark:text-emerald-400">{item.feedback.recommendation}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                      <span>Overall Rating:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{item.feedback.overallRating} / 5</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <a
                  href={item.meetingLinkOrLocation}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  <Video className="h-3.5 w-3.5" />
                  Join Room
                </a>

                <div className="flex items-center gap-2">
                  {/* Interviewer submit scorecard */}
                  {(isInterviewer || isHR) && (
                    <button
                      onClick={() => setScorecardInterview(item)}
                      className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors"
                    >
                      {item.feedback ? 'Edit Scorecard' : 'Submit Feedback'}
                    </button>
                  )}

                  {isHR && item.status !== 'Completed' && item.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleCancelInterview(item.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400"
                      title="Cancel Interview"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 px-6 py-4 text-white">
              <h2 className="text-base font-bold text-white">Schedule Candidate Interview</h2>
              <button onClick={() => setShowScheduleModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Candidate Application *
                </label>
                <select
                  required
                  value={selectedAppId}
                  onChange={e => setSelectedAppId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select Candidate Application</option>
                  {applications.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.candidateName} - {a.jobTitle} ({a.applicationId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Assigned Interviewer *
                </label>
                <select
                  required
                  value={selectedInterviewerId}
                  onChange={e => setSelectedInterviewerId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select Interviewer</option>
                  {interviewers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role} - {u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Interview Type
                  </label>
                  <select
                    value={interviewType}
                    onChange={e => setInterviewType(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Online">Online Video</option>
                    <option value="Technical">Technical Live Coding</option>
                    <option value="HR">HR / Cultural Fit</option>
                    <option value="Final">Executive / Final</option>
                    <option value="Phone">Phone Screen</option>
                    <option value="Offline">On-site / Offline</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Meeting Link or Location
                </label>
                <input
                  type="text"
                  required
                  value={meetingLink}
                  onChange={e => setMeetingLink(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Focus Notes for Interviewer
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Focus on distributed concurrency, system design, and past leadership projects..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Scheduling...' : 'Dispatch Interview Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scorecard Modal */}
      {scorecardInterview && (
        <InterviewScorecardModal
          interview={scorecardInterview}
          onClose={() => setScorecardInterview(null)}
          onSubmitted={() => {
            fetchData();
            setScorecardInterview(null);
          }}
        />
      )}
    </div>
  );
};
