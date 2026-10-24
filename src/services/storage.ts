import {
  AcademicYear,
  AttendanceRecord,
  AttendanceSession,
  AuditLog,
  ClassOffering,
  Enrollment,
  Program,
  Role,
  SchoolSettings,
  Section,
  Student,
  Subject,
  User,
  YearLevel,
} from '../types';
import {
  initialAcademicYears,
  initialAttendanceSessions,
  initialAuditLogs,
  initialClassOfferings,
  initialEnrollments,
  initialPrograms,
  initialSchoolSettings,
  initialSections,
  initialStudents,
  initialSubjects,
  initialUsers,
  initialYearLevels,
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'siams_users',
  CURRENT_USER: 'siams_current_user',
  ACADEMIC_YEARS: 'siams_academic_years',
  PROGRAMS: 'siams_programs',
  YEAR_LEVELS: 'siams_year_levels',
  SECTIONS: 'siams_sections',
  SUBJECTS: 'siams_subjects',
  CLASS_OFFERINGS: 'siams_class_offerings',
  STUDENTS: 'siams_students',
  ENROLLMENTS: 'siams_enrollments',
  ATTENDANCE_SESSIONS: 'siams_attendance_sessions',
  AUDIT_LOGS: 'siams_audit_logs',
  SETTINGS: 'siams_settings',
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Listener notification error:', e);
    }
  });
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Failed to parse storage item ${key}:`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notify();
  } catch (e) {
    console.error(`Failed to store item ${key}:`, e);
  }
}

// Initialization
export function initStore() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Default logged in as Dr. Evelyn Vance (Admin)
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(initialUsers[0]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACADEMIC_YEARS)) {
    localStorage.setItem(STORAGE_KEYS.ACADEMIC_YEARS, JSON.stringify(initialAcademicYears));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROGRAMS)) {
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(initialPrograms));
  }
  if (!localStorage.getItem(STORAGE_KEYS.YEAR_LEVELS)) {
    localStorage.setItem(STORAGE_KEYS.YEAR_LEVELS, JSON.stringify(initialYearLevels));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SECTIONS)) {
    localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(initialSections));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(initialSubjects));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLASS_OFFERINGS)) {
    localStorage.setItem(STORAGE_KEYS.CLASS_OFFERINGS, JSON.stringify(initialClassOfferings));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initialStudents));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ENROLLMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(initialEnrollments));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE_SESSIONS)) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_SESSIONS, JSON.stringify(initialAttendanceSessions));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSchoolSettings));
  }
}

// Current User & Auth
export function getCurrentUser(): User {
  initStore();
  const user = getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  if (!user) {
    const defaultUser = initialUsers[0];
    setItem(STORAGE_KEYS.CURRENT_USER, defaultUser);
    return defaultUser;
  }
  return user;
}

export function setCurrentUser(user: User) {
  setItem(STORAGE_KEYS.CURRENT_USER, user);
  logAudit('AUTH', 'USER_SWITCH', `Active session switched to ${user.name} (${user.role.toUpperCase()})`);
}

// Audit Logs
export function getAuditLogs(): AuditLog[] {
  return getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
}

export function logAudit(
  category: AuditLog['category'],
  action: string,
  details: string
) {
  const currentUser = getItem<User | null>(STORAGE_KEYS.CURRENT_USER, initialUsers[0]) || initialUsers[0];
  const logs = getAuditLogs();
  const now = new Date();
  const formattedTime = now.toISOString().replace('T', ' ').substring(0, 19);

  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    action,
    details,
    category,
    timestamp: formattedTime,
    ipAddress: '192.168.1.' + (10 + (Math.floor(Math.random() * 50))),
  };

  const updated = [newLog, ...logs].slice(0, 300); // Keep last 300 logs
  setItem(STORAGE_KEYS.AUDIT_LOGS, updated);
}

// Users
export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, initialUsers);
}

export function saveUser(user: User) {
  const users = getUsers();
  const existingIdx = users.findIndex((u) => u.id === user.id);
  let updated: User[];
  if (existingIdx >= 0) {
    updated = [...users];
    updated[existingIdx] = user;
    logAudit('AUTH', 'USER_UPDATED', `User profile updated: ${user.name} (${user.email})`);
  } else {
    updated = [user, ...users];
    logAudit('AUTH', 'USER_CREATED', `New account created: ${user.name} with role ${user.role.toUpperCase()}`);
  }
  setItem(STORAGE_KEYS.USERS, updated);
}

export function deleteUser(userId: string) {
  const users = getUsers();
  const target = users.find((u) => u.id === userId);
  const updated = users.filter((u) => u.id !== userId);
  setItem(STORAGE_KEYS.USERS, updated);
  if (target) {
    logAudit('AUTH', 'USER_DELETED', `Deleted user account: ${target.name} (${target.email})`);
  }
}

// Students
export function getStudents(): Student[] {
  return getItem<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);
}

export function saveStudent(student: Student) {
  const students = getStudents();
  const existingIdx = students.findIndex((s) => s.id === student.id);
  let updated: Student[];
  if (existingIdx >= 0) {
    updated = [...students];
    updated[existingIdx] = student;
    logAudit('STUDENT', 'STUDENT_UPDATED', `Updated record for ${student.firstName} ${student.lastName} (${student.studentNumber})`);
  } else {
    updated = [student, ...students];
    logAudit('STUDENT', 'STUDENT_REGISTERED', `Registered new student: ${student.firstName} ${student.lastName} with ID ${student.studentNumber}`);
  }
  setItem(STORAGE_KEYS.STUDENTS, updated);
}

export function deleteStudent(studentId: string) {
  const students = getStudents();
  const target = students.find((s) => s.id === studentId);
  const updated = students.filter((s) => s.id !== studentId);
  setItem(STORAGE_KEYS.STUDENTS, updated);
  if (target) {
    logAudit('STUDENT', 'STUDENT_DELETED', `Removed student record for ${target.firstName} ${target.lastName} (${target.studentNumber})`);
  }
}

// Generate Next Unique Student Number (e.g. 2025-00108)
export function generateNextStudentNumber(): string {
  const students = getStudents();
  const year = new Date().getFullYear();
  let maxSeq = 100;
  students.forEach((s) => {
    if (s.studentNumber && s.studentNumber.startsWith(year.toString())) {
      const parts = s.studentNumber.split('-');
      if (parts[1]) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  });
  return `${year}-${String(maxSeq + 1).padStart(5, '0')}`;
}

// Enrollments
export function getEnrollments(): Enrollment[] {
  return getItem<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS, initialEnrollments);
}

export function saveEnrollment(enrollment: Enrollment) {
  const enrollments = getEnrollments();
  const existingIdx = enrollments.findIndex((e) => e.id === enrollment.id);
  let updated: Enrollment[];
  if (existingIdx >= 0) {
    updated = [...enrollments];
    updated[existingIdx] = enrollment;
    logAudit('ENROLLMENT', 'ENROLLMENT_UPDATED', `Enrollment ${enrollment.id} status set to ${enrollment.status}`);
  } else {
    updated = [enrollment, ...enrollments];
    logAudit('ENROLLMENT', 'ENROLLMENT_CREATED', `New enrollment application created for Student ID ${enrollment.studentId}`);
  }
  setItem(STORAGE_KEYS.ENROLLMENTS, updated);

  // Synchronize student enrollment status
  const students = getStudents();
  const student = students.find((s) => s.id === enrollment.studentId);
  if (student) {
    if (enrollment.status === 'Enrolled') {
      student.enrollmentStatus = 'Enrolled';
      student.sectionId = enrollment.sectionId;
    } else if (enrollment.status === 'Pending') {
      student.enrollmentStatus = 'Pending';
    } else if (enrollment.status === 'Rejected' || enrollment.status === 'Cancelled') {
      student.enrollmentStatus = 'Not Enrolled';
    }
    saveStudent(student);
  }
}

// Attendance Sessions
export function getAttendanceSessions(): AttendanceSession[] {
  return getItem<AttendanceSession[]>(STORAGE_KEYS.ATTENDANCE_SESSIONS, initialAttendanceSessions);
}

export function saveAttendanceSession(session: AttendanceSession) {
  const sessions = getAttendanceSessions();
  const existingIdx = sessions.findIndex((s) => s.id === session.id);
  let updated: AttendanceSession[];
  if (existingIdx >= 0) {
    updated = [...sessions];
    updated[existingIdx] = session;
    logAudit('ATTENDANCE', 'ATTENDANCE_UPDATED', `Updated attendance session on ${session.date} (${session.records.length} records)`);
  } else {
    updated = [session, ...sessions];
    logAudit('ATTENDANCE', 'ATTENDANCE_CREATED', `Created new roll call attendance session for class ${session.classOfferingId} on ${session.date}`);
  }
  setItem(STORAGE_KEYS.ATTENDANCE_SESSIONS, updated);
}

// Academic Years
export function getAcademicYears(): AcademicYear[] {
  return getItem<AcademicYear[]>(STORAGE_KEYS.ACADEMIC_YEARS, initialAcademicYears);
}

export function saveAcademicYear(year: AcademicYear) {
  const years = getAcademicYears();
  let updated = [...years];
  if (year.isActive) {
    // Deactivate all others
    updated = updated.map((y) => ({ ...y, isActive: false }));
  }
  const idx = updated.findIndex((y) => y.id === year.id);
  if (idx >= 0) {
    updated[idx] = year;
  } else {
    updated.unshift(year);
  }
  setItem(STORAGE_KEYS.ACADEMIC_YEARS, updated);
  logAudit('ACADEMIC', 'ACADEMIC_YEAR_SAVED', `Academic term configured: ${year.name} (Active: ${year.isActive})`);
}

// Programs
export function getPrograms(): Program[] {
  return getItem<Program[]>(STORAGE_KEYS.PROGRAMS, initialPrograms);
}

export function saveProgram(program: Program) {
  const list = getPrograms();
  const idx = list.findIndex((p) => p.id === program.id);
  const updated = idx >= 0 ? list.map((p) => (p.id === program.id ? program : p)) : [program, ...list];
  setItem(STORAGE_KEYS.PROGRAMS, updated);
  logAudit('ACADEMIC', 'PROGRAM_SAVED', `Degree program saved: ${program.code} - ${program.name}`);
}

// Year Levels
export function getYearLevels(): YearLevel[] {
  return getItem<YearLevel[]>(STORAGE_KEYS.YEAR_LEVELS, initialYearLevels);
}

// Sections
export function getSections(): Section[] {
  return getItem<Section[]>(STORAGE_KEYS.SECTIONS, initialSections);
}

export function saveSection(section: Section) {
  const list = getSections();
  const idx = list.findIndex((s) => s.id === section.id);
  const updated = idx >= 0 ? list.map((s) => (s.id === section.id ? section : s)) : [section, ...list];
  setItem(STORAGE_KEYS.SECTIONS, updated);
  logAudit('ACADEMIC', 'SECTION_SAVED', `Class section saved: ${section.name}`);
}

// Subjects
export function getSubjects(): Subject[] {
  return getItem<Subject[]>(STORAGE_KEYS.SUBJECTS, initialSubjects);
}

export function saveSubject(subject: Subject) {
  const list = getSubjects();
  const idx = list.findIndex((s) => s.id === subject.id);
  const updated = idx >= 0 ? list.map((s) => (s.id === subject.id ? subject : s)) : [subject, ...list];
  setItem(STORAGE_KEYS.SUBJECTS, updated);
  logAudit('ACADEMIC', 'SUBJECT_SAVED', `Curriculum subject saved: ${subject.code} (${subject.title})`);
}

// Class Offerings
export function getClassOfferings(): ClassOffering[] {
  return getItem<ClassOffering[]>(STORAGE_KEYS.CLASS_OFFERINGS, initialClassOfferings);
}

export function saveClassOffering(offering: ClassOffering) {
  const list = getClassOfferings();
  const idx = list.findIndex((c) => c.id === offering.id);
  const updated = idx >= 0 ? list.map((c) => (c.id === offering.id ? offering : c)) : [offering, ...list];
  setItem(STORAGE_KEYS.CLASS_OFFERINGS, updated);
  logAudit('ACADEMIC', 'CLASS_OFFERING_SAVED', `Class schedule saved for Subject ID ${offering.subjectId} (${offering.scheduleDays} ${offering.startTime}-${offering.endTime})`);
}

// Settings
export function getSchoolSettings(): SchoolSettings {
  return getItem<SchoolSettings>(STORAGE_KEYS.SETTINGS, initialSchoolSettings);
}

export function saveSchoolSettings(settings: SchoolSettings) {
  setItem(STORAGE_KEYS.SETTINGS, settings);
  logAudit('SYSTEM', 'SETTINGS_UPDATED', `Updated institutional configuration & attendance policy`);
}

// Reset data
export function resetToSeedData() {
  localStorage.clear();
  initStore();
  notify();
}
