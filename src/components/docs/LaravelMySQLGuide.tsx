import React, { useState } from 'react';
import {
  Code2,
  Database,
  Terminal,
  Server,
  ShieldAlert,
  Download,
  Copy,
  Check,
  X,
  FileCode,
  Layers,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface GuideProps {
  onClose: () => void;
}

export const LaravelMySQLGuide: React.FC<GuideProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'mysql' | 'laravel' | 'models' | 'controllers' | 'apache' | 'security'>('mysql');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadSQL = () => {
    const element = document.createElement('a');
    const file = new Blob([mysqlSchemaSQL], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'students_enrollment_attendance_mysql84.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const mysqlSchemaSQL = `-- ========================================================
-- DATABASE SCHEMA: Students Information, Enrollment & Attendance Monitoring System
-- Target Engine: MySQL 8.4 LTS
-- Character Set: utf8mb4 / Collation: utf8mb4_unicode_ci
-- Normalized to 3rd Normal Form (3NF) with Foreign Key Constraints
-- ========================================================

CREATE DATABASE IF NOT EXISTS \`school_system\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE \`school_system\`;

-- 1. USERS & AUTHENTICATION TABLE
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('admin', 'registrar', 'teacher', 'student') NOT NULL DEFAULT 'student',
  \`status\` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  \`remember_token\` VARCHAR(100) NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_users_role\` (\`role\`),
  INDEX \`idx_users_status\` (\`status\`)
) ENGINE=InnoDB;

-- 2. ACADEMIC YEARS & TERMS TABLE
CREATE TABLE IF NOT EXISTS \`academic_years\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`code\` VARCHAR(20) NOT NULL COMMENT 'e.g. 2024-2025',
  \`name\` VARCHAR(100) NOT NULL,
  \`semester\` ENUM('1st Semester', '2nd Semester', 'Summer') NOT NULL,
  \`start_date\` DATE NOT NULL,
  \`end_date\` DATE NOT NULL,
  \`is_active\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_ay_active\` (\`is_active\`)
) ENGINE=InnoDB;

-- 3. PROGRAMS / DEGREES TABLE
CREATE TABLE IF NOT EXISTS \`programs\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`code\` VARCHAR(20) NOT NULL UNIQUE COMMENT 'e.g. BSCS, BSIT',
  \`name\` VARCHAR(255) NOT NULL,
  \`department\` VARCHAR(255) NOT NULL,
  \`total_units\` INT UNSIGNED NOT NULL DEFAULT 140,
  \`years_to_complete\` TINYINT UNSIGNED NOT NULL DEFAULT 4,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS \`sections\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(50) NOT NULL COMMENT 'e.g. BSCS-1A',
  \`program_id\` BIGINT UNSIGNED NOT NULL,
  \`year_level\` TINYINT UNSIGNED NOT NULL COMMENT '1 to 4',
  \`academic_year_id\` BIGINT UNSIGNED NOT NULL,
  \`room\` VARCHAR(50) NOT NULL,
  \`max_capacity\` INT UNSIGNED NOT NULL DEFAULT 40,
  \`adviser_id\` BIGINT UNSIGNED NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_sections_program\` FOREIGN KEY (\`program_id\`) REFERENCES \`programs\` (\`id\`) ON DELETE RESTRICT,
  CONSTRAINT \`fk_sections_ay\` FOREIGN KEY (\`academic_year_id\`) REFERENCES \`academic_years\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_sections_adviser\` FOREIGN KEY (\`adviser_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
  INDEX \`idx_sec_program_year\` (\`program_id\`, \`year_level\`)
) ENGINE=InnoDB;

-- 5. CURRICULUM SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS \`subjects\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`code\` VARCHAR(20) NOT NULL UNIQUE COMMENT 'e.g. CS101',
  \`title\` VARCHAR(255) NOT NULL,
  \`lec_units\` DECIMAL(3,1) NOT NULL DEFAULT 3.0,
  \`lab_units\` DECIMAL(3,1) NOT NULL DEFAULT 0.0,
  \`total_units\` DECIMAL(3,1) NOT NULL DEFAULT 3.0,
  \`program_id\` BIGINT UNSIGNED NULL,
  \`year_level\` TINYINT UNSIGNED NULL,
  \`semester\` ENUM('1st Semester', '2nd Semester', 'Summer') NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_subjects_program\` FOREIGN KEY (\`program_id\`) REFERENCES \`programs\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. CLASS OFFERINGS / SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS \`class_offerings\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`subject_id\` BIGINT UNSIGNED NOT NULL,
  \`section_id\` BIGINT UNSIGNED NOT NULL,
  \`teacher_id\` BIGINT UNSIGNED NOT NULL,
  \`academic_year_id\` BIGINT UNSIGNED NOT NULL,
  \`schedule_days\` VARCHAR(20) NOT NULL COMMENT 'e.g. MWF, TTH',
  \`start_time\` TIME NOT NULL,
  \`end_time\` TIME NOT NULL,
  \`room\` VARCHAR(50) NOT NULL,
  \`max_capacity\` INT UNSIGNED NOT NULL DEFAULT 40,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_class_subject\` FOREIGN KEY (\`subject_id\`) REFERENCES \`subjects\` (\`id\`) ON DELETE RESTRICT,
  CONSTRAINT \`fk_class_section\` FOREIGN KEY (\`section_id\`) REFERENCES \`sections\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_class_teacher\` FOREIGN KEY (\`teacher_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT,
  CONSTRAINT \`fk_class_ay\` FOREIGN KEY (\`academic_year_id\`) REFERENCES \`academic_years\` (\`id\`) ON DELETE CASCADE,
  INDEX \`idx_offering_schedule\` (\`teacher_id\`, \`schedule_days\`, \`start_time\`)
) ENGINE=InnoDB;

-- 7. STUDENTS PROFILES TABLE
CREATE TABLE IF NOT EXISTS \`students\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` BIGINT UNSIGNED NULL UNIQUE,
  \`student_number\` VARCHAR(30) NOT NULL UNIQUE COMMENT 'Format: YYYY-XXXXX',
  \`first_name\` VARCHAR(100) NOT NULL,
  \`middle_name\` VARCHAR(100) NULL,
  \`last_name\` VARCHAR(100) NOT NULL,
  \`suffix\` VARCHAR(20) NULL,
  \`email\` VARCHAR(255) NOT NULL UNIQUE,
  \`contact_number\` VARCHAR(30) NOT NULL,
  \`gender\` ENUM('Male', 'Female', 'Other') NOT NULL,
  \`birth_date\` DATE NOT NULL,
  \`civil_status\` ENUM('Single', 'Married') NOT NULL DEFAULT 'Single',
  \`address\` TEXT NOT NULL,
  \`city\` VARCHAR(100) NOT NULL,
  \`emergency_contact_name\` VARCHAR(255) NOT NULL,
  \`emergency_contact_relation\` VARCHAR(100) NOT NULL,
  \`emergency_contact_phone\` VARCHAR(30) NOT NULL,
  \`program_id\` BIGINT UNSIGNED NOT NULL,
  \`year_level\` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  \`section_id\` BIGINT UNSIGNED NULL,
  \`entry_status\` ENUM('Freshman', 'Transferee', 'Returning', 'Continuing') NOT NULL DEFAULT 'Freshman',
  \`enrollment_status\` ENUM('Not Enrolled', 'Pending', 'Enrolled', 'Dropped') NOT NULL DEFAULT 'Not Enrolled',
  \`admission_date\` DATE NOT NULL,
  \`previous_school\` VARCHAR(255) NULL,
  \`doc_birth_cert\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`doc_report_card\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`doc_good_moral\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`doc_photos\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`avatar_url\` VARCHAR(500) NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_students_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
  CONSTRAINT \`fk_students_program\` FOREIGN KEY (\`program_id\`) REFERENCES \`programs\` (\`id\`) ON DELETE RESTRICT,
  CONSTRAINT \`fk_students_section\` FOREIGN KEY (\`section_id\`) REFERENCES \`sections\` (\`id\`) ON DELETE SET NULL,
  INDEX \`idx_student_search\` (\`last_name\`, \`first_name\`),
  INDEX \`idx_student_enr_status\` (\`enrollment_status\`)
) ENGINE=InnoDB;

-- 8. ENROLLMENTS MASTER TABLE
CREATE TABLE IF NOT EXISTS \`enrollments\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`student_id\` BIGINT UNSIGNED NOT NULL,
  \`academic_year_id\` BIGINT UNSIGNED NOT NULL,
  \`program_id\` BIGINT UNSIGNED NOT NULL,
  \`year_level\` TINYINT UNSIGNED NOT NULL,
  \`section_id\` BIGINT UNSIGNED NOT NULL,
  \`total_units\` DECIMAL(4,1) NOT NULL DEFAULT 0.0,
  \`status\` ENUM('Pending', 'Approved', 'Enrolled', 'Rejected', 'Cancelled') NOT NULL DEFAULT 'Pending',
  \`date_applied\` DATE NOT NULL,
  \`date_processed\` DATE NULL,
  \`processed_by_id\` BIGINT UNSIGNED NULL,
  \`rejection_reason\` TEXT NULL,
  \`tuition_fee\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`lab_fee\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`misc_fee\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`discount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`net_total\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_enr_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_enr_ay\` FOREIGN KEY (\`academic_year_id\`) REFERENCES \`academic_years\` (\`id\`) ON DELETE RESTRICT,
  CONSTRAINT \`fk_enr_processor\` FOREIGN KEY (\`processed_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
  INDEX \`idx_enr_lookup\` (\`academic_year_id\`, \`status\`)
) ENGINE=InnoDB;

-- 9. ENROLLMENT SUBJECT ITEMS (PIVOT TABLE)
CREATE TABLE IF NOT EXISTS \`enrollment_items\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`enrollment_id\` BIGINT UNSIGNED NOT NULL,
  \`class_offering_id\` BIGINT UNSIGNED NOT NULL,
  \`subject_id\` BIGINT UNSIGNED NOT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_enritem_enr\` FOREIGN KEY (\`enrollment_id\`) REFERENCES \`enrollments\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_enritem_offering\` FOREIGN KEY (\`class_offering_id\`) REFERENCES \`class_offerings\` (\`id\`) ON DELETE RESTRICT,
  CONSTRAINT \`fk_enritem_subject\` FOREIGN KEY (\`subject_id\`) REFERENCES \`subjects\` (\`id\`) ON DELETE RESTRICT,
  UNIQUE KEY \`uk_enr_offering\` (\`enrollment_id\`, \`class_offering_id\`)
) ENGINE=InnoDB;

-- 10. ATTENDANCE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS \`attendance_sessions\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`class_offering_id\` BIGINT UNSIGNED NOT NULL,
  \`teacher_id\` BIGINT UNSIGNED NOT NULL,
  \`date\` DATE NOT NULL,
  \`start_time\` TIME NOT NULL,
  \`end_time\` TIME NULL,
  \`topic\` VARCHAR(255) NULL,
  \`session_type\` ENUM('Regular Lecture', 'Laboratory', 'Quiz / Exam', 'Special Review') NOT NULL DEFAULT 'Regular Lecture',
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_attsess_offering\` FOREIGN KEY (\`class_offering_id\`) REFERENCES \`class_offerings\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_attsess_teacher\` FOREIGN KEY (\`teacher_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT,
  INDEX \`idx_attsess_date\` (\`class_offering_id\`, \`date\`)
) ENGINE=InnoDB;

-- 11. ATTENDANCE RECORDS (INDIVIDUAL STUDENT LOGS)
CREATE TABLE IF NOT EXISTS \`attendance_records\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`session_id\` BIGINT UNSIGNED NOT NULL,
  \`student_id\` BIGINT UNSIGNED NOT NULL,
  \`status\` ENUM('present', 'late', 'absent', 'excused') NOT NULL DEFAULT 'present',
  \`marked_at\` TIME NOT NULL,
  \`remarks\` VARCHAR(255) NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_attrec_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`attendance_sessions\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_attrec_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE,
  UNIQUE KEY \`uk_session_student\` (\`session_id\`, \`student_id\`),
  INDEX \`idx_attrec_status\` (\`student_id\`, \`status\`)
) ENGINE=InnoDB;

-- 12. AUDIT TRAIL LOGS TABLE
CREATE TABLE IF NOT EXISTS \`audit_logs\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` BIGINT UNSIGNED NULL,
  \`user_name\` VARCHAR(255) NOT NULL,
  \`user_role\` VARCHAR(50) NOT NULL,
  \`category\` ENUM('AUTH', 'STUDENT', 'ENROLLMENT', 'ATTENDANCE', 'ACADEMIC', 'SYSTEM') NOT NULL,
  \`action\` VARCHAR(100) NOT NULL,
  \`details\` TEXT NOT NULL,
  \`ip_address\` VARCHAR(45) NOT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_audit_category\` (\`category\`),
  INDEX \`idx_audit_time\` (\`created_at\`)
) ENGINE=InnoDB;
`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Laravel & MySQL 8.4 Architecture Guide</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                  Beginner Friendly
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete database blueprints, Artisan commands, Eloquent models, and school LAN deployment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-slate-950/40 border-b border-slate-800 flex space-x-1 overflow-x-auto text-xs py-2">
          <button
            onClick={() => setActiveTab('mysql')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'mysql'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>1. MySQL 8.4 DDL Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('laravel')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'laravel'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>2. Laravel Setup Commands</span>
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'models'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Eloquent Models</span>
          </button>
          <button
            onClick={() => setActiveTab('controllers')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'controllers'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>4. Controllers & Routes</span>
          </button>
          <button
            onClick={() => setActiveTab('apache')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'apache'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>5. Apache School LAN Setup</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>6. Cybersecurity & RBAC</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: MySQL Schema */}
          {activeTab === 'mysql' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    MySQL 8.4 LTS Production Database Script
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    12 normalized tables (users, academic_years, programs, sections, subjects, class_offerings, students, enrollments, enrollment_items, attendance_sessions, attendance_records, audit_logs)
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopy(mysqlSchemaSQL, 'sql')}
                    className="inline-flex items-center px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    {copiedKey === 'sql' ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy Script
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadSQL}
                    className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download .sql
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs overflow-x-auto text-slate-300 max-h-96">
                <pre>{mysqlSchemaSQL}</pre>
              </div>

              <div className="bg-blue-950/40 border border-blue-800/50 rounded-xl p-4 text-xs text-blue-200 space-y-1">
                <p className="font-bold">How to execute in MySQL Workbench:</p>
                <p>1. Open MySQL Workbench on Windows and connect to your local MySQL instance (port 3306).</p>
                <p>2. Click <strong>File &gt; New Query Tab</strong>, paste the SQL code above, and click the ⚡ (Execute) button.</p>
                <p>3. Refresh the Schemas sidebar to verify `school_system` is created with all 12 tables and constraints.</p>
              </div>
            </div>
          )}

          {/* TAB 2: Laravel Setup Commands */}
          {activeTab === 'laravel' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <h3 className="font-semibold text-white text-sm mb-1">
                  Beginner Step-by-Step Terminal Commands (Windows Command Prompt or PowerShell)
                </h3>
                <p className="text-xs text-slate-400">
                  Execute these commands in sequence in your project root folder (e.g. `C:\laragon\www` or `C:\xampp\htdocs`).
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {/* Step 1 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-indigo-400 font-bold mb-2">
                    <span>Step 1: Install Fresh Laravel Project via Composer</span>
                    <button
                      onClick={() =>
                        handleCopy('composer create-project laravel/laravel school-system "11.*"', 'c1')
                      }
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'c1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="text-slate-300 font-mono bg-slate-900 p-2.5 rounded">
composer create-project laravel/laravel school-system "11.*"
cd school-system
                  </pre>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-indigo-400 font-bold mb-2">
                    <span>Step 2: Configure .env Database Connection</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          `DB_CONNECTION=mysql\nDB_HOST=127.0.0.1\nDB_PORT=3306\nDB_DATABASE=school_system\nDB_USERNAME=root\nDB_PASSWORD=your_mysql_password`,
                          'c2'
                        )
                      }
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'c2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="text-slate-300 font-mono bg-slate-900 p-2.5 rounded">
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=school_system
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
                  </pre>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-indigo-400 font-bold mb-2">
                    <span>Step 3: Generate Laravel Models, Migrations & Controllers</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          `php artisan make:model Student -mcr\nphp artisan make:model Enrollment -mcr\nphp artisan make:model AttendanceSession -mcr\nphp artisan make:model AttendanceRecord -m\nphp artisan make:model ClassOffering -mcr\nphp artisan make:model Section -m\nphp artisan make:model Subject -m\nphp artisan make:model AuditLog -m`,
                          'c3'
                        )
                      }
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'c3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="text-slate-300 font-mono bg-slate-900 p-2.5 rounded">
php artisan make:model Student -mcr
php artisan make:model Enrollment -mcr
php artisan make:model AttendanceSession -mcr
php artisan make:model AttendanceRecord -m
php artisan make:model ClassOffering -mcr
php artisan make:model Section -m
php artisan make:model Subject -m
php artisan make:model AuditLog -m
                  </pre>
                  <p className="text-[11px] text-slate-400 mt-2">
                    * Flag `-mcr` creates Model, Migration, Controller with Resource methods (index, create, store, show, edit, update, destroy).
                  </p>
                </div>

                {/* Step 4 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-indigo-400 font-bold mb-2">
                    <span>Step 4: Run Migrations and Start Local Server</span>
                  </div>
                  <pre className="text-slate-300 font-mono bg-slate-900 p-2.5 rounded">
php artisan migrate
php artisan serve --port=8000
                  </pre>
                  <p className="text-[11px] text-emerald-400 mt-1.5">
                    Verification: Open your browser and navigate to <strong>http://127.0.0.1:8000</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Eloquent Models */}
          {activeTab === 'models' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <h3 className="font-semibold text-white text-sm mb-1">
                  Laravel Eloquent Models with Relationships
                </h3>
                <p className="text-xs text-slate-400">
                  Files located in: <code>app/Models/Student.php</code>, <code>app/Models/AttendanceSession.php</code>, and <code>app/Models/Enrollment.php</code>.
                </p>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Model Student */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-indigo-400 font-sans font-bold mb-2">
                    <span>app/Models/Student.php</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          `<?php\n\nnamespace App\\Models;\n\nuse Illuminate\\Database\\Eloquent\\Model;\nuse Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;\nuse Illuminate\\Database\\Eloquent\\Relations\\HasMany;\n\nclass Student extends Model\n{\n    protected $fillable = [\n        'student_number', 'first_name', 'middle_name', 'last_name', 'suffix',\n        'email', 'contact_number', 'gender', 'birth_date', 'civil_status',\n        'address', 'city', 'emergency_contact_name', 'emergency_contact_relation',\n        'emergency_contact_phone', 'program_id', 'year_level', 'section_id',\n        'entry_status', 'enrollment_status', 'admission_date', 'previous_school',\n        'doc_birth_cert', 'doc_report_card', 'doc_good_moral', 'doc_photos'\n    ];\n\n    public function program(): BelongsTo\n    {\n        return $this->belongsTo(Program::class);\n    }\n\n    public function section(): BelongsTo\n    {\n        return $this->belongsTo(Section::class);\n    }\n\n    public function enrollments(): HasMany\n    {\n        return $this->hasMany(Enrollment::class);\n    }\n\n    public function attendanceRecords(): HasMany\n    {\n        return $this->hasMany(AttendanceRecord::class);\n    }\n\n    public function getFullNameAttribute(): string\n    {\n        return "{$this->last_name}, {$this->first_name} {$this->middle_name}";\n    }\n}`,
                          'm1'
                        )
                      }
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'm1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="text-slate-300 overflow-x-auto bg-slate-900 p-3 rounded">
{`namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class Student extends Model
{
    protected $fillable = [
        'student_number', 'first_name', 'middle_name', 'last_name',
        'email', 'contact_number', 'gender', 'birth_date',
        'program_id', 'year_level', 'section_id', 'enrollment_status'
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }
}`}
                  </pre>
                </div>

                {/* Model AttendanceSession */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-indigo-400 font-sans font-bold mb-2">
                    <span>app/Models/AttendanceSession.php</span>
                  </div>
                  <pre className="text-slate-300 overflow-x-auto bg-slate-900 p-3 rounded">
{`namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class AttendanceSession extends Model
{
    protected $fillable = [
        'class_offering_id', 'teacher_id', 'date', 'start_time',
        'end_time', 'topic', 'session_type'
    ];

    public function classOffering(): BelongsTo
    {
        return $this->belongsTo(ClassOffering::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function records(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class, 'session_id');
    }
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Controllers & Routes */}
          {activeTab === 'controllers' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <h3 className="font-semibold text-white text-sm mb-1">
                  Laravel Controller & Routes Implementation (routes/web.php)
                </h3>
                <p className="text-xs text-slate-400">
                  Clean RESTful routes with Role-Based Middleware protection.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
                <div className="flex items-center justify-between text-indigo-400 font-sans font-bold mb-2">
                  <span>routes/web.php</span>
                  <button
                    onClick={() =>
                      handleCopy(
                        `use App\\Http\\Controllers\\StudentController;\nuse App\\Http\\Controllers\\EnrollmentController;\nuse App\\Http\\Controllers\\AttendanceController;\nuse App\\Http\\Controllers\\DashboardController;\n\nRoute::middleware(['auth'])->group(function () {\n    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');\n\n    // Administrator & Registrar Only\n    Route::middleware(['role:admin,registrar'])->group(function () {\n        Route::resource('students', StudentController::class);\n        Route::get('/students/{student}/cor', [StudentController::class, 'printCOR'])->name('students.cor');\n        Route::get('/students/{student}/id-card', [StudentController::class, 'printIdCard'])->name('students.id');\n        Route::resource('enrollments', EnrollmentController::class);\n        Route::post('/enrollments/{enrollment}/approve', [EnrollmentController::class, 'approve'])->name('enrollments.approve');\n    });\n\n    // Teacher / Faculty Attendance Routes\n    Route::middleware(['role:admin,teacher'])->group(function () {\n        Route::get('/attendance/take/{classOffering}', [AttendanceController::class, 'create'])->name('attendance.create');\n        Route::post('/attendance/store', [AttendanceController::class, 'store'])->name('attendance.store');\n        Route::post('/attendance/quick-mark', [AttendanceController::class, 'quickMarkByBarcode'])->name('attendance.quickMark');\n        Route::get('/attendance/reports/{classOffering}', [AttendanceController::class, 'classReport'])->name('attendance.report');\n    });\n});`,
                        'r1'
                      )
                    }
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'r1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="text-slate-300 overflow-x-auto bg-slate-900 p-3 rounded">
{`use App\\Http\\Controllers\\StudentController;
use App\\Http\\Controllers\\EnrollmentController;
use App\\Http\\Controllers\\AttendanceController;

Route::middleware(['auth'])->group(function () {
    // Admin & Registrar Operations
    Route::middleware(['role:admin,registrar'])->group(function () {
        Route::resource('students', StudentController::class);
        Route::get('/students/{student}/cor', [StudentController::class, 'printCOR'])->name('students.cor');
        Route::resource('enrollments', EnrollmentController::class);
        Route::post('/enrollments/{enrollment}/approve', [EnrollmentController::class, 'approve'])->name('enrollments.approve');
    });

    // Teacher Attendance Roll Call & QR/Barcode Marking
    Route::middleware(['role:admin,teacher'])->group(function () {
        Route::get('/attendance/take/{classOffering}', [AttendanceController::class, 'create'])->name('attendance.create');
        Route::post('/attendance/store', [AttendanceController::class, 'store'])->name('attendance.store');
        Route::post('/attendance/quick-scan', [AttendanceController::class, 'quickMarkByBarcode'])->name('attendance.quickScan');
    });
});`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 5: Apache School LAN Setup */}
          {activeTab === 'apache' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <h3 className="font-semibold text-white text-sm mb-1">
                  Deploying on School Local Area Network (LAN) using Apache
                </h3>
                <p className="text-xs text-slate-400">
                  Allow authorized computers across school classrooms and the registrar office to access the server.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-white mb-1">1. Find Your Host Server Local IP</h4>
                  <p className="text-slate-400 mb-2">Open Command Prompt on the host computer and run:</p>
                  <pre className="bg-slate-900 p-2 text-indigo-300 rounded font-mono">ipconfig</pre>
                  <p className="text-slate-400 mt-2">
                    Look for <strong>IPv4 Address</strong> (e.g., <code>192.168.1.50</code>).
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-white mb-1">2. Apache VirtualHost Configuration (httpd-vhosts.conf)</h4>
                  <p className="text-slate-400 mb-2">Point DocumentRoot strictly to Laravel's <code>/public</code> directory:</p>
                  <pre className="bg-slate-900 p-3 text-slate-300 rounded font-mono overflow-x-auto">
{`<VirtualHost *:80>
    ServerName school.local
    DocumentRoot "C:/school-system/public"
    
    <Directory "C:/school-system/public">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>`}
                  </pre>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-white mb-1">3. Windows Defender Firewall Rule</h4>
                  <p className="text-slate-400 mb-2">Open inbound port 80 so other school computers can connect:</p>
                  <pre className="bg-slate-900 p-2 text-emerald-300 rounded font-mono">
netsh advfirewall firewall add rule name="School SIAMS Apache Web Server" dir=in action=allow protocol=TCP localport=80
                  </pre>
                  <p className="text-slate-400 mt-2">
                    Now teachers and registrars simply open <code>http://192.168.1.50</code> in their browser!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Cybersecurity & RBAC */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <h3 className="font-semibold text-white text-sm mb-1">
                  Enterprise Security & Data Protection Checklist
                </h3>
                <p className="text-xs text-slate-400">
                  Critical safeguards implemented to ensure student privacy and prevent unauthorized tampering.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 flex items-center space-x-1.5">
                    <span>1. SQL Injection Immunity</span>
                  </h4>
                  <p className="text-slate-300">
                    Always use Eloquent ORM or parameterized query bindings (<code>DB::table('students')-&gt;where('id', $id)</code>). Never concatenate raw input into SQL strings.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 flex items-center space-x-1.5">
                    <span>2. Cross-Site Request Forgery (CSRF)</span>
                  </h4>
                  <p className="text-slate-300">
                    Every Blade form must include the <code>@csrf</code> directive. Laravel verifies the token on every POST/PUT/DELETE request.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 flex items-center space-x-1.5">
                    <span>3. Role-Based Access Control (RBAC)</span>
                  </h4>
                  <p className="text-slate-300">
                    Create middleware <code>php artisan make:middleware CheckRole</code> to ensure teachers cannot access registrar enrollment queues, and students can only view their own records.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 flex items-center space-x-1.5">
                    <span>4. Password Security & Hashing</span>
                  </h4>
                  <p className="text-slate-300">
                    Passwords are never stored in plain text. Laravel automatically employs Bcrypt or Argon2id with <code>Hash::make($request-&gt;password)</code>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Target Stack: Laravel 11/12 • PHP 8.3/8.4 • MySQL 8.4 LTS • Apache 2.4</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
