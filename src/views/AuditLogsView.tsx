import React, { useState, useEffect } from 'react';
import { Shield, Search, Filter, Clock, User, FileText, ChevronRight } from 'lucide-react';
import { AuditLog } from '../types';
import { api } from '../api';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [entityFilter, setEntityFilter] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs({
        action: actionFilter !== 'All' ? actionFilter : undefined,
        entity: entityFilter !== 'All' ? entityFilter : undefined,
        user: searchTerm || undefined,
      });
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">System Audit Trail & Compliance Log</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Immutable audit records of all user role alterations, vacancy creations, scorecards, and hiring state transitions
        </p>
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
              placeholder="Search user name or details..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800"
            >
              <option value="All">All Actions</option>
              <option value="CREATE_VACANCY">CREATE_VACANCY</option>
              <option value="STATUS_CHANGE">STATUS_CHANGE</option>
              <option value="SHORTLISTED_CANDIDATE">SHORTLISTED_CANDIDATE</option>
              <option value="SCHEDULE_INTERVIEW">SCHEDULE_INTERVIEW</option>
              <option value="SUBMIT_FEEDBACK">SUBMIT_FEEDBACK</option>
              <option value="GENERATE_OFFER">GENERATE_OFFER</option>
              <option value="ONBOARD_EMPLOYEE">ONBOARD_EMPLOYEE</option>
            </select>
          </div>

          <div>
            <select
              value={entityFilter}
              onChange={e => setEntityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800"
            >
              <option value="All">All Entities</option>
              <option value="Vacancy">Vacancy</option>
              <option value="Application">Application</option>
              <option value="Interview">Interview</option>
              <option value="InterviewFeedback">InterviewFeedback</option>
              <option value="Offer">Offer</option>
              <option value="Employee">Employee</option>
              <option value="User">User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <Shield className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No audit logs found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Actions taken within the system appear here automatically.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Actor (User)</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Action</th>
                  <th className="px-4 py-3.5">Entity</th>
                  <th className="px-4 py-3.5">Previous Value</th>
                  <th className="px-4 py-3.5">New Value</th>
                  <th className="px-4 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{log.userName}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-indigo-700 dark:text-indigo-400 text-[11px]">{log.action}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{log.entity}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{log.entityId}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-400 max-w-[140px] truncate">{log.previousValue}</td>
                    <td className="px-4 py-3 font-medium text-emerald-700 dark:text-emerald-400 max-w-[140px] truncate">{log.newValue}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{log.details || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
