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

const NAV_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12.5px',
  fontWeight: 400,
  letterSpacing: 0,
  color: '#4B4A46',
};

const NAV_LABEL_ACTIVE_STYLE: React.CSSProperties = {
  ...NAV_LABEL_STYLE,
  fontWeight: 500,
  color: '#1D1F1E',
};

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: '#77736C',
  padding: '0 12px',
  marginBottom: '2px',
};

const BADGE_STYLE: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.02em',
  padding: '1px 6px',
  borderRadius: '3px',
  flexShrink: 0,
  lineHeight: 1.4,
};

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
    badgeStyle?: React.CSSProperties;
  }[] = [
    { tab: 'dashboard',  label: 'Overview',               icon: LayoutDashboard },
    { tab: 'map',        label: 'Live Network',            icon: Map,
      badge: 'Live',
      badgeStyle: { backgroundColor: '#EDF5F0', color: '#4D8B68', border: '1px solid #96C4AE' },
    },
    { tab: 'planner',    label: 'Block Planner',           icon: CalendarClock,
      badge: 'Auto',
      badgeStyle: { backgroundColor: '#EEF2F8', color: '#1E3A5F', border: '1px solid #B0C4DC' },
    },
    { tab: 'assets',     label: 'Asset Intelligence',      icon: Layers,
      badge: '17 ⚠',
      badgeStyle: { backgroundColor: '#FBF5E6', color: '#D49A32', border: '1px solid #E0BF7A' },
    },
    { tab: 'trains',     label: 'Train Operations',        icon: Train },
    { tab: 'conflicts',  label: 'Conflict Center',         icon: AlertTriangle,
      badge: '3',
      badgeStyle: { backgroundColor: '#F9EEEE', color: '#C84B43', border: '1px solid #DCA09C' },
    },
    { tab: 'simulation', label: 'What-If Sandbox',         icon: Flame,
      badge: 'Sandbox',
      badgeStyle: { backgroundColor: '#F5F0F8', color: '#6B21A8', border: '1px solid #D8B4FE' },
    },
    { tab: 'insights',   label: 'AI Insights',             icon: Sparkles },
  ];

  const deptNavItems: {
    tab: NavTab;
    label: string;
    icon: any;
    deptCode: string;
  }[] = [
    { tab: 'dept-track', label: 'Civil / Track',        icon: FileSpreadsheet, deptCode: 'TMS'  },
    { tab: 'dept-ohe',   label: 'Electrical / OHE',     icon: Zap,             deptCode: 'TDMS' },
    { tab: 'dept-snt',   label: 'Signal & Telecom',     icon: Radio,           deptCode: 'SMMS' },
  ];

  const renderNavItem = (
    tab: NavTab,
    label: string,
    Icon: any,
    badge?: string,
    badgeStyle?: React.CSSProperties,
    deptCode?: string,
  ) => {
    const isActive = activeTab === tab;
    return (
      <button
        key={tab}
        onClick={() => onTabChange(tab)}
        title={collapsed ? label : undefined}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 10,
          padding: collapsed ? '8px 0' : '7px 12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: '4px',
          backgroundColor: isActive ? '#EDE5D8' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background-color 0.12s ease',
          marginBottom: '1px',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#F0ECE4'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        {/* Left-edge indicator for active item */}
        {isActive && !collapsed && (
          <span style={{
            position: 'absolute', left: 0, top: '4px', bottom: '4px',
            width: '2px', borderRadius: '2px',
            backgroundColor: '#1D1F1E',
          }} />
        )}

        <Icon
          style={{
            width: 15,
            height: 15,
            flexShrink: 0,
            color: isActive ? '#1D1F1E' : '#77736C',
            transition: 'color 0.12s ease',
          }}
        />

        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, overflow: 'hidden' }}>
            <span style={isActive ? NAV_LABEL_ACTIVE_STYLE : NAV_LABEL_STYLE}>
              {label}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              {badge && (
                <span style={{ ...BADGE_STYLE, ...badgeStyle }}>
                  {badge}
                </span>
              )}
              {deptCode && (
                <span style={{
                  ...BADGE_STYLE,
                  backgroundColor: 'transparent',
                  border: `1px solid ${isActive ? '#A8A29E' : '#D5CEC1'}`,
                  color: isActive ? '#1D1F1E' : '#77736C',
                }}>
                  {deptCode}
                </span>
              )}
            </div>
          </div>
        )}
      </button>
    );
  };

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0, top: 48, bottom: 0,
        backgroundColor: '#F8F5EF',
        borderRight: '1px solid #D5CEC1',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        width: collapsed ? 56 : 232,
        userSelect: 'none',
      }}
    >
      {/* Top accent line */}
      <div style={{ height: 2, backgroundColor: '#1D1F1E', flexShrink: 0 }} />

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* ── Mission Control ── */}
        <div style={{ marginBottom: 8 }}>
          {!collapsed && (
            <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 4 }}>
              Mission Control
            </div>
          )}
          {primaryNavItems.map(item =>
            renderNavItem(item.tab, item.label, item.icon, item.badge, item.badgeStyle)
          )}
        </div>

        {/* ── Departments ── */}
        <div style={{ paddingTop: 8, borderTop: '1px solid #E8E2D8', marginBottom: 8 }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', marginBottom: 4 }}>
              <span style={{ ...SECTION_LABEL_STYLE, padding: 0 }}>Departments</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: '#77736C' }}>Fusion</span>
            </div>
          )}
          {deptNavItems.map(item =>
            renderNavItem(item.tab, item.label, item.icon, undefined, undefined, item.deptCode)
          )}
        </div>

        {/* ── Governance ── */}
        <div style={{ paddingTop: 8, borderTop: '1px solid #E8E2D8' }}>
          {!collapsed && (
            <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 4 }}>
              Governance
            </div>
          )}
          {renderNavItem('admin', 'Safety & Audit', ShieldCheck)}
        </div>
      </div>

      {/* Collapse toggle */}
      <div style={{ borderTop: '1px solid #D5CEC1', flexShrink: 0 }}>
        <button
          onClick={onToggleCollapse}
          style={{
            width: '100%',
            padding: '9px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            fontSize: '10px', fontWeight: 500,
            color: '#77736C',
            letterSpacing: '0.05em',
            transition: 'background-color 0.12s ease, color 0.12s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EDE5D8'; e.currentTarget.style.color = '#1D1F1E'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#77736C'; }}
        >
          <ChevronRight
            style={{ width: 14, height: 14, transition: 'transform 0.2s ease', transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};
