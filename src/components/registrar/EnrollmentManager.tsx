import React, { useState } from 'react';
import {
  Student,
  Enrollment,
  Program,
  Section,
  Subject,
  ClassOffering,
  AcademicYear,
  User,
} from '../../types';
import { saveEnrollment, logAudit } from '../../services/storage';
import {
  UserPlus,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Layers,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

interface EnrollmentManagerProps {
  enrollments: Enrollment[];
  students: Student[];
  programs: Program[];
  sections: Section[];
  subjects: Subject[];
  classOfferings: ClassOffering[];
  academicYears: AcademicYear[];
  currentUser: User;
  onOpenCOR: (student: Student) => void;
}

export const EnrollmentManager: React.FC<EnrollmentManagerProps> = ({
  enrollments,
  students,
  programs,
  sections,
  subjects,
  classOfferings,
  academicYears,
  currentUser,
  onOpenCOR,
}) => {
  const [tabFilter, setTabFilter] = useState<'all' | 'Pending' | 'Enrolled' | 'Rejected'>('all');
  const [search, setSearch] = useState('');
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedOfferings, setSelectedOfferings] = useState<string[]>([]);
  const [tuitionPerUnit, setTuitionPerUnit] = useState<number>(1000);
  const [miscFee, setMiscFee] = useState<number>(2500);
  const [labFee, setLabFee] = useState<number>(3500);
  const [discount, setDiscount] = useState<number>(0);
  const [rejectionNotes, setRejectionNotes] = useState<string>('');
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);

  const activeAY = academicYears.find((y) => y.isActive) || academicYears[0];

  const filteredEnrollments = enrollments.filter((e) => {
    const student = students.find((s) => s.id === e.studentId);
    const searchTarget = `${student?.firstName || ''} ${student?.lastName || ''} ${student?.studentNumber || ''}`.toLowerCase();
    const matchesSearch = searchTarget.includes(search.toLowerCase());
    const matchesTab = tabFilter === 'all' || e.status === tabFilter;
    return matchesSearch && matchesTab;
  });

  const getSubject = (subjId: string) => subjects.find((s) => s.id === subjId);

  // Available offerings for selected section
  const availableOfferings = classOfferings.filter(
    (off) => !selectedSectionId || off.sectionId === selectedSectionId
  );

  // Calculate total units
  const totalUnits = selectedOfferings.reduce((sum, offId) => {
    const off = classOfferings.find((c) => c.id === offId);
    const s = off ? getSubject(off.subjectId) : null;
    return sum + (s?.totalUnits || 0);
  }, 0);

  const calculatedTuition = totalUnits * tuitionPerUnit;
  const netTotal = Math.max(calculatedTuition + labFee + miscFee - discount, 0);

  const handleOpenNewEnrollment = (student?: Student) => {
    setEditingEnrollment(null);
    if (student) {
      setSelectedStudentId(student.id);
      const studentSec = student.sectionId || sections[0]?.id || '';
      setSelectedSectionId(studentSec);
      // Auto select matching offerings
      const matching = classOfferings.filter((o) => o.sectionId === studentSec).map((o) => o.id);
      setSelectedOfferings(matching);
    } else {
      const firstUnenrolled = students.find((s) => s.enrollmentStatus !== 'Enrolled');
      setSelectedStudentId(firstUnenrolled ? firstUnenrolled.id : students[0]?.id || '');
      setSelectedSectionId(sections[0]?.id || '');
      const matching = classOfferings.filter((o) => o.sectionId === sections[0]?.id).map((o) => o.id);
      setSelectedOfferings(matching);
    }
    setShowProcessModal(true);
  };

  const handleOpenReview = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setSelectedStudentId(enrollment.studentId);
    setSelectedSectionId(enrollment.sectionId);
    setSelectedOfferings(enrollment.classOfferingIds || []);
    setTuitionPerUnit(Math.round(enrollment.feeSummary.tuitionFee / (enrollment.totalUnits || 1)));
    setMiscFee(enrollment.feeSummary.miscFee);
    setLabFee(enrollment.feeSummary.labFee);
    setDiscount(enrollment.feeSummary.discount);
    setShowProcessModal(true);
  };

  const handleSaveEnrollment = (status: 'Pending' | 'Enrolled' | 'Rejected') => {
    if (!selectedStudentId) {
      alert('Please select a student.');
      return;
    }

    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    const enrId = editingEnrollment ? editingEnrollment.id : `enr-${Date.now()}`;
    const enr: Enrollment = {
      id: enrId,
      studentId: selectedStudentId,
      academicYearId: activeAY?.id || 'ay-2024-1',
      programId: student.programId,
      yearLevel: student.yearLevel,
      sectionId: selectedSectionId,
      enrolledSubjectIds: selectedOfferings.map((offId) => {
        const off = classOfferings.find((c) => c.id === offId);
        return off?.subjectId || '';
      }),
      classOfferingIds: selectedOfferings,
      totalUnits,
      status,
      dateApplied: editingEnrollment?.dateApplied || new Date().toISOString().slice(0, 10),
      dateProcessed: new Date().toISOString().slice(0, 10),
      processedByUserId: currentUser.id,
      rejectionReason: status === 'Rejected' ? rejectionNotes : undefined,
      feeSummary: {
        tuitionFee: calculatedTuition,
        labFee,
        miscFee,
        discount,
        netTotal,
      },
    };

    saveEnrollment(enr);
    setShowProcessModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Enrollment Applications & Section Assignment
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
              {enrollments.filter((e) => e.status === 'Pending').length} Pending Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Process incoming enrollment requests, evaluate prerequisite unit loads, compute assessed fees, and assign classes
          </p>
        </div>
        <button
          onClick={() => handleOpenNewEnrollment()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          Create New Enrollment
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search enrolled student name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex space-x-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs">
          <button
            onClick={() => setTabFilter('all')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              tabFilter === 'all' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-600'
            }`}
          >
            All ({enrollments.length})
          </button>
          <button
            onClick={() => setTabFilter('Pending')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              tabFilter === 'Pending' ? 'bg-white shadow-xs text-amber-700' : 'text-slate-600'
            }`}
          >
            Pending ({enrollments.filter((e) => e.status === 'Pending').length})
          </button>
          <button
            onClick={() => setTabFilter('Enrolled')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              tabFilter === 'Enrolled' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-600'
            }`}
          >
            Enrolled ({enrollments.filter((e) => e.status === 'Enrolled').length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Student ID & Name</th>
              <th className="py-3 px-4">Program & Year</th>
              <th className="py-3 px-4">Assigned Section</th>
              <th className="py-3 px-4 text-center">Credit Load</th>
              <th className="py-3 px-4">Assessed Total</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEnrollments.map((enr) => {
              const student = students.find((s) => s.id === enr.studentId);
              const program = programs.find((p) => p.id === enr.programId);
              const sec = sections.find((s) => s.id === enr.sectionId);
              return (
                <tr key={enr.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-blue-900 block">
                      {student?.studentNumber || '—'}
                    </span>
                    <span className="font-semibold text-slate-900 text-xs">
                      {student ? `${student.lastName}, ${student.firstName}` : 'Unknown Student'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800">{program?.code || '—'}</span>
                    <span className="text-slate-500 ml-1">Year {enr.yearLevel}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    {sec?.name || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">
                    {enr.totalUnits} Units
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    ₱{(enr.feeSummary?.netTotal || 0).toLocaleString()}.00
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        enr.status === 'Enrolled'
                          ? 'bg-emerald-100 text-emerald-800'
                          : enr.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {enr.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenReview(enr)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px]"
                    >
                      Review / Edit
                    </button>
                    {student && (
                      <button
                        onClick={() => onOpenCOR(student)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded text-[11px]"
                        title="Print Certificate of Registration"
                      >
                        <FileText className="w-3.5 h-3.5 inline mr-1" />
                        COR
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Processing & Evaluation Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingEnrollment ? 'Evaluate & Process Enrollment' : 'New Student Enrollment Application'}
                </h3>
                <p className="text-xs text-slate-500">
                  Assess subject offerings, class schedules, and tuition fees
                </p>
              </div>
              <button onClick={() => setShowProcessModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Select Student */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                      const s = students.find((st) => st.id === e.target.value);
                      if (s?.sectionId) {
                        setSelectedSectionId(s.sectionId);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.studentNumber} - {s.lastName}, {s.firstName} ({s.enrollmentStatus})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Class Section</label>
                  <select
                    value={selectedSectionId}
                    onChange={(e) => {
                      const secId = e.target.value;
                      setSelectedSectionId(secId);
                      const matching = classOfferings.filter((o) => o.sectionId === secId).map((o) => o.id);
                      setSelectedOfferings(matching);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name} ({sec.room} • Cap: {sec.maxCapacity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Offerings Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Available Subjects & Class Offerings
                  </span>
                  <span className="font-semibold text-blue-700">
                    Total Load: {totalUnits} Units
                  </span>
                </div>
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {classOfferings.map((off) => {
                    const subj = getSubject(off.subjectId);
                    const sec = sections.find((s) => s.id === off.sectionId);
                    const isChecked = selectedOfferings.includes(off.id);
                    return (
                      <label
                        key={off.id}
                        className={`p-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                          isChecked ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOfferings([...selectedOfferings, off.id]);
                              } else {
                                setSelectedOfferings(selectedOfferings.filter((id) => id !== off.id));
                              }
                            }}
                            className="rounded text-blue-600"
                          />
                          <div>
                            <span className="font-mono font-bold text-blue-900 mr-2">{subj?.code}</span>
                            <span className="font-medium text-slate-800">{subj?.title}</span>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Section {sec?.name} • {off.scheduleDays} {off.startTime}-{off.endTime} • {off.room}
                            </div>
                          </div>
                        </div>
                        <span className="font-bold text-slate-700 text-xs">{subj?.totalUnits} Units</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Fee Breakdown Assessment */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Tuition & Fee Assessment Breakdown
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 text-[10px] font-semibold mb-1">
                      Rate / Unit (₱)
                    </label>
                    <input
                      type="number"
                      value={tuitionPerUnit}
                      onChange={(e) => setTuitionPerUnit(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] font-semibold mb-1">
                      Lab Fees (₱)
                    </label>
                    <input
                      type="number"
                      value={labFee}
                      onChange={(e) => setLabFee(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] font-semibold mb-1">
                      Misc / Athletic (₱)
                    </label>
                    <input
                      type="number"
                      value={miscFee}
                      onChange={(e) => setMiscFee(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] font-semibold mb-1">
                      Scholarship Discount (₱)
                    </label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono text-emerald-700 font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 uppercase">Computed Net Assessment:</span>
                  <span className="font-mono font-extrabold text-base text-blue-900">
                    ₱{netTotal.toLocaleString()}.00
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowProcessModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleSaveEnrollment('Rejected')}
                    className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold border border-rose-200"
                  >
                    Reject Application
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEnrollment('Pending')}
                    className="px-3 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg font-semibold border border-amber-200"
                  >
                    Save as Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEnrollment('Enrolled')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs flex items-center space-x-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Approve & Finalize Enrollment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
