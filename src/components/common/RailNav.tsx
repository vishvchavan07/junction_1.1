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
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface RailNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isPresentationMode?: boolean;
  onTogglePresentationMode?: () => void;
}

export const RailNav: React.FC<RailNavProps> = ({
  activeTab,
  onTabChange,
  isPresentationMode = false,
  onTogglePresentationMode,
}) => {
  const navGroups: {
    category: string;
    items: {
      tab: NavTab;
      label: string;
      icon: any;
      badge?: string;
      badgeType?: 'red' | 'amber' | 'green' | 'blue';
    }[];
  }[] = [
    {
      category: 'OPERATIONS',
      items: [
        { tab: 'dashboard',  label: 'Overview',      icon: LayoutDashboard },
        { tab: 'map',        label: 'Live Network',  icon: Map, badge: 'LIVE', badgeType: 'green' },
        { tab: 'planner',    label: 'AI Planner',    icon: CalendarClock, badge: 'AUTO', badgeType: 'blue' },
        { tab: 'assets',     label: 'Assets',        icon: Layers, badge: '17', badgeType: 'amber' },
        { tab: 'trains',     label: 'Trains (COA)',  icon: Train },
        { tab: 'conflicts',  label: 'Conflicts',     icon: AlertTriangle, badge: '3', badgeType: 'red' },
        { tab: 'simulation', label: 'Simulation',    icon: Flame },
        { tab: 'insights',   label: 'Insights',      icon: Sparkles },
      ],
    },
    {
      category: 'DEPARTMENTS',
      items: [
        { tab: 'dept-track', label: 'Civil Track',   icon: FileSpreadsheet },
        { tab: 'dept-ohe',   label: 'Traction OHE',  icon: Zap },
        { tab: 'dept-snt',   label: 'Signal & Tel',  icon: Radio },
      ],
    },
    {
      category: 'GOVERNANCE',
      items: [
        { tab: 'admin',      label: 'Safety Audit',  icon: ShieldCheck },
      ],
    },
  ];

  const getBadgeClass = (type?: string) => {
    switch (type) {
      case 'red':   return 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]';
      case 'amber': return 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
      case 'green': return 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]';
      case 'blue':  return 'bg-[#EFF6FF] text-[#1E3A5F] border-[#BFDBFE]';
      default:      return 'bg-[#F0EBE1] text-[#615A4F] border-[#D8D1C5]';
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#1A1815] shadow-lg select-none">
      {/* Decorative Miniature Rail Track Line */}
      <div className="h-[2.5px] w-full bg-[#1A1815] relative flex items-center justify-between overflow-hidden">
        {/* Subtle sleepers */}
        <div className="w-full h-full opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,#FFFFFF_8px,#FFFFFF_10px)]" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Navigation Categories and Nodes */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          {navGroups.map((group, gIdx) => (
            <div key={group.category} className="flex items-center gap-1.5">
              {/* Category Divider on desktop */}
              {gIdx > 0 && (
                <div className="hidden md:flex items-center h-5 w-[1px] bg-[#D8D1C5] mx-1 shrink-0" />
              )}
              
              <div className="flex items-center gap-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.tab;

                  return (
                    <button
                      key={item.tab}
                      onClick={() => onTabChange(item.tab)}
                      className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#1A1815] text-[#FFFFFF]'
                          : 'text-[#615A4F] hover:text-[#1A1815] hover:bg-[#F7F4EE]'
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#FFFFFF]' : 'text-[#615A4F]'}`} />
                      <span className={`text-[11px] font-sans font-medium ${isActive ? 'text-[#FFFFFF] font-semibold' : ''}`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={`text-[8.5px] font-mono font-bold px-1 py-0.1 border rounded-[1px] ${isActive ? 'bg-[#FFFFFF] text-[#1A1815] border-[#FFFFFF]' : getBadgeClass(item.badgeType)}`}>
                          {item.badge}
                        </span>
                      )}
                      {/* Active station node dot */}
                      {isActive && (
                        <span className="absolute -top-[5.5px] left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-[#1A1815] border-2 border-[#FFFFFF]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Presentation Focus Mode Toggle */}
        {onTogglePresentationMode && (
          <div className="flex items-center gap-2 pl-2 shrink-0 border-l border-[#D8D1C5]">
            <button
              onClick={onTogglePresentationMode}
              className={`p-1.5 rounded-[2px] border transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono ${
                isPresentationMode
                  ? 'bg-[#1A1815] text-[#FFFFFF] border-[#1A1815]'
                  : 'bg-[#F7F4EE] text-[#615A4F] hover:text-[#1A1815] border-[#D8D1C5]'
              }`}
              title={isPresentationMode ? 'Exit Focus Mode' : 'Enter Focus Presentation Mode'}
            >
              {isPresentationMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden xl:inline">{isPresentationMode ? 'STANDARD' : 'FOCUS'}</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
