export type UserRole = 'ADMIN' | 'HR' | 'INTERVIEWER' | 'CANDIDATE';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  managerName: string;
  location: string;
  employeeCount: number;
}

export interface Vacancy {
  id: string;
  jobId: string;
  title: string;
  departmentId: string;
  departmentName: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid';
  salaryRange: string;
  requiredQualification: string;
  requiredExperience: string;
  requiredSkills: string[];
  description: string;
  responsibilities: string[];
  numberOfOpenings: number;
  openingDate: string;
  closingDate: string;
  status: 'Draft' | 'Open' | 'Closed' | 'On Hold' | 'Filled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  applicationCount?: number;
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  grade?: string;
}

export interface ExperienceItem {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  link?: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year: string;
}

export interface Candidate {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  education: EducationItem[];
  skills: string[];
  certifications: CertificationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  resumeId?: string;
  resumeFileName?: string;
  resumeUrl?: string;
  resumeText?: string;
  photoUrl: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  note: string;
  changedBy: string;
}

export interface AiScreeningResult {
  requiredSkills: string[];
  candidateSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  experienceMatch: string;
  overallMatchPercentage: number;
  strengths: string[];
  weaknesses: string[];
  aiRecommendation: string;
  analysisSummary: string;
  screenedAt: string;
}

export interface Application {
  id: string;
  applicationId: string;
  vacancyId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  jobTitle: string;
  departmentName: string;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Interview Completed' | 'Selected' | 'Rejected' | 'Withdrawn';
  appliedDate: string;
  coverNote: string;
  recruiterNotes: string;
  statusHistory: StatusHistoryEntry[];
  matchScore?: number;
  aiScreening?: AiScreeningResult;
  resumeFileName?: string;
}

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  candidateId: string;
  applicationId: string;
  interviewerId: string;
  interviewerName: string;
  technicalSkillsRating: number;
  communicationRating: number;
  problemSolvingRating: number;
  teamworkRating: number;
  experienceRating: number;
  overallRating: number;
  comments: string;
  recommendation: 'Strong Hire' | 'Hire' | 'Neutral' | 'Do Not Hire';
  submittedAt: string;
}

export interface Interview {
  id: string;
  interviewId: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  vacancyId: string;
  jobTitle: string;
  interviewerId: string;
  interviewerName: string;
  interviewerEmail: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  type: 'Online' | 'Offline' | 'Phone' | 'Technical' | 'HR' | 'Final';
  meetingLinkOrLocation: string;
  status: 'Scheduled' | 'Confirmed' | 'Rescheduled' | 'Completed' | 'Cancelled';
  notes: string;
  createdAt: string;
  feedback?: InterviewFeedback;
}

export interface Offer {
  id: string;
  offerId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  applicationId: string;
  jobTitle: string;
  departmentName: string;
  salary: string;
  joiningDate: string;
  benefits: string[];
  expiryDate: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
  offerLetterText: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  candidateId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  manager: string;
  employmentType: string;
  status: 'Active' | 'Onboarding' | 'Leave';
  salary: string;
  officeLocation: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  targetRole?: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  previousValue: string;
  newValue: string;
  details?: string;
}

export interface DashboardStatistics {
  metrics: {
    totalEmployees: number;
    totalCandidates: number;
    activeVacancies: number;
    totalVacancies: number;
    totalApplications: number;
    shortlistedCandidates: number;
    scheduledInterviews: number;
    selectedCandidates: number;
    pendingApplications: number;
    averageHiringDays: number;
    offerAcceptanceRate: string;
  };
  departmentDistribution: Record<string, number>;
  vacancyCounts: Array<{
    jobId: string;
    title: string;
    department: string;
    count: number;
    openings: number;
    status: string;
  }>;
  statusFunnel: Record<string, number>;
  recentAudits: AuditLog[];
}
