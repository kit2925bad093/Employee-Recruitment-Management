import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  Award,
  ChevronRight,
  RefreshCw,
  X,
  Calendar,
  Check,
  UserCheck,
} from 'lucide-react';
import { Application, AiScreeningResult } from '../types';
import { api } from '../api';

interface AiScreeningModalProps {
  application: Application;
  onClose: () => void;
  onStatusUpdate: (newStatus: string) => void;
  onScheduleInterview: () => void;
}

export const AiScreeningModal: React.FC<AiScreeningModalProps> = ({
  application,
  onClose,
  onStatusUpdate,
  onScheduleInterview,
}) => {
  const [screening, setScreening] = useState<AiScreeningResult | undefined>(application.aiScreening);
  const [loading, setLoading] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const runScreening = async () => {
    setLoading(true);
    try {
      const res = await api.triggerAiScreening(application.id, customText || undefined);
      setScreening(res);
      setActionSuccess('AI Screening updated successfully!');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert('Error running AI screening: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (score >= 70) return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/30">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">AI Resume Screening & Fit Analysis</h2>
                <span className="rounded bg-indigo-500/30 px-2 py-0.5 text-[11px] font-medium text-indigo-200">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Evaluating {application.candidateName} for {application.jobTitle} ({application.applicationId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {actionSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {actionSuccess}
            </div>
          )}

          {/* Quick Score Banner */}
          {screening ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Match Score Card */}
              <div className={`rounded-xl border p-4 flex flex-col justify-center items-center text-center ${getScoreColor(screening.overallMatchPercentage)}`}>
                <span className="text-xs font-semibold uppercase tracking-wider">Overall Match Score</span>
                <div className="text-4xl font-extrabold my-1">{screening.overallMatchPercentage}%</div>
                <span className="text-xs font-medium">
                  {screening.overallMatchPercentage >= 80 ? 'Highly Recommended' : screening.overallMatchPercentage >= 65 ? 'Qualified Fit' : 'Borderline / Gaps'}
                </span>
              </div>

              {/* AI Recommendation */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4 flex flex-col justify-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Recommendation</span>
                <div className="flex items-center gap-2 mt-1">
                  <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-base font-bold text-slate-900 dark:text-white">{screening.aiRecommendation}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Decision-support indicator; HR retains full selection control.</p>
              </div>

              {/* Experience Match */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4 flex flex-col justify-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Experience Match</span>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 leading-snug">{screening.experienceMatch}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/30 dark:bg-indigo-950/20 p-8 text-center">
              <Sparkles className="h-8 w-8 text-indigo-500 mx-auto mb-2 animate-bounce" />
              <p className="text-sm font-semibold text-slate-800 dark:text-white">No AI screening has been run yet for this candidate</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Trigger Gemini 3.8 Flash to extract qualifications, match skills, and calculate alignment percentage.
              </p>
              <button
                onClick={runScreening}
                disabled={loading}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Run AI Screening Now
              </button>
            </div>
          )}

          {screening && (
            <>
              {/* Executive Summary */}
              <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/40 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  AI Analysis Summary
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{screening.analysisSummary}</p>
              </div>

              {/* Skills Match Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Skills Comparison</h4>

                {/* Matching Skills */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Matching Skills ({screening.matchingSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {screening.matchingSkills.length > 0 ? (
                      screening.matchingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        >
                          <Check className="h-3 w-3" />
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No direct skill matches identified.</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>Missing or Unverified Required Skills ({screening.missingSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {screening.missingSkills.length > 0 ? (
                      screening.missingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        >
                          <X className="h-3 w-3" />
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All vacancy required skills matched!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Identified Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                    {screening.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    Recommended Probes & Gaps
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                    {screening.weaknesses.map((gap, i) => (
                      <li key={i}>{gap}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* Re-Screen with Custom Resume Text */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {showCustomInput ? 'Hide Custom Resume Input' : 'Paste Updated Resume Text to Re-screen'}
            </button>

            {showCustomInput && (
              <div className="mt-3 space-y-2">
                <textarea
                  rows={4}
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder="Paste raw text extracted from candidate's updated resume or CV..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={runScreening}
                  disabled={loading}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Re-analyzing with Gemini...' : 'Re-run Screening'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions for Recruiter */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-6 py-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Current Status: <span className="font-semibold text-slate-800 dark:text-white">{application.status}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onStatusUpdate('Shortlisted');
                setActionSuccess('Candidate marked as Shortlisted!');
              }}
              className="rounded-lg border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors"
            >
              Shortlist Candidate
            </button>

            <button
              onClick={() => {
                onScheduleInterview();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
            >
              <Calendar className="h-3.5 w-3.5" />
              Schedule Interview
            </button>

            <button
              onClick={() => {
                onStatusUpdate('Rejected');
                setActionSuccess('Application updated to Rejected.');
              }}
              className="rounded-lg border border-rose-200 dark:border-rose-900/80 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
