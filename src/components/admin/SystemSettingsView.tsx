import React, { useState } from 'react';
import { SchoolSettings, AcademicYear } from '../../types';
import { saveSchoolSettings } from '../../services/storage';
import { Settings, Save, Database, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface SystemSettingsProps {
  settings: SchoolSettings;
  academicYears: AcademicYear[];
}

export const SystemSettingsView: React.FC<SystemSettingsProps> = ({ settings, academicYears }) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSchoolSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('siams_')) {
        data[key] = JSON.parse(localStorage.getItem(key) || '{}');
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `siams_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Institutional & Attendance System Settings
            </h2>
            <p className="text-xs text-slate-500">
              Configure school identity, attendance monitoring parameters, and database backup
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System configuration successfully updated and saved to persistent database.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: School Identity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Institution Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">School / University Name</label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institutional Code</label>
              <input
                type="text"
                required
                value={formData.schoolCode}
                onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Campus Address</label>
              <input
                type="text"
                required
                value={formData.schoolAddress}
                onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registrar Contact Email</label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Telephone</label>
              <input
                type="text"
                required
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Attendance Policies */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Attendance Monitoring & Academic Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Late Arrival Grace Period (Minutes)
              </label>
              <input
                type="number"
                min={0}
                max={60}
                value={formData.attendanceGracePeriodMins}
                onChange={(e) =>
                  setFormData({ ...formData, attendanceGracePeriodMins: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Students arriving after this threshold are marked "Late" instead of "Present".
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Max Unexcused Absences Warning Limit
              </label>
              <input
                type="number"
                min={1}
                max={15}
                value={formData.maxAbsencesAllowed}
                onChange={(e) =>
                  setFormData({ ...formData, maxAbsencesAllowed: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Flags warning badge on student portal & faculty rosters when reached.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Database className="w-4 h-4 mr-1.5 text-slate-500" />
            Download JSON Backup
          </button>

          <button
            type="submit"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
};
