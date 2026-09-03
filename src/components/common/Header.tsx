import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../../types';
import { INITIAL_USER_PROFILES } from '../../data/mockData';
import {
  Bell,
  AlertTriangle,
  Clock,
  Activity,
  ChevronDown,
  CheckCircle,
  Database,
  Maximize2,
  Minimize2,
  Play,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenLogin: () => void;
  activeEmergency: boolean;
  onToggleEmergency: () => void;
  isPresentationMode?: boolean;
  onTogglePresentationMode?: () => void;
  onTriggerDemo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenLogin,
  activeEmergency,
  onToggleEmergency,
  isPresentationMode = false,
  onTogglePresentationMode,
  onTriggerDemo,
}) => {
  const [timeStr, setTimeStr] = useState<string>('01 SEP 2026 00:00:00 IST');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentUser: UserProfile =
    INITIAL_USER_PROFILES[currentRole] || INITIAL_USER_PROFILES.controller;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const year = '2026';
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${day} ${month} ${year} ${hours}:${mins}:${secs} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roles: { role: UserRole; title: string; dept: string }[] = [
    { role: 'controller',          title: 'Operations Controller',         dept: 'COA / Control Desk'     },
    { role: 'engineering',         title: 'Track / Civil Engineer',        dept: 'Track TMS'              },
    { role: 'ohe',                 title: 'OHE / Traction Engineer',       dept: 'TRD / SCADA'            },
    { role: 'signalling',          title: 'S&T Engineer',                  dept: 'SMMS / Interlocking'    },
    { role: 'maintenance_planner', title: 'Maintenance & Machine Planner', dept: 'TTM Depot'              },
    { role: 'admin',               title: 'System Safety Administrator',   dept: 'Railway Board'          },
  ];

  return (
    <header
      className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between select-none"
      style={{
        height: '46px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 16px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* ── Brand: Space Grotesk JUNCTION + compact mark ── */}
      <div className="flex items-center gap-2.5">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="3" width="14" height="12" rx="1.5" stroke="#0F172A" strokeWidth="1.5" fill="none"/>
          <line x1="8" y1="7" x2="16" y2="7" stroke="#0F172A" strokeWidth="1.1"/>
          <circle cx="8.5" cy="11" r="1.2" fill="#0F172A"/>
          <circle cx="15.5" cy="11" r="1.2" fill="#0F172A"/>
          <path d="M4 21L8 16M20 21L16 16" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="8" y1="16" x2="16" y2="16" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>

        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '15.5px',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: '#0F172A',
              lineHeight: 1,
            }}
          >
            JUNCTION
          </span>
          <span
            className="hidden sm:inline-block"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: '#475569',
              textTransform: 'uppercase',
              padding: '1.5px 5px',
              border: '1px solid #E2E8F0',
              borderRadius: '2px',
              backgroundColor: '#F8FAFC',
            }}
          >
            IR-ABPS
          </span>
        </div>
      </div>

      {/* ── Center: Corridor Live Operational State ── */}
      <div className="hidden md:flex items-center gap-3" style={{ fontSize: '12px', fontFamily: "'Inter', sans-serif", color: '#475569' }}>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] bg-[#F8FAFC] border border-[#E2E8F0]">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse shrink-0" />
          <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '11.5px' }}>LIVE</span>
          <span style={{ color: '#CBD5E1' }}>·</span>
          <span style={{ color: '#475569', fontSize: '11.5px' }}>Western Corridor · KM 100–160</span>
        </div>
      </div>

      {/* ── Right controls ── */}
      <div className="flex items-center gap-1.5">

        {/* 30s Automated Demo Story */}
        {onTriggerDemo && (
          <button
            onClick={onTriggerDemo}
            className="flex items-center gap-1.5 cursor-pointer"
            style={{
              padding: '4px 10px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: '1px solid #0F172A',
              borderRadius: '4px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '11.5px',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            title="Launch 30-Second Automated Hackathon Story"
          >
            <Play style={{ width: 11, height: 11, color: '#22C55E', fill: 'currentColor' }} />
            <span className="hidden sm:inline">Simulate Operation</span>
          </button>
        )}

        {/* Emergency toggle */}
        <button
          onClick={onToggleEmergency}
          style={{
            padding: '4px 9px',
            backgroundColor: activeEmergency ? '#DC2626' : '#FEF2F2',
            color: activeEmergency ? '#FFFFFF' : '#DC2626',
            border: `1px solid ${activeEmergency ? '#DC2626' : '#FECACA'}`,
            borderRadius: '4px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Toggle Emergency Incident Simulation"
        >
          <AlertTriangle style={{ width: 11, height: 11, flexShrink: 0 }} />
          <span className="hidden sm:inline">
            {activeEmergency ? 'Incident Active' : 'Incident'}
          </span>
        </button>

        {/* Clock */}
        <div
          className="hidden xl:flex items-center gap-1.5"
          style={{
            padding: '3px 8px',
            border: '1px solid #E2E8F0',
            borderRadius: '4px',
            backgroundColor: '#F8FAFC',
          }}
        >
          <Clock style={{ width: 11, height: 11, color: '#64748B', flexShrink: 0 }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10.5px', fontWeight: 500, color: '#0F172A' }}>
            {timeStr}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.12s ease',
            }}
          >
            <Bell style={{ width: 13, height: 13, color: '#475569' }} />
            <span style={{
              position: 'absolute', top: -3, right: -3,
              width: 13, height: 13, borderRadius: '50%',
              backgroundColor: '#DC2626', color: '#FFFFFF',
              fontSize: '8px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Inter', sans-serif",
            }}>3</span>
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 z-50 shadow-panel-lift"
              style={{
                width: 290,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', marginBottom: '6px' }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '11.5px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Activity style={{ width: 12, height: 12, color: '#DC2626' }} />
                  Operational Alerts
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', fontWeight: 500, color: '#DC2626' }}>3 critical</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: 200, overflowY: 'auto' }}>
                {[
                  { title: 'KM 127/4 Turnout PT-227-II', body: 'TGI dropped to 68.2. Lateral G: 0.28g.', color: '#DC2626' },
                  { title: 'OHE Feeder Span 42 Hotspot', body: '+18.4°C thermal delta recorded by SCADA.', color: '#D97706' },
                  { title: 'Shadow Block Opportunity', body: 'Club Civil Tamping with OHE Jumper at 02:00.', color: '#16A34A' },
                ].map((n, i) => (
                  <div key={i} style={{ padding: '7px 9px', backgroundColor: '#F8FAFC', borderLeft: `2px solid ${n.color}`, borderRadius: '3px' }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '11.5px', color: '#0F172A' }}>{n.title}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '10.5px', color: '#475569', marginTop: '1px' }}>{n.body}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role selector */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '3px 7px',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
              transition: 'background-color 0.12s ease',
            }}
          >
            <div style={{
              width: 20, height: 20,
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600, fontSize: '9.5px',
              borderRadius: '3px', flexShrink: 0,
            }}>
              {currentUser.name[0]}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 500, color: '#0F172A', lineHeight: 1.2 }}>
                {currentUser.name}
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: '#64748B', lineHeight: 1.2 }}>
                {currentUser.roleTitle.split('(')[0].trim()}
              </span>
            </div>
            <ChevronDown style={{ width: 11, height: 11, color: '#64748B' }} />
          </button>

          {showRoleMenu && (
            <div
              className="absolute right-0 mt-2 z-50 shadow-panel-lift"
              style={{
                width: 260,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '6px',
              }}
            >
              <div style={{ padding: '4px 6px 6px', borderBottom: '1px solid #F1F5F9', marginBottom: '4px' }}>
                <span style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '9.5px', fontWeight: 600, color: '#64748B', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '1px' }}>
                  Switch Operational Role
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => { onRoleChange(r.role); setShowRoleMenu(false); }}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '6px 7px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderRadius: '3px',
                      backgroundColor: currentRole === r.role ? '#0F172A' : 'transparent',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'background-color 0.1s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11.5px', fontWeight: 500, color: currentRole === r.role ? '#FFFFFF' : '#0F172A' }}>
                        {r.title}
                      </div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', color: currentRole === r.role ? '#94A3B8' : '#64748B', marginTop: '1px' }}>
                        {r.dept}
                      </div>
                    </div>
                    {currentRole === r.role && (
                      <CheckCircle style={{ width: 12, height: 12, color: '#22C55E', flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '4px', paddingTop: '4px' }}>
                <button
                  onClick={() => { setShowRoleMenu(false); onOpenLogin(); }}
                  style={{
                    width: '100%', textAlign: 'center',
                    padding: '5px',
                    backgroundColor: 'transparent',
                    border: '1px solid #E2E8F0',
                    borderRadius: '3px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '10.5px', fontWeight: 500,
                    color: '#475569',
                    cursor: 'pointer',
                    transition: 'background-color 0.12s ease',
                  }}
                >
                  Switch User / Re-authenticate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Presentation mode toggle */}
        {onTogglePresentationMode && (
          <button
            onClick={onTogglePresentationMode}
            style={{
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              backgroundColor: isPresentationMode ? '#0F172A' : '#FFFFFF',
              color: isPresentationMode ? '#FFFFFF' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={isPresentationMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
          >
            {isPresentationMode ? <Minimize2 style={{ width: 12, height: 12 }} /> : <Maximize2 style={{ width: 12, height: 12 }} />}
          </button>
        )}
      </div>
    </header>
  );
};
