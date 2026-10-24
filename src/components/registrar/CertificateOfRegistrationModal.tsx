import React from 'react';
import {
  Student,
  Enrollment,
  Program,
  Section,
  Subject,
  ClassOffering,
  AcademicYear,
  SchoolSettings,
  User,
} from '../../types';
import { Printer, X, CheckCircle, ShieldCheck, Download } from 'lucide-react';

interface CORModalProps {
  student: Student;
  enrollment?: Enrollment;
  program?: Program;
  section?: Section;
  subjects: Subject[];
  offerings: ClassOffering[];
  academicYear?: AcademicYear;
  settings: SchoolSettings;
  teachers: User[];
  onClose: () => void;
}

export const CertificateOfRegistrationModal: React.FC<CORModalProps> = ({
  student,
  enrollment,
  program,
  section,
  subjects,
  offerings,
  academicYear,
  settings,
  teachers,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Find enrolled class details
  const enrolledOfferings = offerings.filter((o) =>
    enrollment?.classOfferingIds?.includes(o.id)
  );

  const getSubject = (subjId: string) => subjects.find((s) => s.id === subjId);
  const getTeacher = (teacherId: string) => teachers.find((t) => t.id === teacherId);

  const totalUnits = enrolledOfferings.reduce((sum, off) => {
    const s = getSubject(off.subjectId);
    return sum + (s?.totalUnits || 0);
  }, 0);

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="no-print bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm">Official Certificate of Registration (COR)</span>
            <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-mono">
              VALIDATED
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Area */}
        <div className="printable-area p-8 sm:p-10 bg-white text-slate-900 text-xs">
          {/* Official Letterhead */}
          <div className="text-center pb-5 border-b-2 border-slate-800">
            <div className="flex justify-center mb-1">
              <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center font-bold text-lg text-slate-800">
                🏛️
              </div>
            </div>
            <h1 className="text-lg font-extrabold uppercase tracking-wide text-slate-900">
              {settings.schoolName}
            </h1>
            <p className="text-[11px] text-slate-600">{settings.schoolAddress}</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Office of the University Registrar • Email: {settings.contactEmail} • Tel: {settings.contactPhone}
            </p>
            <div className="mt-3 inline-block px-4 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-sm">
              CERTIFICATE OF REGISTRATION & ASSESSMENT
            </div>
            <p className="text-[11px] font-semibold text-slate-700 mt-1">
              {academicYear ? `${academicYear.code} - ${academicYear.semester}` : 'Academic Term'}
            </p>
          </div>

          {/* Student Information Grid */}
          <div className="my-5 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Student No.</span>
                <span className="font-mono font-bold text-sm text-blue-900">{student.studentNumber}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Full Name</span>
                <span className="font-bold text-xs text-slate-900">
                  {student.lastName}, {student.firstName} {student.middleName || ''}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Program / Degree</span>
                <span className="font-semibold text-xs text-slate-800">
                  {program ? `${program.code} - ${program.name}` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Year & Section</span>
                <span className="font-semibold text-xs text-slate-800">
                  Year {student.yearLevel} • {section?.name || 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Gender / Status</span>
                <span className="text-slate-800">{student.gender} • {student.civilStatus}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Contact No.</span>
                <span className="font-mono text-slate-800">{student.contactNumber}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Enrollment Status</span>
                <span className="font-bold text-emerald-700">{student.enrollmentStatus.toUpperCase()}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Date Issued</span>
                <span className="text-slate-800">{today}</span>
              </div>
            </div>
          </div>

          {/* Enrolled Courses Schedule Table */}
          <div className="mb-6">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
              Registered Academic Schedule
            </h3>
            <div className="border border-slate-300 rounded-sm overflow-hidden">
              <table className="w-full text-left text-[11px] divide-y divide-slate-200">
                <thead className="bg-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="py-2 px-3">Course Code</th>
                    <th className="py-2 px-3">Descriptive Title</th>
                    <th className="py-2 px-2 text-center">Lec</th>
                    <th className="py-2 px-2 text-center">Lab</th>
                    <th className="py-2 px-2 text-center">Units</th>
                    <th className="py-2 px-3">Schedule Days & Time</th>
                    <th className="py-2 px-3">Room</th>
                    <th className="py-2 px-3">Faculty Instructor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {enrolledOfferings.length > 0 ? (
                    enrolledOfferings.map((off) => {
                      const subj = getSubject(off.subjectId);
                      const instr = getTeacher(off.teacherId);
                      return (
                        <tr key={off.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono font-bold text-blue-900">
                            {subj?.code || '—'}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-900">
                            {subj?.title || 'Unknown Subject'}
                          </td>
                          <td className="py-2 px-2 text-center text-slate-600">{subj?.lecUnits || 0}</td>
                          <td className="py-2 px-2 text-center text-slate-600">{subj?.labUnits || 0}</td>
                          <td className="py-2 px-2 text-center font-bold text-slate-900">{subj?.totalUnits || 0}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">
                            {off.scheduleDays} {off.startTime} - {off.endTime}
                          </td>
                          <td className="py-2 px-3 text-slate-700">{off.room}</td>
                          <td className="py-2 px-3 text-slate-700">{instr?.name || 'Assigned Faculty'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-slate-400 italic">
                        No subject offerings attached to this registration.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={4} className="py-2 px-3 text-right uppercase text-slate-600">
                      Total Credit Units:
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-slate-900 text-xs">
                      {totalUnits}
                    </td>
                    <td colSpan={3} className="py-2 px-3 text-slate-500 text-[10px]">
                      Regular Full-Time Load
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Assessment of Fees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                Assessment of School Fees
              </h4>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tuition Fee:</span>
                  <span className="font-mono">₱{(enrollment?.feeSummary?.tuitionFee || 12000).toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Laboratory & Computer Fees:</span>
                  <span className="font-mono">₱{(enrollment?.feeSummary?.labFee || 3500).toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Miscellaneous & Athletics:</span>
                  <span className="font-mono">₱{(enrollment?.feeSummary?.miscFee || 2500).toLocaleString()}.00</span>
                </div>
                {(enrollment?.feeSummary?.discount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Scholarship / Grant Deduction:</span>
                    <span className="font-mono">-₱{(enrollment?.feeSummary.discount || 0).toLocaleString()}.00</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-xs text-slate-900">
                  <span>NET TOTAL AMOUNT DUE:</span>
                  <span className="font-mono text-blue-900">₱{(enrollment?.feeSummary?.netTotal || 18000).toLocaleString()}.00</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Registrar Notice & Conditions
                </h4>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  1. This document serves as the official proof of registration for the specified semester.
                  <br />
                  2. Changes in schedule or dropping of subjects must be filed within the official add/drop period.
                  <br />
                  3. A student is held responsible for attendance once enrolled.
                </p>
              </div>

              {/* Barcode Strip */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold tracking-widest text-[9px] text-slate-400">
                    COR-AUTH-{student.studentNumber.replace('-', '')}-{Date.now().toString().slice(-6)}
                  </div>
                  <div className="h-6 w-36 bg-slate-900 mt-1 flex items-center justify-center text-white text-[8px] font-mono tracking-widest">
                    ||||| | |||| || ||| ||||
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center text-[10px] text-emerald-700 font-semibold">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Registrar Certified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Lines */}
          <div className="pt-6 grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="border-b border-slate-900 h-10 flex items-end justify-center pb-1">
                <span className="font-semibold text-slate-800">
                  {student.firstName} {student.lastName}
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
                Student's Signature Over Printed Name
              </p>
            </div>
            <div>
              <div className="border-b border-slate-900 h-10 flex items-end justify-center pb-1">
                <span className="font-bold text-slate-900">
                  Marcus Sterling, M.Ed.
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
                University Registrar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
