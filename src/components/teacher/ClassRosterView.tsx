import React, { useState } from 'react';
import {
  ClassOffering,
  Subject,
  Section,
  Student,
  AttendanceSession,
  User,
} from '../../types';
import {
  Users,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
} from 'lucide-react';

interface ClassRosterViewProps {
  teacher: User;
  classOfferings: ClassOffering[];
  subjects: Subject[];
  sections: Section[];
  students: Student[];
  attendanceSessions: AttendanceSession[];
}

export const ClassRosterView: React.FC<ClassRosterViewProps> = ({
  teacher,
  classOfferings,
  subjects,
  sections,
  students,
  attendanceSessions,
}) => {
  const teacherOfferings = classOfferings.filter(
    (off) => teacher.role === 'admin' || off.teacherId === teacher.id || off.teacherId === teacher.teacherId
  );

  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(
    teacherOfferings[0]?.id || classOfferings[0]?.id || ''
  );
  const [search, setSearch] = useState('');

  const selectedOffering = classOfferings.find((o) => o.id === selectedOfferingId);
  const selectedSubject = subjects.find((s) => s.id === selectedOffering?.subjectId);
  const selectedSection = sections.find((sec) => sec.id === selectedOffering?.sectionId);

  // Filter students enrolled in this offering's section
  const enrolledStudents = students.filter(
    (s) => s.sectionId === selectedOffering?.sectionId && s.enrollmentStatus === 'Enrolled'
  );

  // Filter attendance sessions for this class offering
  const classSessions = attendanceSessions.filter(
    (s) => s.classOfferingId === selectedOfferingId
  );

  const filteredStudents = enrolledStudents.filter((s) => {
    const target = `${s.firstName} ${s.lastName} ${s.studentNumber}`.toLowerCase();
    return target.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header and Class Selector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Class Roster & Student Performance
            </h2>
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
              {enrolledStudents.length} Students
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Subject student masterlist with personal attendance percentages and excessive absence monitoring
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700">Class:</span>
          <select
            value={selectedOfferingId}
            onChange={(e) => setSelectedOfferingId(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {teacherOfferings.map((off) => {
              const subj = subjects.find((s) => s.id === off.subjectId);
              const sec = sections.find((s) => s.id === off.sectionId);
              return (
                <option key={off.id} value={off.id}>
                  {subj?.code} - {sec?.name} ({off.scheduleDays})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Class Overview Banner */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-mono font-bold text-sm text-blue-900 mr-2">
            {selectedSubject?.code}
          </span>
          <span className="font-bold text-slate-800">{selectedSubject?.title}</span>
          <span className="text-slate-500 ml-2">
            • Section {selectedSection?.name} ({selectedOffering?.scheduleDays} {selectedOffering?.startTime}-{selectedOffering?.endTime} • {selectedOffering?.room})
          </span>
        </div>
        <div className="text-slate-600 font-medium">
          Total Recorded Sessions: <strong className="text-slate-900">{classSessions.length}</strong>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Student ID & Name</th>
              <th className="py-3 px-4">Contact Info</th>
              <th className="py-3 px-4 text-center">Sessions Present</th>
              <th className="py-3 px-4 text-center">Late Arrivals</th>
              <th className="py-3 px-4 text-center">Unexcused Absences</th>
              <th className="py-3 px-4 text-center">Attendance %</th>
              <th className="py-3 px-4">Academic Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((stud, idx) => {
              // Calculate student stats in this class
              let presentCount = 0;
              let lateCount = 0;
              let absentCount = 0;

              classSessions.forEach((sess) => {
                const rec = sess.records.find((r) => r.studentId === stud.id);
                if (rec) {
                  if (rec.status === 'present') presentCount++;
                  if (rec.status === 'late') lateCount++;
                  if (rec.status === 'absent') absentCount++;
                }
              });

              const totalSessions = classSessions.length;
              const rate = totalSessions > 0 ? Math.round(((presentCount + lateCount) / totalSessions) * 100) : 100;
              const isWarning = absentCount >= 2 || rate < 80;

              return (
                <tr key={stud.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                        {stud.avatarUrl ? (
                          <img src={stud.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          stud.firstName.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">
                          {stud.lastName}, {stud.firstName}
                        </p>
                        <p className="font-mono text-[11px] font-bold text-blue-900">
                          {stud.studentNumber}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="text-[11px] font-mono">{stud.contactNumber}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-xs">{stud.email}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    {presentCount} / {totalSessions}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-amber-700">
                    {lateCount}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-rose-700">
                    {absentCount}
                  </td>
                  <td className="py-3 px-4 text-center font-extrabold text-slate-900">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs ${
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
                  <td className="py-3 px-4">
                    {isWarning ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" />
                        Attendance Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
                        In Good Standing
                      </span>
                    )}
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
