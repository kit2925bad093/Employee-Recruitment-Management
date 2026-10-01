import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  FileText,
  Upload,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Candidate, EducationItem, ExperienceItem, CertificationItem, ProjectItem } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { ThemeSelectorCard } from '../components/ThemeToggle';

export const CandidateProfileView: React.FC = () => {
  const { user, candidate, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(candidate?.fullName || user?.fullName || '');
  const [email, setEmail] = useState(candidate?.email || user?.email || '');
  const [phone, setPhone] = useState(candidate?.phone || '+1 (415) 555-0192');
  const [dob, setDob] = useState(candidate?.dob || '1995-04-12');
  const [address, setAddress] = useState(candidate?.address || 'San Francisco, CA');
  const [summary, setSummary] = useState(candidate?.summary || '');
  const [photoUrl, setPhotoUrl] = useState(candidate?.photoUrl || user?.avatarUrl || '');

  // Skills
  const [skills, setSkills] = useState<string[]>(candidate?.skills || ['React', 'TypeScript', 'Node.js', 'PostgreSQL']);
  const [newSkill, setNewSkill] = useState('');

  // Complex lists
  const [education, setEducation] = useState<EducationItem[]>(
    candidate?.education || [
      { degree: 'B.S. in Computer Science', institution: 'University of California, Berkeley', year: '2017', grade: '3.8 GPA' },
    ]
  );
  const [experience, setExperience] = useState<ExperienceItem[]>(
    candidate?.experience || [
      {
        title: 'Senior Software Engineer',
        company: 'Starlight Tech Inc.',
        duration: '2021 - Present',
        description: 'Built scalable microservices handling 40M daily requests. Architected design systems in React and TypeScript.',
      },
    ]
  );
  const [certifications, setCertifications] = useState<CertificationItem[]>(
    candidate?.certifications || [
      { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2023' },
    ]
  );
  const [projects, setProjects] = useState<ProjectItem[]>(
    candidate?.projects || [
      {
        title: 'Talent Evaluation Pipeline',
        description: 'Automated skill extraction and matching engine built with TypeScript.',
        link: 'https://github.com/example/pipeline',
      },
    ]
  );

  // Resume Upload Simulator
  const [resumeFileName, setResumeFileName] = useState(candidate?.resumeFileName || 'Candidate_Resume_2026.pdf');
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (candidate) {
      setFullName(candidate.fullName);
      setEmail(candidate.email);
      setPhone(candidate.phone);
      setDob(candidate.dob);
      setAddress(candidate.address);
      setSummary(candidate.summary);
      setSkills(candidate.skills);
      setEducation(candidate.education);
      setExperience(candidate.experience);
      setCertifications(candidate.certifications);
      setProjects(candidate.projects);
      setResumeFileName(candidate.resumeFileName || 'Resume.pdf');
    }
  }, [candidate]);

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
      }
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;
    setLoading(true);
    try {
      await api.updateCandidate(candidate.id, {
        fullName,
        email,
        phone,
        dob,
        address,
        summary,
        photoUrl,
        skills,
        education,
        experience,
        certifications,
        projects,
        resumeFileName,
      });
      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert('Error saving profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    setTimeout(async () => {
      setResumeFileName(file.name);
      if (candidate) {
        await api.uploadResume(candidate.id, {
          fileName: file.name,
          fileType: file.type || 'application/pdf',
          textContent: `${fullName} - ${summary}. Skills: ${skills.join(', ')}. Experience: ${experience.map(exp => `${exp.title} at ${exp.company}`).join('; ')}`,
        });
      }
      setUploadingResume(false);
      alert(`Resume "${file.name}" uploaded and parsed into candidate profile.`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">My Candidate Profile & CV</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep your credentials, verified skills, visual appearance, and resume updated for automated AI screening
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Candidate profile updated successfully! All new applications will reflect this information.
        </div>
      )}

      {/* User-selectable dark mode toggle in User Profile */}
      <ThemeSelectorCard
        title="My Profile Display & Dark Mode Preference"
        description="Choose your personal visual theme preference. Switches seamlessly between light and dark modes."
      />

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Personal Details Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Personal & Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Current Address & City</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Professional Summary</label>
            <textarea
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Highlight your background, core technical specialties, and career objectives..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-3 text-xs"
            />
          </div>
        </div>

        {/* Skills Tag Management */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Skills & Competencies
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            These skills are directly evaluated by Gemini AI against required job skills when you apply.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {skills.map(s => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800"
              >
                {s}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s)}
                  className="rounded hover:text-indigo-950 dark:hover:text-white"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="pt-2">
            <input
              type="text"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="Type a skill and press Enter to add (e.g. Python, Docker, Figma)..."
              className="w-full sm:w-96 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
            />
          </div>
        </div>

        {/* Resume Attachment Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Resume / CV Document
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload your latest resume (PDF, DOC, DOCX). Our AI will extract key milestones automatically.
          </p>

          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 dark:bg-indigo-950 p-2 text-indigo-600 dark:text-indigo-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{resumeFileName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Synced for automated vacancy matching</p>
              </div>
            </div>

            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <Upload className="h-3.5 w-3.5" />
                <span>{uploadingResume ? 'Processing...' : 'Upload New Resume'}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleSimulatedFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Work Experience */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Work Experience ({experience.length})
            </h3>
            <button
              type="button"
              onClick={() =>
                setExperience([
                  ...experience,
                  { title: 'Software Developer', company: 'Company Name', duration: '2020 - 2022', description: 'Engineered web applications.' },
                ])
              }
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Position
            </button>
          </div>

          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/40 dark:bg-slate-800/40">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <input
                      type="text"
                      value={exp.title}
                      onChange={e => {
                        const copy = [...experience];
                        copy[idx].title = e.target.value;
                        setExperience(copy);
                      }}
                      placeholder="Job Title"
                      className="rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2 text-xs font-semibold"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={e => {
                        const copy = [...experience];
                        copy[idx].company = e.target.value;
                        setExperience(copy);
                      }}
                      placeholder="Company"
                      className="rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2 text-xs"
                    />
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={e => {
                        const copy = [...experience];
                        copy[idx].duration = e.target.value;
                        setExperience(copy);
                      }}
                      placeholder="e.g. 2022 - Present"
                      className="rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                    className="p-1.5 text-slate-400 hover:text-rose-600 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={exp.description}
                  onChange={e => {
                    const copy = [...experience];
                    copy[idx].description = e.target.value;
                    setExperience(copy);
                  }}
                  placeholder="Key contributions and technologies used..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Education History */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Education History ({education.length})
            </h3>
            <button
              type="button"
              onClick={() =>
                setEducation([
                  ...education,
                  { degree: 'B.S. in Computer Science', institution: 'University', year: '2020', grade: '3.7 GPA' },
                ])
              }
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Education
            </button>
          </div>

          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/40 dark:bg-slate-800/40">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1 text-xs">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={e => {
                      const copy = [...education];
                      copy[idx].degree = e.target.value;
                      setEducation(copy);
                    }}
                    placeholder="Degree"
                    className="rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2 font-semibold"
                  />
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={e => {
                      const copy = [...education];
                      copy[idx].institution = e.target.value;
                      setEducation(copy);
                    }}
                    placeholder="Institution / University"
                    className="rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2"
                  />
                  <input
                    type="text"
                    value={edu.year}
                    onChange={e => {
                      const copy = [...education];
                      copy[idx].year = e.target.value;
                      setEducation(copy);
                    }}
                    placeholder="Graduation Year"
                    className="rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2"
                  />
                  <input
                    type="text"
                    value={edu.grade || ''}
                    onChange={e => {
                      const copy = [...education];
                      copy[idx].grade = e.target.value;
                      setEducation(copy);
                    }}
                    placeholder="Grade / GPA"
                    className="rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                  className="p-1.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
