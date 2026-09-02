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
  Train,
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
    <header className="bg-[#FFFFFF]/90 backdrop-blur-md h-12 border-b border-[#1A1815] fixed top-0 right-0 left-0 z-40 flex items-center justify-between px-3 sm:px-6 select-none shadow-sm">

      {/* ── Brand Identity: Integrated Train & Junction Mark ── */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 border border-[#1A1815] bg-[#F7F4EE] flex items-center justify-center shrink-0 rounded-[2px]">
          {/* Integrated Train & Track Switch SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="3" width="14" height="13" rx="1.5" stroke="#1A1815" strokeWidth="1.6" fill="none" />
            <line x1="8" y1="7" x2="16" y2="7" stroke="#1A1815" strokeWidth="1.2" />
            <circle cx="8.5" cy="11.5" r="1.2" fill="#1A1815" />
            <circle cx="15.5" cy="11.5" r="1.2" fill="#1A1815" />
            {/* Lower rails */}
            <path d="M4 21L8 16M20 21L16 16M10 21H14" stroke="#1A1815" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-sans font-extrabold text-[15px] text-[#1A1815] tracking-[0.08em]">
            JUNCTION
          </span>
          <span className="hidden sm:inline-block text-[9.5px] bg-[#F0EBE1] border border-[#D8D1C5] text-[#615A4F] px-1.5 py-0.2 rounded-[2px] font-mono font-semibold">
            IR-ABPS · VR-ST
          </span>
        </div>
      </div>

      {/* ── Center: Corridor Live Telemetry ── */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#615A4F]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
          <span>CORRIDOR:</span>
          <span className="text-[#1A1815] font-semibold">25kV AC (KM 100–160)</span>
        </div>
        <div className="h-3 w-[1px] bg-[#D8D1C5]" />
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#615A4F]">
          <Database className="w-3 h-3 text-[#615A4F]" />
          <span>FUSION:</span>
          <span className="text-[#1A1815] font-semibold">TMS · TDMS · SMMS · COA</span>
        </div>
      </div>

      {/* ── Right: Emergency Trigger, Clock, Role Switcher & Focus Mode ── */}
      <div className="flex items-center gap-2">

        {/* Hackathon Demo Simulation Trigger */}
        {onTriggerDemo && (
          <button
            onClick={onTriggerDemo}
            className="px-2.5 py-1 bg-[#1A1815] hover:bg-[#2D2A26] text-[#FFFFFF] text-[10px] font-mono font-bold uppercase rounded-[2px] shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            title="Launch 30-Second Automated Hackathon Story"
          >
            <Activity className="w-3 h-3 text-[#15803D]" />
            <span className="hidden sm:inline">SIMULATE OPERATION</span>
          </button>
        )}

        {/* Emergency Simulation Trigger */}
        <button
          onClick={onToggleEmergency}
          className={`px-2 py-1 text-[10px] font-mono font-semibold flex items-center gap-1.5 rounded-[2px] transition-colors border cursor-pointer ${
            activeEmergency
              ? 'bg-[#B91C1C] text-[#FFFFFF] border-[#B91C1C]'
              : 'bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]'
          }`}
          title="Toggle Emergency Incident Simulation (Rail Fracture at KM 127/4)"
        >
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span className="hidden sm:inline">
            {activeEmergency ? 'INCIDENT ACTIVE' : 'SIMULATE INCIDENT'}
          </span>
        </button>

        {/* Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 border border-[#D8D1C5] bg-[#F7F4EE] rounded-[2px]">
          <Clock className="w-3 h-3 text-[#615A4F] shrink-0" />
          <span className="text-[#1A1815] text-[10.5px] font-mono font-semibold">{timeStr}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-7 h-7 flex items-center justify-center border border-[#D8D1C5] bg-[#FFFFFF] hover:bg-[#F7F4EE] text-[#1A1815] rounded-[2px] transition-colors cursor-pointer relative"
          >
            <Bell className="w-3.5 h-3.5 text-[#615A4F]" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#B91C1C] text-white text-[8.5px] font-mono font-bold flex items-center justify-center rounded-full">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#FFFFFF] border border-[#1A1815] shadow-xl rounded-[2px] p-3 z-50">
              <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-2 mb-2">
                <span className="font-mono font-semibold text-[11px] text-[#1A1815] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#B91C1C]" />
                  OPERATIONAL ALERTS
                </span>
                <span className="text-[10px] text-[#B91C1C] font-mono font-semibold">3 CRITICAL</span>
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {[
                  { title: 'KM 127/4 Turnout PT-227-II', body: 'TGI dropped to 68.2. OMS Lateral G: 0.28g.', border: '#B91C1C' },
                  { title: 'OHE Feeder Span 42 Hotspot', body: '+18.4°C thermal delta recorded by SCADA.', border: '#B45309' },
                  { title: 'Shadow Block Opportunity', body: 'Club Civil Tamping with OHE Jumper at 02:00.', border: '#15803D' },
                ].map((n, i) => (
                  <div key={i} className="p-2 bg-[#F7F4EE] border-l-2 rounded-[1px]" style={{ borderLeftColor: n.border }}>
                    <div className="text-[#1A1815] font-sans font-semibold text-[11px]">{n.title}</div>
                    <div className="text-[10px] text-[#615A4F] mt-0.5">{n.body}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Selector */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2 py-0.5 border border-[#D8D1C5] bg-[#FFFFFF] hover:bg-[#F7F4EE] rounded-[2px] cursor-pointer transition-colors"
          >
            <div className="w-5 h-5 bg-[#1A1815] text-[#FFFFFF] flex items-center justify-center font-mono font-bold text-[9.5px] rounded-sm shrink-0">
              {currentUser.name[0]}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[10.5px] font-sans font-semibold text-[#1A1815] leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[8.5px] text-[#615A4F] leading-tight font-mono">
                {currentUser.roleTitle.split('(')[0].trim()}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#615A4F]" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-[#FFFFFF] border border-[#1A1815] shadow-xl rounded-[2px] p-2 z-50">
              <div className="px-2 py-1.5 border-b border-[#D8D1C5] mb-1">
                <span className="block text-[9px] font-mono font-semibold text-[#615A4F] tracking-wider uppercase">
                  Switch Operational Role
                </span>
                <span className="text-[11px] text-[#1A1815] font-sans font-semibold">
                  6 Railway Stakeholder Portals
                </span>
              </div>
              <div className="space-y-0.5">
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => { onRoleChange(r.role); setShowRoleMenu(false); }}
                    className={`w-full text-left px-2 py-1.5 flex items-center justify-between rounded-[2px] transition-colors cursor-pointer ${
                      currentRole === r.role
                        ? 'bg-[#1A1815] text-[#FFFFFF]'
                        : 'text-[#1A1815] hover:bg-[#F7F4EE]'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] font-sans font-medium">{r.title}</div>
                      <div className={`text-[9px] font-mono ${currentRole === r.role ? 'text-[#D8D1C5]' : 'text-[#615A4F]'}`}>
                        {r.dept}
                      </div>
                    </div>
                    {currentRole === r.role && (
                      <CheckCircle className="w-3 h-3 text-[#4ADE80] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-[#D8D1C5] mt-1.5 pt-1.5">
                <button
                  onClick={() => { setShowRoleMenu(false); onOpenLogin(); }}
                  className="w-full text-center py-1 bg-[#F7F4EE] hover:bg-[#EDE7DC] text-[#1A1815] border border-[#D8D1C5] text-[10px] font-mono font-semibold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
                >
                  Switch User / Re-authenticate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Presentation Focus Mode Button */}
        {onTogglePresentationMode && (
          <button
            onClick={onTogglePresentationMode}
            className={`p-1 border rounded-[2px] transition-colors cursor-pointer ${
              isPresentationMode
                ? 'bg-[#1A1815] text-[#FFFFFF] border-[#1A1815]'
                : 'bg-[#FFFFFF] text-[#615A4F] hover:text-[#1A1815] border-[#D8D1C5]'
            }`}
            title={isPresentationMode ? 'Exit Presentation Mode' : 'Enter Presentation Focus Mode'}
          >
            {isPresentationMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </header>
  );
};
