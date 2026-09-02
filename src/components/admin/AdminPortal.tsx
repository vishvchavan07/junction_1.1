import React, { useState } from 'react';
import { AuditLog } from '../../types';
import { INITIAL_AUDIT_LOGS } from '../../data/mockData';
import {
  ShieldCheck, Sliders, Database, FileText, CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminPortal: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Configurable Safety Rules — state unchanged
  const [minHeadwayMin, setMinHeadwayMin]             = useState(15);
  const [oheIsolationBufferMin, setOheIsolationBufferMin] = useState(20);
  const [maxTampingDurationMin, setMaxTampingDurationMin] = useState(180);
  const [slwSpeedLimitKmH, setSlwSpeedLimitKmH]       = useState(50);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Save handler — logic unchanged
  const handleSaveSafetyRules = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(Math.random() * 9000) + 1000}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'Sourabh Patil (Safety Admin)',
      role: 'Safety Administrator',
      action: 'Safety Rule Thresholds Updated',
      details: `Headway: ${minHeadwayMin}m, OHE Buffer: ${oheIsolationBufferMin}m, SLW Speed: ${slwSpeedLimitKmH} km/h.`,
      category: 'SAFETY_RULE_CHANGE',
      impactLevel: 'HIGH',
    };
    setAuditLogs([newLog, ...auditLogs]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 }, colors: ['#166534', '#8B1A1A', '#ffffff'] });
    } catch (e) {}
  };

  const dataConnectors = [
    { name: 'Track Management System (TMS)',           status: 'SYNCED', ping: '18ms',  records: '14,200/hr', type: 'Civil'       },
    { name: 'Traction Distribution & SCADA (TDMS)',    status: 'SYNCED', ping: '12ms',  records: '8,400/hr',  type: 'Electrical'  },
    { name: 'Signalling Maintenance (SMMS)',           status: 'SYNCED', ping: '15ms',  records: '5,600/hr',  type: 'S&T'         },
    { name: 'Control Office Application (COA)',        status: 'SYNCED', ping: '9ms',   records: '1,200/hr',  type: 'Operations'  },
    { name: 'Block Disconnection Management (BDMS)',   status: 'SYNCED', ping: '24ms',  records: '340/hr',    type: 'Possessions' },
  ];

  const InputRow = ({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) => (
    <div>
      <label className="block text-[9px] font-mono font-bold text-[#5C5347] uppercase tracking-wider mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full bg-[#FAF7F2] border border-[#C4BAA8] px-3 py-2 text-[#1A1208] font-mono font-bold text-sm outline-none focus:border-[#8B1A1A] transition-colors"
      />
    </div>
  );

  return (
    <div className="space-y-5 select-none font-mono">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-[#F5F0E8] border border-[#C4BAA8] p-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xl text-[#1A1208] tracking-tight">
              System Administration, Safety Rules & Audit Trail
            </span>
            <span className="bg-[#FEF2F2] text-[#7F1D1D] text-[9px] px-2 py-0.5 border border-[#7F1D1D]/40 font-mono font-bold">
              RAILWAY BOARD SAFETY MANDATE
            </span>
          </div>
          <p className="text-[11px] text-[#5C5347] mt-0.5">
            Engineering safety constraints, OR-Tools limits, API data connectors, and cryptographically verifiable audit logs.
          </p>
        </div>
        <div className="bg-white border border-[#C4BAA8] p-2.5 text-[11px] font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#8B1A1A]" />
          <div>
            <span className="text-[9px] text-[#8B8073] font-bold block">ADMINISTRATOR:</span>
            <span className="text-[#8B1A1A] font-bold">Sourabh Patil</span>
          </div>
        </div>
      </div>

      {/* ── Config Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Safety Constraints Form */}
        <div className="bg-white border border-[#C4BAA8] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-2.5">
            <span className="text-[11px] font-mono font-bold text-[#1A1208] uppercase flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#8B1A1A]" />
              Engineering Safety Constraints & Thresholds
            </span>
            <span className="text-[9px] text-[#8B8073] font-mono">Active Rules</span>
          </div>

          <form onSubmit={handleSaveSafetyRules} className="space-y-3">
            <InputRow
              label="Minimum Headway Buffer Between Superfast Trains (Minutes)"
              value={minHeadwayMin}
              onChange={setMinHeadwayMin}
            />
            <InputRow
              label="25kV OHE Power Isolation & Earthing Buffer (Minutes)"
              value={oheIsolationBufferMin}
              onChange={setOheIsolationBufferMin}
            />
            <InputRow
              label="Max Continuous Tamping Machine Window Duration (Minutes)"
              value={maxTampingDurationMin}
              onChange={setMaxTampingDurationMin}
            />
            <InputRow
              label="Single Line Working (SLW) Temporary Speed Restriction (km/h)"
              value={slwSpeedLimitKmH}
              onChange={setSlwSpeedLimitKmH}
            />

            <button
              type="submit"
              className="w-full py-2.5 bg-[#8B1A1A] hover:bg-[#7F1D1D] text-white font-mono font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              SAVE SAFETY CONSTRAINTS & LOG AUDIT
            </button>

            {saveSuccess && (
              <div className="p-2 bg-[#F0FDF4] border border-[#166534] text-[#166534] text-[11px] font-mono font-bold text-center">
                ✓ Safety rules updated and recorded in immutable audit log.
              </div>
            )}
          </form>
        </div>

        {/* Data Connectors */}
        <div className="bg-white border border-[#C4BAA8] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-2.5">
            <span className="text-[11px] font-mono font-bold text-[#1A1208] uppercase flex items-center gap-2">
              <Database className="w-4 h-4 text-[#1E3A5F]" />
              Enterprise Data Fusion Connectors
            </span>
            <span className="text-[10px] text-[#166534] flex items-center gap-1 font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#166534] animate-pulse" />
              ALL ONLINE
            </span>
          </div>
          <div className="space-y-2 text-[11px]">
            {dataConnectors.map((conn, idx) => (
              <div key={idx} className="p-3 bg-[#F5F0E8] border border-[#D9D0C0] flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-[#1A1208]">{conn.name}</div>
                  <div className="text-[9px] text-[#8B8073] font-mono">Throughput: {conn.records} · Dept: {conn.type}</div>
                </div>
                <div>
                  <span className="text-[9px] bg-[#F0FDF4] text-[#166534] font-mono font-bold px-1.5 py-0.5 border border-[#166534]/40">
                    {conn.status} ({conn.ping})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Audit Log Table ──────────────────────────────── */}
      <div className="bg-white border border-[#C4BAA8] overflow-hidden">
        <div className="border-b border-[#D9D0C0] px-4 py-2.5 flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-[#1A1208] uppercase flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#8B1A1A]" />
            Immutable Audit Trail & AI Decision Log
          </span>
          <span className="text-[9px] text-[#8B8073] font-mono">Showing {auditLogs.length} Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-[#F5F0E8] text-[#8B8073] border-b border-[#D9D0C0] text-[9px] font-mono font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User / Persona</th>
                <th className="py-2.5 px-3">Action Executed</th>
                <th className="py-2.5 px-3">Operational Details</th>
                <th className="py-2.5 px-3">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE7DA]">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#FAF7F2]">
                  <td className="py-2.5 px-3 text-[#8B8073] font-mono text-[10px] whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#8B1A1A]">{log.user}</td>
                  <td className="py-2.5 px-3 font-mono text-[#1A1208] font-medium">{log.action}</td>
                  <td className="py-2.5 px-3 font-mono text-[#5C5347]">{log.details}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[8px] bg-[#EFF6FF] text-[#1E3A5F] font-mono font-bold px-1.5 py-0.5 border border-[#BFDBFE]">
                      {log.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
