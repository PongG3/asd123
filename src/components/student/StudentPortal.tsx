import React, { useState } from 'react';
import {
  Student,
  Enrollment,
  Program,
  Section,
  Subject,
  ClassOffering,
  AttendanceSession,
  SchoolSettings,
  User,
} from '../../types';
import {
  BookOpen,
  CalendarCheck2,
  QrCode,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  GraduationCap,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

interface StudentPortalProps {
  currentUser: User;
  students: Student[];
  enrollments: Enrollment[];
  programs: Program[];
  sections: Section[];
  subjects: Subject[];
  classOfferings: ClassOffering[];
  attendanceSessions: AttendanceSession[];
  settings: SchoolSettings;
  teachers: User[];
  onOpenCOR: (student: Student) => void;
  onOpenIDCard: (student: Student) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentUser,
  students,
  enrollments,
  programs,
  sections,
  subjects,
  classOfferings,
  attendanceSessions,
  settings,
  teachers,
  onOpenCOR,
  onOpenIDCard,
}) => {
  // Find linked student profile (either by studentId or first student in list)
  const student =
    students.find((s) => s.id === currentUser.studentId) ||
    students.find((s) => s.email === currentUser.email) ||
    students[0];

  const program = programs.find((p) => p.id === student?.programId);
  const section = sections.find((s) => s.id === student?.sectionId);
  const enrollment = enrollments.find((e) => e.studentId === student?.id && e.status === 'Enrolled');

  // Subjects enrolled
  const enrolledOfferings = classOfferings.filter((o) =>
    enrollment?.classOfferingIds?.includes(o.id)
  );

  const getSubject = (subjId: string) => subjects.find((s) => s.id === subjId);
  const getTeacher = (teacherId: string) => teachers.find((t) => t.id === teacherId);

  // Calculate subject attendance breakdown
  const attendanceBreakdown = enrolledOfferings.map((off) => {
    const subj = getSubject(off.subjectId);
    const sessions = attendanceSessions.filter((s) => s.classOfferingId === off.id);
    let present = 0;
    let late = 0;
    let absent = 0;
    let excused = 0;

    sessions.forEach((s) => {
      const rec = s.records.find((r) => r.studentId === student?.id);
      if (rec) {
        if (rec.status === 'present') present++;
        if (rec.status === 'late') late++;
        if (rec.status === 'absent') absent++;
        if (rec.status === 'excused') excused++;
      }
    });

    const total = sessions.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;
    const isCritical = absent >= 2 || rate < 80;

    return {
      offering: off,
      subject: subj,
      sessionsCount: total,
      present,
      late,
      absent,
      excused,
      rate,
      isCritical,
    };
  });

  const overallAbsences = attendanceBreakdown.reduce((sum, item) => sum + item.absent, 0);
  const anyWarning = attendanceBreakdown.some((item) => item.isCritical);

  if (!student) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
        <p className="text-sm text-slate-500">No student profile linked to this user account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Profile & Quick Actions Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl border-2 border-indigo-300 shadow-md overflow-hidden bg-slate-200 shrink-0">
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-slate-700 bg-white">
                  {student.firstName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded-full">
                {student.studentNumber}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold mt-1 tracking-tight">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-xs text-blue-200 font-medium">
                {program?.name} • Year {student.yearLevel} • Section {section?.name || 'Assigned'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenIDCard(student)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Digital Student ID
            </button>
            <button
              onClick={() => onOpenCOR(student)}
              className="inline-flex items-center px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 mr-2 text-emerald-400" />
              Official Registration (COR)
            </button>
          </div>
        </div>
      </div>

      {/* Warning Notice if Absences Exceed Limit */}
      {anyWarning && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start space-x-3 text-xs text-rose-800">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900 text-sm">Attendance Early Warning Alert</h4>
            <p className="mt-0.5 leading-relaxed">
              You have exceeded {settings.maxAbsencesAllowed} unexcused absences in one or more enrolled subjects. Please submit valid medical or official clinic excuse slips to the Registrar to avoid academic disqualification.
            </p>
          </div>
        </div>
      )}

      {/* Real-time Attendance Tracker Cards by Subject */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              My Real-Time Subject Attendance Tracker
            </h3>
            <p className="text-xs text-slate-500">
              Live roll call logs, attendance percentages, and tardiness records
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700">
            Total Absences: <strong className="text-rose-600">{overallAbsences}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attendanceBreakdown.map((item) => (
            <div
              key={item.offering.id}
              className={`p-4 rounded-xl border transition-all ${
                item.isCritical
                  ? 'bg-rose-50/40 border-rose-200'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm text-blue-900">
                      {item.subject?.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      ({item.subject?.totalUnits} Units)
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mt-1">
                    {item.subject?.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.offering.scheduleDays} {item.offering.startTime}-{item.offering.endTime} • {item.offering.room}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-lg font-black ${
                      item.rate >= 90
                        ? 'text-emerald-700'
                        : item.rate >= 75
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {item.rate}%
                  </span>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">
                    Attendance Rate
                  </span>
                </div>
              </div>

              {/* Attendance metrics bar */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-600">
                  {item.sessionsCount} Sessions Total:
                </span>
                <div className="flex items-center space-x-2 font-bold font-mono">
                  <span className="text-emerald-700">{item.present} Pres</span>
                  <span className="text-amber-700">{item.late} Late</span>
                  <span className="text-rose-700">{item.absent} Abs</span>
                  <span className="text-blue-700">{item.excused} Exc</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Class Schedule Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3">
          Registered Class Schedule & Assigned Rooms
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Subject Code</th>
                <th className="py-2.5 px-3">Descriptive Title</th>
                <th className="py-2.5 px-3">Units</th>
                <th className="py-2.5 px-3">Days & Time</th>
                <th className="py-2.5 px-3">Assigned Room</th>
                <th className="py-2.5 px-3">Faculty Instructor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrolledOfferings.map((off) => {
                const subj = getSubject(off.subjectId);
                const teacher = getTeacher(off.teacherId);
                return (
                  <tr key={off.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{subj?.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{subj?.title}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{subj?.totalUnits}</td>
                    <td className="py-2.5 px-3 text-slate-700">{off.scheduleDays} {off.startTime}-{off.endTime}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{off.room}</td>
                    <td className="py-2.5 px-3 text-slate-800">{teacher?.name || 'Assigned Faculty'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
