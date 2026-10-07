import {
  User,
  Vacancy,
  Candidate,
  Application,
  Interview,
  InterviewFeedback,
  Offer,
  Employee,
  Department,
  NotificationItem,
  AuditLog,
  DashboardStatistics,
  AiScreeningResult,
  UserRole,
} from './types';

const TOKEN_KEY = 'talentpulse_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Server request failed');
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string; role: UserRole }) =>
    request<{ token: string; user: User; candidate?: Candidate }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (payload: { email: string; password: string; fullName: string; role: UserRole }) =>
    request<{ token: string; user: User; candidate?: Candidate }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ user: User; candidate?: Candidate }>('/api/auth/me'),

  // Vacancies
  getVacancies: (params?: { search?: string; department?: string; location?: string; employmentType?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
    }
    return request<Vacancy[]>(`/api/vacancies?${query.toString()}`);
  },

  getVacancy: (id: string) => request<Vacancy>(`/api/vacancies/${id}`),

  createVacancy: (data: Partial<Vacancy>) =>
    request<Vacancy>('/api/vacancies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateVacancy: (id: string, data: Partial<Vacancy>) =>
    request<Vacancy>(`/api/vacancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteVacancy: (id: string) =>
    request<{ message: string }>(`/api/vacancies/${id}`, {
      method: 'DELETE',
    }),

  // Candidates
  getCandidates: (params?: { search?: string; skill?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.skill) query.append('skill', params.skill);
    return request<Candidate[]>(`/api/candidates?${query.toString()}`);
  },

  getCandidate: (id: string) => request<Candidate & { applications: Application[] }>(`/api/candidates/${id}`),

  updateCandidate: (id: string, data: Partial<Candidate>) =>
    request<Candidate>(`/api/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  uploadResume: (id: string, data: { fileName: string; fileType?: string; textContent?: string; dataUrl?: string }) =>
    request<{ message: string; resumeFileName: string; resumeId: string }>(`/api/candidates/${id}/resume`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Applications
  getApplications: (params?: { candidateId?: string; vacancyId?: string; status?: string; department?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
    }
    return request<Application[]>(`/api/applications?${query.toString()}`);
  },

  getApplication: (id: string) =>
    request<Application & { interviews: Interview[]; offer?: Offer; vacancy?: Vacancy }>(`/api/applications/${id}`),

  applyForJob: (data: { vacancyId: string; coverNote?: string }) =>
    request<Application>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateApplicationStatus: (id: string, data: { status: string; note?: string }) =>
    request<Application>(`/api/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateApplicationNotes: (id: string, notes: string) =>
    request<Application>(`/api/applications/${id}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    }),

  triggerAiScreening: (id: string, customResumeText?: string) =>
    request<AiScreeningResult>(`/api/applications/${id}/screen`, {
      method: 'POST',
      body: JSON.stringify({ customResumeText }),
    }),

  // Interviews
  getInterviews: (params?: { interviewerId?: string; status?: string; date?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
    }
    return request<Interview[]>(`/api/interviews?${query.toString()}`);
  },

  scheduleInterview: (data: {
    applicationId: string;
    interviewerId: string;
    scheduledDate: string;
    scheduledTime: string;
    durationMinutes?: number;
    type?: string;
    meetingLinkOrLocation?: string;
    notes?: string;
  }) =>
    request<Interview>('/api/interviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateInterview: (id: string, data: Partial<Interview>) =>
    request<Interview>(`/api/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  cancelInterview: (id: string) =>
    request<Interview>(`/api/interviews/${id}/cancel`, {
      method: 'POST',
    }),

  submitFeedback: (interviewId: string, data: Partial<InterviewFeedback>) =>
    request<InterviewFeedback>(`/api/interviews/${interviewId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Offers
  getOffers: () => request<Offer[]>('/api/offers'),

  createOffer: (data: {
    applicationId: string;
    salary: string;
    joiningDate: string;
    benefits?: string[];
    expiryDate?: string;
    offerLetterText?: string;
  }) =>
    request<Offer>('/api/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateOfferStatus: (id: string, status: string) =>
    request<Offer>(`/api/offers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Employees & Onboarding
  getEmployees: () => request<Employee[]>('/api/employees'),

  onboardEmployee: (data: Partial<Employee>) =>
    request<Employee>('/api/employees/onboard', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Departments
  getDepartments: () => request<Department[]>('/api/departments'),

  createDepartment: (data: Partial<Department>) =>
    request<Department>('/api/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateDepartment: (id: string, data: Partial<Department>) =>
    request<Department>(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteDepartment: (id: string) =>
    request<{ message: string }>(`/api/departments/${id}`, {
      method: 'DELETE',
    }),

  // Admin Users
  getAdminUsers: () => request<User[]>('/api/admin/users'),

  updateUserStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') =>
    request<{ id: string; status: string }>(`/api/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  updateUserRole: (id: string, role: string) =>
    request<{ id: string; role: string }>(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  // Dashboard & Audit
  getDashboardStats: () => request<DashboardStatistics>('/api/dashboard/statistics'),

  getAuditLogs: (params?: { action?: string; entity?: string; user?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
    }
    return request<AuditLog[]>(`/api/audit-logs?${query.toString()}`);
  },

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/api/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'PUT',
    }),
};
