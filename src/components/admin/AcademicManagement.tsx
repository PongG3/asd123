import React, { useState } from 'react';
import {
  AcademicYear,
  ClassOffering,
  Program,
  Section,
  Subject,
  User,
  YearLevel,
} from '../../types';
import {
  saveAcademicYear,
  saveClassOffering,
  saveProgram,
  saveSection,
  saveSubject,
} from '../../services/storage';
import {
  Building2,
  Calendar,
  Layers,
  BookOpen,
  Clock,
  Plus,
  Check,
  Edit2,
  CheckCircle2,
} from 'lucide-react';

interface AcademicManagementProps {
  academicYears: AcademicYear[];
  programs: Program[];
  yearLevels: YearLevel[];
  sections: Section[];
  subjects: Subject[];
  classOfferings: ClassOffering[];
  teachers: User[];
}

export const AcademicManagement: React.FC<AcademicManagementProps> = ({
  academicYears,
  programs,
  yearLevels,
  sections,
  subjects,
  classOfferings,
  teachers,
}) => {
  const [activeTab, setActiveTab] = useState<'years' | 'programs' | 'sections' | 'subjects' | 'offerings'>('years');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [newYear, setNewYear] = useState<Partial<AcademicYear>>({
    code: '2025-2026',
    name: 'Academic Year 2025-2026 - 1st Term',
    semester: '1st Semester',
    startDate: '2025-08-15',
    endDate: '2025-12-20',
    isActive: false,
  });

  const [newProgram, setNewProgram] = useState<Partial<Program>>({
    code: '',
    name: '',
    department: 'College of Computer Studies',
    totalUnits: 140,
    yearsToComplete: 4,
  });

  const [newSection, setNewSection] = useState<Partial<Section>>({
    name: '',
    programId: programs[0]?.id || '',
    yearLevel: 1,
    academicYearId: academicYears.find((y) => y.isActive)?.id || academicYears[0]?.id || '',
    room: 'Room 101',
    maxCapacity: 40,
  });

  const [newSubject, setNewSubject] = useState<Partial<Subject>>({
    code: '',
    title: '',
    lecUnits: 2,
    labUnits: 1,
    totalUnits: 3,
    yearLevel: 1,
    semester: '1st Semester',
  });

  const [newOffering, setNewOffering] = useState<Partial<ClassOffering>>({
    subjectId: subjects[0]?.id || '',
    sectionId: sections[0]?.id || '',
    teacherId: teachers[0]?.id || '',
    academicYearId: academicYears.find((y) => y.isActive)?.id || academicYears[0]?.id || '',
    scheduleDays: 'MWF',
    startTime: '08:00',
    endTime: '09:30',
    room: 'Room 201',
    maxCapacity: 40,
  });

  const handleCreateYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear.code || !newYear.name) return;
    const item: AcademicYear = {
      id: `ay-${Date.now()}`,
      code: newYear.code,
      name: newYear.name,
      semester: newYear.semester as any,
      startDate: newYear.startDate || '2025-08-01',
      endDate: newYear.endDate || '2025-12-20',
      isActive: Boolean(newYear.isActive),
    };
    saveAcademicYear(item);
    setShowModal(false);
  };

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgram.code || !newProgram.name) return;
    const item: Program = {
      id: `prog-${Date.now()}`,
      code: newProgram.code.toUpperCase(),
      name: newProgram.name,
      department: newProgram.department || 'College of Computer Studies',
      totalUnits: Number(newProgram.totalUnits) || 140,
      yearsToComplete: Number(newProgram.yearsToComplete) || 4,
    };
    saveProgram(item);
    setShowModal(false);
    setNewProgram({ code: '', name: '', department: 'College of Computer Studies', totalUnits: 140, yearsToComplete: 4 });
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSection.name) return;
    const item: Section = {
      id: `sec-${Date.now()}`,
      name: newSection.name,
      programId: newSection.programId || programs[0].id,
      yearLevel: Number(newSection.yearLevel) || 1,
      academicYearId: newSection.academicYearId || academicYears[0].id,
      room: newSection.room || 'Room 101',
      maxCapacity: Number(newSection.maxCapacity) || 40,
    };
    saveSection(item);
    setShowModal(false);
    setNewSection({ name: '', programId: programs[0]?.id || '', yearLevel: 1, room: 'Room 101', maxCapacity: 40 });
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.code || !newSubject.title) return;
    const total = (Number(newSubject.lecUnits) || 0) + (Number(newSubject.labUnits) || 0);
    const item: Subject = {
      id: `subj-${Date.now()}`,
      code: newSubject.code.toUpperCase(),
      title: newSubject.title,
      lecUnits: Number(newSubject.lecUnits) || 0,
      labUnits: Number(newSubject.labUnits) || 0,
      totalUnits: total,
      yearLevel: Number(newSubject.yearLevel) || 1,
      semester: newSubject.semester as any,
    };
    saveSubject(item);
    setShowModal(false);
    setNewSubject({ code: '', title: '', lecUnits: 2, labUnits: 1, totalUnits: 3, yearLevel: 1, semester: '1st Semester' });
  };

  const handleCreateOffering = (e: React.FormEvent) => {
    e.preventDefault();
    const item: ClassOffering = {
      id: `class-${Date.now()}`,
      subjectId: newOffering.subjectId || subjects[0].id,
      sectionId: newOffering.sectionId || sections[0].id,
      teacherId: newOffering.teacherId || teachers[0].id,
      academicYearId: newOffering.academicYearId || academicYears[0].id,
      scheduleDays: newOffering.scheduleDays || 'MWF',
      startTime: newOffering.startTime || '08:00',
      endTime: newOffering.endTime || '09:30',
      room: newOffering.room || 'Room 101',
      maxCapacity: Number(newOffering.maxCapacity) || 40,
    };
    saveClassOffering(item);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Subnav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Academic Curriculum & Structure
          </h2>
          <p className="text-xs text-slate-500">
            Configure Academic Terms, Degree Programs, Sections, Subject Catalog, and Class Offerings
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add New {activeTab === 'years' ? 'Academic Year' : activeTab === 'programs' ? 'Program' : activeTab === 'sections' ? 'Section' : activeTab === 'subjects' ? 'Subject' : 'Class Offering'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto text-xs pb-1">
        <button
          onClick={() => setActiveTab('years')}
          className={`px-4 py-2 font-semibold rounded-lg flex items-center space-x-2 transition-all ${
            activeTab === 'years'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Academic Terms ({academicYears.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('programs')}
          className={`px-4 py-2 font-semibold rounded-lg flex items-center space-x-2 transition-all ${
            activeTab === 'programs'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Programs / Degrees ({programs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2 font-semibold rounded-lg flex items-center space-x-2 transition-all ${
            activeTab === 'sections'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Class Sections ({sections.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-2 font-semibold rounded-lg flex items-center space-x-2 transition-all ${
            activeTab === 'subjects'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Subjects Catalog ({subjects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('offerings')}
          className={`px-4 py-2 font-semibold rounded-lg flex items-center space-x-2 transition-all ${
            activeTab === 'offerings'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Class Schedules ({classOfferings.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: Academic Years */}
      {activeTab === 'years' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Academic Year</th>
                <th className="py-3 px-4">Semester Term</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">System Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {academicYears.map((ay) => (
                <tr key={ay.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{ay.code}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{ay.semester}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {ay.startDate} to {ay.endDate}
                  </td>
                  <td className="py-3 px-4">
                    {ay.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Current Active Term
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-medium">Inactive</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!ay.isActive && (
                      <button
                        onClick={() => saveAcademicYear({ ...ay, isActive: true })}
                        className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded text-[11px] font-semibold border border-slate-300 hover:border-blue-300"
                      >
                        Set as Active
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: Programs */}
      {activeTab === 'programs' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Program Code</th>
                <th className="py-3 px-4">Degree Title</th>
                <th className="py-3 px-4">Department / College</th>
                <th className="py-3 px-4 text-center">Total Units</th>
                <th className="py-3 px-4 text-center">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {programs.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold font-mono text-blue-900">{p.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                  <td className="py-3 px-4 text-slate-600">{p.department}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">{p.totalUnits} Units</td>
                  <td className="py-3 px-4 text-center text-slate-600">{p.yearsToComplete} Years</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: Sections */}
      {activeTab === 'sections' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Section Name</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Year Level</th>
                <th className="py-3 px-4">Designated Room</th>
                <th className="py-3 px-4 text-center">Capacity</th>
                <th className="py-3 px-4">Assigned Adviser</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sections.map((sec) => {
                const prog = programs.find((p) => p.id === sec.programId);
                const adv = teachers.find((t) => t.id === sec.adviserTeacherId);
                return (
                  <tr key={sec.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">{sec.name}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{prog?.code || '—'} - {prog?.name}</td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">Year {sec.yearLevel}</td>
                    <td className="py-3 px-4 text-slate-600">{sec.room}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900">{sec.maxCapacity}</td>
                    <td className="py-3 px-4 text-slate-700">{adv?.name || 'Unassigned'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: Subjects */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-2 text-center">Lec Units</th>
                <th className="py-3 px-2 text-center">Lab Units</th>
                <th className="py-3 px-2 text-center">Total Units</th>
                <th className="py-3 px-4">Year & Semester</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold font-mono text-blue-900">{s.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{s.title}</td>
                  <td className="py-3 px-2 text-center text-slate-600">{s.lecUnits}</td>
                  <td className="py-3 px-2 text-center text-slate-600">{s.labUnits}</td>
                  <td className="py-3 px-2 text-center font-bold text-slate-900">{s.totalUnits}</td>
                  <td className="py-3 px-4 text-slate-600">
                    Year {s.yearLevel || 1} • {s.semester || '1st Semester'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: Class Offerings */}
      {activeTab === 'offerings' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Schedule Days & Time</th>
                <th className="py-3 px-4">Assigned Room</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4 text-center">Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classOfferings.map((off) => {
                const subj = subjects.find((s) => s.id === off.subjectId);
                const sec = sections.find((s) => s.id === off.sectionId);
                const instr = teachers.find((t) => t.id === off.teacherId);
                return (
                  <tr key={off.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-900 block">{subj?.code}</span>
                      <span className="text-slate-600 text-[11px] truncate block max-w-xs">{subj?.title}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{sec?.name}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {off.scheduleDays} • {off.startTime} - {off.endTime}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{off.room}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{instr?.name || 'TBA'}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">{off.maxCapacity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-sm text-slate-900">
                Create New {activeTab === 'years' ? 'Academic Year' : activeTab === 'programs' ? 'Program' : activeTab === 'sections' ? 'Section' : activeTab === 'subjects' ? 'Subject' : 'Class Offering'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {activeTab === 'years' && (
              <form onSubmit={handleCreateYear} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Year Code (e.g. 2025-2026)</label>
                  <input
                    type="text"
                    required
                    value={newYear.code}
                    onChange={(e) => setNewYear({ ...newYear, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Descriptive Name</label>
                  <input
                    type="text"
                    required
                    value={newYear.name}
                    onChange={(e) => setNewYear({ ...newYear, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester Term</label>
                  <select
                    value={newYear.semester}
                    onChange={(e) => setNewYear({ ...newYear, semester: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newYear.isActive}
                    onChange={(e) => setNewYear({ ...newYear, isActive: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="isActive" className="font-semibold text-slate-700">Set as active term immediately</label>
                </div>
                <div className="pt-3 flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 bg-slate-100 rounded text-slate-600">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded">Save Term</button>
                </div>
              </form>
            )}

            {activeTab === 'programs' && (
              <form onSubmit={handleCreateProgram} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Program Code (e.g. BSCS, BSED)</label>
                  <input
                    type="text"
                    required
                    value={newProgram.code}
                    onChange={(e) => setNewProgram({ ...newProgram, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Degree Title</label>
                  <input
                    type="text"
                    required
                    value={newProgram.name}
                    onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newProgram.department}
                    onChange={(e) => setNewProgram({ ...newProgram, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Total Units</label>
                    <input
                      type="number"
                      value={newProgram.totalUnits}
                      onChange={(e) => setNewProgram({ ...newProgram, totalUnits: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Years to Complete</label>
                    <input
                      type="number"
                      value={newProgram.yearsToComplete}
                      onChange={(e) => setNewProgram({ ...newProgram, yearsToComplete: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="pt-3 flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 bg-slate-100 rounded text-slate-600">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded">Save Program</button>
                </div>
              </form>
            )}

            {activeTab === 'sections' && (
              <form onSubmit={handleCreateSection} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section Name (e.g. BSCS-1B)</label>
                  <input
                    type="text"
                    required
                    value={newSection.name}
                    onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Program</label>
                  <select
                    value={newSection.programId}
                    onChange={(e) => setNewSection({ ...newSection, programId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Year Level</label>
                    <select
                      value={newSection.yearLevel}
                      onChange={(e) => setNewSection({ ...newSection, yearLevel: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Max Capacity</label>
                    <input
                      type="number"
                      value={newSection.maxCapacity}
                      onChange={(e) => setNewSection({ ...newSection, maxCapacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Room</label>
                  <input
                    type="text"
                    value={newSection.room}
                    onChange={(e) => setNewSection({ ...newSection, room: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="pt-3 flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 bg-slate-100 rounded text-slate-600">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded">Save Section</button>
                </div>
              </form>
            )}

            {activeTab === 'subjects' && (
              <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code (e.g. CS103)</label>
                  <input
                    type="text"
                    required
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={newSubject.title}
                    onChange={(e) => setNewSubject({ ...newSubject, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Lecture Units</label>
                    <input
                      type="number"
                      value={newSubject.lecUnits}
                      onChange={(e) => setNewSubject({ ...newSubject, lecUnits: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Lab Units</label>
                    <input
                      type="number"
                      value={newSubject.labUnits}
                      onChange={(e) => setNewSubject({ ...newSubject, labUnits: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="pt-3 flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 bg-slate-100 rounded text-slate-600">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded">Save Subject</button>
                </div>
              </form>
            )}

            {activeTab === 'offerings' && (
              <form onSubmit={handleCreateOffering} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={newOffering.subjectId}
                    onChange={(e) => setNewOffering({ ...newOffering, subjectId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.code} - {s.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={newOffering.sectionId}
                    onChange={(e) => setNewOffering({ ...newOffering, sectionId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teacher / Instructor</label>
                  <select
                    value={newOffering.teacherId}
                    onChange={(e) => setNewOffering({ ...newOffering, teacherId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Days</label>
                    <input
                      type="text"
                      value={newOffering.scheduleDays}
                      onChange={(e) => setNewOffering({ ...newOffering, scheduleDays: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="MWF"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={newOffering.startTime}
                      onChange={(e) => setNewOffering({ ...newOffering, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={newOffering.endTime}
                      onChange={(e) => setNewOffering({ ...newOffering, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Room</label>
                    <input
                      type="text"
                      value={newOffering.room}
                      onChange={(e) => setNewOffering({ ...newOffering, room: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Max Capacity</label>
                    <input
                      type="number"
                      value={newOffering.maxCapacity}
                      onChange={(e) => setNewOffering({ ...newOffering, maxCapacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="pt-3 flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 bg-slate-100 rounded text-slate-600">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded">Save Offering</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
