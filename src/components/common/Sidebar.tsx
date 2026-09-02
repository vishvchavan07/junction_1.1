import React from 'react';
import {
  LayoutDashboard,
  Map,
  Layers,
  CalendarClock,
  Train,
  AlertTriangle,
  Sparkles,
  Flame,
  ShieldCheck,
  Zap,
  Radio,
  FileSpreadsheet,
  ChevronRight,
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavTab =
  | 'dashboard'
  | 'map'
  | 'assets'
  | 'planner'
  | 'trains'
  | 'conflicts'
  | 'simulation'
  | 'insights'
  | 'dept-track'
  | 'dept-ohe'
  | 'dept-snt'
  | 'admin';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentRole: UserRole;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  collapsed,
  onToggleCollapse,
}) => {
  const primaryNavItems: {
    tab: NavTab;
    label: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
  }[] = [
    { tab: 'dashboard',  label: 'Command Dashboard',        icon: LayoutDashboard },
    { tab: 'map',        label: 'Live Network Map',         icon: Map,          badge: 'LIVE',  badgeColor: 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'    },
    { tab: 'planner',    label: 'AI Block Planner',         icon: CalendarClock, badge: 'AUTO', badgeColor: 'bg-[#EFF6FF] text-[#1E3A5F] border border-[#BFDBFE]'    },
    { tab: 'assets',     label: 'Asset Intelligence',       icon: Layers,        badge: '17 WNG', badgeColor: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'  },
    { tab: 'trains',     label: 'Train Operations (COA)',   icon: Train },
    { tab: 'conflicts',  label: 'Conflict Center',          icon: AlertTriangle, badge: '3 CNF', badgeColor: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'  },
    { tab: 'simulation', label: 'What-If Sandbox',          icon: Flame,         badge: 'SANDBOX', badgeColor: 'bg-[#FAF5FF] text-[#6B21A8] border border-[#E9D5FF]' },
    { tab: 'insights',   label: 'AI Analytics & ROI',       icon: Sparkles },
  ];

  const deptNavItems: {
    tab: NavTab;
    label: string;
    icon: any;
    deptCode: string;
  }[] = [
    { tab: 'dept-track', label: 'Civil Track (TMS)',        icon: FileSpreadsheet, deptCode: 'TMS'  },
    { tab: 'dept-ohe',   label: 'Electrical OHE / SCADA',  icon: Zap,             deptCode: 'TDMS' },
    { tab: 'dept-snt',   label: 'Signal & Telecom (SMMS)', icon: Radio,           deptCode: 'SMMS' },
  ];

  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 bg-[#F7F4EE] border-r border-[#D8D1C5] z-30 flex flex-col transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-60 lg:w-64'
      }`}
    >
      {/* Precision line header mark */}
      <div className="h-[2px] bg-[#1A1815] w-full shrink-0" />

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">

        {/* ── MISSION CONTROL ── */}
        <div className="mb-2">
          {!collapsed && (
            <div className="px-3 pt-1 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#615A4F]">
              Mission Control
            </div>
          )}
          {primaryNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2 my-0.5 text-xs rounded-[2px] transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1815] text-[#FFFFFF]'
                    : 'text-[#1A1815] hover:bg-[#EFEAE1]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#FFFFFF]' : 'text-[#615A4F]'
                  }`}
                />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span className="truncate font-sans font-medium text-[12px]">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-[2px] shrink-0 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── DEPARTMENTS ── */}
        <div className="pt-2 border-t border-[#D8D1C5] mb-2">
          {!collapsed && (
            <div className="px-3 pt-1 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#615A4F]">
                Departments
              </span>
              <span className="text-[9px] font-mono text-[#615A4F]">FUSION</span>
            </div>
          )}
          {deptNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2 my-0.5 text-xs rounded-[2px] transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1815] text-[#FFFFFF]'
                    : 'text-[#1A1815] hover:bg-[#EFEAE1]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#FFFFFF]' : 'text-[#615A4F]'
                  }`}
                />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span className="truncate font-sans font-medium text-[12px]">{item.label}</span>
                    <span className={`text-[9px] font-mono border px-1 rounded-[2px] shrink-0 ${
                      isActive ? 'border-[#FFFFFF]/30 text-[#D8D1C5]' : 'border-[#D8D1C5] text-[#615A4F] bg-[#FFFFFF]'
                    }`}>
                      {item.deptCode}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── ADMINISTRATION ── */}
        <div className="pt-2 border-t border-[#D8D1C5]">
          {!collapsed && (
            <div className="px-3 pt-1 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#615A4F]">
              Governance
            </div>
          )}
          <button
            onClick={() => onTabChange('admin')}
            title={collapsed ? 'Safety Rules & Audit' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 my-0.5 text-xs rounded-[2px] transition-colors cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-[#1A1815] text-[#FFFFFF]'
                : 'text-[#1A1815] hover:bg-[#EFEAE1]'
            }`}
          >
            <ShieldCheck
              className={`w-4 h-4 shrink-0 ${
                activeTab === 'admin' ? 'text-[#FFFFFF]' : 'text-[#615A4F]'
              }`}
            />
            {!collapsed && (
              <span className="truncate font-sans font-medium text-[12px]">Safety Rules & Audit</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Collapse Toggle ── */}
      <div className="border-t border-[#D8D1C5] bg-[#F0EBE1] shrink-0">
        <button
          onClick={onToggleCollapse}
          className="w-full py-2 px-2 text-[#615A4F] hover:text-[#1A1815] hover:bg-[#EAE4D9] text-[10px] font-mono font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <ChevronRight
            className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
          />
          {!collapsed && <span>COLLAPSE</span>}
        </button>
      </div>
    </aside>
  );
};
