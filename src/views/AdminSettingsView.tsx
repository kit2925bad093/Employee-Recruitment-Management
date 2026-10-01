import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Shield,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  MapPin,
  Briefcase,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { User, Department } from '../types';
import { api } from '../api';
import { ThemeSelectorCard } from '../components/ThemeToggle';

export const AdminSettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'departments' | 'theme'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Department Modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({
    code: '',
    name: '',
    description: '',
    managerName: '',
    location: 'San Francisco, CA / Hybrid',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uList, dList] = await Promise.all([api.getAdminUsers(), api.getDepartments()]);
      setUsers(uList);
      setDepartments(dList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleUserStatus = async (user: User) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.updateUserStatus(user.id, nextStatus);
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, status: nextStatus } : u)));
    } catch (err: any) {
      alert('Error updating user status: ' + err.message);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole as any } : u)));
    } catch (err: any) {
      alert('Error updating role: ' + err.message);
    }
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.updateDepartment(editingDept.id, deptForm);
      } else {
        await api.createDepartment(deptForm);
      }
      setShowDeptModal(false);
      setEditingDept(null);
      fetchData();
    } catch (err: any) {
      alert('Error saving department: ' + err.message);
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.deleteDepartment(id);
      fetchData();
    } catch (err: any) {
      alert('Error deleting department: ' + err.message);
    }
  };

  const openDeptModal = (d?: Department) => {
    if (d) {
      setEditingDept(d);
      setDeptForm({
        code: d.code,
        name: d.name,
        description: d.description,
        managerName: d.managerName,
        location: d.location,
      });
    } else {
      setEditingDept(null);
      setDeptForm({
        code: '',
        name: '',
        description: '',
        managerName: '',
        location: 'San Francisco, CA / Hybrid',
      });
    }
    setShowDeptModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Control & Organization Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage system roles, account active states, organizational department structures, and visual theme
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
            }`}
          >
            Users & Roles ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'departments'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
            }`}
          >
            Departments ({departments.length})
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'theme'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            Appearance & Dark Mode
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : activeTab === 'theme' ? (
        /* Appearance & Theme Setting */
        <div className="space-y-6">
          <ThemeSelectorCard
            title="System Appearance & Dark Mode"
            description="Toggle theme mode across TalentPulse ERMS. Tailwind CSS dark mode classes are dynamically applied to every table, modal, chart, and input component."
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-xs space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Theme Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600 dark:text-slate-400">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Persistent Preference</span>
                Saved automatically to client storage (<code className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">localStorage</code>) and synced on subsequent visits.
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Accessibility & Contrast</span>
                High contrast ratios for WCAG AA adherence across data tables, badges, modals, and charts.
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        /* Users Management Table */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Assigned Role</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Account Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{u.fullName}</td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={u.role}
                        onChange={e => handleChangeRole(u.id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="HR">HR</option>
                        <option value="INTERVIEWER">INTERVIEWER</option>
                        <option value="CANDIDATE">CANDIDATE</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{u.departmentName || '-'}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Department Management */
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => openDeptModal()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments.map(d => (
              <div
                key={d.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded dark:bg-indigo-950 dark:text-indigo-400">
                      {d.code}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{d.employeeCount} staff</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{d.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{d.description}</p>

                  <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p><strong className="text-slate-700 dark:text-slate-300">Manager:</strong> {d.managerName}</p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {d.location}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openDeptModal(d)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDept(d.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white dark:border-slate-800">
              <h2 className="text-base font-bold text-white">
                {editingDept ? 'Edit Department' : 'Create Department'}
              </h2>
              <button onClick={() => setShowDeptModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="p-6 space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ENG, FIN, HR"
                  value={deptForm.code}
                  onChange={e => setDeptForm({ ...deptForm, code: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering & Platform"
                  value={deptForm.name}
                  onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Head of Department / Manager</label>
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova (VP Engineering)"
                  value={deptForm.managerName}
                  onChange={e => setDeptForm({ ...deptForm, managerName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Location</label>
                <input
                  type="text"
                  value={deptForm.location}
                  onChange={e => setDeptForm({ ...deptForm, location: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={deptForm.description}
                  onChange={e => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2 font-bold text-white shadow-2xs hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
