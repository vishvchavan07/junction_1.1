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
  fontSize: '12px',
  fontWeight: 400,
  letterSpacing: 0,
  color: '#475569',
};

const NAV_LABEL_ACTIVE_STYLE: React.CSSProperties = {
  ...NAV_LABEL_STYLE,
  fontWeight: 600,
  color: '#0F172A',
};

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '9.5px',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#94A3B8',
  padding: '0 12px',
  marginBottom: '2px',
};

const BADGE_STYLE: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '9.5px',
  fontWeight: 600,
  letterSpacing: '0.02em',
  padding: '1px 5px',
  borderRadius: '2px',
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
      badgeStyle: { backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' },
    },
    { tab: 'planner',    label: 'Block Planner',           icon: CalendarClock,
      badge: 'Auto',
      badgeStyle: { backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' },
    },
    { tab: 'assets',     label: 'Asset Intelligence',      icon: Layers,
      badge: '17 ⚠',
      badgeStyle: { backgroundColor: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' },
    },
    { tab: 'trains',     label: 'Train Operations',        icon: Train },
    { tab: 'conflicts',  label: 'Conflict Center',         icon: AlertTriangle,
      badge: '3',
      badgeStyle: { backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' },
    },
    { tab: 'simulation', label: 'What-If Sandbox',         icon: Flame,
      badge: 'Sandbox',
      badgeStyle: { backgroundColor: '#FAF5FF', color: '#7C3AED', border: '1px solid #E9D5FF' },
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
          padding: collapsed ? '7px 0' : '6px 12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: '3px',
          backgroundColor: isActive ? '#F1F5F9' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background-color 0.12s ease',
          marginBottom: '1px',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        {/* Left-edge active indicator */}
        {isActive && !collapsed && (
          <span style={{
            position: 'absolute', left: 0, top: '4px', bottom: '4px',
            width: '2.5px', borderRadius: '2px',
            backgroundColor: '#0F172A',
          }} />
        )}

        <Icon
          style={{
            width: 14,
            height: 14,
            flexShrink: 0,
            color: isActive ? '#0F172A' : '#64748B',
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
                  border: `1px solid ${isActive ? '#CBD5E1' : '#E2E8F0'}`,
                  color: isActive ? '#0F172A' : '#64748B',
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
        left: 0, top: 46, bottom: 0,
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        width: collapsed ? 56 : 220,
        userSelect: 'none',
      }}
    >
      {/* Top accent line */}
      <div style={{ height: 2, backgroundColor: '#0F172A', flexShrink: 0 }} />

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 6px', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* ── Mission Control ── */}
        <div style={{ marginBottom: 6 }}>
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
        <div style={{ paddingTop: 6, borderTop: '1px solid #F1F5F9', marginBottom: 6 }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', marginBottom: 4 }}>
              <span style={{ ...SECTION_LABEL_STYLE, padding: 0 }}>Departments</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: '#94A3B8' }}>Fusion</span>
            </div>
          )}
          {deptNavItems.map(item =>
            renderNavItem(item.tab, item.label, item.icon, undefined, undefined, item.deptCode)
          )}
        </div>

        {/* ── Governance ── */}
        <div style={{ paddingTop: 6, borderTop: '1px solid #F1F5F9' }}>
          {!collapsed && (
            <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 4 }}>
              Governance
            </div>
          )}
          {renderNavItem('admin', 'Safety & Audit', ShieldCheck)}
        </div>
      </div>

      {/* Collapse toggle */}
      <div style={{ borderTop: '1px solid #E2E8F0', flexShrink: 0 }}>
        <button
          onClick={onToggleCollapse}
          style={{
            width: '100%',
            padding: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            fontSize: '9.5px', fontWeight: 600,
            color: '#64748B',
            letterSpacing: '0.06em',
            transition: 'background-color 0.12s ease, color 0.12s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.color = '#0F172A'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
        >
          <ChevronRight
            style={{ width: 13, height: 13, transition: 'transform 0.2s ease', transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};
