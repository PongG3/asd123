import React, { useState, useEffect } from 'react';
import {
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
  ClassOffering,
  Section,
  Student,
  Subject,
  User,
} from '../../types';
import { saveAttendanceSession } from '../../services/storage';
import {
  CalendarCheck2,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Save,
  QrCode,
  Scan,
  Users,
  Search,
  CheckCheck,
  Sparkles,
} from 'lucide-react';

interface AttendanceSessionManagerProps {
  teacher: User;
  classOfferings: ClassOffering[];
  subjects: Subject[];
  sections: Section[];
  students: Student[];
  onSessionSaved?: () => void;
}

export const AttendanceSessionManager: React.FC<AttendanceSessionManagerProps> = ({
  teacher,
  classOfferings,
  subjects,
  sections,
  students,
  onSessionSaved,
}) => {
  // Filter offerings assigned to this teacher (or all if admin)
  const teacherOfferings = classOfferings.filter(
    (off) => teacher.role === 'admin' || off.teacherId === teacher.id || off.teacherId === teacher.teacherId
  );

  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(
    teacherOfferings[0]?.id || classOfferings[0]?.id || ''
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const nowTimeStr = new Date().toTimeString().slice(0, 5);

  const [sessionDate, setSessionDate] = useState<string>(todayStr);
  const [sessionTime, setSessionTime] = useState<string>(nowTimeStr);
  const [sessionTopic, setSessionTopic] = useState<string>('Lecture Session: Core Concepts & Practice');
  const [sessionType, setSessionType] = useState<AttendanceSession['sessionType']>('Regular Lecture');

  // Scanner state
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [lastScannedFeedback, setLastScannedFeedback] = useState<string | null>(null);

  const selectedOffering = classOfferings.find((o) => o.id === selectedOfferingId);
  const selectedSubject = subjects.find((s) => s.id === selectedOffering?.subjectId);
  const selectedSection = sections.find((sec) => sec.id === selectedOffering?.sectionId);

  // Students belonging to the offering's section
  const enrolledStudents = students.filter(
    (s) => s.sectionId === selectedOffering?.sectionId && s.enrollmentStatus === 'Enrolled'
  );

  // Active records state
  const [recordsMap, setRecordsMap] = useState<
    Record<string, { status: AttendanceStatus; remarks: string; markedAt: string }>
  >({});

  // Initialize records map when offering or students change
  useEffect(() => {
    const initialMap: Record<string, { status: AttendanceStatus; remarks: string; markedAt: string }> = {};
    enrolledStudents.forEach((stud) => {
      initialMap[stud.id] = {
        status: 'present',
        remarks: '',
        markedAt: nowTimeStr,
      };
    });
    setRecordsMap(initialMap);
  }, [selectedOfferingId, enrolledStudents.length]);

  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setRecordsMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { remarks: '', markedAt: nowTimeStr }),
        status,
        markedAt: new Date().toTimeString().slice(0, 5),
      },
    }));
  };

  const handleSetRemarks = (studentId: string, remarks: string) => {
    setRecordsMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'present', markedAt: nowTimeStr }),
        remarks,
      },
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: typeof recordsMap = {};
    const curTime = new Date().toTimeString().slice(0, 5);
    enrolledStudents.forEach((s) => {
      updated[s.id] = {
        status,
        remarks: recordsMap[s.id]?.remarks || '',
        markedAt: curTime,
      };
    });
    setRecordsMap(updated);
  };

  // Barcode / Student ID Quick Scanner Handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const trimmed = barcodeInput.trim().toUpperCase();
    const student = enrolledStudents.find(
      (s) =>
        s.studentNumber.toUpperCase() === trimmed ||
        s.studentNumber.replace('-', '').toUpperCase() === trimmed ||
        s.id === trimmed
    );

    if (student) {
      handleSetStatus(student.id, 'present');
      setLastScannedFeedback(`✓ ${student.firstName} ${student.lastName} marked PRESENT`);
    } else {
      setLastScannedFeedback(`⚠️ Student ID ${trimmed} not found in this class section roster.`);
    }

    setBarcodeInput('');
    setTimeout(() => setLastScannedFeedback(null), 3000);
  };

  // Stats
  const total = enrolledStudents.length;
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let excusedCount = 0;

  Object.values(recordsMap).forEach((r) => {
    if (r.status === 'present') presentCount++;
    if (r.status === 'late') lateCount++;
    if (r.status === 'absent') absentCount++;
    if (r.status === 'excused') excusedCount++;
  });

  const presentPercentage = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  const handleSaveSession = () => {
    if (!selectedOffering) return;

    const sessionRecords: AttendanceRecord[] = enrolledStudents.map((stud) => {
      const rec = recordsMap[stud.id] || { status: 'present', remarks: '', markedAt: nowTimeStr };
      return {
        id: `rec-${Date.now()}-${stud.id}`,
        sessionId: `att-sess-${Date.now()}`,
        studentId: stud.id,
        status: rec.status,
        markedAt: rec.markedAt,
        remarks: rec.remarks,
      };
    });

    const newSession: AttendanceSession = {
      id: `att-sess-${Date.now()}`,
      classOfferingId: selectedOffering.id,
      teacherId: teacher.id,
      date: sessionDate,
      startTime: sessionTime,
      topic: sessionTopic,
      sessionType,
      records: sessionRecords,
      createdAt: `${sessionDate} ${sessionTime}:00`,
    };

    saveAttendanceSession(newSession);
    alert(`Attendance session successfully recorded for ${sessionRecords.length} students!`);
    if (onSessionSaved) onSessionSaved();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Live Attendance Roll Call & Quick Scanner
            </h2>
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full animate-pulse">
              LIVE SESSION
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Log real-time class attendance, simulate barcode ID scanners, record student tardiness notes, and persist records
          </p>
        </div>

        <button
          onClick={handleSaveSession}
          className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <Save className="w-4 h-4 mr-2" />
          Save & Commit Attendance
        </button>
      </div>

      {/* Class & Session Controls Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Class offering selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Assigned Subject & Section</label>
            <select
              value={selectedOfferingId}
              onChange={(e) => setSelectedOfferingId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {teacherOfferings.map((off) => {
                const subj = subjects.find((s) => s.id === off.subjectId);
                const sec = sections.find((s) => s.id === off.sectionId);
                return (
                  <option key={off.id} value={off.id}>
                    {subj?.code} - {sec?.name} ({off.scheduleDays} {off.startTime})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Session Date */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Session Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50"
            />
          </div>

          {/* Session Time */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Roll Call Time</label>
            <input
              type="time"
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 font-mono"
            />
          </div>

          {/* Session Type */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Session Classification</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50"
            >
              <option value="Regular Lecture">Regular Lecture</option>
              <option value="Laboratory">Laboratory Session</option>
              <option value="Quiz / Exam">Quiz / Major Exam</option>
              <option value="Special Review">Special Review / Consultation</option>
            </select>
          </div>
        </div>

        {/* Topic input */}
        <div className="text-xs">
          <label className="block font-bold text-slate-700 mb-1">
            Lesson / Agenda Topic Description
          </label>
          <input
            type="text"
            value={sessionTopic}
            onChange={(e) => setSessionTopic(e.target.value)}
            placeholder="e.g. Chapter 4: Relational Database Modeling and SQL Joins"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Barcode / ID Quick Scanner Bar & Real-time KPI Counters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Scanner Simulation Box */}
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-xl shadow-md border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 mb-2">
              <Scan className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider">
                Barcode / ID Card Scanner
              </h3>
            </div>
            <p className="text-[11px] text-slate-300 mb-3">
              Scan student card or type student ID number (e.g. <code className="text-indigo-200 font-bold">2024-00101</code>) to instantaneously record attendance:
            </p>

            <form onSubmit={handleBarcodeSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan or type Student No..."
                  className="w-full pl-3 pr-20 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded"
                >
                  Mark
                </button>
              </div>
            </form>

            {lastScannedFeedback && (
              <div className="mt-3 p-2 bg-slate-800/90 rounded text-xs border border-indigo-500/30 font-medium animate-in fade-in">
                {lastScannedFeedback}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Hardware scanner input ready</span>
            <span className="font-mono text-emerald-400">ACTIVE</span>
          </div>
        </div>

        {/* Real-time Attendance KPI Badges */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Attendance Metrics ({selectedSubject?.code} - {selectedSection?.name})
              </span>
              <p className="text-[11px] text-slate-500">
                {total} Total Enrolled Students
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900">{presentPercentage}%</span>
              <span className="block text-[10px] uppercase font-bold text-emerald-700">Attendance Rate</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">Present</span>
              <span className="text-xl font-bold text-emerald-800">{presentCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-bold uppercase text-amber-700 block">Late</span>
              <span className="text-xl font-bold text-amber-800">{lateCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
              <span className="text-[10px] font-bold uppercase text-rose-700 block">Absent</span>
              <span className="text-xl font-bold text-rose-800">{absentCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-[10px] font-bold uppercase text-blue-700 block">Excused</span>
              <span className="text-xl font-bold text-blue-800">{excusedCount}</span>
            </div>
          </div>

          {/* Quick Bulk Actions */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">Quick Bulk Action:</span>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => handleMarkAll('present')}
                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded text-xs font-semibold"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('absent')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-semibold"
              >
                Reset All Absent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Student Roster Marking Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Student Class Roll Call Roster ({enrolledStudents.length} Students)
          </span>
          <span className="text-xs text-slate-500">
            Click status button to toggle • Enter remarks as needed
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4 w-12 text-center">#</th>
              <th className="py-2.5 px-4">Student Identification</th>
              <th className="py-2.5 px-4">Attendance Status</th>
              <th className="py-2.5 px-4">Marked Time</th>
              <th className="py-2.5 px-4">Notes & Medical / Commute Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {enrolledStudents.map((stud, idx) => {
              const rec = recordsMap[stud.id] || { status: 'present', remarks: '', markedAt: nowTimeStr };
              return (
                <tr key={stud.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-4">
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

                  {/* Status Toggle Buttons */}
                  <td className="py-2.5 px-4">
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 space-x-0.5">
                      <button
                        type="button"
                        onClick={() => handleSetStatus(stud.id, 'present')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          rec.status === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-emerald-700'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetStatus(stud.id, 'late')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          rec.status === 'late'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-slate-600 hover:text-amber-700'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetStatus(stud.id, 'absent')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          rec.status === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-rose-700'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetStatus(stud.id, 'excused')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          rec.status === 'excused'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-blue-700'
                        }`}
                      >
                        Excused
                      </button>
                    </div>
                  </td>

                  {/* Marked Time */}
                  <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                    {rec.markedAt}
                  </td>

                  {/* Remarks input */}
                  <td className="py-2.5 px-4">
                    <input
                      type="text"
                      value={rec.remarks}
                      onChange={(e) => handleSetRemarks(stud.id, e.target.value)}
                      placeholder="Add remark (e.g. excuse letter, traffic)..."
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
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
