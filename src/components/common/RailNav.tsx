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
        { tab: 'insights',   label: 'AI Insights',   icon: Sparkles },
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

  const getBadgeStyle = (type?: string, isActive?: boolean) => {
    if (isActive) {
      return { backgroundColor: '#FFFFFF', color: '#0F172A', borderColor: '#FFFFFF' };
    }
    switch (type) {
      case 'red':   return { backgroundColor: '#FEF2F2', color: '#DC2626', borderColor: '#FECACA' };
      case 'amber': return { backgroundColor: '#FFFBEB', color: '#D97706', borderColor: '#FDE68A' };
      case 'green': return { backgroundColor: '#F0FDF4', color: '#16A34A', borderColor: '#BBF7D0' };
      case 'blue':  return { backgroundColor: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' };
      default:      return { backgroundColor: '#F1F5F9', color: '#475569', borderColor: '#E2E8F0' };
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-panel-lift select-none">
      {/* Decorative Miniature Rail Track Line */}
      <div className="h-[2px] w-full bg-[#E2E8F0] relative flex items-center justify-between overflow-hidden">
        <div className="w-full h-full opacity-60 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,#0F172A_8px,#0F172A_10px)]" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Navigation Categories and Nodes */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          {navGroups.map((group, gIdx) => (
            <div key={group.category} className="flex items-center gap-1">
              {/* Category Divider on desktop */}
              {gIdx > 0 && (
                <div className="hidden md:flex items-center h-4 w-[1px] bg-[#E2E8F0] mx-1 shrink-0" />
              )}
              
              <div className="flex items-center gap-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.tab;

                  return (
                    <button
                      key={item.tab}
                      onClick={() => onTabChange(item.tab)}
                      className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#0F172A] text-[#FFFFFF]'
                          : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#FFFFFF]' : 'text-[#64748B]'}`} />
                      <span className={`text-[11px] font-sans font-medium ${isActive ? 'text-[#FFFFFF] font-semibold' : ''}`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className="text-[8.5px] font-mono font-bold px-1 py-0.1 border rounded-[2px]"
                          style={getBadgeStyle(item.badgeType, isActive)}
                        >
                          {item.badge}
                        </span>
                      )}
                      {/* Active indicator dot */}
                      {isActive && (
                        <span className="absolute -top-[4px] left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0F172A]" />
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
          <div className="flex items-center gap-2 pl-2 shrink-0 border-l border-[#E2E8F0]">
            <button
              onClick={onTogglePresentationMode}
              className={`p-1 rounded-[3px] border transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono ${
                isPresentationMode
                  ? 'bg-[#0F172A] text-[#FFFFFF] border-[#0F172A]'
                  : 'bg-[#FFFFFF] text-[#475569] hover:text-[#0F172A] border-[#CBD5E1]'
              }`}
              title={isPresentationMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
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
