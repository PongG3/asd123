import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  setCurrentUser,
  getUsers,
  getAcademicYears,
  getSchoolSettings,
  resetToSeedData,
  subscribeToStore,
} from '../../services/storage';
import { User, Role } from '../../types';
import {
  GraduationCap,
  Shield,
  ClipboardList,
  UserCheck,
  BookOpen,
  RotateCcw,
  Code2,
  Calendar,
  CheckCircle,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenLaravelGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenLaravelGuide }) => {
  const [currentUser, setCurUser] = useState<User>(getCurrentUser());
  const [users, setUsers] = useState<User[]>(getUsers());
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const settings = getSchoolSettings();
  const academicYears = getAcademicYears();
  const activeYear = academicYears.find((y) => y.isActive) || academicYears[0];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return subscribeToStore(() => {
      setCurUser(getCurrentUser());
      setUsers(getUsers());
    });
  }, []);

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    setShowRoleDropdown(false);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to default factory seed records?')) {
      resetToSeedData();
      alert('Data reset successfully to default state.');
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Administrator',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <Shield className="w-3.5 h-3.5 mr-1 text-rose-600" />,
        };
      case 'registrar':
        return {
          label: 'Registrar',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <ClipboardList className="w-3.5 h-3.5 mr-1 text-blue-600" />,
        };
      case 'teacher':
        return {
          label: 'Faculty / Teacher',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
        };
      case 'student':
        return {
          label: 'Student',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <BookOpen className="w-3.5 h-3.5 mr-1 text-amber-600" />,
        };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Brand & Institution */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                    SIAMS
                  </span>
                  <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                    School Network Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs font-medium">
                  {settings.schoolName}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Academic Term & Time Badge (Hidden on small screens) */}
          <div className="hidden lg:flex items-center space-x-3 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800">
                {activeYear ? `${activeYear.code} • ${activeYear.semester}` : 'Active Semester'}
              </span>
              <span className="mx-2 text-slate-300">|</span>
              <span className="text-slate-500 font-mono text-[11px]">{currentTime}</span>
            </div>
          </div>

          {/* Right: Role Switcher & Utilities */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Laravel Guide Button */}
            <button
              onClick={onOpenLaravelGuide}
              className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors shadow-2xs"
              title="View Laravel 11/12, MySQL 8.4 schema and local network deployment guide"
            >
              <Code2 className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              <span>Laravel & MySQL Docs</span>
            </button>

            {/* Reset Seed Button */}
            <button
              onClick={handleResetData}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset sample data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase overflow-hidden ring-1 ring-slate-300">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium border ${badge.bg}`}>
                    {badge.icon}
                    {badge.label}
                  </div>
                </div>
              </button>

              {/* Role Dropdown Menu */}
              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/70">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Role & User Simulation
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Switch personas to test real permissions and views
                    </p>
                  </div>

                  <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-100">
                    {users.map((user) => {
                      const uBadge = getRoleBadge(user.role);
                      const isSelected = user.id === currentUser.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => handleSwitchUser(user)}
                          className={`w-full px-3 py-2.5 text-left flex items-start justify-between hover:bg-slate-50 transition-colors ${
                            isSelected ? 'bg-indigo-50/50' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-900 leading-tight">
                                {user.name}
                              </p>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium border ${uBadge.bg}`}>
                                  {uBadge.icon}
                                  {uBadge.label}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="px-3 pt-2 mt-1 border-t border-slate-100 text-[11px] text-slate-500 text-center">
                    Authorized session enforced on server
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
