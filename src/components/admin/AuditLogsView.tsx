import React, { useState } from 'react';
import { AuditLog } from '../../types';
import { Clock, Search, Filter, Download, ShieldCheck } from 'lucide-react';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Category', 'Action', 'IP Address', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      l.userRole,
      l.category,
      `"${l.action}"`,
      l.ipAddress,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `siams_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (cat: AuditLog['category']) => {
    switch (cat) {
      case 'AUTH':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'STUDENT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ENROLLMENT':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ATTENDANCE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ACADEMIC':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'SYSTEM':
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Security & Operations Audit Trail
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold">
              IMMUTABLE LOGS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped trail of all system state changes, attendance submissions, and user authentication
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export Audit Trail (.csv)
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit actions, users, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Event Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none"
          >
            <option value="all">All Event Categories ({logs.length})</option>
            <option value="AUTH">Authentication & Users</option>
            <option value="STUDENT">Student Records</option>
            <option value="ENROLLMENT">Enrollment & Sectioning</option>
            <option value="ATTENDANCE">Attendance Roll Call</option>
            <option value="ACADEMIC">Curriculum & Structure</option>
            <option value="SYSTEM">System & Settings</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Operator</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Details & Payload</th>
              <th className="py-3 px-4 font-mono">LAN IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/70">
                <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                  {log.timestamp}
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-slate-900 block">{log.userName}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{log.userRole}</span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadge(
                      log.category
                    )}`}
                  >
                    {log.category}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-800 text-[11px]">
                  {log.action}
                </td>
                <td className="py-3 px-4 text-slate-700 max-w-md">{log.details}</td>
                <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                  {log.ipAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
