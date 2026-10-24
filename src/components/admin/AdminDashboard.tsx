import React from 'react';
import {
  Student,
  Enrollment,
  Program,
  Section,
  Subject,
  ClassOffering,
  AttendanceSession,
  AuditLog,
  User,
} from '../../types';
import {
  Users,
  GraduationCap,
  CalendarCheck2,
  Clock,
  ArrowUpRight,
  UserPlus,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface AdminDashboardProps {
  students: Student[];
  enrollments: Enrollment[];
  programs: Program[];
  sections: Section[];
  subjects: Subject[];
  classOfferings: ClassOffering[];
  attendanceSessions: AttendanceSession[];
  auditLogs: AuditLog[];
  users: User[];
  onNavigate: (key: string) => void;
  onOpenCOR: (student: Student) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  enrollments,
  programs,
  sections,
  subjects,
  classOfferings,
  attendanceSessions,
  auditLogs,
  users,
  onNavigate,
}) => {
  const totalStudents = students.length;
  const enrolledStudents = students.filter((s) => s.enrollmentStatus === 'Enrolled').length;
  const pendingEnrollments = enrollments.filter((e) => e.status === 'Pending').length;
  const facultyCount = users.filter((u) => u.role === 'teacher').length;

  // Calculate overall attendance rate across all recorded sessions
  let totalRecordsCount = 0;
  let totalPresentCount = 0;
  let totalLateCount = 0;
  let totalAbsentCount = 0;

  attendanceSessions.forEach((sess) => {
    sess.records.forEach((rec) => {
      totalRecordsCount++;
      if (rec.status === 'present') totalPresentCount++;
      if (rec.status === 'late') totalLateCount++;
      if (rec.status === 'absent') totalAbsentCount++;
    });
  });

  const attendanceRate = totalRecordsCount > 0
    ? Math.round(((totalPresentCount + totalLateCount) / totalRecordsCount) * 100)
    : 95;

  return (
    <div className="space-y-6">
      {/* Top Welcome & System Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded-full font-mono uppercase tracking-wider">
            Administrative Command Central
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            Institutional Overview & Academic Operations
          </h1>
          <p className="text-sm text-blue-200 mt-2 leading-relaxed">
            Real-time enrollment statistics, faculty class roll calls, and campus-wide attendance monitoring.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('admin-enrollment')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Process Pending Enrollments ({pendingEnrollments})
            </button>
            <button
              onClick={() => onNavigate('admin-attendance')}
              className="inline-flex items-center px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all cursor-pointer"
            >
              <CalendarCheck2 className="w-4 h-4 mr-2 text-emerald-400" />
              View Today's Roll Calls
            </button>
            <button
              onClick={() => onNavigate('admin-academics')}
              className="inline-flex items-center px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 mr-2 text-indigo-400" />
              Curriculum & Sections
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Students
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{totalStudents}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              Active Profiles
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified in institutional registry</p>
        </div>

        {/* Card 2: Enrolled This Term */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled This Term
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{enrolledStudents}</span>
            <span className="text-xs font-semibold text-slate-600">
              {Math.round((enrolledStudents / (totalStudents || 1)) * 100)}% Enrolled
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${(enrolledStudents / (totalStudents || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Card 3: Attendance Average */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Campus Attendance Rate
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{attendanceRate}%</span>
            <span className="text-xs font-semibold text-indigo-600">
              {attendanceSessions.length} Sessions Logged
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalAbsentCount} absences flagged across all courses
          </p>
        </div>

        {/* Card 4: Pending Enrollments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Applications
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{pendingEnrollments}</span>
            <span className="text-xs font-semibold text-amber-600">
              Awaiting Approval
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Registrar review required for sectioning
          </p>
        </div>
      </div>

      {/* Main Content Split: Enrollment Demographics & Live Attendance Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Program Distribution & Recent Enrollments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Programs & Sections Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Degree Programs & Student Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Enrolled students classified by major curriculum
                </p>
              </div>
              <button
                onClick={() => onNavigate('admin-academics')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center"
              >
                Manage Programs <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="space-y-3">
              {programs.map((prog) => {
                const count = students.filter((s) => s.programId === prog.id).length;
                const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                const progSections = sections.filter((sec) => sec.programId === prog.id);
                return (
                  <div key={prog.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 font-mono text-sm mr-2">
                          {prog.code}
                        </span>
                        <span className="font-medium text-slate-700">{prog.name}</span>
                        <span className="text-slate-400 ml-2">({progSections.length} sections)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">{count}</span>
                        <span className="text-slate-500 ml-1">students ({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Student Enrollments */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Recent Enrollment Applications
                </h3>
                <p className="text-xs text-slate-500">
                  Latest students processed through the registrar workflow
                </p>
              </div>
              <button
                onClick={() => onNavigate('admin-enrollment')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center"
              >
                View All Enrollments <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Student No.</th>
                    <th className="py-2.5 px-3">Program & Section</th>
                    <th className="py-2.5 px-3">Units</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollments.slice(0, 5).map((enr) => {
                    const student = students.find((s) => s.id === enr.studentId);
                    const program = programs.find((p) => p.id === enr.programId);
                    const sec = sections.find((s) => s.id === enr.sectionId);
                    return (
                      <tr key={enr.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-blue-800 font-bold">
                          {student?.studentNumber || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {program?.code || ''} • {sec?.name || 'Unassigned'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          {enr.totalUnits} Units
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              enr.status === 'Enrolled'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : enr.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {enr.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Attendance Sessions & Audit Activity */}
        <div className="space-y-6">
          {/* Recent Attendance Sessions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Recent Attendance Sessions
              </h3>
              <button
                onClick={() => onNavigate('admin-attendance')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                Roll Call Hub
              </button>
            </div>
            <div className="space-y-3">
              {attendanceSessions.slice(0, 3).map((sess) => {
                const off = classOfferings.find((c) => c.id === sess.classOfferingId);
                const subj = subjects.find((s) => s.id === off?.subjectId);
                const sec = sections.find((s) => s.id === off?.sectionId);
                const teacher = users.find((u) => u.id === sess.teacherId);

                const presents = sess.records.filter((r) => r.status === 'present').length;
                const lates = sess.records.filter((r) => r.status === 'late').length;
                const absents = sess.records.filter((r) => r.status === 'absent').length;
                const total = sess.records.length;
                const rate = total > 0 ? Math.round(((presents + lates) / total) * 100) : 0;

                return (
                  <div key={sess.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold font-mono text-xs text-indigo-700 mr-1.5">
                          {subj?.code || 'CS101'}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {sec?.name || 'Section'}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                          {teacher?.name || 'Assigned Faculty'}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {rate}% Present
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                      <span>Date: <strong className="text-slate-800">{sess.date}</strong></span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">{presents} Pres</span>
                      <span className="text-amber-700 font-semibold">{lates} Late</span>
                      <span className="text-rose-700 font-semibold">{absents} Abs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Audit Feed */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900 text-sm">
                  System Audit Trail
                </h3>
              </div>
              <button
                onClick={() => onNavigate('admin-audit')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                View Full Log
              </button>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-indigo-500 pl-3 py-0.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700">{log.userName}</span>
                    <span className="font-mono text-[10px]">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                  </div>
                  <p className="text-slate-800 font-medium mt-0.5 text-[11px]">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
