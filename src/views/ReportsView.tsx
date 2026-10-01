import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Users,
  Briefcase,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { DashboardStatistics } from '../types';
import { api } from '../api';

export const ReportsView: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getDashboardStats();
        setStats(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const exportToExcelCsv = () => {
    if (!stats) return;

    // Build CSV format
    const rows = [
      ['TalentPulse ERMS Recruitment Lifecycle & Analytics Report'],
      ['Generated On', new Date().toISOString()],
      [],
      ['Metric', 'Value'],
      ['Total Active Vacancies', stats.metrics.activeVacancies],
      ['Total Vacancies', stats.metrics.totalVacancies],
      ['Total Applications', stats.metrics.totalApplications],
      ['Shortlisted Candidates', stats.metrics.shortlistedCandidates],
      ['Scheduled Interviews', stats.metrics.scheduledInterviews],
      ['Selected Candidates', stats.metrics.selectedCandidates],
      ['Total Employees', stats.metrics.totalEmployees],
      ['Average Processing Days', stats.metrics.averageHiringDays],
      ['Offer Acceptance Rate', stats.metrics.offerAcceptanceRate],
      [],
      ['Applications by Department'],
      ...Object.entries(stats.departmentDistribution).map(([dept, count]) => [dept, count]),
      [],
      ['Vacancy Performance'],
      ['Job ID', 'Title', 'Department', 'Openings', 'Status', 'Applications'],
      ...stats.vacancyCounts.map(v => [v.jobId, v.title, v.department, v.openings, v.status, v.count]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TalentPulse_Recruitment_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Recruitment Analytics & Executive Reports</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Lifecycle benchmarks, hiring funnel velocity, vacancy ratios, and exportable intelligence
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcelCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Export to Excel (CSV)
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print / PDF Report
          </button>
        </div>
      </div>

      {/* Velocity Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg. Time-to-Hire</span>
            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 p-2 text-indigo-600 dark:text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{stats.metrics.averageHiringDays} Days</div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">From initial application to offer signed</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Offer Acceptance Rate</span>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 p-2 text-emerald-600 dark:text-emerald-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{stats.metrics.offerAcceptanceRate}</div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">High conversion across senior roles</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active vs Total Vacancies</span>
            <div className="rounded-lg bg-cyan-50 dark:bg-cyan-950/60 p-2 text-cyan-600 dark:text-cyan-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {stats.metrics.activeVacancies} / {stats.metrics.totalVacancies}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">83% vacancy fill pacing</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications By Vacancy Bar Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Applications by Vacancy</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Applicant interest density per job role</p>
          </div>

          <div className="space-y-3 pt-2">
            {stats.vacancyCounts.map(v => {
              const maxCount = 5;
              const pct = Math.max(10, Math.min(100, (v.count / maxCount) * 100));
              return (
                <div key={v.jobId} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{v.title}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{v.count} applications</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-400">
                    <span>{v.department} • {v.jobId}</span>
                    <span>{v.openings} open position(s)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline Stage Distribution */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hiring Stage Conversion Ratios</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Candidate flow through screening and selection</p>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(stats.statusFunnel).map(([status, count], i) => (
              <div key={status} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 dark:border-slate-800">
                <span className="font-medium text-slate-700 dark:text-slate-300">{status}</span>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 px-2.5 py-0.5 font-bold">
                    {count} candidate(s)
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 w-12 text-right">
                    {Math.round((count / (stats.metrics.totalApplications || 1)) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3.5 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>Overall Screened-to-Offer Ratio:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">33.3% Conversion</span>
          </div>
        </div>
      </div>
    </div>
  );
};
