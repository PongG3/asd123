import React from 'react';
import { Student, Program, SchoolSettings } from '../../types';
import { Printer, X, Shield, QrCode } from 'lucide-react';

interface StudentIdCardModalProps {
  student: Student;
  program?: Program;
  settings: SchoolSettings;
  onClose: () => void;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
  student,
  program,
  settings,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="no-print bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm">Official University Student Identification Card</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Print Card
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable ID Cards (Front and Back) */}
        <div className="printable-area p-8 bg-slate-100 flex flex-col md:flex-row items-center justify-center gap-6">
          {/* CARD FRONT */}
          <div className="w-[320px] h-[480px] bg-white rounded-2xl shadow-lg border border-slate-300 overflow-hidden flex flex-col justify-between relative">
            {/* Top Header Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-white text-blue-900 flex items-center justify-center font-bold text-xs">
                  🏛️
                </div>
                <div className="text-left">
                  <h3 className="text-[11px] font-extrabold uppercase leading-tight tracking-wider">
                    {settings.schoolName}
                  </h3>
                  <p className="text-[9px] text-blue-200 uppercase tracking-widest font-semibold">
                    Student Identification
                  </p>
                </div>
              </div>
            </div>

            {/* Middle: Photo & Details */}
            <div className="px-6 flex flex-col items-center text-center">
              {/* Photo Frame */}
              <div className="w-28 h-28 rounded-xl border-4 border-indigo-100 shadow-sm overflow-hidden bg-slate-200 mt-2 mb-3">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-slate-400 bg-slate-100">
                    {student.firstName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Student Name */}
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                {student.firstName} {student.middleName ? `${student.middleName.charAt(0)}.` : ''} {student.lastName}
              </h2>
              <div className="mt-1 font-mono font-bold text-sm text-indigo-700 bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-200">
                {student.studentNumber}
              </div>

              <div className="mt-3 w-full border-t border-slate-200 pt-2 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Program of Study
                </span>
                <span className="text-xs font-bold text-slate-800 block">
                  {program ? program.name : 'Bachelor of Science'}
                </span>
                <span className="text-[11px] font-semibold text-slate-600 block mt-0.5">
                  Year Level: {student.yearLevel}
                </span>
              </div>
            </div>

            {/* Bottom Barcode */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
              <div className="h-8 bg-slate-900 rounded mx-auto flex items-center justify-center text-white text-[9px] font-mono tracking-[0.3em] px-2">
                |||| | |||||| |||| ||| |||||
              </div>
              <p className="text-[9px] font-mono text-slate-500 mt-1">
                VALID A.Y. 2024-2025
              </p>
            </div>
          </div>

          {/* CARD BACK */}
          <div className="w-[320px] h-[480px] bg-white rounded-2xl shadow-lg border border-slate-300 overflow-hidden flex flex-col justify-between p-5 relative">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Student Verification
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ID: {student.id}
                </span>
              </div>

              {/* Emergency Contact */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                  In Case of Emergency Notify:
                </span>
                <p className="font-bold text-slate-900">
                  {student.emergencyContactName} ({student.emergencyContactRelation})
                </p>
                <p className="text-slate-600 font-mono">
                  {student.emergencyContactPhone}
                </p>
                <p className="text-slate-600 text-[10px]">
                  Address: {student.address}, {student.city}
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="mt-4 text-[9px] text-slate-500 space-y-1 leading-relaxed">
                <p>• This card is non-transferable and must be carried at all times within campus premises.</p>
                <p>• If lost or stolen, report immediately to the University Registrar.</p>
                <p>• Unauthorized use or duplication is strictly punishable under student regulations.</p>
              </div>
            </div>

            {/* Bottom Signatures and QR Code */}
            <div>
              <div className="grid grid-cols-2 gap-4 text-center text-[10px] pt-2 border-t border-slate-200">
                <div>
                  <div className="h-7 border-b border-slate-400 flex items-end justify-center pb-0.5">
                    <span className="font-script text-xs italic text-slate-700">
                      {student.firstName} {student.lastName}
                    </span>
                  </div>
                  <span className="text-[8px] text-slate-500 uppercase font-semibold">
                    Cardholder Signature
                  </span>
                </div>
                <div>
                  <div className="h-7 border-b border-slate-400 flex items-end justify-center pb-0.5">
                    <span className="font-bold text-slate-800">
                      M. Sterling
                    </span>
                  </div>
                  <span className="text-[8px] text-slate-500 uppercase font-semibold">
                    University Registrar
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-800" />
                </div>
                <div className="text-right text-[9px] text-slate-500">
                  <p className="font-semibold text-slate-700">{settings.contactEmail}</p>
                  <p>{settings.contactPhone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
