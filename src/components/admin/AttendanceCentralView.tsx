import React, { useState } from 'react';
import {
  AttendanceSession,
  ClassOffering,
  Section,
  Student,
  Subject,
  User,
} from '../../types';
import {
  CalendarCheck2,
  AlertTriangle,
  Users,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Printer,
} from 'lucide-react';

interface AttendanceCentralViewProps {
  attendanceSessions: AttendanceSession[];
  classOfferings: ClassOffering[];
  subjects: Subject[];
  sections: Section[];
  students: Student[];
  teachers: User[];
}

export const AttendanceCentralView: React.FC<AttendanceCentralViewProps> = ({
  attendanceSessions,
  classOfferings,
  subjects,
  sections,
  students,
  teachers,
}) => {
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');

  // Compute school-wide stats
  let totalRecords = 0;
  let totalPresent = 0;
  let totalLate = 0;
  let totalAbsent = 0;

  attendanceSessions.forEach((s) => {
    s.records.forEach((r) => {
      totalRecords++;
      if (r.status === 'present') totalPresent++;
      if (r.status === 'late') totalLate++;
      if (r.status === 'absent') totalAbsent++;
    });
  });

  const overallRate = totalRecords > 0 ? Math.round(((totalPresent + totalLate) / totalRecords) * 100) : 0;

  // Find students with excessive absences across the school
  const studentAbsenceMap: Record<string, { student: Student; absences: number; total: number }> = {};

  students.forEach((s) => {
    studentAbsenceMap[s.id] = { student: s, absences: 0, total: 0 };
  });

  attendanceSessions.forEach((sess) => {
    sess.records.forEach((r) => {
      if (studentAbsenceMap[r.studentId]) {
        studentAbsenceMap[r.studentId].total++;
        if (r.status === 'absent') {
          studentAbsenceMap[r.studentId].absences++;
        }
      }
    });
  });

  const flaggedStudents = Object.values(studentAbsenceMap).filter(
    (item) => item.absences >= 1 && item.total > 0
  );

  const filteredSessions = attendanceSessions.filter((sess) => {
    const off = classOfferings.find((c) => c.id === sess.classOfferingId);
    const matchesSubject = subjectFilter === 'all' || off?.subjectId === subjectFilter;
    const matchesSection = sectionFilter === 'all' || off?.sectionId === sectionFilter;
    return matchesSubject && matchesSection;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Campus Attendance Central & Surveillance
            </h2>
            <span className="px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-800 rounded-full">
              {attendanceSessions.length} Roll Calls Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Campus-wide roll call telemetry, student absenteeism early warnings, and institutional compliance
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 mr-1.5" />
          Print Attendance Audit
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Overall Campus Rate</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{overallRate}%</span>
          <span className="text-[11px] text-emerald-600 font-semibold">Campus Aggregate</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-emerald-700 block">Total Presents</span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block">{totalPresent}</span>
          <span className="text-[11px] text-slate-400">On-time attendances</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-amber-700 block">Total Tardiness (Late)</span>
          <span className="text-2xl font-black text-amber-800 mt-1 block">{totalLate}</span>
          <span className="text-[11px] text-slate-400">Within grace period</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-rose-700 block">Total Absences</span>
          <span className="text-2xl font-black text-rose-800 mt-1 block">{totalAbsent}</span>
          <span className="text-[11px] text-rose-600 font-semibold">Require intervention</span>
        </div>
      </div>

      {/* Flagged Students with High Absences Warning */}
      {flaggedStudents.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Students Flagged for Absenteeism Risk
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {flaggedStudents.map((item) => {
              const rate = Math.round(((item.total - item.absences) / item.total) * 100);
              return (
                <div key={item.student.id} className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      {item.student.lastName}, {item.student.firstName}
                    </span>
                    <span className="font-mono text-[11px] text-slate-600">
                      {item.student.studentNumber}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-rose-700 block">
                      {item.absences} Absences
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      ({rate}% Rate)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sessions Stream Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
            All Class Roll Call Sessions Logged
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredSessions.length} recorded class logs
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Date & Time</th>
              <th className="py-2.5 px-4">Subject & Section</th>
              <th className="py-2.5 px-4">Faculty In Charge</th>
              <th className="py-2.5 px-4">Session Topic / Classification</th>
              <th className="py-2.5 px-4 text-center">Attendance Breakdown</th>
              <th className="py-2.5 px-4 text-center">Present %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSessions.map((sess) => {
              const off = classOfferings.find((c) => c.id === sess.classOfferingId);
              const subj = subjects.find((s) => s.id === off?.subjectId);
              const sec = sections.find((s) => s.id === off?.sectionId);
              const teacher = teachers.find((t) => t.id === sess.teacherId);

              const presents = sess.records.filter((r) => r.status === 'present').length;
              const lates = sess.records.filter((r) => r.status === 'late').length;
              const absents = sess.records.filter((r) => r.status === 'absent').length;
              const total = sess.records.length;
              const rate = total > 0 ? Math.round(((presents + lates) / total) * 100) : 0;

              return (
                <tr key={sess.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono text-slate-700 font-semibold">
                    {sess.date} • {sess.startTime}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-mono font-bold text-blue-900 block">{subj?.code}</span>
                    <span className="text-slate-500 text-[11px]">Section {sec?.name}</span>
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-800">
                    {teacher?.name || 'Assigned Faculty'}
                  </td>
                  <td className="py-2.5 px-4 text-slate-700 max-w-xs truncate">
                    <span className="font-semibold block">{sess.sessionType}</span>
                    <span className="text-[11px] text-slate-500">{sess.topic}</span>
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono text-[11px]">
                    <span className="text-emerald-700 font-bold">{presents}P</span> •{' '}
                    <span className="text-amber-700 font-bold">{lates}L</span> •{' '}
                    <span className="text-rose-700 font-bold">{absents}A</span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        rate >= 90
                          ? 'bg-emerald-100 text-emerald-800'
                          : rate >= 75
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {rate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
