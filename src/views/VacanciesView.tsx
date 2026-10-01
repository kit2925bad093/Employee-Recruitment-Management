import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Calendar,
  Sparkles,
  ChevronRight,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Eye,
} from 'lucide-react';
import { Vacancy, Department } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const VacanciesView: React.FC = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'HR' || user?.role === 'ADMIN';

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState(isHR ? 'All' : 'Open');

  // Modals
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState<Vacancy | null>(null);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);

  // Application Submission state
  const [coverNote, setCoverNote] = useState('');
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);
  const [applyErrorMsg, setApplyErrorMsg] = useState<string | null>(null);

  // Vacancy Form State
  const [formData, setFormData] = useState<{
    title: string;
    departmentId: string;
    location: string;
    employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid';
    salaryRange: string;
    requiredQualification: string;
    requiredExperience: string;
    requiredSkills: string;
    description: string;
    responsibilities: string;
    numberOfOpenings: number;
    openingDate: string;
    closingDate: string;
    status: 'Draft' | 'Open' | 'Closed' | 'On Hold' | 'Filled';
  }>({
    title: '',
    departmentId: '',
    location: 'San Francisco, CA / Hybrid',
    employmentType: 'Full-time',
    salaryRange: '₹120,000 - ₹160,000',
    requiredQualification: 'B.S. in Computer Science or equivalent field experience',
    requiredExperience: '3-5 years',
    requiredSkills: 'React, TypeScript, Node.js, SQL',
    description: '',
    responsibilities: 'Lead feature development, collaborate with design, conduct code reviews',
    numberOfOpenings: 1,
    openingDate: new Date().toISOString().split('T')[0],
    closingDate: '2026-12-31',
    status: 'Open',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vList, dList] = await Promise.all([
        api.getVacancies({
          search: searchTerm,
          department: deptFilter !== 'All' ? deptFilter : undefined,
          location: locationFilter !== 'All' ? locationFilter : undefined,
          employmentType: typeFilter !== 'All' ? typeFilter : undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
        }),
        api.getDepartments(),
      ]);
      setVacancies(vList);
      setDepartments(dList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, deptFilter, locationFilter, typeFilter, statusFilter]);

  const handleSaveVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()),
        responsibilities: formData.responsibilities.split('\n').filter(Boolean),
      };

      if (editingVacancy) {
        await api.updateVacancy(editingVacancy.id, payload);
      } else {
        await api.createVacancy(payload);
      }

      setShowCreateModal(false);
      setEditingVacancy(null);
      fetchData();
    } catch (err: any) {
      alert('Error saving vacancy: ' + err.message);
    }
  };

  const handleDeleteVacancy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vacancy?')) return;
    try {
      await api.deleteVacancy(id);
      fetchData();
    } catch (err: any) {
      alert('Error deleting vacancy: ' + err.message);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showApplyModal) return;
    setApplySubmitting(true);
    setApplyErrorMsg(null);
    setApplySuccessMsg(null);

    try {
      const result = await api.applyForJob({
        vacancyId: showApplyModal.id,
        coverNote,
      });
      setApplySuccessMsg(`Application ${result.applicationId} submitted successfully! Automated AI screening match score: ${result.matchScore || 85}%`);
      setTimeout(() => {
        setShowApplyModal(null);
        setCoverNote('');
        setApplySuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setApplyErrorMsg(err.message || 'Failed to submit application');
    } finally {
      setApplySubmitting(false);
    }
  };

  const openEdit = (v: Vacancy) => {
    setEditingVacancy(v);
    setFormData({
      title: v.title,
      departmentId: v.departmentId,
      location: v.location,
      employmentType: v.employmentType,
      salaryRange: v.salaryRange,
      requiredQualification: v.requiredQualification,
      requiredExperience: v.requiredExperience,
      requiredSkills: v.requiredSkills.join(', '),
      description: v.description,
      responsibilities: v.responsibilities.join('\n'),
      numberOfOpenings: v.numberOfOpenings,
      openingDate: v.openingDate,
      closingDate: v.closingDate,
      status: v.status,
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setEditingVacancy(null);
    setFormData({
      title: '',
      departmentId: departments[0]?.id || '',
      location: 'San Francisco, CA / Hybrid',
      employmentType: 'Full-time',
      salaryRange: '₹120,000 - ₹160,000',
      requiredQualification: 'B.S. in Computer Science or equivalent field experience',
      requiredExperience: '3-5 years',
      requiredSkills: 'React, TypeScript, Node.js, SQL',
      description: '',
      responsibilities: 'Lead feature development, collaborate with design, conduct code reviews',
      numberOfOpenings: 1,
      openingDate: new Date().toISOString().split('T')[0],
      closingDate: '2026-12-31',
      status: 'Open',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isHR ? 'Job Vacancy Management' : 'Career Opportunities & Job Board'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isHR
              ? 'Create, edit, and manage job openings across all departments'
              : 'Explore open roles, review required qualifications, and submit applications'}
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create New Vacancy
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by title, skill (e.g. React, Python), keyword..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800"
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Employment Type */}
          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800"
            >
              <option value="All">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Status Filter */}
          {isHR && (
            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Draft">Draft</option>
                <option value="Closed">Closed</option>
                <option value="On Hold">On Hold</option>
                <option value="Filled">Filled</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Vacancies Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : vacancies.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <Briefcase className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No vacancies matched your criteria</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try resetting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vacancies.map(v => (
            <div
              key={v.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header row: Job ID & Status */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                    {v.jobId}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                      v.status === 'Open'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : v.status === 'Filled'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                        : v.status === 'Draft'
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                {/* Job Title & Department */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {v.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {v.departmentName}
                  </p>
                </div>

                {/* Meta details */}
                <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{v.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{v.salaryRange}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{v.employmentType} • Exp: {v.requiredExperience}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Deadline: {new Date(v.closingDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {v.requiredSkills.slice(0, 4).map((s, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                    {v.requiredSkills.length > 4 && (
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        +{v.requiredSkills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedVacancy(v)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Details
                </button>

                <div className="flex items-center gap-2">
                  {isHR && (
                    <>
                      <button
                        onClick={() => openEdit(v)}
                        title="Edit Vacancy"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVacancy(v.id)}
                        title="Delete Vacancy"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {v.status === 'Open' ? (
                    <button
                      onClick={() => setShowApplyModal(v)}
                      className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                    >
                      Apply Now
                    </button>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Applications Closed</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vacancy Detail Modal */}
      {selectedVacancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-900 px-6 py-4 text-white">
              <div>
                <span className="font-mono text-xs text-indigo-300 font-semibold">{selectedVacancy.jobId}</span>
                <h2 className="text-lg font-bold text-white mt-0.5">{selectedVacancy.title}</h2>
                <p className="text-xs text-slate-300">{selectedVacancy.departmentName} • {selectedVacancy.location}</p>
              </div>
              <button onClick={() => setSelectedVacancy(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3.5">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Salary</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{selectedVacancy.salaryRange}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Openings</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedVacancy.numberOfOpenings}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Employment</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedVacancy.employmentType}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Status</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedVacancy.status}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1.5">Description</h4>
                <p className="whitespace-pre-line">{selectedVacancy.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1.5">Key Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedVacancy.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1.5">Required Skills & Technologies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedVacancy.requiredSkills.map((s, i) => (
                    <span key={i} className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">Qualifications & Experience</h4>
                <p><strong className="text-slate-900 dark:text-white">Required Experience:</strong> {selectedVacancy.requiredExperience}</p>
                <p><strong className="text-slate-900 dark:text-white">Qualification:</strong> {selectedVacancy.requiredQualification}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-3.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Application Deadline: {new Date(selectedVacancy.closingDate).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedVacancy(null)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Close
                </button>
                {selectedVacancy.status === 'Open' && (
                  <button
                    onClick={() => {
                      const v = selectedVacancy;
                      setSelectedVacancy(null);
                      setShowApplyModal(v);
                    }}
                    className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sm"
                  >
                    Apply for this Position
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-900 px-6 py-4 text-white">
              <div>
                <h2 className="text-base font-bold text-white">Job Application Submission</h2>
                <p className="text-xs text-slate-300">Applying for: {showApplyModal.title} ({showApplyModal.jobId})</p>
              </div>
              <button onClick={() => setShowApplyModal(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="p-6 space-y-4">
              {applySuccessMsg && (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{applySuccessMsg}</span>
                </div>
              )}

              {applyErrorMsg && (
                <div className="rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{applyErrorMsg}</span>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Candidate Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{user?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Contact Email:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Attached Resume:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">Profile Resume Document (Synced)</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Cover Note / Introduction for Recruiter
                </label>
                <textarea
                  rows={4}
                  value={coverNote}
                  onChange={e => setCoverNote(e.target.value)}
                  placeholder="Share a brief introduction, your relevant highlights, or why you're interested in joining TalentPulse..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(null)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applySubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {applySubmitting ? 'Submitting & Screening...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Vacancy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-base font-bold text-white">
                {editingVacancy ? `Edit Vacancy: ${editingVacancy.jobId}` : 'Create New Job Vacancy'}
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVacancy} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                    required
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Employment Type
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={e => setFormData({ ...formData, employmentType: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Salary Range *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.salaryRange}
                    onChange={e => setFormData({ ...formData, salaryRange: e.target.value })}
                    placeholder="₹130,000 - ₹170,000"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Number of Openings
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfOpenings}
                    onChange={e => setFormData({ ...formData, numberOfOpenings: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Required Experience
                  </label>
                  <input
                    type="text"
                    value={formData.requiredExperience}
                    onChange={e => setFormData({ ...formData, requiredExperience: e.target.value })}
                    placeholder="e.g. 4+ years"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Vacancy Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs font-semibold"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Filled">Filled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={formData.requiredSkills}
                  onChange={e => setFormData({ ...formData, requiredSkills: e.target.value })}
                  placeholder="React, TypeScript, Node.js, PostgreSQL, Docker"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Job Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Key Responsibilities (one per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.responsibilities}
                  onChange={e => setFormData({ ...formData, responsibilities: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Opening Date
                  </label>
                  <input
                    type="date"
                    value={formData.openingDate}
                    onChange={e => setFormData({ ...formData, openingDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Application Closing Date
                  </label>
                  <input
                    type="date"
                    value={formData.closingDate}
                    onChange={e => setFormData({ ...formData, closingDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  {editingVacancy ? 'Save Changes' : 'Publish Vacancy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
