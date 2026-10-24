/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  getStudents,
  getEnrollments,
  getAcademicYears,
  getPrograms,
  getYearLevels,
  getSections,
  getSubjects,
  getClassOfferings,
  getAttendanceSessions,
  getAuditLogs,
  getSchoolSettings,
  getUsers,
  subscribeToStore,
} from './services/storage';
import {
  Student,
  Enrollment,
  AcademicYear,
  Program,
  YearLevel,
  Section,
  Subject,
  ClassOffering,
  AttendanceSession,
  AuditLog,
  SchoolSettings,
  User,
} from './types';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AcademicManagement } from './components/admin/AcademicManagement';
import { UserManagement } from './components/admin/UserManagement';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { SystemSettingsView } from './components/admin/SystemSettingsView';
import { AttendanceCentralView } from './components/admin/AttendanceCentralView';

// Registrar Views
import { StudentDirectory } from './components/registrar/StudentDirectory';
import { EnrollmentManager } from './components/registrar/EnrollmentManager';
import { ReportsMasterlist } from './components/registrar/ReportsMasterlist';

// Teacher Views
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { ClassRosterView } from './components/teacher/ClassRosterView';
import { AttendanceSessionManager } from './components/teacher/AttendanceSessionManager';
import { AttendanceHistoryView } from './components/teacher/AttendanceHistoryView';

// Student Portal View
import { StudentPortal } from './components/student/StudentPortal';

// Modals
import { CertificateOfRegistrationModal } from './components/registrar/CertificateOfRegistrationModal';
import { StudentIdCardModal } from './components/registrar/StudentIdCardModal';
import { LaravelMySQLGuide } from './components/docs/LaravelMySQLGuide';

export default function App() {
  // Global Store State
  const [currentUser, setCurUser] = useState<User>(getCurrentUser());
  const [students, setStudents] = useState<Student[]>(getStudents());
  const [enrollments, setEnrollments] = useState<Enrollment[]>(getEnrollments());
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(getAcademicYears());
  const [programs, setPrograms] = useState<Program[]>(getPrograms());
  const [yearLevels, setYearLevels] = useState<YearLevel[]>(getYearLevels());
  const [sections, setSections] = useState<Section[]>(getSections());
  const [subjects, setSubjects] = useState<Subject[]>(getSubjects());
  const [classOfferings, setClassOfferings] = useState<ClassOffering[]>(getClassOfferings());
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(getAttendanceSessions());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(getAuditLogs());
  const [settings, setSettings] = useState<SchoolSettings>(getSchoolSettings());
  const [users, setUsers] = useState<User[]>(getUsers());

  // Navigation State
  const [activeItem, setActiveItem] = useState<NavItemKey>('admin-dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals State
  const [selectedCORStudent, setSelectedCORStudent] = useState<Student | null>(null);
  const [selectedIDCardStudent, setSelectedIDCardStudent] = useState<Student | null>(null);
  const [showLaravelGuide, setShowLaravelGuide] = useState(false);

  // Sync with storage events
  useEffect(() => {
    return subscribeToStore(() => {
      const updatedUser = getCurrentUser();
      setCurUser(updatedUser);
      setStudents(getStudents());
      setEnrollments(getEnrollments());
      setAcademicYears(getAcademicYears());
      setPrograms(getPrograms());
      setYearLevels(getYearLevels());
      setSections(getSections());
      setSubjects(getSubjects());
      setClassOfferings(getClassOfferings());
      setAttendanceSessions(getAttendanceSessions());
      setAuditLogs(getAuditLogs());
      setSettings(getSchoolSettings());
      setUsers(getUsers());
    });
  }, []);

  // Update default tab when role switches
  useEffect(() => {
    switch (currentUser.role) {
      case 'admin':
        if (!activeItem.startsWith('admin-')) setActiveItem('admin-dashboard');
        break;
      case 'registrar':
        if (!activeItem.startsWith('reg-')) setActiveItem('reg-students');
        break;
      case 'teacher':
        if (!activeItem.startsWith('teach-')) setActiveItem('teach-dashboard');
        break;
      case 'student':
        if (!activeItem.startsWith('stud-')) setActiveItem('stud-dashboard');
        break;
    }
  }, [currentUser.role]);

  const pendingEnrollmentsCount = enrollments.filter((e) => e.status === 'Pending').length;
  const teachers = users.filter((u) => u.role === 'teacher');
  const activeAY = academicYears.find((y) => y.isActive) || academicYears[0];

  const handleOpenCOR = (student: Student) => {
    setSelectedCORStudent(student);
  };

  const handleOpenIDCard = (student: Student) => {
    setSelectedIDCardStudent(student);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenLaravelGuide={() => setShowLaravelGuide(true)}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          currentRole={currentUser.role}
          activeItem={activeItem}
          onSelectItem={(key) => setActiveItem(key)}
          pendingEnrollmentsCount={pendingEnrollmentsCount}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 min-w-0 flex flex-col">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
            {/* ADMINISTRATOR VIEWS */}
            {currentUser.role === 'admin' && (
              <>
                {activeItem === 'admin-dashboard' && (
                  <AdminDashboard
                    students={students}
                    enrollments={enrollments}
                    programs={programs}
                    sections={sections}
                    subjects={subjects}
                    classOfferings={classOfferings}
                    attendanceSessions={attendanceSessions}
                    auditLogs={auditLogs}
                    users={users}
                    onNavigate={(key) => setActiveItem(key as NavItemKey)}
                    onOpenCOR={handleOpenCOR}
                  />
                )}
                {activeItem === 'admin-students' && (
                  <StudentDirectory
                    students={students}
                    programs={programs}
                    sections={sections}
                    enrollments={enrollments}
                    settings={settings}
                    onOpenCOR={handleOpenCOR}
                    onOpenIDCard={handleOpenIDCard}
                  />
                )}
                {activeItem === 'admin-enrollment' && (
                  <EnrollmentManager
                    enrollments={enrollments}
                    students={students}
                    programs={programs}
                    sections={sections}
                    subjects={subjects}
                    classOfferings={classOfferings}
                    academicYears={academicYears}
                    currentUser={currentUser}
                    onOpenCOR={handleOpenCOR}
                  />
                )}
                {activeItem === 'admin-attendance' && (
                  <AttendanceCentralView
                    attendanceSessions={attendanceSessions}
                    classOfferings={classOfferings}
                    subjects={subjects}
                    sections={sections}
                    students={students}
                    teachers={teachers}
                  />
                )}
                {activeItem === 'admin-academics' && (
                  <AcademicManagement
                    academicYears={academicYears}
                    programs={programs}
                    yearLevels={yearLevels}
                    sections={sections}
                    subjects={subjects}
                    classOfferings={classOfferings}
                    teachers={teachers}
                  />
                )}
                {activeItem === 'admin-users' && (
                  <UserManagement users={users} currentUserId={currentUser.id} />
                )}
                {activeItem === 'admin-audit' && <AuditLogsView logs={auditLogs} />}
                {activeItem === 'admin-settings' && (
                  <SystemSettingsView settings={settings} academicYears={academicYears} />
                )}
              </>
            )}

            {/* REGISTRAR VIEWS */}
            {currentUser.role === 'registrar' && (
              <>
                {activeItem === 'reg-students' && (
                  <StudentDirectory
                    students={students}
                    programs={programs}
                    sections={sections}
                    enrollments={enrollments}
                    settings={settings}
                    onOpenCOR={handleOpenCOR}
                    onOpenIDCard={handleOpenIDCard}
                  />
                )}
                {activeItem === 'reg-enrollment' && (
                  <EnrollmentManager
                    enrollments={enrollments}
                    students={students}
                    programs={programs}
                    sections={sections}
                    subjects={subjects}
                    classOfferings={classOfferings}
                    academicYears={academicYears}
                    currentUser={currentUser}
                    onOpenCOR={handleOpenCOR}
                  />
                )}
                {activeItem === 'reg-masterlists' && (
                  <ReportsMasterlist
                    students={students}
                    programs={programs}
                    sections={sections}
                    enrollments={enrollments}
                    settings={settings}
                  />
                )}
              </>
            )}

            {/* TEACHER VIEWS */}
            {currentUser.role === 'teacher' && (
              <>
                {activeItem === 'teach-dashboard' && (
                  <TeacherDashboard
                    teacher={currentUser}
                    classOfferings={classOfferings}
                    subjects={subjects}
                    sections={sections}
                    students={students}
                    attendanceSessions={attendanceSessions}
                    onNavigate={(key) => setActiveItem(key as NavItemKey)}
                  />
                )}
                {activeItem === 'teach-roster' && (
                  <ClassRosterView
                    teacher={currentUser}
                    classOfferings={classOfferings}
                    subjects={subjects}
                    sections={sections}
                    students={students}
                    attendanceSessions={attendanceSessions}
                  />
                )}
                {activeItem === 'teach-attendance' && (
                  <AttendanceSessionManager
                    teacher={currentUser}
                    classOfferings={classOfferings}
                    subjects={subjects}
                    sections={sections}
                    students={students}
                    onSessionSaved={() => setActiveItem('teach-history')}
                  />
                )}
                {activeItem === 'teach-history' && (
                  <AttendanceHistoryView
                    attendanceSessions={attendanceSessions}
                    classOfferings={classOfferings}
                    subjects={subjects}
                    sections={sections}
                    students={students}
                    teacher={currentUser}
                  />
                )}
              </>
            )}

            {/* STUDENT PORTAL VIEWS */}
            {currentUser.role === 'student' && (
              <StudentPortal
                currentUser={currentUser}
                students={students}
                enrollments={enrollments}
                programs={programs}
                sections={sections}
                subjects={subjects}
                classOfferings={classOfferings}
                attendanceSessions={attendanceSessions}
                settings={settings}
                teachers={teachers}
                onOpenCOR={handleOpenCOR}
                onOpenIDCard={handleOpenIDCard}
              />
            )}
          </div>
        </main>
      </div>

      {/* MODAL 1: Official Certificate of Registration (COR) */}
      {selectedCORStudent && (
        <CertificateOfRegistrationModal
          student={selectedCORStudent}
          enrollment={enrollments.find((e) => e.studentId === selectedCORStudent.id && e.status === 'Enrolled')}
          program={programs.find((p) => p.id === selectedCORStudent.programId)}
          section={sections.find((s) => s.id === selectedCORStudent.sectionId)}
          subjects={subjects}
          offerings={classOfferings}
          academicYear={activeAY}
          settings={settings}
          teachers={teachers}
          onClose={() => setSelectedCORStudent(null)}
        />
      )}

      {/* MODAL 2: Official Student Identification Card */}
      {selectedIDCardStudent && (
        <StudentIdCardModal
          student={selectedIDCardStudent}
          program={programs.find((p) => p.id === selectedIDCardStudent.programId)}
          settings={settings}
          onClose={() => setSelectedIDCardStudent(null)}
        />
      )}

      {/* MODAL 3: Laravel & MySQL 8.4 Architecture & Deployment Guide */}
      {showLaravelGuide && (
        <LaravelMySQLGuide onClose={() => setShowLaravelGuide(false)} />
      )}
    </div>
  );
}
