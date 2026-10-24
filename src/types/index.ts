export type Role = 'admin' | 'registrar' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department?: string;
  status: 'active' | 'suspended';
  lastLogin?: string;
  studentId?: string; // linked student if role === 'student'
  teacherId?: string; // linked teacher if role === 'teacher'
}

export interface AcademicYear {
  id: string;
  code: string; // e.g. "2024-2025"
  name: string;
  semester: '1st Semester' | '2nd Semester' | 'Summer';
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Program {
  id: string;
  code: string; // e.g. "BSCS"
  name: string; // e.g. "Bachelor of Science in Computer Science"
  department: string;
  totalUnits: number;
  yearsToComplete: number;
}

export interface YearLevel {
  id: string;
  level: number; // 1, 2, 3, 4
  name: string; // "1st Year", "2nd Year"
}

export interface Section {
  id: string;
  name: string; // e.g. "BSCS-1A"
  programId: string;
  yearLevel: number;
  academicYearId: string;
  room: string;
  maxCapacity: number;
  adviserTeacherId?: string;
}

export interface Subject {
  id: string;
  code: string; // e.g. "CS101"
  title: string; // e.g. "Introduction to Computing"
  lecUnits: number;
  labUnits: number;
  totalUnits: number;
  prerequisites?: string[]; // Subject codes
  programId?: string;
  yearLevel?: number;
  semester?: '1st Semester' | '2nd Semester' | 'Summer';
}

export interface ClassOffering {
  id: string;
  subjectId: string;
  sectionId: string;
  teacherId: string;
  academicYearId: string;
  scheduleDays: string; // e.g. "MWF" or "TTH" or "SAT"
  startTime: string; // "08:00"
  endTime: string; // "09:30"
  room: string;
  maxCapacity: number;
}

export interface Student {
  id: string;
  studentNumber: string; // e.g. "2024-00101"
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email: string;
  contactNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  birthDate: string;
  civilStatus: 'Single' | 'Married';
  address: string;
  city: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  
  // Academic Profile
  programId: string;
  yearLevel: number;
  sectionId?: string;
  entryStatus: 'Freshman' | 'Transferee' | 'Returning' | 'Continuing';
  enrollmentStatus: 'Not Enrolled' | 'Pending' | 'Enrolled' | 'Dropped';
  admissionDate: string;
  previousSchool?: string;
  
  // Documents
  submittedDocuments: {
    birthCertificate: boolean;
    reportCard: boolean; // Form 137 / 138
    goodMoral: boolean;
    idPhotos: boolean;
  };
  
  avatarUrl?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  academicYearId: string;
  programId: string;
  yearLevel: number;
  sectionId: string;
  enrolledSubjectIds: string[]; // Subject IDs
  classOfferingIds: string[]; // ClassOffering IDs
  totalUnits: number;
  status: 'Pending' | 'Approved' | 'Enrolled' | 'Rejected' | 'Cancelled';
  dateApplied: string;
  dateProcessed?: string;
  processedByUserId?: string;
  rejectionReason?: string;
  
  // Tuition & Fees Breakdown
  feeSummary: {
    tuitionFee: number;
    labFee: number;
    miscFee: number;
    discount: number;
    netTotal: number;
  };
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  markedAt: string;
  remarks?: string;
}

export interface AttendanceSession {
  id: string;
  classOfferingId: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;
  topic?: string;
  sessionType: 'Regular Lecture' | 'Laboratory' | 'Quiz / Exam' | 'Special Review';
  records: AttendanceRecord[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  details: string;
  category: 'AUTH' | 'STUDENT' | 'ENROLLMENT' | 'ATTENDANCE' | 'ACADEMIC' | 'SYSTEM';
  timestamp: string;
  ipAddress: string;
}

export interface SchoolSettings {
  schoolName: string;
  schoolCode: string;
  schoolAddress: string;
  contactEmail: string;
  contactPhone: string;
  activeAcademicYearId: string;
  attendanceGracePeriodMins: number; // e.g. 15 mins late
  maxAbsencesAllowed: number; // e.g. 3 or 4 before warning
  allowOnlineEnrollment: boolean;
  systemVersion: string;
}
