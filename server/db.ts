import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'ADMIN' | 'HR' | 'INTERVIEWER' | 'CANDIDATE';
  departmentId?: string;
  departmentName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl: string;
  createdAt: string;
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
}

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  candidateId: string;
  applicationId: string;
  interviewerId: string;
  interviewerName: string;
  technicalSkillsRating: number; // 1-5
  communicationRating: number; // 1-5
  problemSolvingRating: number; // 1-5
  teamworkRating: number; // 1-5
  experienceRating: number; // 1-5
  overallRating: number; // 1-5
  comments: string;
  recommendation: 'Strong Hire' | 'Hire' | 'Neutral' | 'Do Not Hire';
  submittedAt: string;
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
  userId?: string; // target user or all if undefined
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

export interface ResumeMetadata {
  id: string;
  candidateId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  textContent: string;
  dataUrl?: string;
}

// In-Memory Database Store with initial seed data
class DatabaseStore {
  users: User[] = [];
  departments: Department[] = [];
  vacancies: Vacancy[] = [];
  candidates: Candidate[] = [];
  applications: Application[] = [];
  interviews: Interview[] = [];
  interviewFeedbacks: InterviewFeedback[] = [];
  offers: Offer[] = [];
  employees: Employee[] = [];
  notifications: NotificationItem[] = [];
  auditLogs: AuditLog[] = [];
  resumes: ResumeMetadata[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // 1. Departments
    this.departments = [
      {
        id: 'dept-1',
        code: 'ENG',
        name: 'Engineering',
        description: 'Software development, cloud infrastructure, and technical architecture.',
        managerName: 'Elena Rostova (VP Engineering)',
        location: 'San Francisco, CA / Hybrid',
        employeeCount: 42,
      },
      {
        id: 'dept-2',
        code: 'PROD',
        name: 'Product & Design',
        description: 'Product strategy, UX/UI research, design systems, and roadmaps.',
        managerName: 'Marcus Vance (Head of Product)',
        location: 'New York, NY / Hybrid',
        employeeCount: 18,
      },
      {
        id: 'dept-3',
        code: 'DATA',
        name: 'Data & AI',
        description: 'Machine learning, generative AI integrations, and data engineering.',
        managerName: 'Dr. Aris Thorne (Chief Data Scientist)',
        location: 'Remote',
        employeeCount: 14,
      },
      {
        id: 'dept-4',
        code: 'HR',
        name: 'Human Resources & Talent',
        description: 'Talent acquisition, employee experience, and organizational development.',
        managerName: 'Sarah Jenkins (Chief People Officer)',
        location: 'San Francisco, CA',
        employeeCount: 8,
      },
      {
        id: 'dept-5',
        code: 'SALES',
        name: 'Sales & Growth',
        description: 'Enterprise account executive, customer expansion, and partnerships.',
        managerName: 'David Sterling (SVP Global Sales)',
        location: 'Chicago, IL / Remote',
        employeeCount: 25,
      },
    ];

    // 2. Initial Users
    this.users = [
      {
        id: 'usr-admin',
        email: 'admin@talentpulse.io',
        passwordHash: 'admin123',
        fullName: 'Victoria Vance',
        role: 'ADMIN',
        departmentId: 'dept-5',
        departmentName: 'Sales & Growth',
        status: 'ACTIVE',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Victoria%20Vance&backgroundColor=4f46e5,06b6d4,10b981',
        createdAt: '2026-01-01T09:00:00Z',
      },
      {
        id: 'usr-hr',
        email: 'hr@talentpulse.io',
        passwordHash: 'hr123',
        fullName: 'Jonathan Miller',
        role: 'HR',
        departmentId: 'dept-4',
        departmentName: 'Human Resources & Talent',
        status: 'ACTIVE',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Jonathan%20Miller&backgroundColor=4f46e5,06b6d4,10b981',
        createdAt: '2026-01-02T09:00:00Z',
      },
      {
        id: 'usr-interviewer',
        email: 'interviewer@talentpulse.io',
        passwordHash: 'interviewer123',
        fullName: 'Devon Chen',
        role: 'INTERVIEWER',
        departmentId: 'dept-1',
        departmentName: 'Engineering',
        status: 'ACTIVE',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Devon%20Chen&backgroundColor=4f46e5,06b6d4,10b981',
        createdAt: '2026-01-03T09:00:00Z',
      },
      {
        id: 'usr-candidate-1',
        email: 'candidate@example.com',
        passwordHash: 'password123',
        fullName: 'Alex Rivera',
        role: 'CANDIDATE',
        status: 'ACTIVE',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex%20Rivera&backgroundColor=4f46e5,06b6d4,10b981',
        createdAt: '2026-02-01T11:00:00Z',
      },
    ];

    // 3. Vacancies
    this.vacancies = [
      {
        id: 'vac-1',
        jobId: 'VAC-2026-001',
        title: 'Senior Full Stack Engineer',
        departmentId: 'dept-1',
        departmentName: 'Engineering',
        location: 'San Francisco, CA / Hybrid',
        employmentType: 'Full-time',
        salaryRange: '₹145,000 - ₹185,000',
        requiredQualification: 'B.S. or M.S. in Computer Science, Software Engineering or equivalent experience',
        requiredExperience: '5+ years in modern web development and distributed services',
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'REST API', 'System Design'],
        description: 'We are seeking an experienced Senior Full Stack Engineer to lead architecture for core web applications, develop scalable APIs, and mentor junior engineers.',
        responsibilities: [
          'Design and implement high-performance frontend interfaces with React and TypeScript.',
          'Build secure, low-latency microservices and RESTful APIs.',
          'Collaborate with Product Managers and UX designers on end-to-end features.',
          'Participate in code reviews, technical roadmapping, and CI/CD enhancements.'
        ],
        numberOfOpenings: 3,
        openingDate: '2026-01-15',
        closingDate: '2026-11-30',
        status: 'Open',
        createdBy: 'Jonathan Miller',
        createdAt: '2026-01-15T09:00:00Z',
        updatedAt: '2026-01-15T09:00:00Z',
      },
      {
        id: 'vac-2',
        jobId: 'VAC-2026-002',
        title: 'AI / Machine Learning Engineer',
        departmentId: 'dept-3',
        departmentName: 'Data & AI',
        location: 'Remote',
        employmentType: 'Full-time',
        salaryRange: '₹160,000 - ₹210,000',
        requiredQualification: 'Master\'s or Ph.D. in Computer Science, AI, Mathematics or related field',
        requiredExperience: '3+ years deploying LLM / ML models in production',
        requiredSkills: ['Python', 'PyTorch', 'LLMs', 'Gemini API', 'Vector Databases', 'FastAPI', 'LangChain'],
        description: 'Drive the intelligence layer of our enterprise platform by integrating advanced generative AI models, fine-tuning neural embeddings, and building production evaluation pipelines.',
        responsibilities: [
          'Integrate cutting-edge LLMs (Gemini, multimodal architectures) into customer-facing features.',
          'Optimize vector indexing and semantic retrieval workflows.',
          'Ensure strict compliance with AI safety, hallucination guards, and latency limits.',
          'Benchmark model throughput and inference costs.'
        ],
        numberOfOpenings: 2,
        openingDate: '2026-02-01',
        closingDate: '2026-12-15',
        status: 'Open',
        createdBy: 'Jonathan Miller',
        createdAt: '2026-02-01T10:00:00Z',
        updatedAt: '2026-02-01T10:00:00Z',
      },
      {
        id: 'vac-3',
        jobId: 'VAC-2026-003',
        title: 'Lead Product Designer (UI/UX)',
        departmentId: 'dept-2',
        departmentName: 'Product & Design',
        location: 'New York, NY / Hybrid',
        employmentType: 'Full-time',
        salaryRange: '₹130,000 - ₹165,000',
        requiredQualification: 'Degree in HCI, Interaction Design, Visual Arts, or equivalent portfolio experience',
        requiredExperience: '4+ years designing B2B SaaS desktop and responsive interfaces',
        requiredSkills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Information Architecture', 'Tailwind CSS understanding'],
        description: 'Shape the holistic user experience across our recruitment and talent operating systems. Deliver intuitive workflows that delight recruiters and job seekers alike.',
        responsibilities: [
          'Maintain and evolve the enterprise design system with tokens and reusable Figma libraries.',
          'Conduct user interviews, usability testing, and journey mapping.',
          'Create high-fidelity interactive prototypes and specifications for frontend teams.',
          'Champion accessible, WCAG AA compliant interface patterns.'
        ],
        numberOfOpenings: 1,
        openingDate: '2026-02-10',
        closingDate: '2026-10-31',
        status: 'Open',
        createdBy: 'Jonathan Miller',
        createdAt: '2026-02-10T11:00:00Z',
        updatedAt: '2026-02-10T11:00:00Z',
      },
      {
        id: 'vac-4',
        jobId: 'VAC-2026-004',
        title: 'Enterprise Account Executive',
        departmentId: 'dept-5',
        departmentName: 'Sales & Growth',
        location: 'Chicago, IL / Remote',
        employmentType: 'Full-time',
        salaryRange: '₹110,000 - ₹140,000 (OTE ₹220k)',
        requiredQualification: 'Bachelor\'s degree in Business, Marketing, or relevant sales credentials',
        requiredExperience: '4+ years closing B2B enterprise software deals (₹50k-₹250k ACV)',
        requiredSkills: ['Enterprise Sales', 'CRM (Salesforce)', 'Contract Negotiation', 'Strategic Prospecting', 'SaaS Demos'],
        description: 'Accelerate market expansion by closing Tier-1 enterprise accounts, building trusted relationships with C-level talent executives, and managing sales pipeline.',
        responsibilities: [
          'Generate and advance qualified enterprise pipeline across Fortune 1000 prospects.',
          'Conduct tailored executive presentations and product demonstrations.',
          'Manage contract negotiations, security questionnaires, and procurement cycles.',
          'Partner with Customer Success on smooth customer handoffs.'
        ],
        numberOfOpenings: 4,
        openingDate: '2026-02-15',
        closingDate: '2026-11-15',
        status: 'Open',
        createdBy: 'Victoria Vance',
        createdAt: '2026-02-15T13:00:00Z',
        updatedAt: '2026-02-15T13:00:00Z',
      },
      {
        id: 'vac-5',
        jobId: 'VAC-2026-005',
        title: 'DevOps & Cloud Infrastructure Lead',
        departmentId: 'dept-1',
        departmentName: 'Engineering',
        location: 'Remote',
        employmentType: 'Full-time',
        salaryRange: '₹150,000 - ₹190,000',
        requiredQualification: 'B.S. in Computer Science or equivalent Cloud certifications (AWS/GCP)',
        requiredExperience: '5+ years managing Kubernetes, Terraform, and cloud networking',
        requiredSkills: ['Kubernetes', 'Terraform', 'GCP', 'AWS', 'CI/CD Pipelines', 'Prometheus', 'Security Compliance'],
        description: 'Architect, monitor, and scale automated infrastructure for high-availability multi-region enterprise services.',
        responsibilities: [
          'Manage multi-cluster Kubernetes deployments with automated canary rollouts.',
          'Enforce Infrastructure as Code using Terraform and GitOps.',
          'Lead incident response, zero-trust security hardening, and SOC 2 audits.',
          'Optimize cloud compute spending and reliability metrics (99.99% uptime).'
        ],
        numberOfOpenings: 1,
        openingDate: '2026-03-01',
        closingDate: '2026-08-30',
        status: 'Filled',
        createdBy: 'Jonathan Miller',
        createdAt: '2026-03-01T08:00:00Z',
        updatedAt: '2026-08-15T12:00:00Z',
      },
      {
        id: 'vac-6',
        jobId: 'VAC-2026-006',
        title: 'Senior Java / Spring Boot Architect',
        departmentId: 'dept-1',
        departmentName: 'Engineering',
        location: 'San Francisco, CA / Hybrid',
        employmentType: 'Full-time',
        salaryRange: '₹155,000 - ₹195,000',
        requiredQualification: 'B.S./M.S. in Computer Science with strong foundation in Java ecosystem',
        requiredExperience: '6+ years with Java 17+, Spring Boot, Hibernate/JPA, and microservices',
        requiredSkills: ['Java 17', 'Spring Boot', 'Spring Security', 'Hibernate/JPA', 'MySQL', 'Kafka', 'JWT', 'REST API'],
        description: 'Lead backend enterprise service design, transaction management, and high-throughput data processing using modern Spring Boot 3+ stack.',
        responsibilities: [
          'Architect enterprise RESTful microservices with Spring Data JPA and Hibernate.',
          'Implement robust security policies using Spring Security and JWT tokens.',
          'Design high-performance relational schemas, indexing strategies, and database caching.',
          'Author technical specifications and establish coding standards.'
        ],
        numberOfOpenings: 2,
        openingDate: '2026-02-20',
        closingDate: '2026-11-20',
        status: 'Open',
        createdBy: 'Jonathan Miller',
        createdAt: '2026-02-20T10:00:00Z',
        updatedAt: '2026-02-20T10:00:00Z',
      }
    ];

    // 4. Candidates
    this.candidates = [
      {
        id: 'cand-1',
        userId: 'usr-candidate-1',
        fullName: 'Alex Rivera',
        email: 'candidate@example.com',
        phone: '+1 (415) 555-0192',
        dob: '1994-06-18',
        address: '742 Evergreen Terrace, San Francisco, CA',
        education: [
          { degree: 'B.S. Computer Science', institution: 'University of California, Berkeley', year: '2016', grade: '3.8 GPA' },
          { degree: 'M.S. Software Engineering', institution: 'San Jose State University', year: '2018', grade: '3.9 GPA' },
        ],
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'REST API', 'GraphQL', 'Tailwind CSS', 'Git'],
        certifications: [
          { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2023' },
          { name: 'Certified Kubernetes Administrator (CKA)', issuer: 'Linux Foundation', year: '2024' },
        ],
        experience: [
          {
            title: 'Senior Software Engineer',
            company: 'Starlight Tech Inc.',
            duration: '2021 - Present',
            description: 'Built scalable microservices handling 40M daily requests. Architected React/TypeScript design systems and mentored 6 engineers.'
          },
          {
            title: 'Full Stack Developer',
            company: 'Apex Cloud Solutions',
            duration: '2018 - 2021',
            description: 'Developed RESTful endpoints with Node.js and PostgreSQL. Migrated legacy single-page apps to React.'
          }
        ],
        projects: [
          {
            title: 'Real-Time Collaboration Canvas',
            description: 'High-throughput WebSockets canvas tool with conflict-free replicated data types.',
            link: 'https://github.com/alexrivera/collab-canvas'
          },
          {
            title: 'Automated CI/CD Pipeline Generator',
            description: 'Open-source CLI tool for generating Docker and GitHub Action workflows.',
            link: 'https://github.com/alexrivera/pipeline-gen'
          }
        ],
        resumeFileName: 'Alex_Rivera_Resume_2026.pdf',
        resumeText: 'Alex Rivera - Senior Full Stack Engineer with 7+ years building enterprise web applications with React, TypeScript, Node.js, and PostgreSQL. Docker, Microservices, REST APIs.',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        summary: 'Enthusiastic Senior Full Stack Engineer specializing in React, TypeScript, scalable backends, and cloud architectures. Passionate about developer tooling and performance.',
        createdAt: '2026-02-01T11:00:00Z',
        updatedAt: '2026-02-01T11:00:00Z',
      },
      {
        id: 'cand-2',
        userId: 'usr-candidate-2',
        fullName: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+1 (212) 555-0847',
        dob: '1996-03-24',
        address: '120 West 44th St, New York, NY',
        education: [
          { degree: 'B.Des. in Interaction Design', institution: 'Rhode Island School of Design (RISD)', year: '2018', grade: 'Summa Cum Laude' },
        ],
        skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Information Architecture', 'Usability Testing', 'HTML/CSS'],
        certifications: [
          { name: 'Nielsen Norman Group UX Master Certified', issuer: 'NN/g', year: '2022' }
        ],
        experience: [
          {
            title: 'Lead Product Designer',
            company: 'FinPulse Systems',
            duration: '2022 - Present',
            description: 'Redesigned core wealth management console, decreasing user task drop-off by 34%.'
          },
          {
            title: 'Senior UX/UI Designer',
            company: 'Krypton Labs',
            duration: '2019 - 2022',
            description: 'Created comprehensive Figma multi-brand design tokens used across 12 product teams.'
          }
        ],
        projects: [
          {
            title: 'Talent Design Token Framework',
            description: 'Accessible WCAG 2.1 AA tokenized styling spec for enterprise applications.',
            link: 'https://figma.com/@priyasharma/tokens'
          }
        ],
        resumeFileName: 'Priya_Sharma_Product_Design_CV.pdf',
        resumeText: 'Priya Sharma - Lead UX/UI Designer with 6 years experience in Figma, design systems, usability research, and B2B SaaS workflows.',
        photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        summary: 'Strategic product designer dedicated to clean interfaces, data density clarity, and enterprise user delight.',
        createdAt: '2026-02-05T14:10:00Z',
        updatedAt: '2026-02-05T14:10:00Z',
      },
      {
        id: 'cand-3',
        userId: 'usr-candidate-3',
        fullName: 'Michael Zhang',
        email: 'michael.zhang@example.com',
        phone: '+1 (650) 555-4321',
        dob: '1993-11-09',
        address: '450 University Ave, Palo Alto, CA',
        education: [
          { degree: 'B.S. in Computer Science', institution: 'Stanford University', year: '2015', grade: '3.9 GPA' },
          { degree: 'M.S. in Artificial Intelligence', institution: 'Stanford University', year: '2017', grade: '4.0 GPA' }
        ],
        skills: ['Python', 'PyTorch', 'LLMs', 'Gemini API', 'Vector Databases', 'FastAPI', 'LangChain', 'Docker', 'Kubernetes'],
        certifications: [
          { name: 'Google Cloud Professional Machine Learning Engineer', issuer: 'Google Cloud', year: '2024' }
        ],
        experience: [
          {
            title: 'Staff AI Engineer',
            company: 'Cerebro AI',
            duration: '2022 - Present',
            description: 'Architected retrieval-augmented generation (RAG) platform processing over 5M document queries per week.'
          },
          {
            title: 'Machine Learning Specialist',
            company: 'NextGen Analytics',
            duration: '2017 - 2022',
            description: 'Trained and served custom NLP classification models with 99.2% precision.'
          }
        ],
        projects: [
          {
            title: 'Semantic Vector Cache Engine',
            description: 'Sub-millisecond semantic similarity cache for LLM queries in Python and Rust.',
            link: 'https://github.com/michaelzhang/vector-cache'
          }
        ],
        resumeFileName: 'Michael_Zhang_AI_Engineer.pdf',
        resumeText: 'Michael Zhang - Staff AI / Machine Learning Engineer with 8+ years experience in Python, PyTorch, LLMs, Gemini API, Vector DBs, RAG, and FastAPI.',
        photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        summary: 'AI researcher and systems builder enthusiastic about productionizing large multimodal models and enterprise AI agents.',
        createdAt: '2026-02-10T16:20:00Z',
        updatedAt: '2026-02-10T16:20:00Z',
      }
    ];

    // 5. Applications (covers diverse stages)
    this.applications = [
      {
        id: 'app-1',
        applicationId: 'APP-2026-001',
        vacancyId: 'vac-1',
        candidateId: 'cand-1',
        candidateName: 'Alex Rivera',
        candidateEmail: 'candidate@example.com',
        candidatePhone: '+1 (415) 555-0192',
        jobTitle: 'Senior Full Stack Engineer',
        departmentName: 'Engineering',
        status: 'Interview Scheduled',
        appliedDate: '2026-02-02T10:15:00Z',
        coverNote: 'Excited about TalentPulse\'s engineering culture and mission. Having built large-scale React and Node.js microservices, I look forward to contributing immediately.',
        recruiterNotes: 'Exceptional profile. Verified AWS and CKA credentials. Matches 95% of technical criteria.',
        resumeFileName: 'Alex_Rivera_Resume_2026.pdf',
        matchScore: 92,
        aiScreening: {
          requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'REST API', 'System Design'],
          candidateSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'REST API', 'GraphQL', 'Tailwind CSS', 'Git'],
          matchingSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'REST API'],
          missingSkills: ['System Design (Formal verification)'],
          experienceMatch: 'Exceeds requirement: 7+ years vs 5+ required.',
          overallMatchPercentage: 92,
          strengths: ['Deep TypeScript & React frontend mastery', 'Production Docker and cloud microservice experience', 'Active open-source contributions'],
          weaknesses: ['Ensure system design architecture interview focuses on high-load distributed caching.'],
          aiRecommendation: 'Strong Hire - Candidate possesses exact required stack and proven leadership.',
          analysisSummary: 'Alex Rivera demonstrates outstanding alignment with the Senior Full Stack Engineer role with 6 of 7 key skills matched and extensive relevant experience.',
          screenedAt: '2026-02-02T10:20:00Z'
        },
        statusHistory: [
          { status: 'Applied', timestamp: '2026-02-02T10:15:00Z', note: 'Application submitted online.', changedBy: 'Alex Rivera' },
          { status: 'Under Review', timestamp: '2026-02-03T09:00:00Z', note: 'Resume reviewed by recruiter Jonathan Miller.', changedBy: 'Jonathan Miller' },
          { status: 'Shortlisted', timestamp: '2026-02-04T11:30:00Z', note: 'AI screening match score 92%. Candidate moved to technical round.', changedBy: 'Jonathan Miller' },
          { status: 'Interview Scheduled', timestamp: '2026-02-05T14:00:00Z', note: 'Technical interview scheduled with Devon Chen.', changedBy: 'Jonathan Miller' }
        ]
      },
      {
        id: 'app-2',
        applicationId: 'APP-2026-002',
        vacancyId: 'vac-3',
        candidateId: 'cand-2',
        candidateName: 'Priya Sharma',
        candidateEmail: 'priya.sharma@example.com',
        candidatePhone: '+1 (212) 555-0847',
        jobTitle: 'Lead Product Designer (UI/UX)',
        departmentName: 'Product & Design',
        status: 'Interview Completed',
        appliedDate: '2026-02-06T11:20:00Z',
        coverNote: 'I have dedicated my career to crafting elegant design systems for enterprise software. TalentPulse presents the ideal opportunity.',
        recruiterNotes: 'Portfolio is remarkable. Highly endorsed by previous design VP.',
        resumeFileName: 'Priya_Sharma_Product_Design_CV.pdf',
        matchScore: 95,
        aiScreening: {
          requiredSkills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Information Architecture', 'Tailwind CSS understanding'],
          candidateSkills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Information Architecture', 'Usability Testing', 'HTML/CSS'],
          matchingSkills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Information Architecture'],
          missingSkills: ['Tailwind CSS understanding (Basic familiarity)'],
          experienceMatch: 'Exact fit: 6 years vs 4+ required.',
          overallMatchPercentage: 95,
          strengths: ['World-class Figma design system tokenization', 'Deep usability research methodologies'],
          weaknesses: ['None identified.'],
          aiRecommendation: 'Strong Hire - Exceptional portfolio quality and domain experience.',
          analysisSummary: 'Priya Sharma is an exemplary match for Lead Product Designer, showing mastery of enterprise systems and human-centered design.',
          screenedAt: '2026-02-06T11:25:00Z'
        },
        statusHistory: [
          { status: 'Applied', timestamp: '2026-02-06T11:20:00Z', note: 'Application submitted online.', changedBy: 'Priya Sharma' },
          { status: 'Under Review', timestamp: '2026-02-07T08:30:00Z', note: 'Portfolio review completed.', changedBy: 'Jonathan Miller' },
          { status: 'Shortlisted', timestamp: '2026-02-08T10:00:00Z', note: 'Shortlisted for portfolio presentation.', changedBy: 'Jonathan Miller' },
          { status: 'Interview Scheduled', timestamp: '2026-02-10T09:00:00Z', note: 'Design panel scheduled with Marcus Vance & Devon Chen.', changedBy: 'Jonathan Miller' },
          { status: 'Interview Completed', timestamp: '2026-02-14T16:00:00Z', note: 'All interviewers submitted scorecards (Average 4.8/5).', changedBy: 'Devon Chen' }
        ]
      },
      {
        id: 'app-3',
        applicationId: 'APP-2026-003',
        vacancyId: 'vac-2',
        candidateId: 'cand-3',
        candidateName: 'Michael Zhang',
        candidateEmail: 'michael.zhang@example.com',
        candidatePhone: '+1 (650) 555-4321',
        jobTitle: 'AI / Machine Learning Engineer',
        departmentName: 'Data & AI',
        status: 'Selected',
        appliedDate: '2026-02-11T13:40:00Z',
        coverNote: 'Passionate about integrating Gemini and cutting-edge generative AI models into high-value enterprise applications.',
        recruiterNotes: 'Top candidate. Received 5/5 from Dr. Aris Thorne. Offer letter drafted.',
        resumeFileName: 'Michael_Zhang_AI_Engineer.pdf',
        matchScore: 98,
        aiScreening: {
          requiredSkills: ['Python', 'PyTorch', 'LLMs', 'Gemini API', 'Vector Databases', 'FastAPI', 'LangChain'],
          candidateSkills: ['Python', 'PyTorch', 'LLMs', 'Gemini API', 'Vector Databases', 'FastAPI', 'LangChain', 'Docker', 'Kubernetes'],
          matchingSkills: ['Python', 'PyTorch', 'LLMs', 'Gemini API', 'Vector Databases', 'FastAPI', 'LangChain'],
          missingSkills: [],
          experienceMatch: 'Outstanding: 8+ years with Stanford Masters in AI.',
          overallMatchPercentage: 98,
          strengths: ['100% skill match with Gemini API and Vector DB specialization', 'Proven track record scaling RAG pipelines to 5M weekly queries'],
          weaknesses: [],
          aiRecommendation: 'Strong Hire - Prime technical talent.',
          analysisSummary: 'Michael Zhang possesses flawless alignment with every listed requirement for AI / Machine Learning Engineer.',
          screenedAt: '2026-02-11T13:45:00Z'
        },
        statusHistory: [
          { status: 'Applied', timestamp: '2026-02-11T13:40:00Z', note: 'Application received.', changedBy: 'Michael Zhang' },
          { status: 'Shortlisted', timestamp: '2026-02-12T09:00:00Z', note: 'Fast-tracked due to stellar credentials.', changedBy: 'Jonathan Miller' },
          { status: 'Interview Scheduled', timestamp: '2026-02-13T10:00:00Z', note: 'Deep technical AI panel scheduled.', changedBy: 'Jonathan Miller' },
          { status: 'Interview Completed', timestamp: '2026-02-17T17:00:00Z', note: 'Technical evaluation rated 5.0/5.', changedBy: 'Devon Chen' },
          { status: 'Selected', timestamp: '2026-02-19T14:30:00Z', note: 'Candidate formally selected by VP of Data & AI.', changedBy: 'Jonathan Miller' }
        ]
      }
    ];

    // 6. Interviews
    this.interviews = [
      {
        id: 'int-1',
        interviewId: 'INT-2026-101',
        applicationId: 'app-1',
        candidateId: 'cand-1',
        candidateName: 'Alex Rivera',
        candidateEmail: 'candidate@example.com',
        vacancyId: 'vac-1',
        jobTitle: 'Senior Full Stack Engineer',
        interviewerId: 'usr-interviewer',
        interviewerName: 'Devon Chen',
        interviewerEmail: 'interviewer@talentpulse.io',
        scheduledDate: '2026-10-05',
        scheduledTime: '14:00',
        durationMinutes: 60,
        type: 'Technical',
        meetingLinkOrLocation: 'https://meet.google.com/talent-erm-eng',
        status: 'Scheduled',
        notes: 'Focus on React 19 performance, distributed state, and PostgreSQL schema design under load.',
        createdAt: '2026-02-05T14:00:00Z',
      },
      {
        id: 'int-2',
        interviewId: 'INT-2026-102',
        applicationId: 'app-2',
        candidateId: 'cand-2',
        candidateName: 'Priya Sharma',
        candidateEmail: 'priya.sharma@example.com',
        vacancyId: 'vac-3',
        jobTitle: 'Lead Product Designer (UI/UX)',
        interviewerId: 'usr-interviewer',
        interviewerName: 'Devon Chen',
        interviewerEmail: 'interviewer@talentpulse.io',
        scheduledDate: '2026-02-14',
        scheduledTime: '15:00',
        durationMinutes: 60,
        type: 'Final',
        meetingLinkOrLocation: 'https://meet.google.com/talent-erm-design',
        status: 'Completed',
        notes: 'Comprehensive design critique and cross-functional engineering alignment.',
        createdAt: '2026-02-10T09:00:00Z',
      },
      {
        id: 'int-3',
        interviewId: 'INT-2026-103',
        applicationId: 'app-3',
        candidateId: 'cand-3',
        candidateName: 'Michael Zhang',
        candidateEmail: 'michael.zhang@example.com',
        vacancyId: 'vac-2',
        jobTitle: 'AI / Machine Learning Engineer',
        interviewerId: 'usr-interviewer',
        interviewerName: 'Devon Chen',
        interviewerEmail: 'interviewer@talentpulse.io',
        scheduledDate: '2026-02-17',
        scheduledTime: '11:00',
        durationMinutes: 75,
        type: 'Technical',
        meetingLinkOrLocation: 'https://meet.google.com/talent-erm-ai',
        status: 'Completed',
        notes: 'Deep dive into LLM inference latency, vector clustering, and prompt engineering.',
        createdAt: '2026-02-13T10:00:00Z',
      }
    ];

    // 7. Interview Feedbacks
    this.interviewFeedbacks = [
      {
        id: 'fb-1',
        interviewId: 'int-2',
        candidateId: 'cand-2',
        applicationId: 'app-2',
        interviewerId: 'usr-interviewer',
        interviewerName: 'Devon Chen',
        technicalSkillsRating: 5,
        communicationRating: 5,
        problemSolvingRating: 4,
        teamworkRating: 5,
        experienceRating: 5,
        overallRating: 5,
        comments: 'Priya gave a masterclass walkthrough of her enterprise design system. She communicates with extraordinary empathy and precision. Ready to lead design here.',
        recommendation: 'Strong Hire',
        submittedAt: '2026-02-14T16:30:00Z'
      },
      {
        id: 'fb-2',
        interviewId: 'int-3',
        candidateId: 'cand-3',
        applicationId: 'app-3',
        interviewerId: 'usr-interviewer',
        interviewerName: 'Devon Chen',
        technicalSkillsRating: 5,
        communicationRating: 4,
        problemSolvingRating: 5,
        teamworkRating: 5,
        experienceRating: 5,
        overallRating: 5,
        comments: 'Michael solved our hardest live vector indexing problem in 15 minutes. Profound understanding of Gemini API architectures and low-latency embeddings.',
        recommendation: 'Strong Hire',
        submittedAt: '2026-02-17T17:10:00Z'
      }
    ];

    // 8. Offers
    this.offers = [
      {
        id: 'off-1',
        offerId: 'OFF-2026-001',
        candidateId: 'cand-3',
        candidateName: 'Michael Zhang',
        candidateEmail: 'michael.zhang@example.com',
        applicationId: 'app-3',
        jobTitle: 'AI / Machine Learning Engineer',
        departmentName: 'Data & AI',
        salary: '₹195,000 / year + 0.15% Equity Option Grant',
        joiningDate: '2026-11-01',
        benefits: [
          'Full Medical, Dental, and Vision coverage (100% employer paid)',
          'Retirement plan with 5% employer match',
          'Flexible Paid Time Off (PTO) + 12 annual paid organizational holidays',
          '₹3,500 annual personal education and conference budget',
          'Home office setup stipend (₹1,500 one-time)'
        ],
        expiryDate: '2026-10-25',
        status: 'Sent',
        offerLetterText: 'Dear Michael,\n\nOn behalf of TalentPulse, we are delighted to offer you the position of AI / Machine Learning Engineer within our Data & AI department. Your expertise and leadership will be pivotal in shaping the next chapter of our intelligent talent platform.\n\nWe look forward to welcoming you to our team.',
        createdAt: '2026-02-20T10:00:00Z',
        updatedAt: '2026-02-20T10:00:00Z',
      }
    ];

    // 9. Onboarded Employees
    this.employees = [
      {
        id: 'emp-1',
        employeeId: 'EMP-00101',
        candidateId: 'cand-prior-1',
        fullName: 'Samantha Brody',
        email: 'samantha.brody@talentpulse.io',
        phone: '+1 (415) 555-8822',
        department: 'Engineering',
        designation: 'Senior DevOps Architect',
        joiningDate: '2026-01-05',
        manager: 'Elena Rostova (VP Engineering)',
        employmentType: 'Full-time',
        status: 'Active',
        salary: '₹175,000',
        officeLocation: 'San Francisco, CA',
        createdAt: '2026-01-05T08:00:00Z'
      },
      {
        id: 'emp-2',
        employeeId: 'EMP-00102',
        candidateId: 'cand-prior-2',
        fullName: 'Julian Hayes',
        email: 'julian.hayes@talentpulse.io',
        phone: '+1 (312) 555-9011',
        department: 'Sales & Growth',
        designation: 'Enterprise Account Executive',
        joiningDate: '2026-01-20',
        manager: 'David Sterling (SVP Sales)',
        employmentType: 'Full-time',
        status: 'Active',
        salary: '₹125,000',
        officeLocation: 'Chicago, IL',
        createdAt: '2026-01-20T08:00:00Z'
      }
    ];

    // 10. Audit Logs
    this.auditLogs = [
      {
        id: 'aud-1',
        userId: 'usr-admin',
        userName: 'Victoria Vance',
        userRole: 'ADMIN',
        action: 'CREATED_VACANCY',
        entity: 'Vacancy',
        entityId: 'VAC-2026-001',
        timestamp: '2026-01-15T09:00:00Z',
        previousValue: 'None',
        newValue: 'Senior Full Stack Engineer (Status: Open)',
        details: 'Initial job vacancy created for Engineering department.'
      },
      {
        id: 'aud-2',
        userId: 'usr-hr',
        userName: 'Jonathan Miller',
        userRole: 'HR',
        action: 'SHORTLISTED_CANDIDATE',
        entity: 'Application',
        entityId: 'APP-2026-001',
        timestamp: '2026-02-04T11:30:00Z',
        previousValue: 'Under Review',
        newValue: 'Shortlisted',
        details: 'Candidate Alex Rivera passed AI resume screening with 92% match score.'
      },
      {
        id: 'aud-3',
        userId: 'usr-hr',
        userName: 'Jonathan Miller',
        userRole: 'HR',
        action: 'SCHEDULED_INTERVIEW',
        entity: 'Interview',
        entityId: 'INT-2026-101',
        timestamp: '2026-02-05T14:00:00Z',
        previousValue: 'None',
        newValue: 'Scheduled for 2026-10-05 14:00',
        details: 'Technical round assigned to interviewer Devon Chen.'
      },
      {
        id: 'aud-4',
        userId: 'usr-interviewer',
        userName: 'Devon Chen',
        userRole: 'INTERVIEWER',
        action: 'SUBMITTED_FEEDBACK',
        entity: 'InterviewFeedback',
        entityId: 'int-2',
        timestamp: '2026-02-14T16:30:00Z',
        previousValue: 'Pending',
        newValue: 'Strong Hire (Score: 5/5)',
        details: 'Submitted evaluation scorecard for Priya Sharma.'
      },
      {
        id: 'aud-5',
        userId: 'usr-hr',
        userName: 'Jonathan Miller',
        userRole: 'HR',
        action: 'SENT_OFFER',
        entity: 'Offer',
        entityId: 'OFF-2026-001',
        timestamp: '2026-02-20T10:00:00Z',
        previousValue: 'Draft',
        newValue: 'Sent',
        details: 'Job offer sent to Michael Zhang (₹195,000/yr).'
      }
    ];

    // 11. Notifications
    this.notifications = [
      {
        id: 'notif-1',
        userId: 'usr-candidate-1',
        targetRole: 'CANDIDATE',
        title: 'Interview Scheduled',
        message: 'Your Technical Interview for Senior Full Stack Engineer has been scheduled for Oct 5, 2026 at 2:00 PM.',
        type: 'INFO',
        link: '/candidate/applications',
        read: false,
        createdAt: '2026-02-05T14:00:00Z'
      },
      {
        id: 'notif-2',
        targetRole: 'HR',
        title: 'New Candidate Application',
        message: 'Michael Zhang applied for AI / Machine Learning Engineer (Match Score: 98%).',
        type: 'SUCCESS',
        link: '/hr/applications',
        read: false,
        createdAt: '2026-02-11T13:40:00Z'
      },
      {
        id: 'notif-3',
        userId: 'usr-interviewer',
        targetRole: 'INTERVIEWER',
        title: 'New Interview Assigned',
        message: 'You have been assigned to interview Alex Rivera for Senior Full Stack Engineer.',
        type: 'INFO',
        link: '/interviewer/interviews',
        read: false,
        createdAt: '2026-02-05T14:05:00Z'
      },
      {
        id: 'notif-4',
        userId: 'usr-candidate-3',
        targetRole: 'CANDIDATE',
        title: 'Formal Job Offer Received!',
        message: 'Congratulations! TalentPulse has extended you an offer for AI / Machine Learning Engineer.',
        type: 'SUCCESS',
        link: '/candidate/offers',
        read: false,
        createdAt: '2026-02-20T10:00:00Z'
      }
    ];
  }

  // Audit Helper
  logAudit(userId: string, userName: string, userRole: string, action: string, entity: string, entityId: string, prevVal: string, newVal: string, details?: string) {
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userName,
      userRole,
      action,
      entity,
      entityId,
      timestamp: new Date().toISOString(),
      previousValue: prevVal,
      newValue: newVal,
      details,
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  // Notification Helper
  sendNotification(title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT', options: { userId?: string; targetRole?: string; link?: string } = {}) {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: options.userId,
      targetRole: options.targetRole,
      title,
      message,
      type,
      link: options.link,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    return notif;
  }
}

export const db = new DatabaseStore();
