import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  Building2,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  DollarSign,
  Award,
} from 'lucide-react';
import { Employee } from '../types';
import { api } from '../api';

export const EmployeesView: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = employees.filter(e => {
    const matchesSearch =
      !searchTerm ||
      e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || e.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Onboarded Employees & Staff Directory</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Complete organizational records for all successfully recruited and onboarded candidates
        </p>
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
              placeholder="Search employee ID, name, designation..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800"
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

      {/* Employee Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <UserCheck className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No employees found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Accept candidate offers and onboard them into staff.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3.5">Employee ID</th>
                  <th className="px-4 py-3.5">Full Name</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Designation</th>
                  <th className="px-4 py-3.5">Manager</th>
                  <th className="px-4 py-3.5">Start Date</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">{emp.employeeId}</td>
                    <td className="px-4 py-3.5">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{emp.fullName}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 block">{emp.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">{emp.department}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">{emp.designation}</td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{emp.manager}</td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{new Date(emp.joiningDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{emp.officeLocation}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          emp.status === 'Active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
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
