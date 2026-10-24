import React from 'react';
import { Role } from '../../types';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarCheck2,
  GraduationCap,
  BookOpen,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  QrCode,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

export type NavItemKey =
  | 'admin-dashboard'
  | 'admin-students'
  | 'admin-enrollment'
  | 'admin-attendance'
  | 'admin-academics'
  | 'admin-users'
  | 'admin-audit'
  | 'admin-settings'
  | 'reg-students'
  | 'reg-enrollment'
  | 'reg-masterlists'
  | 'teach-dashboard'
  | 'teach-roster'
  | 'teach-attendance'
  | 'teach-history'
  | 'stud-dashboard'
  | 'stud-schedule'
  | 'stud-attendance'
  | 'stud-cor';

interface SidebarProps {
  currentRole: Role;
  activeItem: NavItemKey;
  onSelectItem: (item: NavItemKey) => void;
  pendingEnrollmentsCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeItem,
  onSelectItem,
  pendingEnrollmentsCount,
  isOpen,
  onClose,
}) => {
  interface NavConfig {
    key: NavItemKey;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }

  const getNavItems = (): { section: string; items: NavConfig[] }[] => {
    switch (currentRole) {
      case 'admin':
        return [
          {
            section: 'Core Management',
            items: [
              {
                key: 'admin-dashboard',
                label: 'Executive Dashboard',
                icon: <LayoutDashboard className="w-4 h-4" />,
              },
              {
                key: 'admin-students',
                label: 'Student Records',
                icon: <Users className="w-4 h-4" />,
              },
              {
                key: 'admin-enrollment',
                label: 'Enrollment Approval',
                icon: <UserPlus className="w-4 h-4" />,
                badge: pendingEnrollmentsCount > 0 ? pendingEnrollmentsCount : undefined,
                badgeColor: 'bg-amber-500 text-white',
              },
              {
                key: 'admin-attendance',
                label: 'Attendance Central',
                icon: <CalendarCheck2 className="w-4 h-4" />,
              },
            ],
          },
          {
            section: 'Curriculum & Hierarchy',
            items: [
              {
                key: 'admin-academics',
                label: 'Academic Setup',
                icon: <GraduationCap className="w-4 h-4" />,
              },
            ],
          },
          {
            section: 'Administration & Security',
            items: [
              {
                key: 'admin-users',
                label: 'User Accounts & Roles',
                icon: <ShieldCheck className="w-4 h-4" />,
              },
              {
                key: 'admin-audit',
                label: 'System Audit Logs',
                icon: <Clock className="w-4 h-4" />,
              },
              {
                key: 'admin-settings',
                label: 'School Settings',
                icon: <Settings className="w-4 h-4" />,
              },
            ],
          },
        ];

      case 'registrar':
        return [
          {
            section: 'Registrar Operations',
            items: [
              {
                key: 'reg-students',
                label: 'Student Registry',
                icon: <Users className="w-4 h-4" />,
              },
              {
                key: 'reg-enrollment',
                label: 'Enrollment Processing',
                icon: <UserPlus className="w-4 h-4" />,
                badge: pendingEnrollmentsCount > 0 ? pendingEnrollmentsCount : undefined,
                badgeColor: 'bg-amber-500 text-white',
              },
              {
                key: 'reg-masterlists',
                label: 'Masterlists & Reports',
                icon: <FileSpreadsheet className="w-4 h-4" />,
              },
            ],
          },
        ];

      case 'teacher':
        return [
          {
            section: 'Instruction & Classes',
            items: [
              {
                key: 'teach-dashboard',
                label: 'Faculty Dashboard',
                icon: <LayoutDashboard className="w-4 h-4" />,
              },
              {
                key: 'teach-roster',
                label: 'Class Rosters',
                icon: <Users className="w-4 h-4" />,
              },
              {
                key: 'teach-attendance',
                label: 'Live Attendance Session',
                icon: <CalendarCheck2 className="w-4 h-4" />,
                badge: 'Live',
                badgeColor: 'bg-emerald-500 text-white animate-pulse',
              },
              {
                key: 'teach-history',
                label: 'Attendance Sheets',
                icon: <FileText className="w-4 h-4" />,
              },
            ],
          },
        ];

      case 'student':
        return [
          {
            section: 'Student Portal',
            items: [
              {
                key: 'stud-dashboard',
                label: 'My Student Profile & ID',
                icon: <QrCode className="w-4 h-4" />,
              },
              {
                key: 'stud-schedule',
                label: 'Enrolled Classes',
                icon: <BookOpen className="w-4 h-4" />,
              },
              {
                key: 'stud-attendance',
                label: 'My Attendance Record',
                icon: <CalendarCheck2 className="w-4 h-4" />,
              },
              {
                key: 'stud-cor',
                label: 'Official Registration (COR)',
                icon: <FileText className="w-4 h-4" />,
              },
            ],
          },
        ];
    }
  };

  const navGroups = getNavItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <h3 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {group.section}
              </h3>
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeItem === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        onSelectItem(item.key);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={isActive ? 'text-white' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            item.badgeColor || 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom System Status Badge */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-400 font-mono text-[11px]">LAN Online</span>
            </div>
            <span className="text-[11px] text-slate-500">MySQL 8.4 LTS</span>
          </div>
        </div>
      </aside>
    </>
  );
};
