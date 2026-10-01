import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  GraduationCap,
  Briefcase,
  ExternalLink,
  Download,
  X,
  Sparkles,
} from 'lucide-react';
import { Candidate } from '../types';
import { api } from '../api';

export const CandidatesView: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const data = await api.getCandidates({
        search: searchTerm || undefined,
        skill: selectedSkill !== 'All' ? selectedSkill : undefined,
      });
      setCandidates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [searchTerm, selectedSkill]);

  const allSkills = Array.from(new Set(candidates.flatMap(c => c.skills)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Talent Pool & Candidate Directory</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Search candidate credentials, verified skills, employment track record, and resume attachments
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
              placeholder="Search candidate name, email, background..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedSkill}
              onChange={e => setSelectedSkill(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800"
            >
              <option value="All">All Skill Filters</option>
              {allSkills.slice(0, 15).map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No candidates found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try broadening your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map(cand => (
            <div
              key={cand.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={cand.photoUrl}
                    alt={cand.fullName}
                    className="h-12 w-12 rounded-full border border-slate-200 dark:border-slate-700 object-cover bg-slate-100 dark:bg-slate-800"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cand.fullName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{cand.experience[0]?.title || 'Professional Specialist'}</p>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      {cand.education[0]?.degree || 'University Graduate'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {cand.summary || 'Accomplished candidate profile with proven career background and technical certifications.'}
                </p>

                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{cand.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{cand.phone || 'Phone verified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{cand.address || 'United States'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {cand.skills.slice(0, 4).map((s, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                    {cand.skills.length > 4 && (
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        +{cand.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  {cand.resumeFileName || 'Resume.pdf'}
                </span>
                <button
                  onClick={() => setSelectedCandidate(cand)}
                  className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors border border-indigo-200 dark:border-indigo-800"
                >
                  View Full Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Full Profile Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCandidate.photoUrl}
                  alt={selectedCandidate.fullName}
                  className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                />
                <div>
                  <h2 className="text-base font-bold text-white">{selectedCandidate.fullName}</h2>
                  <p className="text-xs text-slate-300">{selectedCandidate.email} • {selectedCandidate.phone}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-700 dark:text-slate-300">
              {/* Summary */}
              {selectedCandidate.summary && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">Professional Summary</h4>
                  <p className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3 leading-relaxed">
                    {selectedCandidate.summary}
                  </p>
                </div>
              )}

              {/* Skills */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">Verified Skillset</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map((s, i) => (
                    <span key={i} className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  Work Experience
                </h4>
                <div className="space-y-3">
                  {selectedCandidate.experience.map((exp, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-1">
                      <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                        <span>{exp.title}</span>
                        <span className="text-slate-400 font-normal">{exp.duration}</span>
                      </div>
                      <p className="text-indigo-600 dark:text-indigo-400 font-semibold">{exp.company}</p>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed pt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  Education
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCandidate.education.map((edu, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white">{edu.degree}</p>
                      <p className="text-slate-600 dark:text-slate-300">{edu.institution}</p>
                      <p className="text-slate-400 text-[11px]">Class of {edu.year} {edu.grade ? `• ${edu.grade}` : ''}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications & Projects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedCandidate.certifications.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      Certifications
                    </h4>
                    <div className="space-y-2">
                      {selectedCandidate.certifications.map((c, i) => (
                        <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5">
                          <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.issuer} ({c.year})</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCandidate.projects.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">Projects</h4>
                    <div className="space-y-2">
                      {selectedCandidate.projects.map((p, i) => (
                        <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5">
                          <p className="font-semibold text-slate-900 dark:text-white">{p.title}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Resume Metadata Box */}
              <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/40 p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-xs">Attached Document</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{selectedCandidate.resumeFileName || 'Resume_Document.pdf'} (PDF format)</p>
                </div>
                <button
                  onClick={() => alert(`Simulated secure download of ${selectedCandidate.resumeFileName || 'Resume.pdf'}`)}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Resume
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 text-right">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-700"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
