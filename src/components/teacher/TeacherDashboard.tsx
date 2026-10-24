import React from 'react';
import {
  ClassOffering,
  Subject,
  Section,
  Student,
  AttendanceSession,
  User,
} from '../../types';
import {
  CalendarCheck2,
  Clock,
  Users,
  BookOpen,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface TeacherDashboardProps {
  teacher: User;
  classOfferings: ClassOffering[];
  subjects: Subject[];
  sections: Section[];
  students: Student[];
  attendanceSessions: AttendanceSession[];
  onNavigate: (key: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  classOfferings,
  subjects,
  sections,
  students,
  attendanceSessions,
  onNavigate,
}) => {
  // Offerings assigned to this teacher
  const assignedOfferings = classOfferings.filter(
    (off) => teacher.role === 'admin' || off.teacherId === teacher.id || off.teacherId === teacher.teacherId
  );

  const teacherSessions = attendanceSessions.filter(
    (s) => teacher.role === 'admin' || s.teacherId === teacher.id
  );

  // Total distinct students across teacher's classes
  const assignedSectionIds = assignedOfferings.map((o) => o.sectionId);
  const enrolledStudents = students.filter(
    (s) => assignedSectionIds.includes(s.sectionId || '') && s.enrollmentStatus === 'Enrolled'
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-full font-mono uppercase tracking-wider">
            Faculty Teaching Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            Welcome, {teacher.name}
          </h1>
          <p className="text-sm text-emerald-200 mt-2 leading-relaxed">
            {assignedOfferings.length} assigned class offerings • {enrolledStudents.length} active students enrolled this semester
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('teach-attendance')}
              className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <CalendarCheck2 className="w-4 h-4 mr-2" />
              Start Live Roll Call Attendance
            </button>
            <button
              onClick={() => onNavigate('teach-roster')}
              className="inline-flex items-center px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 mr-2" />
              View Class Rosters
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Assigned Classes
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{assignedOfferings.length}</span>
            <span className="text-xs font-semibold text-blue-600">Active Offerings</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across computer science & IT</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Enrolled Students
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{enrolledStudents.length}</span>
            <span className="text-xs font-semibold text-emerald-600">In My Sections</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for roll call</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Attendance Sessions Logged
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{teacherSessions.length}</span>
            <span className="text-xs font-semibold text-indigo-600">Recorded Dates</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Synchronized with audit logs</p>
        </div>
      </div>

      {/* Assigned Classes Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h3 className="font-bold text-slate-900 text-sm mb-4">
          Assigned Teaching Schedule & Course Loads
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignedOfferings.map((off) => {
            const subj = subjects.find((s) => s.id === off.subjectId);
            const sec = sections.find((s) => s.id === off.sectionId);
            const count = students.filter(
              (s) => s.sectionId === off.sectionId && s.enrollmentStatus === 'Enrolled'
            ).length;

            return (
              <div
                key={off.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                      {subj?.code}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                      {sec?.name}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-2">
                    {subj?.title}
                  </h4>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{off.scheduleDays} • {off.startTime} - {off.endTime}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{off.room}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{count} Enrolled Students (Max {off.maxCapacity})</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {subj?.totalUnits} Academic Units
                  </span>
                  <button
                    onClick={() => onNavigate('teach-attendance')}
                    className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    <span>Take Attendance</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
