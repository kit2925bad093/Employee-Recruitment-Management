import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db, User, Candidate, Vacancy, Application, Interview, InterviewFeedback, Offer, Employee, Department } from './server/db.js';
import { generateToken, authenticateToken, requireRoles, optionalAuth, AuthenticatedRequest } from './server/auth.js';
import { screenResumeWithAi } from './server/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const portArgIndex = process.argv.indexOf('--port');
const portArg = portArgIndex !== -1 ? process.argv[portArgIndex + 1] : null;
const hostArgIndex = process.argv.indexOf('--host');
const hostArg = hostArgIndex !== -1 ? process.argv[hostArgIndex + 1] : null;

// In dev environment, always prefer port 3000 unless specified via CLI flag; avoid binding to container PORT (8080)
const PORT = Number(portArg) || (process.env.NODE_ENV === 'production' ? (Number(process.env.PORT) || 8080) : 3000);
const HOST = hostArg || '0.0.0.0';

app.use(express.json({ limit: '15mb' }));

// ----------------------------------------------------
// 1. AUTHENTICATION CONTROLLER & USER MANAGEMENT
// ----------------------------------------------------

// POST /api/auth/register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, fullName, role: requestedRole = 'CANDIDATE' } = req.body;
  const allowedRoles: User['role'][] = ['ADMIN', 'HR', 'INTERVIEWER', 'CANDIDATE'];

  if (!allowedRoles.includes(requestedRole)) {
    return res.status(400).json({ error: 'Invalid account type.' });
  }

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const newUser: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: email.toLowerCase(),
    passwordHash: password,
    fullName,
    role: requestedRole,
    status: 'ACTIVE',
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=4f46e5,06b6d4,10b981`,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  let candidateRecord: Candidate | undefined;
  if (requestedRole === 'CANDIDATE') {
    candidateRecord = {
      id: `cand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: '',
      dob: '',
      address: '',
      education: [],
      skills: [],
      certifications: [],
      experience: [],
      projects: [],
      photoUrl: newUser.avatarUrl,
      summary: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.candidates.push(candidateRecord);
  }

  db.logAudit(newUser.id, newUser.fullName, newUser.role, 'USER_REGISTERED', 'User', newUser.id, 'None', newUser.email);
  db.sendNotification('Welcome to TalentPulse!', `Hello ${fullName}, your account has been registered.`, 'SUCCESS', { userId: newUser.id });

  const token = generateToken(newUser);
  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      departmentId: newUser.departmentId,
      departmentName: newUser.departmentName,
      avatarUrl: newUser.avatarUrl,
    },
    candidate: candidateRecord,
  });
});

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== password || (role && user.role !== role)) {
    return res.status(401).json({ error: 'Invalid account type, email, or password.' });
  }

  if (user.status === 'INACTIVE') {
    return res.status(403).json({ error: 'Account is deactivated. Please contact HR or System Administrator.' });
  }

  const candidate = db.candidates.find(c => c.userId === user.id) ||
    db.candidates.find(c => c.email.toLowerCase() === user.email.toLowerCase());
  const token = generateToken(user);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      departmentId: user.departmentId,
      departmentName: user.departmentName,
      avatarUrl: user.avatarUrl,
    },
    candidate,
  });
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find(u => u.id === req.user?.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const candidate = db.candidates.find(c => c.userId === user.id) ||
    db.candidates.find(c => c.email.toLowerCase() === user.email.toLowerCase());
  res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      departmentId: user.departmentId,
      departmentName: user.departmentName,
      avatarUrl: user.avatarUrl,
      status: user.status,
    },
    candidate,
  });
});

// ----------------------------------------------------
// 2. VACANCY MANAGEMENT
// ----------------------------------------------------

// GET /api/vacancies
app.get('/api/vacancies', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { search, department, location, employmentType, status } = req.query;

  let results = [...db.vacancies];

  // Candidates only see 'Open' vacancies by default
  const isInternal = req.user && ['ADMIN', 'HR', 'INTERVIEWER'].includes(req.user.role);
  if (!isInternal && !status) {
    results = results.filter(v => v.status === 'Open');
  } else if (status && typeof status === 'string' && status !== 'All') {
    results = results.filter(v => v.status.toLowerCase() === status.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      v =>
        v.title.toLowerCase().includes(q) ||
        v.jobId.toLowerCase().includes(q) ||
        v.requiredSkills.some(s => s.toLowerCase().includes(q)) ||
        v.description.toLowerCase().includes(q)
    );
  }

  if (department && typeof department === 'string' && department !== 'All') {
    results = results.filter(v => v.departmentId === department || v.departmentName === department);
  }

  if (location && typeof location === 'string' && location !== 'All') {
    results = results.filter(v => v.location.toLowerCase().includes(location.toLowerCase()));
  }

  if (employmentType && typeof employmentType === 'string' && employmentType !== 'All') {
    results = results.filter(v => v.employmentType.toLowerCase() === employmentType.toLowerCase());
  }

  res.json(results);
});

// GET /api/vacancies/:id
app.get('/api/vacancies/:id', (req: Request, res: Response) => {
  const vacancy = db.vacancies.find(v => v.id === req.params.id || v.jobId === req.params.id);
  if (!vacancy) {
    return res.status(404).json({ error: 'Vacancy not found.' });
  }

  // Include application count for recruiters
  const appCount = db.applications.filter(a => a.vacancyId === vacancy.id).length;
  res.json({ ...vacancy, applicationCount: appCount });
});

// POST /api/vacancies (Admin & HR)
app.post('/api/vacancies', authenticateToken, requireRoles(['ADMIN', 'HR']), (req: AuthenticatedRequest, res: Response) => {
  const {
    title,
    departmentId,
    location,
    employmentType = 'Full-time',
    salaryRange,
    requiredQualification,
    requiredExperience,
    requiredSkills = [],
    description,
    responsibilities = [],
    numberOfOpenings = 1,
    openingDate = new Date().toISOString().split('T')[0],
    closingDate,
    status = 'Open',
  } = req.body;

  if (!title || !departmentId || !salaryRange || !description) {
    return res.status(400).json({ error: 'Title, department, salary range, and description are required.' });
  }

  const dept = db.departments.find(d => d.id === departmentId);
  const nextJobNum = db.vacancies.length + 1;
  const jobId = `VAC-2026-${String(nextJobNum).padStart(3, '0')}`;

  const newVacancy: Vacancy = {
    id: `vac-${Date.now()}`,
    jobId,
    title,
    departmentId,
    departmentName: dept?.name || 'General Operations',
    location: location || 'Headquarters / Hybrid',
    employmentType,
    salaryRange,
    requiredQualification: requiredQualification || 'Bachelor’s degree or relevant industry experience',
    requiredExperience: requiredExperience || '3+ years',
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map((s: string) => s.trim()),
    description,
    responsibilities: Array.isArray(responsibilities) ? responsibilities : [responsibilities],
    numberOfOpenings: Number(numberOfOpenings) || 1,
    openingDate,
    closingDate: closingDate || '2026-12-31',
    status,
    createdBy: req.user!.fullName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.vacancies.unshift(newVacancy);

  db.logAudit(
    req.user!.userId,
    req.user!.fullName,
    req.user!.role,
    'CREATE_VACANCY',
    'Vacancy',
    newVacancy.jobId,
    'None',
    newVacancy.title,
    `Created new vacancy in ${newVacancy.departmentName} with ${newVacancy.numberOfOpenings} opening(s).`
  );

  db.sendNotification('New Vacancy Posted', `New job vacancy "${newVacancy.title}" is now ${newVacancy.status}.`, 'INFO', { targetRole: 'CANDIDATE' });

  res.status(201).json(newVacancy);
});

// PUT /api/vacancies/:id
app.put('/api/vacancies/:id', authenticateToken, requireRoles(['ADMIN', 'HR']), (req: AuthenticatedRequest, res: Response) => {
  const index = db.vacancies.findIndex(v => v.id === req.params.id || v.jobId === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Vacancy not found.' });
  }

  const prev = db.vacancies[index];
  const { departmentId, ...rest } = req.body;
  const dept = departmentId ? db.departments.find(d => d.id === departmentId) : null;

  const updated: Vacancy = {
    ...prev,
    ...rest,
    departmentId: departmentId || prev.departmentId,
    departmentName: dept?.name || prev.departmentName,
    updatedAt: new Date().toISOString(),
  };

  db.vacancies[index] = updated;

  db.logAudit(
    req.user!.userId,
    req.user!.fullName,
    req.user!.role,
    'UPDATE_VACANCY',
    'Vacancy',
    updated.jobId,
    prev.title,
    updated.title,
    `Status: ${updated.status}`
  );

  res.json(updated);
});

// DELETE /api/vacancies/:id
app.delete('/api/vacancies/:id', authenticateToken, requireRoles(['ADMIN', 'HR']), (req: AuthenticatedRequest, res: Response) => {
  const index = db.vacancies.findIndex(v => v.id === req.params.id || v.jobId === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Vacancy not found.' });
  }

  const deleted = db.vacancies.splice(index, 1)[0];
  db.logAudit(req.user!.userId, req.user!.fullName, req.user!.role, 'DELETE_VACANCY', 'Vacancy', deleted.jobId, deleted.title, 'Deleted');

  res.json({ message: `Vacancy ${deleted.jobId} deleted successfully.` });
});

// ----------------------------------------------------
// 3. CANDIDATE PROFILE & RESUME MANAGEMENT
// ----------------------------------------------------

// GET /api/candidates
app.get('/api/candidates', authenticateToken, requireRoles(['ADMIN', 'HR', 'INTERVIEWER']), (req: Request, res: Response) => {
  const { search, skill } = req.query;
  let candidates = [...db.candidates];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    candidates = candidates.filter(
      c =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.skills.some(s => s.toLowerCase().includes(q))
    );
  }

  if (skill && typeof skill === 'string') {
    candidates = candidates.filter(c => c.skills.some(s => s.toLowerCase().includes(skill.toLowerCase())));
  }

  res.json(candidates);
});

// GET /api/candidates/:id
app.get('/api/candidates/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const candidate = db.candidates.find(c => c.id === req.params.id || c.userId === req.params.id);
  if (!candidate) {
    return res.status(404).json({ error: 'Candidate profile not found.' });
  }

  // Candidate can only view their own unless HR/Admin/Interviewer
  const isPrivileged = ['ADMIN', 'HR', 'INTERVIEWER'].includes(req.user!.role);
  if (!isPrivileged && req.user!.userId !== candidate.userId) {
    return res.status(403).json({ error: 'Access forbidden to this candidate profile.' });
  }

  // Include recent applications
  const applications = db.applications.filter(a => a.candidateId === candidate.id);
  res.json({ ...candidate, applications });
});

// PUT /api/candidates/:id
app.put('/api/candidates/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const index = db.candidates.findIndex(c => c.id === req.params.id || c.userId === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Candidate profile not found.' });
  }

  const existing = db.candidates[index];
  const isPrivileged = ['ADMIN', 'HR'].includes(req.user!.role);
  if (!isPrivileged && req.user!.userId !== existing.userId) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const updatedCandidate: Candidate = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  db.candidates[index] = updatedCandidate;

  // Sync user fullName if modified
  const userIdx = db.users.findIndex(u => u.id === updatedCandidate.userId);
  if (userIdx !== -1 && req.body.fullName) {
    db.users[userIdx].fullName = req.body.fullName;
  }

  db.logAudit(req.user!.userId, req.user!.fullName, req.user!.role, 'UPDATE_PROFILE', 'Candidate', updatedCandidate.id, 'Previous Info', 'Updated Info');

  res.json(updatedCandidate);
});

// POST /api/candidates/:id/resume (Resume upload & simulated text extractor)
app.post('/api/candidates/:id/resume', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { fileName, fileType, textContent, dataUrl } = req.body;
  const candidate = db.candidates.find(c => c.id === req.params.id || c.userId === req.params.id);

  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found.' });
  }

  const resumeId = `res-${Date.now()}`;
  const extractedText = textContent || `${candidate.fullName} - Professional Resume. Skills: ${candidate.skills.join(', ')}. Experience: ${candidate.experience.map(e => `${e.title} at ${e.company}`).join('; ')}`;

  db.resumes.push({
    id: resumeId,
    candidateId: candidate.id,
    fileName: fileName || 'Resume_Document.pdf',
    fileType: fileType || 'application/pdf',
    fileSize: 1024 * 142,
    uploadDate: new Date().toISOString(),
    textContent: extractedText,
    dataUrl: dataUrl || '',
  });

  candidate.resumeId = resumeId;
  candidate.resumeFileName = fileName || 'Resume_Document.pdf';
  candidate.resumeText = extractedText;
  candidate.updatedAt = new Date().toISOString();

  db.logAudit(req.user!.userId, req.user!.fullName, req.user!.role, 'UPLOADED_RESUME', 'Resume', resumeId, 'None', fileName);

  res.json({
    message: 'Resume uploaded and processed successfully.',
    resumeFileName: candidate.resumeFileName,
    resumeId,
  });
});

// ----------------------------------------------------
// 4. APPLICATION MANAGEMENT & LIFECYCLE
// ----------------------------------------------------

// GET /api/applications
app.get('/api/applications', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { candidateId, vacancyId, status, department } = req.query;

  let apps = [...db.applications];

  // Candidates only see their own applications
  if (req.user!.role === 'CANDIDATE') {
    const candidate = db.candidates.find(c => c.userId === req.user!.userId);
    apps = apps.filter(a => a.candidateId === candidate?.id || a.candidateEmail === req.user!.email);
  } else if (candidateId && typeof candidateId === 'string') {
    apps = apps.filter(a => a.candidateId === candidateId);
  }

  if (vacancyId && typeof vacancyId === 'string') {
    apps = apps.filter(a => a.vacancyId === vacancyId);
  }

  if (status && typeof status === 'string' && status !== 'All') {
    apps = apps.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }

  if (department && typeof department === 'string' && department !== 'All') {
    apps = apps.filter(a => a.departmentName.toLowerCase() === department.toLowerCase());
  }

  res.json(apps);
});

// GET /api/applications/:id
app.get('/api/applications/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const appItem = db.applications.find(a => a.id === req.params.id || a.applicationId === req.params.id);
  if (!appItem) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  // Restrict candidate access to their own application
  if (req.user!.role === 'CANDIDATE' && appItem.candidateEmail !== req.user!.email) {
    const candidate = db.candidates.find(c => c.userId === req.user!.userId);
    if (!candidate || candidate.id !== appItem.candidateId) {
      return res.status(403).json({ error: 'Access denied.' });
    }
  }

  // Include associated interviews & offer if any
  const interviews = db.interviews.filter(i => i.applicationId === appItem.id);
  const offer = db.offers.find(o => o.applicationId === appItem.id);
  const vacancy = db.vacancies.find(v => v.id === appItem.vacancyId);

  res.json({
    ...appItem,
    interviews,
    offer,
    vacancy,
  });
});

// POST /api/applications (Apply for job)
app.post('/api/applications', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { vacancyId, coverNote = '' } = req.body;

  if (!vacancyId) {
    return res.status(400).json({ error: 'Vacancy ID is required.' });
  }

  const vacancy = db.vacancies.find(v => v.id === vacancyId || v.jobId === vacancyId);
  if (!vacancy) {
    return res.status(404).json({ error: 'Vacancy not found.' });
  }

  if (vacancy.status !== 'Open') {
    return res.status(400).json({ error: `Cannot apply: Vacancy status is currently "${vacancy.status}". Only "Open" vacancies accept applications.` });
  }

  // Locate candidate profile
  let candidate = db.candidates.find(c => c.userId === req.user!.userId || c.email.toLowerCase() === req.user!.email.toLowerCase());
  if (!candidate) {
    // Auto-create candidate profile from user info if not present
    candidate = {
      id: `cand-${Date.now()}`,
      userId: req.user!.userId,
      fullName: req.user!.fullName,
      email: req.user!.email,
      phone: '',
      dob: '',
      address: '',
      education: [],
      skills: [],
      certifications: [],
      experience: [],
      projects: [],
      photoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.user!.fullName)}`,
      summary: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.candidates.push(candidate);
  }

  // Prevent duplicate application
  const existingApp = db.applications.find(
    a => a.vacancyId === vacancy.id && (a.candidateId === candidate!.id || a.candidateEmail.toLowerCase() === candidate!.email.toLowerCase())
  );
  if (existingApp) {
    return res.status(409).json({
      error: `You have already applied for "${vacancy.title}" on ${new Date(existingApp.appliedDate).toLocaleDateString()}. Application ID: ${existingApp.applicationId}.`,
    });
  }

  const appSeq = db.applications.length + 1;
  const applicationId = `APP-2026-${String(appSeq).padStart(3, '0')}`;

  const newApp: Application = {
    id: `app-${Date.now()}`,
    applicationId,
    vacancyId: vacancy.id,
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    candidateEmail: candidate.email,
    candidatePhone: candidate.phone,
    jobTitle: vacancy.title,
    departmentName: vacancy.departmentName,
    status: 'Applied',
    appliedDate: new Date().toISOString(),
    coverNote,
    recruiterNotes: 'New application received. Automated screening ready.',
    resumeFileName: candidate.resumeFileName || 'Candidate_Profile.pdf',
    statusHistory: [
      {
        status: 'Applied',
        timestamp: new Date().toISOString(),
        note: 'Candidate submitted application online.',
        changedBy: candidate.fullName,
      },
    ],
  };

  // Perform immediate baseline AI resume screening in background
  try {
    const aiResult = await screenResumeWithAi(vacancy, candidate);
    newApp.aiScreening = aiResult;
    newApp.matchScore = aiResult.overallMatchPercentage;
  } catch (aiErr) {
    console.warn('Initial AI screening fallback triggered:', aiErr);
  }

  db.applications.unshift(newApp);

  // Notifications & Audit
  db.sendNotification(
    'Application Received',
    `Your application for ${vacancy.title} (${applicationId}) has been received successfully!`,
    'SUCCESS',
    { userId: req.user!.userId, link: '/candidate/applications' }
  );

  db.sendNotification(
    'New Application Received',
    `${candidate.fullName} applied for ${vacancy.title}. AI Match Score: ${newApp.matchScore || 'N/A'}%`,
    'INFO',
    { targetRole: 'HR', link: '/hr/applications' }
  );

  db.logAudit(
    req.user!.userId,
    req.user!.fullName,
    req.user!.role,
    'SUBMIT_APPLICATION',
    'Application',
    newApp.applicationId,
    'None',
    'Applied',
    `Candidate applied for ${vacancy.title}`
  );

  res.status(201).json(newApp);
});

// PUT /api/applications/:id/status (Recruiter updates status)
app.put('/api/applications/:id/status', authenticateToken, requireRoles(['ADMIN', 'HR']), (req: AuthenticatedRequest, res: Response) => {
  const { status, note = '' } = req.body;
  const validStatuses = [
    'Applied',
    'Under Review',
    'Shortlisted',
    'Interview Scheduled',
    'Interview Completed',
    'Selected',
    'Rejected',
    'Withdrawn',
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Valid values: ${validStatuses.join(', ')}` });
  }

  const appItem = db.applications.find(a => a.id === req.params.id || a.applicationId === req.params.id);
  if (!appItem) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  const prevStatus = appItem.status;
  appItem.status = status;
  appItem.statusHistory.push({
    status,
    timestamp: new Date().toISOString(),
    note: note || `Status updated to ${status} by ${req.user!.fullName}`,
    changedBy: req.user!.fullName,
  });

  // Candidate Notification
  const candidateUser = db.users.find(u => u.email.toLowerCase() === appItem.candidateEmail.toLowerCase());
  let notifType: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' = 'INFO';
  if (status === 'Shortlisted' || status === 'Selected') notifType = 'SUCCESS';
  if (status === 'Rejected') notifType = 'WARNING';

  db.sendNotification(
    `Application Status Update: ${status}`,
    `Your application for ${appItem.jobTitle} is now marked as "${status}".`,
    notifType,
    { userId: candidateUser?.id, link: '/candidate/applications' }
  );

  db.logAudit(
    req.user!.userId,
    req.user!.fullName,
    req.user!.role,
    'STATUS_CHANGE',
    'Application',
    appItem.applicationId,
    prevStatus,
    status,
    note
  );

  res.json(appItem);
});

// PUT /api/applications/:id/notes (Recruiter adds internal notes)
app.put('/api/applications/:id/notes', authenticateToken, requireRoles(['ADMIN', 'HR']), (req: AuthenticatedRequest, res: Response) => {
  const { notes } = req.body;
  const appItem = db.applications.find(a => a.id === req.params.id || a.applicationId === req.params.id);
  if (!appItem) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  appItem.recruiterNotes = notes;
  res.json(appItem);
});

// POST /api/applications/:id/screen (Triggers on-demand AI Resume Screening)
app.post('/api/applications/:id/screen', authenticateToken, requireRoles(['ADMIN', 'HR']), async (req: AuthenticatedRequest, res: Response) => {
  const appItem = db.applications.find(a => a.id === req.params.id || a.applicationId === req.params.id);
  if (!appItem) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  const vacancy = db.vacancies.find(v => v.id === appItem.vacancyId);
  const candidate = db.candidates.find(c => c.id === appItem.candidateId);

  if (!vacancy || !candidate) {
    return res.status(400).json({ error: 'Associated vacancy or candidate record missing.' });
  }

  try {
    const aiResult = await screenResumeWithAi(vacancy, candidate, req.body.customResumeText);
    appItem.aiScreening = aiResult;
    appItem.matchScore = aiResult.overallMatchPercentage;

    db.logAudit(
      req.user!.userId,
      req.user!.fullName,
      req.user!.role,
      'AI_SCREEN_RESUME',
      'Application',
      appItem.applicationId,
      'Unscreened',
      `${aiResult.overallMatchPercentage}% Match (${aiResult.aiRecommendation})`
    );

    res.json(aiResult);
  } catch (err: any) {
    res.status(500).json({ error: 'AI screening failed: ' + err.message });
  }
});

// ----------------------------------------------------
// 5. INTERVIEW MANAGEMENT & INTERVIEWER SCORECARDS
// ----------------------------------------------------

// GET /api/interviews
app.get('/api/interviews', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { interviewerId, status, date } = req.query;

  let interviews = [...db.interviews];

  if (req.user!.role === 'INTERVIEWER') {
    // Show interviews assigned to this interviewer
    interviews = interviews.filter(i => i.interviewerId === req.user!.userId || i.interviewerEmail.toLowerCase() === req.user!.email.toLowerCase());
  } else if (req.user!.role === 'CANDIDATE') {
    // Show interviews for this candidate
    interviews = interviews.filter(i => i.candidateEmail.toLowerCase() === req.user!.email.toLowerCase());
  } else if (interviewerId && typeof interviewerId === 'string') {
    interviews = interviews.filter(i => i.interviewerId === interviewerId);
  }

  if (status && typeof status === 'string' && status !== 'All') {
    interviews = interviews.filter(i => i.status.toLowerCase() === status.toLowerCase());
  }

  if (date && typeof date === 'string') {
    interviews = interviews.filter(i => i.scheduledDate === date);
  }

  // Attach feedback if exists
  const enriched = interviews.map(i => {
    const feedback = db.interviewFeedbacks.find(f => f.interviewId === i.id);
    return { ...i, feedback };
  });

  res.json(enriched);
});

// POST /api/interviews (HR schedules interview)
app.post('/api/interviews', authenticateToken, requireRoles(['ADMIN', 'HR']), (req: AuthenticatedRequest, res: Response) => {
  const {
    applicationId,
    interviewerId,
    scheduledDate,
    scheduledTime,
    durationMinutes = 60,
    type = 'Technical',
    meetingLinkOrLocation,
    notes = '',
  } = req.body;

  const appItem = db.applications.find(a => a.id === applicationId || a.applicationId === applicationId);
  if (!appItem) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  const interviewer = db.users.find(u => u.id === interviewerId);
  if (!interviewer) {
    return res.status(404).json({ error: 'Selected interviewer not found.' });
  }

  const intSeq = db.interviews.length + 1;
  const interviewId = `INT-2026-${String(intSeq).padStart(3, '0')}`;

  const newInterview: Interview = {
    id: `int-${Date.now()}`,
    interviewId,
    applicationId: appItem.id,
    candidateId: appItem.candidateId,
    candidateName: appItem.candidateName,
    candidateEmail: appItem.candidateEmail,
    vacancyId: appItem.vacancyId,
    jobTitle: appItem.jobTitle,
    interviewerId: interviewer.id,
    interviewerName: interviewer.fullName,
    interviewerEmail: interviewer.email,
    scheduledDate,
    scheduledTime,
    durationMinutes: Number(durationMinutes) || 60,
    type,
    meetingLinkOrLocation: meetingLinkOrLocation || 'https://meet.google.com/talent-interview-room',
    status: 'Scheduled',
    notes,
    createdAt: new Date().toISOString(),
  };

  db.interviews.unshift(newInterview);

  // Update application status to Interview Scheduled
  appItem.status = 'Interview Scheduled';
  appItem.statusHistory.push({
    status: 'Interview Scheduled',
    timestamp: new Date().toISOString(),
    note: `${type} interview scheduled with ${interviewer.fullName} on ${scheduledDate} at ${scheduledTime}`,
    changedBy: req.user!.fullName,
  });

  // Notifications
  const candidateUser = db.users.find(u => u.email.toLowerCase() === appItem.candidateEmail.toLowerCase());
  db.sendNotification(
    'Interview Scheduled',
    `Your ${type} interview for ${appItem.jobTitle} is set for ${scheduledDate} at ${scheduledTime}. Meeting link: ${newInterview.meetingLinkOrLocation}`,
    'INFO',
    { userId: candidateUser?.id, link: '/candidate/interviews' }
  );

  db.sendNotification(
    'Interview Assigned',
    `You are scheduled to interview ${appItem.candidateName} for ${appItem.jobTitle} on ${scheduledDate} at ${scheduledTime}.`,
    'INFO',
    { userId: interviewer.id, link: '/interviewer/interviews' }
  );

  db.logAudit(
    req.user!.userId,
    req.user!.fullName,
    req.user!.role,
    'SCHEDULE_INTERVIEW',
    'Interview',
    newInterview.interviewId,
    'None',
    `${scheduledDate} ${scheduledTime} (${type})`,
    `Interviewer: ${interviewer.fullName}, Candidate: ${appItem.candidateName}`
  );

  res.status(201).json(newInterview);
});

// PUT /api/interviews/:id (Reschedule or update)
app.put('/api/interviews/:id', authenticateToken, requireRoles(['ADMIN', 'HR', 'INTERVIEWER']), (req: AuthenticatedRequest, res: Response) => {
  const interview = db.interviews.find(i => i.id === req.params.id || i.interviewId === req.params.id);
  if (!interview) {
    return res.status(404).json({ error: 'Interview not found.' });
  }

  const prev = { ...interview };
  Object.assign(interview, req.body);

  if (req.body.scheduledDate || req.body.scheduledTime) {
    interview.status = 'Rescheduled';
    db.sendNotification(
      'Interview Rescheduled',
      `Your interview for ${interview.jobTitle} has been rescheduled to ${interview.scheduledDate} at ${interview.scheduledTime}.`,
      'WARNING',
      { link: '/candidate/interviews' }
    );
  }

  db.logAudit(
    req.user!.userId,
    req.user!.fullName,
    req.user!.role,
    'RESCHEDULE_INTERVIEW',
    'Interview',
    interview.interviewId,
    `${prev.scheduledDate} ${prev.scheduledTime}`,
    `${interview.scheduledDate} ${interview.scheduledTime}`
  );

  res.json(interview);
});

// POST /api/interviews/:id/cancel
app.post('/api/interviews/:id/cancel', authenticateToken, requireRoles(['ADMIN', 'HR']), (req: AuthenticatedRequest, res: Response) => {
  const interview = db.interviews.find(i => i.id === req.params.id || i.interviewId === req.params.id);
  if (!interview) {
    return res.status(404).json({ error: 'Interview not found.' });
  }

  interview.status = 'Cancelled';
  db.sendNotification(
    'Interview Cancelled',
    `The interview scheduled for ${interview.scheduledDate} has been cancelled.`,
    'WARNING',
    { link: '/candidate/interviews' }
  );

  db.logAudit(req.user!.userId, req.user!.fullName, req.user!.role, 'CANCEL_INTERVIEW', 'Interview', interview.interviewId, 'Scheduled', 'Cancelled');

  res.json(interview);
});

// POST /api/interviews/:id/feedback (Interviewer scorecard submission)
app.post('/api/interviews/:id/feedback', authenticateToken, requireRoles(['ADMIN', 'HR', 'INTERVIEWER']), (req: AuthenticatedRequest, res: Response) => {
  const interview = db.interviews.find(i => i.id === req.params.id || i.interviewId === req.params.id);
  if (!interview) {
    return res.status(404).json({ error: 'Interview not found.' });
  }

  const {
    technicalSkillsRating,
    communicationRating,
    problemSolvingRating,
    teamworkRating,
    experienceRating,
    overallRating,
    comments,
    recommendation = 'Hire',
  } = req.body;

  const existingFeedbackIdx = db.interviewFeedbacks.findIndex(f => f.interviewId === interview.id);

  const feedbackData: InterviewFeedback = {
    id: existingFeedbackIdx !== -1 ? db.interviewFeedbacks[existingFeedbackIdx].id : `fb-${Date.now()}`,
    interviewId: interview.id,
    candidateId: interview.candidateId,
    applicationId: interview.applicationId,
    interviewerId: req.user!.userId,
    interviewerName: req.user!.fullName,
    technicalSkillsRating: Number(technicalSkillsRating) || 3,
    communicationRating: Number(communicationRating) || 3,
    problemSolvingRating: Number(problemSolvingRating) || 3,
    teamworkRating: Number(teamworkRating) || 3,
    experienceRating: Number(experienceRating) || 3,
    overallRating: Number(overallRating) || 3,
    comments: comments || '',
    recommendation,
    submittedAt: new Date().toISOString(),
  };

  if (existingFeedbackIdx !== -1) {
    db.interviewFeedbacks[existingFeedbackIdx] = feedbackData;
  } else {
    db.interviewFeedbacks.push(feedbackData);
  }

  // Mark interview completed
  interview.status = 'Completed';

  // Update application status to Interview Completed
  const appItem = db.applications.find(a => a.id === interview.applicationId);
  if (appItem && appItem.status === 'Interview Scheduled') {
    appItem.status = 'Interview Completed';
    appItem.statusHistory.push({
      status: 'Interview Completed',
      timestamp: new Date().toISOString(),
      note: `Interviewer ${req.user!.fullName} submitted evaluation (${recommendation}, Overall: ${overallRating}/5)`,
      changedBy: req.user!.fullName,
    });
  }

  db.sendNotification(
    'Interview Feedback Submitted',
    `${req.user!.fullName} evaluated ${interview.candidateName} for ${interview.jobTitle}. Verdict: ${recommendation}`,
    'INFO',
    { targetRole: 'HR', link: '/hr/applications' }
  );

  db.logAudit(
    req.user!.userId,
    req.user!.fullName,
    req.user!.role,
    'SUBMIT_FEEDBACK',
    'InterviewFeedback',
    feedbackData.id,
    'Pending',
    recommendation,
    `Overall Rating: ${overallRating}/5`
  );

  res.status(201).json(feedbackData);
});

// ----------------------------------------------------
// 6. OFFER MANAGEMENT & RECRUITMENT WORKFLOW
// ----------------------------------------------------

// GET /api/offers
app.get('/api/offers', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  let offers = [...db.offers];

  if (req.user!.role === 'CANDIDATE') {
    offers = offers.filter(o => o.candidateEmail.toLowerCase() === req.user!.email.toLowerCase());
  }

  res.json(offers);
});

// POST /api/offers (HR creates offer)
app.post('/api/offers', authenticateToken, requireRoles(['ADMIN', 'HR']), (req: AuthenticatedRequest, res: Response) => {
  const {
    applicationId,
    salary,
    joiningDate,
    benefits = [],
    expiryDate,
    offerLetterText,
  } = req.body;

  const appItem = db.applications.find(a => a.id === applicationId || a.applicationId === applicationId);
  if (!appItem) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  const offSeq = db.offers.length + 1;
  const offerId = `OFF-2026-${String(offSeq).padStart(3, '0')}`;

  const defaultBenefits = [
    'Comprehensive Healthcare, Dental, and Vision coverage (100% employer paid)',
    '401(k) Retirement Plan with 5% employer matching',
    'Unlimited Flexible Paid Time Off (PTO) + 12 Annual Public Holidays',
    '₹3,000 Annual Learning & Conference Budget',
    'Remote Work Stipend & Ergonomic Home Office Allowance (₹1,500)',
  ];

  const newOffer: Offer = {
    id: `off-${Date.now()}`,
    offerId,
    candidateId: appItem.candidateId,
    candidateName: appItem.candidateName,
    candidateEmail: appItem.candidateEmail,
    applicationId: appItem.id,
    jobTitle: appItem.jobTitle,
    departmentName: appItem.departmentName,
    salary: salary || '₹120,000 / year',
    joiningDate: joiningDate || '2026-11-15',
    benefits: Array.isArray(benefits) && benefits.length > 0 ? benefits : defaultBenefits,
    expiryDate: expiryDate || '2026-11-01',
    status: 'Sent',
    offerLetterText: offerLetterText || `Dear ${appItem.candidateName},\n\nWe are pleased to extend this formal offer of employment for the position of ${appItem.jobTitle} at TalentPulse. Your compensation package will be ${salary || '₹120,000 / year'} with expected start date on ${joiningDate || '2026-11-15'}.\n\nWe are confident your skills will make a significant impact on our organization.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.offers.unshift(newOffer);

  // Update application to Selected
  appItem.status = 'Selected';
  appItem.statusHistory.push({
    status: 'Selected',
    timestamp: new Date().toISOString(),
    note: `Formal offer ${offerId} generated and dispatched by ${req.user!.fullName}`,
    changedBy: req.user!.fullName,
  });

  // Notify Candidate
  const candUser = db.users.find(u => u.email.toLowerCase() === appItem.candidateEmail.toLowerCase());
  db.sendNotification(
    'Formal Job Offer Received!',
    `Congratulations! An official job offer for ${appItem.jobTitle} has been extended to you.`,
    'SUCCESS',
    { userId: candUser?.id, link: '/candidate/offers' }
  );

  db.logAudit(
    req.user!.userId,
    req.user!.fullName,
    req.user!.role,
    'GENERATE_OFFER',
    'Offer',
    newOffer.offerId,
    'Draft',
    'Sent',
    `Offered ${newOffer.salary} to ${newOffer.candidateName}`
  );

  res.status(201).json(newOffer);
});

// PUT /api/offers/:id/status (Accept / Reject / Expire)
app.put('/api/offers/:id/status', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  const offer = db.offers.find(o => o.id === req.params.id || o.offerId === req.params.id);
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found.' });
  }

  const prev = offer.status;
  offer.status = status;
  offer.updatedAt = new Date().toISOString();

  // If accepted, candidate is ready for employee onboarding
  if (status === 'Accepted') {
    db.sendNotification(
      'Job Offer Accepted!',
      `${offer.candidateName} has ACCEPTED the job offer for ${offer.jobTitle}! Proceed to Employee Onboarding.`,
      'SUCCESS',
      { targetRole: 'HR', link: '/hr/onboarding' }
    );
  }

  db.logAudit(
    req.user!.userId,
    req.user!.fullName,
    req.user!.role,
    'OFFER_STATUS_UPDATE',
    'Offer',
    offer.offerId,
    prev,
    status
  );

  res.json(offer);
});

// ----------------------------------------------------
// 7. EMPLOYEE ONBOARDING
// ----------------------------------------------------

// GET /api/employees
app.get('/api/employees', authenticateToken, requireRoles(['ADMIN', 'HR']), (req: Request, res: Response) => {
  res.json(db.employees);
});

// POST /api/employees/onboard (Converts candidate with accepted offer to Employee)
app.post('/api/employees/onboard', authenticateToken, requireRoles(['ADMIN', 'HR']), (req: AuthenticatedRequest, res: Response) => {
  const {
    candidateId,
    fullName,
    email,
    phone,
    department,
    designation,
    joiningDate,
    manager,
    employmentType = 'Full-time',
    salary,
    officeLocation = 'San Francisco, CA / Hybrid',
  } = req.body;

  if (!fullName || !department || !designation) {
    return res.status(400).json({ error: 'Full name, department, and designation are required.' });
  }

  const nextEmpNum = db.employees.length + 101;
  const employeeId = `EMP-${String(nextEmpNum).padStart(5, '0')}`;

  const newEmployee: Employee = {
    id: `emp-${Date.now()}`,
    employeeId,
    candidateId: candidateId || `cand-onboard-${Date.now()}`,
    fullName,
    email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@talentpulse.io`,
    phone: phone || '+1 (555) 010-9900',
    department,
    designation,
    joiningDate: joiningDate || new Date().toISOString().split('T')[0],
    manager: manager || 'Elena Rostova (VP Engineering)',
    employmentType,
    status: 'Onboarding',
    salary: salary || '₹135,000',
    officeLocation,
    createdAt: new Date().toISOString(),
  };

  db.employees.unshift(newEmployee);

  // Increment department employee count
  const dept = db.departments.find(d => d.name.toLowerCase() === department.toLowerCase());
  if (dept) {
    dept.employeeCount += 1;
  }

  db.sendNotification(
    'New Employee Onboarding',
    `${newEmployee.fullName} has been successfully onboarded as ${newEmployee.designation} (${newEmployee.employeeId}).`,
    'SUCCESS',
    { targetRole: 'HR', link: '/hr/employees' }
  );

  db.logAudit(
    req.user!.userId,
    req.user!.fullName,
    req.user!.role,
    'ONBOARD_EMPLOYEE',
    'Employee',
    newEmployee.employeeId,
    'Candidate',
    'Active Employee',
    `Onboarded to ${department} under ${newEmployee.manager}`
  );

  res.status(201).json(newEmployee);
});

// ----------------------------------------------------
// 8. DEPARTMENTS & ADMIN CONTROL
// ----------------------------------------------------

// GET /api/departments
app.get('/api/departments', (req: Request, res: Response) => {
  res.json(db.departments);
});

// POST /api/departments (Admin)
app.post('/api/departments', authenticateToken, requireRoles(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { code, name, description, managerName, location } = req.body;
  if (!code || !name) {
    return res.status(400).json({ error: 'Department code and name are required.' });
  }

  const newDept: Department = {
    id: `dept-${Date.now()}`,
    code: code.toUpperCase(),
    name,
    description: description || '',
    managerName: managerName || 'Unassigned',
    location: location || 'Corporate HQ',
    employeeCount: 0,
  };

  db.departments.push(newDept);
  db.logAudit(req.user!.userId, req.user!.fullName, req.user!.role, 'CREATE_DEPARTMENT', 'Department', newDept.id, 'None', newDept.name);

  res.status(201).json(newDept);
});

// PUT /api/departments/:id (Admin)
app.put('/api/departments/:id', authenticateToken, requireRoles(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const dept = db.departments.find(d => d.id === req.params.id);
  if (!dept) {
    return res.status(404).json({ error: 'Department not found.' });
  }

  Object.assign(dept, req.body);
  db.logAudit(req.user!.userId, req.user!.fullName, req.user!.role, 'UPDATE_DEPARTMENT', 'Department', dept.id, 'Previous', dept.name);

  res.json(dept);
});

// DELETE /api/departments/:id (Admin)
app.delete('/api/departments/:id', authenticateToken, requireRoles(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const index = db.departments.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Department not found.' });
  }

  const removed = db.departments.splice(index, 1)[0];
  db.logAudit(req.user!.userId, req.user!.fullName, req.user!.role, 'DELETE_DEPARTMENT', 'Department', removed.id, removed.name, 'Deleted');

  res.json({ message: `Department ${removed.name} removed successfully.` });
});

// GET /api/admin/users (Admin)
app.get('/api/admin/users', authenticateToken, requireRoles(['ADMIN']), (req: Request, res: Response) => {
  const sanitized = db.users.map(({ passwordHash, ...u }) => u);
  res.json(sanitized);
});

// PUT /api/admin/users/:id/status (Activate/Deactivate user)
app.put('/api/admin/users/:id/status', authenticateToken, requireRoles(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const prev = user.status;
  user.status = status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

  db.logAudit(req.user!.userId, req.user!.fullName, req.user!.role, 'USER_STATUS_CHANGE', 'User', user.id, prev, user.status);

  res.json({ id: user.id, email: user.email, status: user.status });
});

// PUT /api/admin/users/:id/role (Change user role)
app.put('/api/admin/users/:id/role', authenticateToken, requireRoles(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.body;
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const prev = user.role;
  user.role = role;

  db.logAudit(req.user!.userId, req.user!.fullName, req.user!.role, 'USER_ROLE_CHANGE', 'User', user.id, prev, user.role);

  res.json({ id: user.id, email: user.email, role: user.role });
});

// ----------------------------------------------------
// 9. RECRUITMENT DASHBOARD & ANALYTICS
// ----------------------------------------------------

// GET /api/dashboard/statistics
app.get('/api/dashboard/statistics', authenticateToken, requireRoles(['ADMIN', 'HR', 'INTERVIEWER']), (req: Request, res: Response) => {
  const totalEmployees = db.employees.length;
  const totalCandidates = db.candidates.length;
  const activeVacancies = db.vacancies.filter(v => v.status === 'Open').length;
  const totalVacancies = db.vacancies.length;
  const totalApplications = db.applications.length;
  const shortlistedCandidates = db.applications.filter(a => a.status === 'Shortlisted').length;
  const scheduledInterviews = db.interviews.filter(i => i.status === 'Scheduled' || i.status === 'Confirmed').length;
  const selectedCandidates = db.applications.filter(a => a.status === 'Selected').length;
  const pendingApplications = db.applications.filter(a => a.status === 'Applied' || a.status === 'Under Review').length;

  // Department application distribution
  const deptDist: Record<string, number> = {};
  for (const app of db.applications) {
    deptDist[app.departmentName] = (deptDist[app.departmentName] || 0) + 1;
  }

  // Vacancy application counts
  const vacancyCounts = db.vacancies.map(v => ({
    jobId: v.jobId,
    title: v.title,
    department: v.departmentName,
    count: db.applications.filter(a => a.vacancyId === v.id).length,
    openings: v.numberOfOpenings,
    status: v.status,
  }));

  // Status Funnel
  const statusFunnel = {
    Applied: db.applications.filter(a => a.status === 'Applied').length,
    'Under Review': db.applications.filter(a => a.status === 'Under Review').length,
    Shortlisted: db.applications.filter(a => a.status === 'Shortlisted').length,
    'Interview Scheduled': db.applications.filter(a => a.status === 'Interview Scheduled').length,
    'Interview Completed': db.applications.filter(a => a.status === 'Interview Completed').length,
    Selected: db.applications.filter(a => a.status === 'Selected').length,
    Rejected: db.applications.filter(a => a.status === 'Rejected').length,
  };

  res.json({
    metrics: {
      totalEmployees,
      totalCandidates,
      activeVacancies,
      totalVacancies,
      totalApplications,
      shortlistedCandidates,
      scheduledInterviews,
      selectedCandidates,
      pendingApplications,
      averageHiringDays: 18,
      offerAcceptanceRate: '94%',
    },
    departmentDistribution: deptDist,
    vacancyCounts,
    statusFunnel,
    recentAudits: db.auditLogs.slice(0, 8),
  });
});

// ----------------------------------------------------
// 10. AUDIT LOGS & NOTIFICATIONS
// ----------------------------------------------------

// GET /api/audit-logs
app.get('/api/audit-logs', authenticateToken, requireRoles(['ADMIN']), (req: Request, res: Response) => {
  const { action, entity, user } = req.query;
  let logs = [...db.auditLogs];

  if (action && typeof action === 'string' && action !== 'All') {
    logs = logs.filter(l => l.action.toLowerCase() === action.toLowerCase());
  }

  if (entity && typeof entity === 'string' && entity !== 'All') {
    logs = logs.filter(l => l.entity.toLowerCase() === entity.toLowerCase());
  }

  if (user && typeof user === 'string') {
    logs = logs.filter(l => l.userName.toLowerCase().includes(user.toLowerCase()));
  }

  res.json(logs);
});

// GET /api/notifications
app.get('/api/notifications', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const notifs = db.notifications.filter(
    n => !n.userId || n.userId === req.user!.userId || (n.targetRole && n.targetRole === req.user!.role)
  );
  res.json(notifs);
});

// PUT /api/notifications/:id/read
app.put('/api/notifications/:id/read', authenticateToken, (req: Request, res: Response) => {
  const n = db.notifications.find(item => item.id === req.params.id);
  if (n) {
    n.read = true;
  }
  res.json({ success: true });
});

// PUT /api/notifications/read-all
app.put('/api/notifications/read-all', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  db.notifications.forEach(n => {
    if (!n.userId || n.userId === req.user!.userId || (n.targetRole && n.targetRole === req.user!.role)) {
      n.read = true;
    }
  });
  res.json({ success: true });
});

// ----------------------------------------------------
// 11. POSTMAN COLLECTION & SPRING BOOT EXPORT
// ----------------------------------------------------

// GET /api/export/postman
app.get('/api/export/postman', (req: Request, res: Response) => {
  const postmanCollection = {
    info: {
      name: 'TalentPulse ERMS REST API Collection',
      _postman_id: 'talentpulse-erms-v1',
      description: 'Complete Postman API Collection for Employee Recruitment Management System with JWT authentication.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [
      {
        name: 'Auth',
        item: [
          {
            name: 'Register User',
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              url: '{{baseUrl}}/api/auth/register',
              body: {
                mode: 'raw',
                raw: JSON.stringify({ email: 'newcandidate@example.com', password: 'password123', fullName: 'Jordan Cole' }, null, 2),
              },
            },
          },
          {
            name: 'Login User',
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              url: '{{baseUrl}}/api/auth/login',
              body: {
                mode: 'raw',
                raw: JSON.stringify({ email: 'newcandidate@example.com', password: 'password123', role: 'CANDIDATE' }, null, 2),
              },
            },
          },
          {
            name: 'Current User Profile',
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
              url: '{{baseUrl}}/api/auth/me',
            },
          },
        ],
      },
      {
        name: 'Vacancies',
        item: [
          {
            name: 'List Vacancies',
            request: { method: 'GET', url: '{{baseUrl}}/api/vacancies' },
          },
          {
            name: 'Create Vacancy',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{token}}' },
              ],
              url: '{{baseUrl}}/api/vacancies',
              body: {
                mode: 'raw',
                raw: JSON.stringify(
                  {
                    title: 'Cloud Security Architect',
                    departmentId: 'dept-1',
                    location: 'Remote',
                    employmentType: 'Full-time',
                    salaryRange: '₹160,000 - ₹200,000',
                    requiredSkills: ['AWS', 'Kubernetes', 'Zero Trust', 'SOC 2', 'Terraform'],
                    description: 'Lead organization cloud security architecture and posture management.',
                    numberOfOpenings: 2,
                    status: 'Open',
                  },
                  null,
                  2
                ),
              },
            },
          },
        ],
      },
      {
        name: 'Applications',
        item: [
          {
            name: 'Submit Application',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{token}}' },
              ],
              url: '{{baseUrl}}/api/applications',
              body: {
                mode: 'raw',
                raw: JSON.stringify({ vacancyId: 'vac-1', coverNote: 'Excited about this opportunity!' }, null, 2),
              },
            },
          },
          {
            name: 'Trigger AI Resume Screening',
            request: {
              method: 'POST',
              header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
              url: '{{baseUrl}}/api/applications/app-1/screen',
            },
          },
        ],
      },
      {
        name: 'Interviews & Scorecards',
        item: [
          {
            name: 'Schedule Interview',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{token}}' },
              ],
              url: '{{baseUrl}}/api/interviews',
              body: {
                mode: 'raw',
                raw: JSON.stringify(
                  {
                    applicationId: 'app-1',
                    interviewerId: 'usr-interviewer',
                    scheduledDate: '2026-10-15',
                    scheduledTime: '10:00',
                    type: 'Technical',
                  },
                  null,
                  2
                ),
              },
            },
          },
          {
            name: 'Submit Interview Feedback Scorecard',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{token}}' },
              ],
              url: '{{baseUrl}}/api/interviews/int-1/feedback',
              body: {
                mode: 'raw',
                raw: JSON.stringify(
                  {
                    technicalSkillsRating: 5,
                    communicationRating: 4,
                    problemSolvingRating: 5,
                    teamworkRating: 5,
                    experienceRating: 5,
                    overallRating: 5,
                    recommendation: 'Strong Hire',
                    comments: 'Superb technical grounding and clear explanation.',
                  },
                  null,
                  2
                ),
              },
            },
          },
        ],
      },
      {
        name: 'Offers & Onboarding',
        item: [
          {
            name: 'Create Job Offer',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{token}}' },
              ],
              url: '{{baseUrl}}/api/offers',
              body: {
                mode: 'raw',
                raw: JSON.stringify(
                  {
                    applicationId: 'app-1',
                    salary: '₹165,000 / year',
                    joiningDate: '2026-11-15',
                  },
                  null,
                  2
                ),
              },
            },
          },
          {
            name: 'Onboard Employee',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{token}}' },
              ],
              url: '{{baseUrl}}/api/employees/onboard',
              body: {
                mode: 'raw',
                raw: JSON.stringify(
                  {
                    fullName: 'Alex Rivera',
                    department: 'Engineering',
                    designation: 'Senior Full Stack Engineer',
                    joiningDate: '2026-11-15',
                    manager: 'Elena Rostova (VP Engineering)',
                  },
                  null,
                  2
                ),
              },
            },
          },
        ],
      },
    ],
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="TalentPulse_ERMS_Postman_Collection.json"');
  res.json(postmanCollection);
});

// ----------------------------------------------------
// 12. VITE DEV SERVER / STATIC ASSET INTEGRATION
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), HOST, () => {
    console.log(`[TalentPulse ERMS] Server listening on http://${HOST}:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
