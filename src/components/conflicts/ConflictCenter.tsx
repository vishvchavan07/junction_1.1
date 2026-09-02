import React, { useState } from 'react';
import { BlockConflict } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Train,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ConflictCenterProps {
  conflicts: BlockConflict[];
  onResolveConflict?: (conflictId: string) => void;
  onNavigateToOverview?: () => void;
}

export const ConflictCenter: React.FC<ConflictCenterProps> = ({
  conflicts: initialConflicts,
  onResolveConflict,
  onNavigateToOverview,
}) => {
  const [conflicts, setConflicts] = useState<BlockConflict[]>(initialConflicts);

  const handleResolve = (conflictId: string) => {
    setConflicts(prev =>
      prev.map(c => c.id === conflictId ? { ...c, status: 'RESOLVED_BY_AI' } : c)
    );
    if (onResolveConflict) onResolveConflict(conflictId);
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#15803D', '#1E3A5F', '#8B1A1A', '#FFFFFF'],
      });
    } catch (e) {}
  };

  const resolved = conflicts.filter(c => c.status === 'RESOLVED_BY_AI').length;

  return (
    <div className="space-y-4 select-none font-sans">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-[#FFFFFF] border border-[#1A1815] p-4 rounded-[2px] shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-lg text-[#1A1815] tracking-tight">
              Possession Conflict Resolution Centre
            </span>
            <span className="bg-[#FEF2F2] text-[#B91C1C] text-[10px] px-2 py-0.5 border border-[#FECACA] font-mono font-bold rounded-[2px]">
              MULTI-DEPARTMENT DE-CONFLICTING
            </span>
          </div>
          <p className="text-[11px] text-[#615A4F] mt-0.5 font-sans">
            Real-time inter-departmental dependency resolution across Civil, Traction, Signals, and Train Traffic.
          </p>
        </div>

        {/* Resolution Rate */}
        <div className="flex items-center gap-6 bg-[#F7F4EE] border border-[#D8D1C5] p-3 rounded-[2px] shrink-0">
          <div>
            <div className="text-[9.5px] text-[#615A4F] font-mono font-bold uppercase">Resolution Rate</div>
            <div className="text-2xl font-mono font-bold text-[#1A1815]">
              {Math.round((resolved / conflicts.length) * 100)}%
            </div>
          </div>
          <div className="text-[11px] text-[#15803D] flex items-center gap-1 font-mono font-bold">
            <CheckCircle2 className="w-4 h-4" />
            {resolved} of {conflicts.length} Resolved
          </div>
        </div>
      </div>

      {/* ── Conflict cards ──────────────────────────────── */}
      <div className="space-y-3">
        {conflicts.map(conflict => {
          const isResolved = conflict.status === 'RESOLVED_BY_AI';
          const isShadowCoordination = conflict.id === 'CNF-2026-001';

          return (
            <div
              key={conflict.id}
              className={`bg-[#FFFFFF] border p-4 space-y-3 rounded-[2px] shadow-sm transition-all ${
                isResolved
                  ? 'border-[#BBF7D0] bg-[#F0FDF4]/30'
                  : 'border-[#1A1815]'
              }`}
            >
              {/* Card header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D8D1C5] pb-2.5 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={conflict.status} />
                  <span className="text-[11px] font-mono font-bold text-[#1A1815]">{conflict.id}</span>
                  <span className="font-sans font-bold text-[13px] text-[#1A1815]">{conflict.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[10.5px] font-mono">
                  <span className="text-[#615A4F]">SEVERITY:</span>
                  <strong style={{ color: conflict.severity === 'CRITICAL' ? '#B91C1C' : '#B45309' }}>
                    {conflict.severity}
                  </strong>
                </div>
              </div>

              {/* Description */}
              <p className="text-[12px] text-[#615A4F] leading-relaxed">{conflict.description}</p>

              {/* Inter-Departmental Dependency Chain Preview */}
              {isShadowCoordination && (
                <div className="p-2.5 bg-[#FAF7F2] border border-[#D8D1C5] rounded-[2px]">
                  <div className="text-[10px] font-mono font-bold text-[#1A1815] uppercase mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#1A1815]" />
                    Inter-Department Dependency Chain:
                  </div>
                  <div className="flex items-center gap-2 text-[10.5px] font-mono flex-wrap">
                    <span className="px-2 py-0.5 bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] rounded-[1px]">
                      1. Civil Track Tamping (KM 126)
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#615A4F]" />
                    <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#1E3A5F] border border-[#BFDBFE] rounded-[1px]">
                      2. OHE Traction Inspection
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#615A4F]" />
                    <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] rounded-[1px]">
                      3. S&T Route Interlocking
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#615A4F]" />
                    <span className="px-2 py-0.5 bg-[#F7F4EE] text-[#1A1815] border border-[#D8D1C5] rounded-[1px]">
                      4. Vande Bharat 20901 Departs
                    </span>
                  </div>
                </div>
              )}

              {/* Before / After comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                {/* Before AI */}
                <div className="bg-[#FEF2F2] border border-[#FECACA] p-3 space-y-1.5 rounded-[2px]">
                  <div className="text-[10px] text-[#B91C1C] font-mono font-bold uppercase flex items-center justify-between">
                    <span>Uncoordinated Request (Before AI)</span>
                    <span className="bg-[#B91C1C] text-white px-1.5 py-0.2 rounded-[1px] text-[8.5px]">BOTTLENECK</span>
                  </div>
                  <div className="space-y-1 text-[#615A4F] font-sans text-[11px]">
                    <div className="flex justify-between">
                      <span>Corridor Shutdown:</span>
                      <strong className="text-[#B91C1C] font-mono">4.5 hrs (Fragmented)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Passenger Delay:</span>
                      <strong className="text-[#B91C1C] font-mono">45 min ripple</strong>
                    </div>
                  </div>
                </div>

                {/* After AI */}
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-3 space-y-1.5 rounded-[2px]">
                  <div className="text-[10px] text-[#15803D] font-mono font-bold uppercase flex items-center justify-between">
                    <span>JUNCTION AI Shadow Clubbed (After AI)</span>
                    <span className="bg-[#15803D] text-white px-1.5 py-0.2 rounded-[1px] text-[8.5px]">OPTIMIZED</span>
                  </div>
                  <div className="space-y-1 text-[#615A4F] font-sans text-[11px]">
                    <div className="flex justify-between">
                      <span>Synchronized Window:</span>
                      <strong className="text-[#15803D] font-mono">02:00 – 03:30 (90 min)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Passenger Delay:</span>
                      <strong className="text-[#15803D] font-mono">0 min (Zero impact)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI strategy */}
              <div className="p-3 bg-[#F7F4EE] border border-[#D8D1C5] text-[11px] rounded-[2px] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#1A1815] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#1A1815] font-mono font-bold">AI Resolution Strategy: </span>
                  <span className="text-[#615A4F]">{conflict.aiSuggestedSolution}</span>
                </div>
              </div>

              {/* Action footer */}
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#D8D1C5] gap-2">
                <span className="text-[10.5px] font-mono text-[#615A4F]">
                  Location: <strong className="text-[#1A1815]">{conflict.section}</strong> · Window: <strong className="text-[#1A1815]">{conflict.timeWindow}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {onNavigateToOverview && (
                    <button
                      onClick={onNavigateToOverview}
                      className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F7F4EE] text-[#1A1815] border border-[#D8D1C5] text-[11px] font-mono font-semibold rounded-[2px] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Train className="w-3.5 h-3.5 text-[#1A1815]" />
                      <span>View in Railway Canvas</span>
                    </button>
                  )}

                  {!isResolved ? (
                    <button
                      onClick={() => handleResolve(conflict.id)}
                      className="btn-pen-primary py-1.5 px-3 text-[11px] font-mono uppercase"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Apply AI Resolution
                    </button>
                  ) : (
                    <span className="text-[#15803D] font-mono font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Resolution Applied & Interlocked
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
