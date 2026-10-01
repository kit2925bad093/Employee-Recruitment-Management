import React, { useState } from 'react';
import { Code2, Download, Copy, Check, Database, Shield, Layers, FileCode, X } from 'lucide-react';

interface SpringArchitectureModalProps {
  onClose: () => void;
}

export const SpringArchitectureModal: React.FC<SpringArchitectureModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'entities' | 'security' | 'schema' | 'controller' | 'postman'>('entities');
  const [copied, setCopied] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPostman = () => {
    window.open('/api/export/postman', '_blank');
  };

  const codeSnippets = {
    entities: `// Java 17+ Spring Boot 3 / Spring Data JPA Entity Examples
package com.talentpulse.erms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vacancies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Vacancy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String jobId; // e.g. VAC-2026-001

    @NotBlank(message = "Job title is required")
    @Column(nullable = false, length = 150)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmploymentType employmentType; // FULL_TIME, CONTRACT, REMOTE, HYBRID

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VacancyStatus status; // DRAFT, OPEN, CLOSED, ON_HOLD, FILLED

    @Column(nullable = false)
    private String salaryRange;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "vacancy_skills", joinColumns = @JoinColumn(name = "vacancy_id"))
    @Column(name = "skill_name")
    private List<String> requiredSkills;

    private Integer numberOfOpenings;
    private LocalDateTime openingDate;
    private LocalDateTime closingDate;

    @OneToMany(mappedBy = "vacancy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Application> applications;
}

@Entity
@Table(name = "applications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String applicationId; // e.g. APP-2026-042

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacancy_id", nullable = false)
    private Vacancy vacancy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status; 
    // APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW_SCHEDULED, INTERVIEW_COMPLETED, SELECTED, REJECTED, WITHDRAWN

    private Integer matchScore; // Calculated by AI screening

    @Column(columnDefinition = "TEXT")
    private String coverNote;

    @Column(columnDefinition = "TEXT")
    private String recruiterNotes;

    private LocalDateTime appliedAt;
}`,

    security: `// Spring Security 6 + JWT Configuration (Java 17+)
package com.talentpulse.erms.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/vacancies/public/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/hr/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers("/api/interviewer/**").hasAnyRole("ADMIN", "HR", "INTERVIEWER")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}`,

    schema: `-- MySQL 8.0 Relational DDL Schema
CREATE DATABASE IF NOT EXISTS talentpulse_erms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE talentpulse_erms;

CREATE TABLE departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(16) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_name VARCHAR(100),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role ENUM('ADMIN', 'HR', 'INTERVIEWER', 'CANDIDATE') NOT NULL,
    department_id BIGINT,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE vacancies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id VARCHAR(32) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    department_id BIGINT NOT NULL,
    location VARCHAR(120) NOT NULL,
    employment_type ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'HYBRID') NOT NULL,
    salary_range VARCHAR(80) NOT NULL,
    required_qualification TEXT,
    required_experience VARCHAR(100),
    description LONGTEXT NOT NULL,
    number_of_openings INT DEFAULT 1,
    opening_date DATE NOT NULL,
    closing_date DATE NOT NULL,
    status ENUM('DRAFT', 'OPEN', 'CLOSED', 'ON_HOLD', 'FILLED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(32) NOT NULL UNIQUE,
    vacancy_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,
    status ENUM('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED', 'REJECTED', 'WITHDRAWN') DEFAULT 'APPLIED',
    match_score INT DEFAULT NULL,
    cover_note TEXT,
    recruiter_notes TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_candidate_vacancy (vacancy_id, candidate_id),
    FOREIGN KEY (vacancy_id) REFERENCES vacancies(id) ON DELETE CASCADE
);

CREATE TABLE interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id VARCHAR(32) NOT NULL UNIQUE,
    application_id BIGINT NOT NULL,
    interviewer_id BIGINT NOT NULL,
    scheduled_at DATETIME NOT NULL,
    type ENUM('ONLINE', 'OFFLINE', 'PHONE', 'TECHNICAL', 'HR', 'FINAL') NOT NULL,
    meeting_link VARCHAR(255),
    status ENUM('SCHEDULED', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (interviewer_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE offers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    offer_id VARCHAR(32) NOT NULL UNIQUE,
    application_id BIGINT NOT NULL UNIQUE,
    salary VARCHAR(80) NOT NULL,
    joining_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED') DEFAULT 'SENT',
    offer_letter_text LONGTEXT,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);`,

    controller: `// REST Controller Architecture (Spring Boot)
package com.talentpulse.erms.controller;

import com.talentpulse.erms.dto.*;
import com.talentpulse.erms.service.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vacancies")
public class VacancyController {

    private final VacancyService vacancyService;

    public VacancyController(VacancyService vacancyService) {
        this.vacancyService = vacancyService;
    }

    @GetMapping
    public ResponseEntity<List<VacancyResponseDto>> getAllVacancies(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(vacancyService.findVacancies(search, departmentId, status));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<VacancyResponseDto> createVacancy(@Valid @RequestBody CreateVacancyRequest request) {
        return ResponseEntity.status(201).body(vacancyService.createVacancy(request));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<VacancyResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(vacancyService.updateVacancyStatus(id, status));
    }
}`,

    postman: `// TalentPulse ERMS Postman Collection v2.1
// Click the button below to download the runnable Postman Collection JSON!
// Includes full authentication, bearer token pre-request scripts, and test assertions.

{
  "info": {
    "name": "TalentPulse ERMS REST API Collection",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:3000" },
    { "key": "token", "value": "" }
  ],
  "endpoints": [
    "POST /api/auth/login",
    "POST /api/auth/register",
    "GET  /api/vacancies",
    "POST /api/vacancies",
    "GET  /api/applications",
    "POST /api/applications",
    "POST /api/applications/:id/screen",
    "POST /api/interviews",
    "POST /api/interviews/:id/feedback",
    "POST /api/offers",
    "POST /api/employees/onboard",
    "GET  /api/dashboard/statistics"
  ]
}`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
              <Code2 className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Spring Boot 3 + MySQL JPA Enterprise Architecture</h2>
              <p className="text-xs text-slate-300">Clean layered backend patterns & runnable Postman Collection</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-2">
          <div className="flex gap-2">
            {[
              { id: 'entities', label: 'JPA Entities' },
              { id: 'security', label: 'Spring Security & JWT' },
              { id: 'schema', label: 'MySQL DDL Schema' },
              { id: 'controller', label: 'REST Controller' },
              { id: 'postman', label: 'Postman Collection' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyCode(codeSnippets[activeTab])}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={handleDownloadPostman}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              <Download className="h-3.5 w-3.5" />
              Download Postman JSON
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-6 bg-slate-950 text-slate-100 max-h-[60vh] overflow-y-auto font-mono text-xs leading-relaxed selection:bg-indigo-800">
          <pre>{codeSnippets[activeTab]}</pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Production Clean Architecture: Controller &rarr; Service &rarr; Repository &rarr; JPA Entity</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-1.5 font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-700"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
