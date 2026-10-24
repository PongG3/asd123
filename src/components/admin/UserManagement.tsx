import React, { useState } from 'react';
import { User, Role } from '../../types';
import { saveUser, deleteUser, logAudit } from '../../services/storage';
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  CheckCircle,
  AlertOctagon,
  Search,
  Filter,
} from 'lucide-react';

interface UserManagementProps {
  users: User[];
  currentUserId: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, currentUserId }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'teacher',
    department: 'Computer Studies',
    status: 'active',
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = (user: User) => {
    if (user.id === currentUserId) {
      alert('You cannot deactivate your own current administrator account.');
      return;
    }
    const updatedStatus: 'active' | 'suspended' = user.status === 'active' ? 'suspended' : 'active';
    saveUser({ ...user, status: updatedStatus });
  };

  const handleResetPassword = (user: User) => {
    const newPass = prompt(`Enter new temporary password for ${user.name}:`, 'School2025!');
    if (newPass) {
      logAudit('AUTH', 'PASSWORD_RESET', `Password reset initiated for ${user.email}`);
      alert(`Temporary password successfully set for ${user.name}.`);
    }
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUserId) {
      alert('You cannot delete your own account.');
      return;
    }
    if (window.confirm(`Permanently remove user ${user.name} (${user.email})?`)) {
      deleteUser(user.id);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const user: User = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: (newUser.role as Role) || 'teacher',
      department: newUser.department || 'General Academics',
      status: 'active',
      lastLogin: 'Never logged in',
    };

    saveUser(user);
    setShowAddModal(false);
    setNewUser({ name: '', email: '', role: 'teacher', department: 'Computer Studies', status: 'active' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            User Accounts & Role Permissions
          </h2>
          <p className="text-xs text-slate-500">
            Manage institutional system credentials, role-based access control, and account status
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          Create New User Account
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="admin">Administrator</option>
            <option value="registrar">Registrar</option>
            <option value="teacher">Teacher / Faculty</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Department / Office</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4">Last Active</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{u.name}</p>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'admin'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : u.role === 'registrar'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : u.role === 'teacher'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">{u.department || 'General'}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      u.status === 'active'
                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                    }`}
                    title="Click to toggle active / suspended"
                  >
                    {u.status === 'active' ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
                        Active
                      </>
                    ) : (
                      <>
                        <AlertOctagon className="w-3 h-3 mr-1 text-rose-600" />
                        Suspended
                      </>
                    )}
                  </button>
                </td>
                <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{u.lastLogin || 'Recent'}</td>
                <td className="py-3 px-4 text-right space-x-1">
                  <button
                    onClick={() => handleResetPassword(u)}
                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded"
                    title="Reset temporary password"
                  >
                    <KeyRound className="w-4 h-4 inline" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                    title="Remove user"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-sm text-slate-900">Create New System User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institutional Email Address</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. arthur.p@school.edu"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">System Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="admin">Administrator (Full Access)</option>
                  <option value="registrar">Registrar (Students & Enrollments)</option>
                  <option value="teacher">Teacher / Faculty (Classes & Attendance)</option>
                  <option value="student">Student (Portal & Grades)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department / Assigned Unit</label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  placeholder="e.g. College of Science"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
