import React, { useState } from 'react';
import { MaintenanceBlock, FixedAsset, TrainEntity, MultiHorizonSettings } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { XaiCard } from '../common/XaiCard';
import { runAiBlockOptimization } from '../../services/aiOptimizer';
import confetti from 'canvas-confetti';
import { 
  CalendarClock, 
  Sparkles, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  Train, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Maximize2,
  TrendingDown,
  Zap,
  Radio,
  FileCheck,
  XCircle,
  Edit3
} from 'lucide-react';

interface AiBlockPlannerProps {
  blocks: MaintenanceBlock[];
  assets: FixedAsset[];
  trains: TrainEntity[];
  onUpdateBlock: (updatedBlock: MaintenanceBlock) => void;
  onNavigateToOverview?: () => void;
}

export const AiBlockPlanner: React.FC<AiBlockPlannerProps> = ({
  blocks: initialBlocks,
  assets,
  trains,
  onUpdateBlock,
  onNavigateToOverview,
}) => {
  const [blocks, setBlocks] = useState<MaintenanceBlock[]>(initialBlocks);
  const [horizon, setHorizon] = useState<'24h' | '7d' | '30d'>('24h');
  const [corridor, setCorridor] = useState<string>('Vapi – Udvada (KM 125–135)');
  
  // Objective Function Weights
  const [delayWeight, setDelayWeight] = useState<number>(40);
  const [assetRiskWeight, setAssetRiskWeight] = useState<number>(30);
  const [shadowClubWeight, setShadowClubWeight] = useState<number>(20);
  const [crewAvailWeight, setCrewAvailWeight] = useState<number>(10);

  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationSuccess, setOptimizationSuccess] = useState<boolean>(false);
  const [editingBlock, setEditingBlock] = useState<MaintenanceBlock | null>(null);
  const [editStartTime, setEditStartTime] = useState<string>('02:00');
  const [editEndTime, setEditEndTime] = useState<string>('03:30');

  // Trigger AI Multi-Horizon Optimization
  const handleExecuteOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const settings: MultiHorizonSettings = {
        horizon,
        corridor,
        weights: {
          trainDelayMinimization: delayWeight / 100,
          assetRiskUrgency: assetRiskWeight / 100,
          multiDeptClubbing: shadowClubWeight / 100,
          crewMachineAvailability: crewAvailWeight / 100
        },
        nightWindowPreferred: true,
        freightPriorityBuffer: true
      };

      const result = runAiBlockOptimization(blocks, assets, trains, settings);
      setBlocks(result.optimizedBlocks);
      setIsOptimizing(false);
      setOptimizationSuccess(true);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4be277', '#22c55e', '#3b82f6', '#ffffff']
        });
      } catch (e) {
        // Fallback if canvas confetti isn't ready
      }
    }, 900);
  };

  // Controller Approval Action
  const handleApproveBlock = (blockId: string) => {
    const updated = blocks.map(b => {
      if (b.id === blockId) {
        const approved: MaintenanceBlock = {
          ...b,
          status: 'APPROVED',
          approvalHistory: {
            approvedBy: 'Samyak Misal (Chief Controller)',
            approvedAt: new Date().toLocaleTimeString(),
            notes: 'Approved via Junction AI Optimization Engine.'
          }
        };
        onUpdateBlock(approved);
        return approved;
      }
      return b;
    });
    setBlocks(updated);
  };

  // Controller Reject Action
  const handleRejectBlock = (blockId: string) => {
    const updated = blocks.map(b => {
      if (b.id === blockId) {
        const rejected: MaintenanceBlock = {
          ...b,
          status: 'REJECTED',
          approvalHistory: {
            notes: 'Rejected by Controller: Peak goods freight rakes given clearance.'
          }
        };
        onUpdateBlock(rejected);
        return rejected;
      }
      return b;
    });
    setBlocks(updated);
  };

  // Save Manual Window Edit
  const handleSaveEdit = () => {
    if (!editingBlock) return;
    const updated = blocks.map(b => {
      if (b.id === editingBlock.id) {
        const mod: MaintenanceBlock = {
          ...b,
          aiOptimalStartTime: editStartTime,
          aiOptimalEndTime: editEndTime,
          status: 'MODIFIED',
          approvalHistory: {
            approvedBy: 'Controller Manual Time Override',
            approvedAt: new Date().toLocaleTimeString(),
            notes: `Window adjusted to ${editStartTime}–${editEndTime}.`
          }
        };
        onUpdateBlock(mod);
        return mod;
      }
      return b;
    });
    setBlocks(updated);
    setEditingBlock(null);
  };

  const timelineHours = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00'];

  return (
    <div className="space-y-5 select-none font-mono">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-[#F5F0E8] border border-[#C4BAA8] p-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xl text-[#1A1208] tracking-tight">
              AI Multi-Horizon Block Optimization Engine
            </span>
            <span className="bg-[#EFF6FF] text-[#1E3A5F] text-[9px] px-2 py-0.5 border border-[#BFDBFE] font-mono font-bold">
              MILP / OR-TOOLS
            </span>
          </div>
          <p className="text-[11px] text-[#5C5347] mt-0.5">
            Automated conflict resolution, shadow block clustering, and passenger train punctuality preservation.
          </p>
        </div>

        {/* Horizon Tabs */}
        <div className="flex items-center gap-0 bg-white border border-[#C4BAA8] overflow-hidden">
          <button
            onClick={() => setHorizon('24h')}
            className={`px-3 py-2 text-[10px] font-mono font-bold cursor-pointer transition-colors ${
              horizon === '24h' ? 'bg-[#1A1208] text-[#FAF7F2]' : 'text-[#5C5347] hover:bg-[#EDE7DA]'
            }`}
          >
            24H DYNAMIC
          </button>
          <button
            onClick={() => setHorizon('7d')}
            className={`px-3 py-2 text-[10px] font-mono font-bold cursor-pointer transition-colors border-l border-[#C4BAA8] ${
              horizon === '7d' ? 'bg-[#1A1208] text-[#FAF7F2]' : 'text-[#5C5347] hover:bg-[#EDE7DA]'
            }`}
          >
            7-DAY TACTICAL
          </button>
          <button
            onClick={() => setHorizon('30d')}
            className={`px-3 py-2 text-[10px] font-mono font-bold cursor-pointer transition-colors border-l border-[#C4BAA8] ${
              horizon === '30d' ? 'bg-[#1A1208] text-[#FAF7F2]' : 'text-[#5C5347] hover:bg-[#EDE7DA]'
            }`}
          >
            30-DAY STRATEGIC
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Column: Parameters (4 cols) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white border border-[#C4BAA8] p-4">
            <div className="flex items-center gap-2 border-b border-[#EDE7DA] pb-2.5 mb-4">
              <Sliders className="w-4 h-4 text-[#8B1A1A]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1A1208]">
                1. Optimization Parameters
              </span>
            </div>

            <div className="space-y-4 text-[11px] font-mono">
              {/* Corridor Selector */}
              <div>
                <label className="block text-[9px] font-bold text-[#5C5347] uppercase tracking-wider mb-1">
                  Target Railway Corridor
                </label>
                <select
                  value={corridor}
                  onChange={(e) => setCorridor(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#C4BAA8] px-3 py-2 text-[11px] text-[#1A1208] font-mono outline-none focus:border-[#8B1A1A]"
                >
                  <option value="Vapi – Udvada (KM 125–135)">Vapi – Udvada Sector (KM 125–135) [High Traffic]</option>
                  <option value="Valsad – Surat Main">Valsad – Surat Main Section (KM 140–180)</option>
                  <option value="Western Railway High-Density Main">Full Western Railway High-Density Corridor</option>
                </select>
              </div>

              {/* Shadow Block Clustering Toggle */}
              <div className="p-3 bg-[#F5F0E8] border border-[#D9D0C0] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#1A1208]">SHADOW BLOCK CLUSTERING</div>
                  <div className="text-[9px] text-[#5C5347]">Auto-club Civil, OHE & S&T into shared windows</div>
                </div>
                <span className="text-[#166534] font-bold">ENABLED</span>
              </div>

              {/* Objective Function Weights */}
              <div className="space-y-3 pt-2 border-t border-[#EDE7DA]">
                <div className="flex justify-between items-center text-[9px] font-bold text-[#5C5347] uppercase">
                  <span>MILP Objective Weights</span>
                  <span className="text-[#8B1A1A]">TOTAL: {delayWeight + assetRiskWeight + shadowClubWeight + crewAvailWeight}%</span>
                </div>

                {[['w₁: Train Delay Minimization', delayWeight, setDelayWeight, 10, 70, '#166534'],
                  ['w₂: Asset Failure Risk Urgency', assetRiskWeight, setAssetRiskWeight, 10, 60, '#92400E'],
                  ['w₃: Multi-Dept Clubbing Priority', shadowClubWeight, setShadowClubWeight, 10, 50, '#1E3A5F'],
                  ['w₄: Machine/Crew Availability', crewAvailWeight, setCrewAvailWeight, 5, 30, '#5C5347'],
                ].map(([label, val, setter, mn, mx, col]: any) => (
                  <div key={label}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-[#1A1208]">{label}</span>
                      <strong style={{ color: col }}>{val}%</strong>
                    </div>
                    <input
                      type="range"
                      min={mn}
                      max={mx}
                      value={val}
                      onChange={(e) => setter(Number(e.target.value))}
                      className="w-full h-1.5 cursor-pointer"
                      style={{ accentColor: col }}
                    />
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={handleExecuteOptimization}
                disabled={isOptimizing}
                className="w-full py-3 bg-[#8B1A1A] hover:bg-[#7F1D1D] text-white font-mono font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors active:scale-98 cursor-pointer disabled:opacity-50 shadow"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isOptimizing ? 'COMPUTING MILP OPTIMIZATION...' : 'EXECUTE AI OPTIMIZER'}</span>
              </button>
            </div>
          </div>

          {/* Efficiency Gains Card */}
          <div className="bg-white border border-[#C4BAA8] p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#166534' }}>
            <div className="flex items-center gap-2 border-b border-[#EDE7DA] pb-2 mb-3">
              <TrendingDown className="w-4 h-4 text-[#166534]" />
              <span className="text-[10px] font-mono font-bold text-[#166534] uppercase">
                AI Optimization Efficiency Gains
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono">
              {[
                ['Train Delay Avoidance:',   '54 min saved',          '#166534'],
                ['Corridor Window Gained:',  '+3.5 hours',            '#1E3A5F'],
                ['Shadow Blocks Clubbed:',   '3 Depts Synchronized',  '#166534'],
                ['Tamping Machine ROI:',     '92.4% utilization',     '#1A1208'],
              ].map(([k, v, c]) => (
                <div key={k as string} className="flex justify-between p-2 bg-[#F5F0E8] border border-[#D9D0C0]">
                  <span className="text-[#5C5347]">{k as string}</span>
                  <span className="font-bold" style={{ color: c as string }}>{v as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Gantt + Block Cards (8 cols) */}
        <div className="xl:col-span-8 space-y-5">
          {/* Interactive Gantt Multi-Horizon Timeline */}
          <div className="bg-white border border-[#C4BAA8] p-4">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-2.5 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[10px] text-[#8B1A1A] bg-[#FEF2F2] border border-[#8B1A1A]/30 px-2 py-0.5">
                  GANTT TIMELINE VISUALIZER
                </span>
                <span className="text-[10px] text-[#5C5347] font-mono">
                  COA Timetables vs Multi-Dept Block Requests (00:00 → 08:00)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-[#8B8073] font-mono">
                <span className="w-2 h-2 rounded-full bg-[#166534] animate-pulse"></span>
                <span>CURRENT TIME: 02:53</span>
              </div>
            </div>

            {/* Gantt Chart Matrix */}
            <div className="relative bg-[#F5F0E8] border border-[#D9D0C0] p-4 overflow-x-auto">
              {/* Time scale header */}
              <div className="grid grid-cols-8 border-b border-[#C4BAA8] pb-2 mb-4 text-[9px] text-[#8B8073] font-mono font-bold text-center">
                {timelineHours.map(hour => (
                  <div key={hour} className="border-l border-[#C4BAA8]">{hour}</div>
                ))}
              </div>

              {/* Current time red line */}
              <div
                className="absolute top-8 bottom-2 w-[2px] bg-[#8B1A1A] z-20"
                style={{ left: '36.5%' }}
                title="Current Real-time: 02:53 IST"
              >
                <div className="absolute -top-3.5 -left-3 bg-[#8B1A1A] text-white text-[7px] font-mono font-bold px-1">
                  NOW
                </div>
              </div>

              {/* Row 1: Vande Bharat */}
              <div className="relative my-2 py-1.5 flex items-center border-b border-[#D9D0C0]">
                <div className="w-40 text-[9px] font-mono font-bold text-[#1E3A5F] shrink-0 truncate">VB-20901 (SUPERFAST)</div>
                <div className="flex-1 relative h-5 bg-white border border-[#D9D0C0]">
                  <div className="absolute top-0 bottom-0 bg-[#DBEAFE] border border-[#1E3A5F] text-[7px] text-[#1E3A5F] font-mono font-bold flex items-center justify-center px-1"
                    style={{ left: '30%', width: '10%' }}>TRAIN PATH</div>
                </div>
              </div>

              {/* Row 2: Rajdhani */}
              <div className="relative my-2 py-1.5 flex items-center border-b border-[#D9D0C0]">
                <div className="w-40 text-[9px] font-mono font-bold text-[#1E3A5F] shrink-0 truncate">RAJ-12951 (SUPERFAST)</div>
                <div className="flex-1 relative h-5 bg-white border border-[#D9D0C0]">
                  <div className="absolute top-0 bottom-0 bg-[#DBEAFE] border border-[#1E40AF] text-[7px] text-[#1E40AF] font-mono font-bold flex items-center justify-center px-1"
                    style={{ left: '38%', width: '10%' }}>TRAIN PATH</div>
                </div>
              </div>

              {/* Row 3: BOXN Freight */}
              <div className="relative my-2 py-1.5 flex items-center border-b border-[#D9D0C0]">
                <div className="w-40 text-[9px] font-mono font-bold text-[#92400E] shrink-0 truncate">BOXN-88201 (COAL)</div>
                <div className="flex-1 relative h-5 bg-white border border-[#D9D0C0]">
                  <div className="absolute top-0 bottom-0 bg-[#FFFBEB] border border-[#92400E] text-[7px] text-[#92400E] font-mono font-bold flex items-center justify-center px-1"
                    style={{ left: '15%', width: '22%' }}>FREIGHT PATH</div>
                </div>
              </div>

              {/* Row 4: Civil Possession */}
              <div className="relative my-2 py-1.5 flex items-center border-b border-[#D9D0C0]">
                <div className="w-40 text-[9px] font-mono text-[#5C5347] shrink-0 flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#166534]"></span> Civil Track Tamping
                </div>
                <div className="flex-1 relative h-5 bg-white border border-[#D9D0C0]">
                  <div className="absolute top-0 bottom-0 bg-[#F0FDF4] border border-[#166534] text-[7px] text-[#166534] font-mono font-bold flex items-center justify-center"
                    style={{ left: '18.7%', width: '37.5%' }}>REQ: 01:30–04:30 (3h)</div>
                </div>
              </div>

              {/* Row 5: OHE Request */}
              <div className="relative my-2 py-1.5 flex items-center border-b border-[#D9D0C0]">
                <div className="w-40 text-[9px] font-mono text-[#5C5347] shrink-0 flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#92400E]"></span> OHE Jumper Repair
                </div>
                <div className="flex-1 relative h-5 bg-white border border-[#D9D0C0]">
                  <div className="absolute top-0 bottom-0 bg-[#FFFBEB] border border-[#92400E] text-[7px] text-[#92400E] font-mono font-bold flex items-center justify-center"
                    style={{ left: '37.5%', width: '25%' }}>REQ: 03:00–05:00 (2h)</div>
                </div>
              </div>

              {/* Row 6: AI Shadow Block */}
              <div className="relative my-2 py-2 flex items-center bg-[#FEF2F2] border border-[#8B1A1A]/60 p-1">
                <div className="w-40 text-[9px] font-mono font-bold text-[#8B1A1A] shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#8B1A1A]" />
                  <span>AI SHADOW WINDOW</span>
                </div>
                <div className="flex-1 relative h-7 bg-[#FAF7F2] border border-[#8B1A1A]/60">
                  <div
                    className="absolute top-0 bottom-0 bg-[#8B1A1A]/20 border-2 border-[#8B1A1A] text-[8px] text-[#8B1A1A] font-mono font-extrabold flex items-center justify-center"
                    style={{ left: '25%', width: '18.75%' }}
                    title="AI Shadow Window: 02:00 to 03:30 (90 min)"
                  >
                    ★ OPTIMAL: 02:00–03:30 (90 MIN)
                  </div>
                </div>
              </div>
            </div>

            {/* Gantt Legend */}
            <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-[#8B8073]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#DBEAFE] border border-[#1E3A5F]"></span>Superfast Path</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#FFFBEB] border border-[#92400E]"></span>Goods Path</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#8B1A1A]/20 border border-[#8B1A1A]"></span>AI Clustered Slot</span>
              </div>
              <span className="text-[#166534] font-bold">ZERO PASSENGER TRAIN DELAYS</span>
            </div>
          </div>

          {/* AI Recommended Block Cards & Approval Flow */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase text-[#1A1208] flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#8B1A1A]" />
                AI Recommended Possession Actions (Controller Approval Queue)
              </span>
              <span className="text-[9px] text-[#8B8073] font-mono">Human-in-the-Loop Decision Matrix</span>
            </div>

            {blocks.map(block => (
              <div
                key={block.id}
                className="bg-white border border-[#C4BAA8] p-4 space-y-3 hover:border-[#8B1A1A]/40 transition-colors"
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EDE7DA] pb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={block.status} />
                    <span className="font-mono font-bold text-[11px] text-[#8B1A1A]">{block.blockCode}</span>
                    <span className="font-mono text-[11px] text-[#1A1208] font-medium">{block.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-[#8B8073]">CONFIDENCE:</span>
                    <strong className="text-[#166534]">{block.aiConfidenceScore}%</strong>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono bg-[#F5F0E8] p-3 border border-[#D9D0C0]">
                  <div>
                    <span className="text-[9px] text-[#8B8073] uppercase font-bold block">SECTION & TRACK:</span>
                    <strong className="text-[#1A1208]">{block.section} ({block.track} LINE)</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8B8073] uppercase font-bold block">OPTIMAL WINDOW:</span>
                    <strong className="text-[#8B1A1A]">{block.aiOptimalStartTime} – {block.aiOptimalEndTime} ({block.durationMinutes} min)</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8B8073] uppercase font-bold block">DEPARTMENTS:</span>
                    <strong className="text-[#1E3A5F]">{block.departmentsInvolved.join(' + ')}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8B8073] uppercase font-bold block">TRAIN IMPACT:</span>
                    <strong className="text-[#166534]">{block.affectedTrainCount} Affected ({block.predictedDelayMinutes} min delay)</strong>
                  </div>
                </div>

                {/* AI Rationale */}
                <p className="text-[10px] font-mono text-[#5C5347] bg-[#EFF6FF] p-2.5 border-l-2 border-[#1E3A5F]">
                  <span className="text-[#1E3A5F] font-bold">AI Decision Synthesis: </span>
                  {block.aiExplanation}
                </p>

                {/* Controller Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="text-[10px] text-[#8B8073] font-mono">
                    {block.status === 'APPROVED' ? (
                      <span className="text-[#166534] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved by {block.approvalHistory.approvedBy} at {block.approvalHistory.approvedAt}
                      </span>
                    ) : block.status === 'REJECTED' ? (
                      <span className="text-[#7F1D1D] font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Block Request Rejected
                      </span>
                    ) : (
                      <span>Requires Operations Controller final endorsement</span>
                    )}
                  </div>

                  {block.status !== 'APPROVED' && block.status !== 'REJECTED' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingBlock(block);
                          setEditStartTime(block.aiOptimalStartTime);
                          setEditEndTime(block.aiOptimalEndTime);
                        }}
                        className="px-3 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1E3A5F] text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>MODIFY WINDOW</span>
                      </button>

                      <button
                        onClick={() => handleRejectBlock(block.id)}
                        className="px-3 py-1.5 bg-white hover:bg-[#FEF2F2] border border-[#7F1D1D]/40 text-[#7F1D1D] text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>REJECT</span>
                      </button>

                      {onNavigateToOverview && (
                        <button
                          onClick={onNavigateToOverview}
                          className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F7F4EE] border border-[#D8D1C5] text-[#1A1815] text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Train className="w-3.5 h-3.5" />
                          <span>CANVAS</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleApproveBlock(block.id)}
                        className="px-4 py-1.5 bg-[#166534] hover:bg-[#14532D] text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>APPROVE BLOCK</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modify Window Modal */}
      {editingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1208]/80 backdrop-blur-sm select-none font-mono">
          <div className="bg-[#FAF7F2] border-2 border-[#8B1A1A] p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#EDE7DA] pb-2">
              <span className="font-mono font-bold text-[11px] text-[#8B1A1A]">EDIT POSSESSION WINDOW</span>
              <span className="text-[10px] text-[#8B8073] font-mono">{editingBlock.blockCode}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-mono font-bold text-[#5C5347] uppercase tracking-wider mb-1">START TIME</label>
                <input
                  type="text"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  className="w-full bg-white border border-[#C4BAA8] px-3 py-2 text-[#1A1208] font-mono font-bold outline-none focus:border-[#8B1A1A] text-sm"
                  placeholder="HH:MM"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-[#5C5347] uppercase tracking-wider mb-1">END TIME</label>
                <input
                  type="text"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  className="w-full bg-white border border-[#C4BAA8] px-3 py-2 text-[#1A1208] font-mono font-bold outline-none focus:border-[#8B1A1A] text-sm"
                  placeholder="HH:MM"
                />
              </div>

              <div className="p-2.5 bg-[#FFFBEB] border border-[#92400E]/40 text-[10px] text-[#92400E] font-mono">
                Note: Shifting window beyond 03:30 will trigger 18 min detention on incoming Vande Bharat 20901.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EDE7DA]">
              <button
                onClick={() => setEditingBlock(null)}
                className="px-3 py-1.5 bg-[#EDE7DA] hover:bg-[#D9D0C0] text-[#1A1208] text-[10px] font-mono font-bold cursor-pointer transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 bg-[#1E3A5F] hover:bg-[#1E40AF] text-white text-[10px] font-mono font-bold uppercase cursor-pointer transition-colors"
              >
                CONFIRM OVERRIDE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
