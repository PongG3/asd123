import React, { useState } from 'react';
import {
  Student,
  Program,
  Section,
  Enrollment,
  SchoolSettings,
} from '../../types';
import {
  saveStudent,
  deleteStudent,
  generateNextStudentNumber,
} from '../../services/storage';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  FileText,
  QrCode,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  FileCheck,
} from 'lucide-react';

interface StudentDirectoryProps {
  students: Student[];
  programs: Program[];
  sections: Section[];
  enrollments: Enrollment[];
  settings: SchoolSettings;
  onOpenCOR: (student: Student) => void;
  onOpenIDCard: (student: Student) => void;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({
  students,
  programs,
  sections,
  enrollments,
  settings,
  onOpenCOR,
  onOpenIDCard,
}) => {
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);

  // Auto-generate student number for registration
  const nextStudentNum = generateNextStudentNumber();

  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    studentNumber: nextStudentNum,
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    email: '',
    contactNumber: '+63 ',
    gender: 'Male',
    birthDate: '2005-01-01',
    civilStatus: 'Single',
    address: '',
    city: 'Metro Manila',
    emergencyContactName: '',
    emergencyContactRelation: 'Mother',
    emergencyContactPhone: '',
    programId: programs[0]?.id || '',
    yearLevel: 1,
    entryStatus: 'Freshman',
    enrollmentStatus: 'Not Enrolled',
    admissionDate: new Date().toISOString().slice(0, 10),
    previousSchool: '',
    submittedDocuments: {
      birthCertificate: true,
      reportCard: true,
      goodMoral: true,
      idPhotos: true,
    },
  });

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.firstName} ${s.middleName || ''} ${s.lastName} ${s.studentNumber}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase());
    const matchesProgram = programFilter === 'all' || s.programId === programFilter;
    const matchesStatus = statusFilter === 'all' || s.enrollmentStatus === statusFilter;
    return matchesSearch && matchesProgram && matchesStatus;
  });

  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.firstName || !newStudent.lastName) return;

    const student: Student = {
      id: `stud-${Date.now()}`,
      studentNumber: newStudent.studentNumber || generateNextStudentNumber(),
      firstName: newStudent.firstName,
      middleName: newStudent.middleName || '',
      lastName: newStudent.lastName,
      suffix: newStudent.suffix || '',
      email: newStudent.email || `${newStudent.firstName.toLowerCase()}.${newStudent.lastName.toLowerCase()}@student.school.edu`,
      contactNumber: newStudent.contactNumber || '+63 900 000 0000',
      gender: (newStudent.gender as any) || 'Male',
      birthDate: newStudent.birthDate || '2005-01-01',
      civilStatus: (newStudent.civilStatus as any) || 'Single',
      address: newStudent.address || 'Campus Residence',
      city: newStudent.city || 'Metro Manila',
      emergencyContactName: newStudent.emergencyContactName || 'Parent / Guardian',
      emergencyContactRelation: newStudent.emergencyContactRelation || 'Parent',
      emergencyContactPhone: newStudent.emergencyContactPhone || '+63 900 000 0000',
      programId: newStudent.programId || programs[0].id,
      yearLevel: Number(newStudent.yearLevel) || 1,
      entryStatus: (newStudent.entryStatus as any) || 'Freshman',
      enrollmentStatus: 'Not Enrolled',
      admissionDate: newStudent.admissionDate || new Date().toISOString().slice(0, 10),
      previousSchool: newStudent.previousSchool || 'Senior High School',
      submittedDocuments: newStudent.submittedDocuments || {
        birthCertificate: true,
        reportCard: true,
        goodMoral: true,
        idPhotos: true,
      },
    };

    saveStudent(student);
    setShowAddModal(false);
  };

  const handleDelete = (student: Student) => {
    if (window.confirm(`Permanently remove student record for ${student.firstName} ${student.lastName}?`)) {
      deleteStudent(student.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Student Records & Profiles Directory
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
              {students.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registrar database of student demographic profiles, unique IDs, document verification, and credentials
          </p>
        </div>
        <button
          onClick={() => {
            setNewStudent((prev) => ({ ...prev, studentNumber: generateNextStudentNumber() }));
            setShowAddModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          Register New Student
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name or student number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1 text-xs">
            <span className="font-semibold text-slate-600">Program:</span>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-xs focus:outline-none"
            >
              <option value="all">All Programs</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>{p.code}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1 text-xs">
            <span className="font-semibold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-xs focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Enrolled">Enrolled</option>
              <option value="Pending">Pending</option>
              <option value="Not Enrolled">Not Enrolled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Student ID</th>
              <th className="py-3 px-4">Student Full Name</th>
              <th className="py-3 px-4">Program & Year</th>
              <th className="py-3 px-4">Section</th>
              <th className="py-3 px-4">Docs Verified</th>
              <th className="py-3 px-4">Enrollment Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((s) => {
              const prog = programs.find((p) => p.id === s.programId);
              const sec = sections.find((sec) => sec.id === s.sectionId);
              const docsTotal = Object.values(s.submittedDocuments || {}).filter(Boolean).length;
              return (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-900">{s.studentNumber}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                        {s.avatarUrl ? (
                          <img src={s.avatarUrl} alt={s.firstName} className="w-full h-full object-cover" />
                        ) : (
                          s.firstName.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">
                          {s.lastName}, {s.firstName} {s.middleName ? `${s.middleName.charAt(0)}.` : ''}
                        </p>
                        <p className="text-[11px] text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800">{prog?.code || '—'}</span>
                    <span className="text-slate-500 ml-1">Year {s.yearLevel}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    {sec?.name || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        docsTotal === 4
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {docsTotal}/4 Verified
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.enrollmentStatus === 'Enrolled'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.enrollmentStatus === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s.enrollmentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedStudentForView(s)}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded"
                      title="View Profile Details"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => onOpenIDCard(s)}
                      className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-slate-100 rounded"
                      title="Generate Student ID Card"
                    >
                      <QrCode className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => onOpenCOR(s)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded"
                      title="Print Certificate of Registration (COR)"
                    >
                      <FileText className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                      title="Delete Student Record"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Registrar Student Admission & Profile Form</h3>
                <p className="text-xs text-slate-500">Auto-generates student number and stores in school registry</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleRegisterStudent} className="space-y-4 text-xs">
              {/* Generated Student Number */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-blue-700 uppercase">Allocated Student ID</span>
                  <span className="font-mono font-extrabold text-base text-blue-900">{newStudent.studentNumber}</span>
                </div>
                <span className="text-[11px] text-blue-700 font-medium">Auto-generated sequentially</span>
              </div>

              {/* Personal Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">
                  1. Personal & Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={newStudent.firstName}
                      onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                      placeholder="e.g. Maria Clara"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Middle Name</label>
                    <input
                      type="text"
                      value={newStudent.middleName}
                      onChange={(e) => setNewStudent({ ...newStudent, middleName: e.target.value })}
                      placeholder="e.g. Santos"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={newStudent.lastName}
                      onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                      placeholder="e.g. Del Rosario"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={newStudent.gender}
                      onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Birth Date</label>
                    <input
                      type="date"
                      value={newStudent.birthDate}
                      onChange={(e) => setNewStudent({ ...newStudent, birthDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Civil Status</label>
                    <select
                      value={newStudent.civilStatus}
                      onChange={(e) => setNewStudent({ ...newStudent, civilStatus: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Number</label>
                    <input
                      type="text"
                      value={newStudent.contactNumber}
                      onChange={(e) => setNewStudent({ ...newStudent, contactNumber: e.target.value })}
                      placeholder="+63 9XX XXX XXXX"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Permanent Home Address</label>
                    <input
                      type="text"
                      value={newStudent.address}
                      onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                      placeholder="House No, Street, Barangay"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">
                  2. Parent / Guardian Emergency Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Guardian Name</label>
                    <input
                      type="text"
                      value={newStudent.emergencyContactName}
                      onChange={(e) => setNewStudent({ ...newStudent, emergencyContactName: e.target.value })}
                      placeholder="e.g. Maria Del Rosario"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={newStudent.emergencyContactRelation}
                      onChange={(e) => setNewStudent({ ...newStudent, emergencyContactRelation: e.target.value })}
                      placeholder="Mother / Father"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Guardian Contact Phone</label>
                    <input
                      type="text"
                      value={newStudent.emergencyContactPhone}
                      onChange={(e) => setNewStudent({ ...newStudent, emergencyContactPhone: e.target.value })}
                      placeholder="+63 9XX XXX XXXX"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Placement */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">
                  3. Program Curriculum & Documents
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Degree Program</label>
                    <select
                      value={newStudent.programId}
                      onChange={(e) => setNewStudent({ ...newStudent, programId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Year Level</label>
                    <select
                      value={newStudent.yearLevel}
                      onChange={(e) => setNewStudent({ ...newStudent, yearLevel: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Entry Classification</label>
                    <select
                      value={newStudent.entryStatus}
                      onChange={(e) => setNewStudent({ ...newStudent, entryStatus: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="Freshman">Freshman</option>
                      <option value="Transferee">Transferee</option>
                      <option value="Returning">Returning</option>
                    </select>
                  </div>
                </div>

                {/* Submitted Documents checklist */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block font-semibold text-slate-700 mb-2">Submitted Admission Credentials:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newStudent.submittedDocuments?.birthCertificate}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            submittedDocuments: {
                              ...newStudent.submittedDocuments!,
                              birthCertificate: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span>PSA Birth Certificate</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newStudent.submittedDocuments?.reportCard}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            submittedDocuments: {
                              ...newStudent.submittedDocuments!,
                              reportCard: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span>Form 137 / 138 (Card)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newStudent.submittedDocuments?.goodMoral}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            submittedDocuments: {
                              ...newStudent.submittedDocuments!,
                              goodMoral: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span>Certificate of Good Moral</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newStudent.submittedDocuments?.idPhotos}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            submittedDocuments: {
                              ...newStudent.submittedDocuments!,
                              idPhotos: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      <span>2x2 ID Photos</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Confirm & Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Profile Modal */}
      {selectedStudentForView && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-sm text-slate-900">Student Profile & Academic Summary</h3>
              <button onClick={() => setSelectedStudentForView(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                  {selectedStudentForView.avatarUrl ? (
                    <img src={selectedStudentForView.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-lg text-slate-500">
                      {selectedStudentForView.firstName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedStudentForView.firstName} {selectedStudentForView.middleName || ''} {selectedStudentForView.lastName}
                  </h4>
                  <div className="font-mono text-blue-800 font-bold">{selectedStudentForView.studentNumber}</div>
                  <span className="text-slate-500">{selectedStudentForView.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px]">PROGRAM</span>
                  <span className="font-bold text-slate-800">
                    {programs.find((p) => p.id === selectedStudentForView.programId)?.name || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px]">YEAR & SECTION</span>
                  <span className="font-bold text-slate-800">
                    Year {selectedStudentForView.yearLevel} • {sections.find((sec) => sec.id === selectedStudentForView.sectionId)?.name || 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px]">GUARDIAN</span>
                  <span className="text-slate-800 font-medium">
                    {selectedStudentForView.emergencyContactName} ({selectedStudentForView.emergencyContactPhone})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px]">PREVIOUS SCHOOL</span>
                  <span className="text-slate-800 font-medium">{selectedStudentForView.previousSchool || 'N/A'}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    onOpenIDCard(selectedStudentForView);
                    setSelectedStudentForView(null);
                  }}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded font-semibold"
                >
                  Print ID Card
                </button>
                <button
                  onClick={() => {
                    onOpenCOR(selectedStudentForView);
                    setSelectedStudentForView(null);
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded font-semibold"
                >
                  View COR Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
