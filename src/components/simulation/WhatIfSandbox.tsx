import React, { useState } from 'react';
import { TrainEntity, MaintenanceBlock } from '../../types';
import { simulateWhatIfScenario } from '../../services/aiOptimizer';
import { StatusBadge } from '../common/StatusBadge';
import {
  Flame, Play, RotateCcw, Zap, Sparkles, CheckCircle2, AlertTriangle, Train, Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WhatIfSandboxProps {
  blocks: MaintenanceBlock[];
  trains: TrainEntity[];
  onApplySimulationResult: (impactedTrains: TrainEntity[], emergencyBlocks: MaintenanceBlock[]) => void;
  onNavigateToOverview?: () => void;
}

export const WhatIfSandbox: React.FC<WhatIfSandboxProps> = ({
  blocks, trains, onApplySimulationResult, onNavigateToOverview
}) => {
  const [selectedScenario, setSelectedScenario] = useState<'RAIL_FRACTURE' | 'OHE_BREAKDOWN' | 'FREIGHT_SURGE'>('RAIL_FRACTURE');
  const [simResult, setSimResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const result = simulateWhatIfScenario(selectedScenario, blocks, trains);
      setSimResult(result);
      setIsSimulating(false);
      onApplySimulationResult(result.impactedTrains, result.emergencyBlocks);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#8B1A1A', '#B45309', '#15803D'],
        });
      } catch (e) {}
    }, 700);
  };

  const handleReset = () => setSimResult(null);

  const scenarioCards = [
    {
      type: 'RAIL_FRACTURE' as const,
      title: 'Sudden Rail Fracture on UP Line',
      location: 'Vapi – Udvada (KM 127/4)',
      severity: 'CRITICAL',
      desc: 'USFD / OMS flags immediate track discontinuity on 60kg rail. Red signal auto-triggered on Block 127.',
      icon: AlertTriangle,
      accentColor: '#B91C1C',
      bg: '#FEF2F2',
    },
    {
      type: 'OHE_BREAKDOWN' as const,
      title: '25kV Catenary Dropper Parting',
      location: 'Bhilad – Sanjan (KM 107/0)',
      severity: 'CRITICAL',
      desc: 'High-tension contact wire sagging detected by SCADA. Power block + tower wagon isolation required.',
      icon: Zap,
      accentColor: '#B45309',
      bg: '#FFFBEB',
    },
    {
      type: 'FREIGHT_SURGE' as const,
      title: 'Festive Coal & Container Surge (+40%)',
      location: 'Full Western Corridor',
      severity: 'MEDIUM',
      desc: 'Inflow of 8 additional goods rakes (BOXN & BTPN). Tests dynamic platooning & nighttime headway compression.',
      icon: Train,
      accentColor: '#1E3A5F',
      bg: '#EFF6FF',
    },
  ];

  return (
    <div className="space-y-4 select-none font-sans">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-[#FFFFFF] border border-[#1A1815] p-4 rounded-[2px] shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-lg text-[#1A1815] tracking-tight">
              What-If Incident & Disruption Sandbox
            </span>
            <span className="bg-[#FAF7F2] text-[#1A1815] text-[10px] px-2 py-0.5 border border-[#D8D1C5] font-mono font-bold rounded-[2px]">
              DYNAMIC STRESS-TEST ENGINE
            </span>
          </div>
          <p className="text-[11.5px] text-[#615A4F] mt-0.5">
            Inject emergency breakdowns or demand surges to evaluate AI re-scheduling, single-line-working (SLW), and delay absorption.
          </p>
        </div>
        {simResult && (
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F7F4EE] border border-[#D8D1C5] text-[#1A1815] text-[10.5px] font-mono font-bold rounded-[2px] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#B91C1C]" />
            RESET TO BASELINE
          </button>
        )}
      </div>

      {/* Scenario Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarioCards.map(sc => {
          const Icon = sc.icon;
          const isSelected = selectedScenario === sc.type;
          return (
            <button
              key={sc.type}
              type="button"
              onClick={() => { setSelectedScenario(sc.type); setSimResult(null); }}
              className={`p-4 text-left transition-all flex flex-col justify-between cursor-pointer rounded-[2px] border ${
                isSelected
                  ? 'border-[#1A1815] bg-[#FFFFFF] shadow-sm'
                  : 'border-[#D8D1C5] bg-[#FFFFFF] hover:bg-[#FAF7F2]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: sc.accentColor }} />
                    <span className="font-semibold text-xs text-[#1A1815]">{sc.title}</span>
                  </div>
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-[1px]"
                    style={{ color: sc.accentColor, border: `1px solid ${sc.accentColor}40`, background: `${sc.accentColor}15` }}
                  >
                    {sc.severity}
                  </span>
                </div>
                <div className="text-[10.5px] font-mono font-bold mb-1" style={{ color: sc.accentColor }}>
                  Location: {sc.location}
                </div>
                <p className="text-[11.5px] text-[#615A4F] leading-relaxed">{sc.desc}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#EDE7DC] flex items-center justify-between text-[9.5px] font-mono">
                <span className="text-[#615A4F]">Click to Select</span>
                {isSelected && <span className="font-bold text-[#1A1815]">ACTIVE SCENARIO</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Execute CTA */}
      <div className="bg-[#F7F4EE] border border-[#D8D1C5] p-3.5 rounded-[2px] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-[11.5px] font-mono font-bold text-[#1A1815]">
            READY TO INJECT: {selectedScenario.replace('_', ' ')}
          </div>
          <div className="text-[10.5px] text-[#615A4F]">
            Simulates real-time sensor triggers, red signal locks, emergency block injection, and automated train diversion.
          </div>
        </div>
        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="btn-pen-danger px-5 py-2 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          {isSimulating ? 'SIMULATING DYNAMICS...' : 'EXECUTE WHAT-IF SIMULATION'}
        </button>
      </div>

      {/* Simulation Results */}
      {simResult && (
        <div className="bg-[#FFFFFF] border border-[#1A1815] p-4 space-y-4 rounded-[2px] shadow-sm animate-fade-in">

          {/* Result banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D8D1C5] pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1A1815]" />
              <span className="font-sans font-bold text-base text-[#1A1815]">
                Simulation Results: AI Mitigation & Diversion Strategy
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-[11px] text-[#615A4F] font-mono">
                Total Ripple Delay: <strong className="text-[#B45309]">+{simResult.totalAddedDelayMin} min</strong> (Absorbed)
              </div>
              {onNavigateToOverview && (
                <button
                  onClick={onNavigateToOverview}
                  className="px-2.5 py-1 bg-[#F7F4EE] hover:bg-[#EDE7DC] border border-[#D8D1C5] text-[#1A1815] text-[10px] font-mono font-bold rounded-[2px] flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" /> View Live Simulation on Canvas
                </button>
              )}
            </div>
          </div>

          {/* Emergency blocks */}
          {simResult.emergencyBlocks.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold text-[#1A1815] uppercase">
                Emergency Possession Automatically Dispatched:
              </div>
              {simResult.emergencyBlocks.map((blk: any) => (
                <div key={blk.id} className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[2px] space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="text-[#B91C1C] font-bold">{blk.blockCode}</span>
                    <span className="text-[#B91C1C] font-bold">Slot: {blk.aiOptimalStartTime} – {blk.aiOptimalEndTime} ({blk.durationMinutes} min)</span>
                  </div>
                  <div className="text-[11.5px] font-semibold text-[#1A1815]">{blk.title}</div>
                  <div className="text-[11px] text-[#615A4F]">{blk.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Diversion plan */}
          <div className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[2px] space-y-1">
            <div className="text-[#15803D] font-mono font-bold text-[10.5px] uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Automated Corridor Diversion Plan:
            </div>
            <p className="text-[#1A1815] text-[11.5px] font-mono leading-relaxed">{simResult.recommendedDiversionPlan}</p>
          </div>

          {/* XAI rationale */}
          <div className="p-3 bg-[#FAF7F2] border border-[#D8D1C5] text-[11px] font-mono rounded-[2px]">
            <span className="text-[#1A1815] font-bold uppercase text-[9.5px]">XAI Rationale & Trade-off: </span>
            <p className="text-[#615A4F] mt-0.5">{simResult.xaiMitigationRationale}</p>
          </div>

          {/* Impacted trains table */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold text-[#1A1815] uppercase">
              Updated Train Dispatch Status Post-Incident:
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px] font-mono">
                <thead>
                  <tr className="bg-[#FAF7F2] text-[#615A4F] border-b border-[#D8D1C5] text-[9.5px] font-bold uppercase">
                    <th className="py-2 px-3">Train No.</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Speed</th>
                    <th className="py-2 px-3">Delay</th>
                    <th className="py-2 px-3">Diversion Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE7DC]">
                  {simResult.impactedTrains.map((tr: any) => (
                    <tr key={tr.id} className="hover:bg-[#FAF7F2]">
                      <td className="py-2 px-3 font-bold text-[#1A1815]">{tr.trainNumber}</td>
                      <td className="py-2 px-3 font-sans text-[#1A1815] font-medium">{tr.trainName}</td>
                      <td className="py-2 px-3 text-[#1A1815]">{tr.speedKmH} km/h</td>
                      <td className="py-2 px-3 font-bold">
                        <span style={{ color: tr.delayMinutes > 0 ? '#B45309' : '#15803D' }}>
                          +{tr.delayMinutes} min
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {tr.diverted
                          ? <span className="text-[#B45309] font-bold">Diverted via Down Line</span>
                          : <span className="text-[#15803D]">Normal Path</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
