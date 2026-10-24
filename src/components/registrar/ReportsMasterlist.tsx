import React, { useState } from 'react';
import {
  Student,
  Program,
  Section,
  Enrollment,
  SchoolSettings,
} from '../../types';
import {
  Printer,
  Download,
  FileSpreadsheet,
  Users,
  Filter,
  Layers,
  GraduationCap,
} from 'lucide-react';

interface ReportsMasterlistProps {
  students: Student[];
  programs: Program[];
  sections: Section[];
  enrollments: Enrollment[];
  settings: SchoolSettings;
}

export const ReportsMasterlist: React.FC<ReportsMasterlistProps> = ({
  students,
  programs,
  sections,
  enrollments,
  settings,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.id || ''
  );

  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const selectedProgram = programs.find((p) => p.id === selectedSection?.programId);

  // Students enrolled in this section
  const sectionStudents = students.filter(
    (s) => s.sectionId === selectedSectionId && s.enrollmentStatus === 'Enrolled'
  );

  const maleCount = sectionStudents.filter((s) => s.gender === 'Male').length;
  const femaleCount = sectionStudents.filter((s) => s.gender === 'Female').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['No.', 'Student Number', 'Last Name', 'First Name', 'Middle Name', 'Gender', 'Program', 'Year', 'Section', 'Contact Number', 'Email'];
    const rows = sectionStudents.map((s, idx) => [
      idx + 1,
      s.studentNumber,
      `"${s.lastName}"`,
      `"${s.firstName}"`,
      `"${s.middleName || ''}"`,
      s.gender,
      `"${selectedProgram?.code || ''}"`,
      s.yearLevel,
      `"${selectedSection?.name || ''}"`,
      `"${s.contactNumber}"`,
      `"${s.email}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `masterlist_${selectedSection?.name || 'section'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header (No print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Class Masterlists & Enrollment Reports
          </h2>
          <p className="text-xs text-slate-500">
            Generate printable official student rosters, program enrollment summaries, and export datasets
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print Official Masterlist
          </button>
        </div>
      </div>

      {/* Section Selector Toolbar (No print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Layers className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Select Class Section:</span>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sections.map((sec) => {
              const prog = programs.find((p) => p.id === sec.programId);
              return (
                <option key={sec.id} value={sec.id}>
                  {sec.name} - {prog?.code} (Year {sec.yearLevel})
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex items-center space-x-4 text-xs font-medium text-slate-600">
          <span>
            Total Enrolled: <strong className="text-slate-900">{sectionStudents.length}</strong> / {selectedSection?.maxCapacity}
          </span>
          <span>•</span>
          <span className="text-blue-700 font-semibold">Male: {maleCount}</span>
          <span className="text-purple-700 font-semibold">Female: {femaleCount}</span>
        </div>
      </div>

      {/* Printable Masterlist Document Sheet */}
      <div className="printable-area bg-white p-8 sm:p-10 rounded-xl border border-slate-200 shadow-sm text-xs">
        {/* Official Header */}
        <div className="text-center pb-5 border-b border-slate-800">
          <h1 className="text-base font-extrabold uppercase text-slate-900 tracking-wider">
            {settings.schoolName}
          </h1>
          <p className="text-[11px] text-slate-600">{settings.schoolAddress}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            OFFICE OF THE REGISTRAR • OFFICIAL CLASS MASTERLIST
          </p>
          <div className="mt-3 inline-block px-4 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-xs">
            SECTION: {selectedSection?.name || 'N/A'} • {selectedProgram?.name}
          </div>
          <p className="text-[11px] font-semibold text-slate-700 mt-1">
            Designated Room: {selectedSection?.room || 'TBA'} • Academic Year 2024-2025 (1st Term)
          </p>
        </div>

        {/* Roster Table */}
        <div className="mt-6 border border-slate-300 rounded-sm overflow-hidden">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-100 font-bold text-slate-800">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3">Student Number</th>
                <th className="py-2.5 px-4">Student Name (Last, First, Middle)</th>
                <th className="py-2.5 px-2 text-center">Gender</th>
                <th className="py-2.5 px-3">Contact Phone</th>
                <th className="py-2.5 px-3">Admission Status</th>
                <th className="py-2.5 px-3 text-center">Remarks / Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sectionStudents.length > 0 ? (
                sectionStudents.map((stud, idx) => (
                  <tr key={stud.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-bold text-blue-900">{stud.studentNumber}</td>
                    <td className="py-2 px-4 font-semibold text-slate-900">
                      {stud.lastName}, {stud.firstName} {stud.middleName || ''}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-700">{stud.gender}</td>
                    <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">{stud.contactNumber}</td>
                    <td className="py-2 px-3 font-medium text-emerald-800">{stud.entryStatus}</td>
                    <td className="py-2 px-3 text-center text-slate-300">
                      _________________
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                    No approved students currently enrolled in this section.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-300 text-[11px]">
              <tr>
                <td colSpan={3} className="py-2 px-3 text-slate-700">
                  Total Enrolled: {sectionStudents.length} Students
                </td>
                <td colSpan={2} className="py-2 px-3 text-slate-600">
                  Male: {maleCount} | Female: {femaleCount}
                </td>
                <td colSpan={2} className="py-2 px-3 text-right text-slate-500">
                  Certified True & Correct
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Verification Footer */}
        <div className="mt-8 pt-4 grid grid-cols-2 gap-12 text-center text-xs">
          <div>
            <div className="border-b border-slate-900 h-10 flex items-end justify-center pb-1">
              <span className="font-semibold text-slate-800">
                Prof. Alan Turing
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
              Class Section Adviser
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
  );
};
