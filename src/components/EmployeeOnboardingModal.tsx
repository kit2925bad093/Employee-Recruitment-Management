import React, { useState } from 'react';
import { UserCheck, X, Check, Building2, User, Mail, Phone, Calendar, Briefcase } from 'lucide-react';
import { Candidate, Employee, Offer } from '../types';
import { api } from '../api';

interface EmployeeOnboardingModalProps {
  candidate?: Candidate;
  offer?: Offer;
  onClose: () => void;
  onOnboarded: (newEmployee: Employee) => void;
}

export const EmployeeOnboardingModal: React.FC<EmployeeOnboardingModalProps> = ({
  candidate,
  offer,
  onClose,
  onOnboarded,
}) => {
  const [fullName, setFullName] = useState(candidate?.fullName || offer?.candidateName || '');
  const [email, setEmail] = useState(
    candidate?.email || offer?.candidateEmail || `${fullName.toLowerCase().replace(/\s+/g, '.')}@talentpulse.io`
  );
  const [phone, setPhone] = useState(candidate?.phone || '+1 (415) 555-0199');
  const [department, setDepartment] = useState(offer?.departmentName || 'Engineering');
  const [designation, setDesignation] = useState(offer?.jobTitle || 'Senior Software Engineer');
  const [joiningDate, setJoiningDate] = useState(offer?.joiningDate || new Date().toISOString().split('T')[0]);
  const [manager, setManager] = useState('Elena Rostova (VP Engineering)');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [salary, setSalary] = useState(offer?.salary || '₹145,000');
  const [officeLocation, setOfficeLocation] = useState('San Francisco, CA / Hybrid');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const emp = await api.onboardEmployee({
        candidateId: candidate?.id || offer?.candidateId,
        fullName,
        email,
        phone,
        department,
        designation,
        joiningDate,
        manager,
        employmentType,
        salary,
        officeLocation,
      });
      onOnboarded(emp);
      onClose();
    } catch (err: any) {
      alert('Error onboarding employee: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <UserCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Convert Candidate to Employee (Onboarding)</h2>
              <p className="text-xs text-slate-300">Official provisioning of organizational staff record</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Final Recruitment Step: Candidate &rarr; Application &rarr; Shortlist &rarr; Interview &rarr; Offer &rarr; <strong>Employee</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Data & AI">Data & AI</option>
                <option value="Human Resources & Talent">Human Resources & Talent</option>
                <option value="Sales & Growth">Sales & Growth</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Official Designation
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Reporting Manager
              </label>
              <input
                type="text"
                required
                value={manager}
                onChange={e => setManager(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Joining Date
              </label>
              <input
                type="date"
                required
                value={joiningDate}
                onChange={e => setJoiningDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={e => setEmploymentType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Final Annual Compensation
              </label>
              <input
                type="text"
                required
                value={salary}
                onChange={e => setSalary(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Office / Work Location
              </label>
              <input
                type="text"
                required
                value={officeLocation}
                onChange={e => setOfficeLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50"
            >
              {submitting ? 'Onboarding...' : 'Confirm Employee Onboarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
