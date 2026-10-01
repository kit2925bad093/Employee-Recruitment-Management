# TalentPulse ERMS - Employee Recruitment Management System

TalentPulse ERMS is an enterprise-grade full-stack recruitment platform designed to manage the complete hiring lifecycle from **job vacancy creation to candidate onboarding**.

---

## 🌟 Key Modules & Features

### 1. Role-Based Authentication & Authorization (JWT)
* **Admin**: Full organizational control, department CRUD, user activation/deactivation, role assignment, and audit logs.
* **HR / Recruiter**: Vacancy management, candidate screening, AI resume matching, interview coordination, and offer generation.
* **Interviewer**: Dedicated interview schedule, candidate evaluation scorecard (Technical, Communication, Problem Solving, Teamwork, Experience, Overall), and hiring recommendations.
* **Candidate**: Profile builder, job search with multi-faceted filters, one-click applications with duplicate prevention, real-time application lifecycle timeline, and offer acceptance.

### 2. Full Recruitment Lifecycle
```
Vacancy Creation (Draft -> Open)
       ↓
Candidate Registration & Profile
       ↓
Job Application (Duplicate Prevention)
       ↓
AI Resume Screening (Gemini 3.8 Flash)
       ↓
Candidate Shortlisting
       ↓
Interview Scheduling & Evaluation Scorecard
       ↓
Candidate Selection
       ↓
Formal Offer Letter Generation
       ↓
Candidate Offer Acceptance
       ↓
Employee Onboarding (Official Staff Provisioning)
```

### 3. AI-Powered Resume Screening (Gemini 3.8 Flash)
* Compares candidate skills, experience, projects, and education against vacancy requirements.
* Identifies **matching skills** vs. **missing skills**.
* Computes **overall match score %**.
* Generates executive hiring recommendation (**Strong Hire**, **Hire**, **Potential Match**, **Low Match**).
* Decision-support only: Recruiter retains complete human authority.

### 4. Interactive Analytics & Reporting
* Funnel conversion metrics (Applied → Shortlisted → Interviewed → Selected).
* Applications by department and job vacancy.
* Average time-to-hire calculation and offer acceptance rates.
* Instant export to **Excel (CSV)** and printable **PDF summary**.

### 5. Audit Trail & Notifications
* Complete immutable log of system actions (user, action, entity, timestamp, before/after values).
* In-app notification center for status updates, interview alerts, and offers.

---

## 🏗 Architecture & Tech Stack

### Frontend
* **Framework**: React 19 + TypeScript + Vite
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **State & Auth**: React Context + Token Authorization Header

### Backend (Full-Stack TypeScript / Express)
* **API Engine**: Express.js REST API
* **Security**: JWT HMAC-SHA256 Token authentication, role-based route guards
* **AI Engine**: `@google/genai` (Gemini 3.8 Flash model)
* **Database**: In-memory relational store with relational integrity constraints and full seed dataset

### Spring Boot 3 + MySQL Reference Implementation
Available in-app under the **"Spring & Postman Specs"** dialog:
* Spring Boot 3 + Spring Data JPA Entity definitions
* Spring Security 6 JWT stateless filter configuration
* MySQL 8.0 DDL relational schema scripts
* Runnable Postman Collection v2.1 export

---

## 🚀 Quick Execution Instructions

```bash
# 1. Install dependencies
npm install

# 2. Run the application (Express backend + Vite middleware on Port 3000)
npm run dev

# 3. Build for production
npm run build
npm start
```

Register and sign in using your name, email, password, and account type. Candidate registration does not require a code. Admin registration requires `ADMIN_REGISTRATION_CODE`; HR and interviewer registration require `STAFF_REGISTRATION_CODE`. Configure strong, unique values for these server-side environment variables before creating privileged accounts.

---

## 📡 REST API Summary

| Method | Endpoint | Description | Role |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | Public |
| `POST` | `/api/auth/register` | Register new user or candidate | Public |
| `GET` | `/api/auth/me` | Fetch current authenticated user | Authenticated |
| `GET` | `/api/vacancies` | Search and filter job vacancies | All |
| `POST` | `/api/vacancies` | Create job vacancy | Admin, HR |
| `PUT` | `/api/vacancies/:id` | Update vacancy details or status | Admin, HR |
| `DELETE` | `/api/vacancies/:id` | Remove vacancy | Admin, HR |
| `GET` | `/api/candidates` | Candidate pool directory | Admin, HR, Interviewer |
| `PUT` | `/api/candidates/:id` | Update candidate profile | Candidate, HR |
| `POST` | `/api/candidates/:id/resume`| Upload & extract resume | Candidate |
| `GET` | `/api/applications` | Pipeline of candidate applications | Authenticated |
| `POST` | `/api/applications` | Apply for open vacancy | Candidate |
| `PUT` | `/api/applications/:id/status` | Advance application stage | Admin, HR |
| `POST` | `/api/applications/:id/screen` | Trigger AI resume screening | Admin, HR |
| `GET` | `/api/interviews` | List scheduled interviews | Authenticated |
| `POST` | `/api/interviews` | Schedule new interview round | Admin, HR |
| `POST` | `/api/interviews/:id/feedback` | Submit interview scorecard | Interviewer, HR |
| `GET` | `/api/offers` | View extended job offers | Candidate, HR, Admin |
| `POST` | `/api/offers` | Create formal job offer | Admin, HR |
| `PUT` | `/api/offers/:id/status` | Accept or reject offer | Candidate, HR |
| `POST` | `/api/employees/onboard` | Provision onboarded employee | Admin, HR |
| `GET` | `/api/dashboard/statistics` | Aggregated metrics and funnels | Admin, HR, Interviewer |
| `GET` | `/api/audit-logs` | Retrieve compliance audit trail | Admin |
| `GET` | `/api/export/postman` | Download Postman Collection JSON | Public |
