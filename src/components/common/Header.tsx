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
        height: '48px',
        backgroundColor: '#F8F5EF',
        borderBottom: '1px solid #D5CEC1',
        padding: '0 20px',
      }}
    >
      {/* ── Brand: Space Grotesk JUNCTION + compact mark ── */}
      <div className="flex items-center gap-3">
        {/* Junction mark — clean track switch SVG, no box */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="3" width="14" height="12" rx="1.5" stroke="#1D1F1E" strokeWidth="1.5" fill="none"/>
          <line x1="8" y1="7" x2="16" y2="7" stroke="#1D1F1E" strokeWidth="1.1"/>
          <circle cx="8.5" cy="11" r="1.2" fill="#1D1F1E"/>
          <circle cx="15.5" cy="11" r="1.2" fill="#1D1F1E"/>
          <path d="M4 21L8 16M20 21L16 16" stroke="#1D1F1E" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="8" y1="16" x2="16" y2="16" stroke="#1D1F1E" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>

        <div className="flex items-baseline gap-2.5">
          {/* JUNCTION — Space Grotesk, brand weight */}
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '16px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: '#1D1F1E',
              lineHeight: 1,
            }}
          >
            JUNCTION
          </span>
          {/* System tag — Inter, very small */}
          <span
            className="hidden sm:inline-block"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '9.5px',
              fontWeight: 500,
              letterSpacing: '0.05em',
              color: '#77736C',
              textTransform: 'uppercase',
              padding: '2px 5px',
              border: '1px solid #D5CEC1',
              borderRadius: '2px',
              backgroundColor: 'transparent',
            }}
          >
            IR-ABPS
          </span>
        </div>
      </div>

      {/* ── Center: Corridor live telemetry — Inter, restrained ── */}
      <div className="hidden lg:flex items-center gap-4" style={{ fontSize: '12px', fontFamily: "'Inter', sans-serif", color: '#4B4A46' }}>
        <div className="flex items-center gap-1.5">
          <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#4D8B68', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: '#77736C' }}>Corridor</span>
          <span style={{ fontWeight: 500, color: '#1D1F1E' }}>25kV AC · KM 100–160</span>
        </div>
        <span style={{ width: 1, height: 14, backgroundColor: '#D5CEC1', display: 'inline-block' }} />
        <div className="flex items-center gap-1.5">
          <Database style={{ width: 12, height: 12, color: '#77736C', flexShrink: 0 }} />
          <span style={{ color: '#77736C' }}>Fusion</span>
          <span style={{ fontWeight: 500, color: '#1D1F1E' }}>TMS · TDMS · SMMS · COA</span>
        </div>
      </div>

      {/* ── Right controls ── */}
      <div className="flex items-center gap-1.5">

        {/* Demo simulation trigger — primary graphite action */}
        {onTriggerDemo && (
          <button
            onClick={onTriggerDemo}
            className="flex items-center gap-1.5 cursor-pointer"
            style={{
              padding: '5px 12px',
              backgroundColor: '#1D1F1E',
              color: '#F2EADF',
              border: '1px solid #1D1F1E',
              borderRadius: '4px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.01em',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#242725')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1D1F1E')}
            title="Launch 30-Second Automated Hackathon Story"
          >
            <Activity style={{ width: 12, height: 12, color: '#4D8B68', flexShrink: 0 }} />
            <span className="hidden sm:inline">Simulate Operation</span>
          </button>
        )}

        {/* Emergency toggle — restrained */}
        <button
          onClick={onToggleEmergency}
          style={{
            padding: '5px 10px',
            backgroundColor: activeEmergency ? '#C84B43' : '#F9EEEE',
            color: activeEmergency ? '#FFFFFF' : '#C84B43',
            border: `1px solid ${activeEmergency ? '#C84B43' : '#DCA09C'}`,
            borderRadius: '4px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Toggle Emergency Incident Simulation"
        >
          <AlertTriangle style={{ width: 11, height: 11, flexShrink: 0 }} />
          <span className="hidden sm:inline">
            {activeEmergency ? 'Incident Active' : 'Simulate Incident'}
          </span>
        </button>

        {/* Clock — minimal */}
        <div
          className="hidden xl:flex items-center gap-1.5"
          style={{
            padding: '4px 8px',
            border: '1px solid #D5CEC1',
            borderRadius: '4px',
            backgroundColor: 'transparent',
          }}
        >
          <Clock style={{ width: 11, height: 11, color: '#77736C', flexShrink: 0 }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10.5px', fontWeight: 500, color: '#1D1F1E', letterSpacing: '0.01em' }}>
            {timeStr}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #D5CEC1',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.12s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0ECE4')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Bell style={{ width: 14, height: 14, color: '#4B4A46' }} />
            <span style={{
              position: 'absolute', top: -4, right: -4,
              width: 14, height: 14, borderRadius: '50%',
              backgroundColor: '#C84B43', color: '#FFFFFF',
              fontSize: '8.5px', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Inter', sans-serif",
            }}>3</span>
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 z-50"
              style={{
                width: 300,
                backgroundColor: '#FBF9F4',
                border: '1px solid #D5CEC1',
                borderRadius: '6px',
                boxShadow: '0px 4px 16px rgba(29,31,30,0.10)',
                padding: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E8E2D8', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '12px', color: '#1D1F1E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity style={{ width: 13, height: 13, color: '#C84B43' }} />
                  Operational Alerts
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: 500, color: '#C84B43' }}>3 critical</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: 220, overflowY: 'auto' }}>
                {[
                  { title: 'KM 127/4 Turnout PT-227-II', body: 'TGI dropped to 68.2. Lateral G: 0.28g.', color: '#C84B43' },
                  { title: 'OHE Feeder Span 42 Hotspot', body: '+18.4°C thermal delta recorded by SCADA.', color: '#D49A32' },
                  { title: 'Shadow Block Opportunity', body: 'Club Civil Tamping with OHE Jumper at 02:00.', color: '#4D8B68' },
                ].map((n, i) => (
                  <div key={i} style={{ padding: '8px 10px', backgroundColor: '#F0ECE4', borderLeft: `2px solid ${n.color}`, borderRadius: '3px' }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '12px', color: '#1D1F1E' }}>{n.title}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#4B4A46', marginTop: '2px' }}>{n.body}</div>
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
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 8px',
              border: '1px solid #D5CEC1',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.12s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0ECE4')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {/* User monogram */}
            <div style={{
              width: 22, height: 22,
              backgroundColor: '#1D1F1E',
              color: '#F2EADF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600, fontSize: '10px',
              borderRadius: '3px', flexShrink: 0,
            }}>
              {currentUser.name[0]}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11.5px', fontWeight: 500, color: '#1D1F1E', lineHeight: 1.2 }}>
                {currentUser.name}
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', color: '#77736C', lineHeight: 1.2 }}>
                {currentUser.roleTitle.split('(')[0].trim()}
              </span>
            </div>
            <ChevronDown style={{ width: 12, height: 12, color: '#77736C' }} />
          </button>

          {showRoleMenu && (
            <div
              className="absolute right-0 mt-2 z-50"
              style={{
                width: 280,
                backgroundColor: '#FBF9F4',
                border: '1px solid #D5CEC1',
                borderRadius: '6px',
                boxShadow: '0px 4px 16px rgba(29,31,30,0.10)',
                padding: '8px',
              }}
            >
              <div style={{ padding: '4px 8px 8px', borderBottom: '1px solid #E8E2D8', marginBottom: '4px' }}>
                <span style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: 500, color: '#77736C', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Switch operational role
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 500, color: '#1D1F1E' }}>
                  6 Railway Stakeholder Portals
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => { onRoleChange(r.role); setShowRoleMenu(false); }}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '7px 8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderRadius: '4px',
                      backgroundColor: currentRole === r.role ? '#1D1F1E' : 'transparent',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={e => { if (currentRole !== r.role) e.currentTarget.style.backgroundColor = '#F0ECE4'; }}
                    onMouseLeave={e => { if (currentRole !== r.role) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 500, color: currentRole === r.role ? '#F2EADF' : '#1D1F1E' }}>
                        {r.title}
                      </div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: currentRole === r.role ? '#A8A29E' : '#77736C', marginTop: '1px' }}>
                        {r.dept}
                      </div>
                    </div>
                    {currentRole === r.role && (
                      <CheckCircle style={{ width: 13, height: 13, color: '#4D8B68', flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #E8E2D8', marginTop: '6px', paddingTop: '6px' }}>
                <button
                  onClick={() => { setShowRoleMenu(false); onOpenLogin(); }}
                  style={{
                    width: '100%', textAlign: 'center',
                    padding: '6px',
                    backgroundColor: 'transparent',
                    border: '1px solid #D5CEC1',
                    borderRadius: '4px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '11px', fontWeight: 500,
                    color: '#4B4A46',
                    cursor: 'pointer',
                    transition: 'background-color 0.12s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#EDE5D8')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  Switch user / re-authenticate
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
              width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #D5CEC1',
              borderRadius: '4px',
              backgroundColor: isPresentationMode ? '#1D1F1E' : 'transparent',
              color: isPresentationMode ? '#F2EADF' : '#4B4A46',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={isPresentationMode ? 'Exit Presentation Mode' : 'Enter Presentation Mode'}
          >
            {isPresentationMode ? <Minimize2 style={{ width: 13, height: 13 }} /> : <Maximize2 style={{ width: 13, height: 13 }} />}
          </button>
        )}
      </div>
    </header>
  );
};
