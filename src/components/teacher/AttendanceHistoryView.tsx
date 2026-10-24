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
  Calendar,
  Clock,
  Printer,
  ChevronDown,
  ChevronRight,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

interface AttendanceHistoryViewProps {
  attendanceSessions: AttendanceSession[];
  classOfferings: ClassOffering[];
  subjects: Subject[];
  sections: Section[];
  students: Student[];
  teacher: User;
}

export const AttendanceHistoryView: React.FC<AttendanceHistoryViewProps> = ({
  attendanceSessions,
  classOfferings,
  subjects,
  sections,
  students,
  teacher,
}) => {
  const teacherOfferings = classOfferings.filter(
    (off) => teacher.role === 'admin' || off.teacherId === teacher.id || off.teacherId === teacher.teacherId
  );

  const [selectedOfferingId, setSelectedOfferingId] = useState<string>('all');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const filteredSessions = attendanceSessions.filter((s) => {
    const isTeacherSession = teacher.role === 'admin' || s.teacherId === teacher.id;
    const matchesOffering = selectedOfferingId === 'all' || s.classOfferingId === selectedOfferingId;
    return isTeacherSession && matchesOffering;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Historical Attendance Sessions & Sheets
            </h2>
            <span className="px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-800 rounded-full">
              {filteredSessions.length} Recorded Sessions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-backed log of all roll calls taken with student timestamps and remarks
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 mr-1.5" />
          Print Attendance Summary
        </button>
      </div>

      {/* Filter Bar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-700">Filter Offering:</span>
        <select
          value={selectedOfferingId}
          onChange={(e) => setSelectedOfferingId(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none"
        >
          <option value="all">All Assigned Classes ({teacherOfferings.length})</option>
          {teacherOfferings.map((off) => {
            const subj = subjects.find((s) => s.id === off.subjectId);
            const sec = sections.find((s) => s.id === off.sectionId);
            return (
              <option key={off.id} value={off.id}>
                {subj?.code} - {sec?.name}
              </option>
            );
          })}
        </select>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((sess) => {
          const off = classOfferings.find((c) => c.id === sess.classOfferingId);
          const subj = subjects.find((s) => s.id === off?.subjectId);
          const sec = sections.find((s) => s.id === off?.sectionId);

          const presents = sess.records.filter((r) => r.status === 'present').length;
          const lates = sess.records.filter((r) => r.status === 'late').length;
          const absents = sess.records.filter((r) => r.status === 'absent').length;
          const excused = sess.records.filter((r) => r.status === 'excused').length;
          const total = sess.records.length;
          const rate = total > 0 ? Math.round(((presents + lates) / total) * 100) : 0;
          const isExpanded = expandedSessionId === sess.id;

          return (
            <div
              key={sess.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
            >
              {/* Session Header Item */}
              <div
                onClick={() => setExpandedSessionId(isExpanded ? null : sess.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <CalendarCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sm text-blue-900">
                        {subj?.code}
                      </span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {subj?.title}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                        Section {sec?.name}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1">
                      {sess.topic || 'Class Roll Call Session'}
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1 font-mono">
                      <span>Date: <strong className="text-slate-800">{sess.date}</strong></span>
                      <span>Time: <strong className="text-slate-800">{sess.startTime}</strong></span>
                      <span>Type: <strong className="text-slate-800">{sess.sessionType}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">{rate}% Present</span>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-600 font-bold mt-0.5">
                      <span className="text-emerald-700">{presents} Pres</span>
                      <span className="text-amber-700">{lates} Late</span>
                      <span className="text-rose-700">{absents} Abs</span>
                      <span className="text-blue-700">{excused} Exc</span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Records Table */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50/50 p-4 animate-in fade-in">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Individual Student Attendance Records ({sess.records.length} Students Logged)
                  </h4>
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Student</th>
                          <th className="py-2 px-3">Student Number</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3 font-mono">Recorded Time</th>
                          <th className="py-2 px-3">Instructor Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sess.records.map((rec) => {
                          const stud = students.find((s) => s.id === rec.studentId);
                          return (
                            <tr key={rec.id} className="hover:bg-slate-50/80">
                              <td className="py-2 px-3 font-bold text-slate-900">
                                {stud ? `${stud.lastName}, ${stud.firstName}` : 'Student'}
                              </td>
                              <td className="py-2 px-3 font-mono text-blue-900 font-bold">
                                {stud?.studentNumber || '—'}
                              </td>
                              <td className="py-2 px-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    rec.status === 'present'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : rec.status === 'late'
                                      ? 'bg-amber-100 text-amber-800'
                                      : rec.status === 'absent'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {rec.status}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                                {rec.markedAt}
                              </td>
                              <td className="py-2 px-3 text-slate-600 italic">
                                {rec.remarks || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
