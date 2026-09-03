import React, { useState } from 'react';
import { FixedAsset, MaintenanceBlock, TrainEntity, BlockConflict, DepartmentType } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { RailwaySceneCanvas, SignalInfo, TrackSectionInfo, LiveTrainPhysics } from '../railway/RailwaySceneCanvas';
import {
  Activity,
  Layers,
  CalendarClock,
  Train,
  Zap,
  Radio,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  X,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Eye,
  ShieldCheck,
  Gauge,
  RotateCw,
} from 'lucide-react';
import { NavTab } from '../common/Sidebar';

interface OperationsDashboardProps {
  assets: FixedAsset[];
  blocks: MaintenanceBlock[];
  trains: TrainEntity[];
  conflicts: BlockConflict[];
  onNavigate: (tab: NavTab) => void;
  onSelectAsset?: (asset: FixedAsset) => void;
  onRunOptimization: () => void;
  externalDemoTrigger?: number;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  assets,
  blocks,
  trains,
  conflicts,
  onNavigate,
  onSelectAsset,
  onRunOptimization,
  externalDemoTrigger,
}) => {
  const [selectedTrain, setSelectedTrain] = useState<TrainEntity | null>(null);
  const [selectedTrainPhysics, setSelectedTrainPhysics] = useState<LiveTrainPhysics | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<MaintenanceBlock | null>(null);
  const [selectedAssetItem, setSelectedAssetItem] = useState<FixedAsset | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<SignalInfo | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<TrackSectionInfo | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<'ALL' | DepartmentType>('ALL');

  const criticalAssets  = assets.filter(a => a.status === 'CRITICAL' || a.status === 'WARNING');
  const activeBlocks    = blocks.filter(b => b.status === 'ACTIVE' || b.status === 'APPROVED');
  const pendingAiBlocks = blocks.filter(b => b.status === 'AI_RECOMMENDED' || b.status === 'REQUESTED');

  const handleSelectTrain = (t: TrainEntity, phys?: LiveTrainPhysics) => {
    setSelectedTrain(t);
    setSelectedTrainPhysics(phys || null);
    setSelectedBlock(null);
    setSelectedAssetItem(null);
    setSelectedSignal(null);
    setSelectedTrack(null);
  };

  const handleSelectBlock = (b: MaintenanceBlock) => {
    setSelectedBlock(b);
    setSelectedTrain(null);
    setSelectedTrainPhysics(null);
    setSelectedAssetItem(null);
    setSelectedSignal(null);
    setSelectedTrack(null);
  };

  const handleSelectAsset = (a: FixedAsset) => {
    setSelectedAssetItem(a);
    setSelectedTrain(null);
    setSelectedTrainPhysics(null);
    setSelectedBlock(null);
    setSelectedSignal(null);
    setSelectedTrack(null);
    onSelectAsset?.(a);
  };

  const handleSelectSignal = (s: SignalInfo) => {
    setSelectedSignal(s);
    setSelectedTrain(null);
    setSelectedTrainPhysics(null);
    setSelectedBlock(null);
    setSelectedAssetItem(null);
    setSelectedTrack(null);
  };

  const handleSelectTrack = (tr: TrackSectionInfo) => {
    setSelectedTrack(tr);
    setSelectedTrain(null);
    setSelectedTrainPhysics(null);
    setSelectedBlock(null);
    setSelectedAssetItem(null);
    setSelectedSignal(null);
  };

  const closeDrawer = () => {
    setSelectedTrain(null);
    setSelectedTrainPhysics(null);
    setSelectedBlock(null);
    setSelectedAssetItem(null);
    setSelectedSignal(null);
    setSelectedTrack(null);
  };

  const hasInspectorOpen = Boolean(selectedTrain || selectedBlock || selectedAssetItem || selectedSignal || selectedTrack);

  return (
    <div className="space-y-3 select-none font-sans">

      {/* ── Compact Operational Heading & Focus Strip ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#FFFFFF] border border-[#E2E8F0] px-3.5 py-2.5 rounded-[4px] shadow-panel gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse shrink-0" />
          <div className="flex items-baseline gap-2">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '14.5px', color: '#0F172A' }}>
              LIVE NETWORK
            </span>
            <span className="text-[11px] text-[#64748B]">
              Western Corridor · KM 100–160 · 25kV AC
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Department Focus Pills */}
          <div className="flex items-center gap-1 bg-[#F8FAFC] p-0.5 border border-[#E2E8F0] rounded-[3px]">
            <span className="text-[9px] font-mono font-semibold text-[#64748B] px-1.5 flex items-center gap-1">
              <Filter className="w-2.5 h-2.5 text-[#0F172A]" /> FOCUS:
            </span>
            {[
              { label: 'ALL', value: 'ALL' },
              { label: 'CIVIL', value: 'TRACK' },
              { label: 'OHE', value: 'OHE' },
              { label: 'SIGNALS', value: 'SNT' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setDepartmentFilter(f.value as any)}
                className={`px-2 py-0.5 text-[9.5px] font-mono font-bold rounded-[2px] transition-colors cursor-pointer ${
                  departmentFilter === f.value
                    ? 'bg-[#0F172A] text-[#FFFFFF]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={onRunOptimization}
            className="btn-pen-primary text-[11px] py-1 px-2.5"
          >
            <Sparkles className="w-3 h-3 text-[#FFFFFF]" />
            <span>AI Optimizer</span>
          </button>
        </div>
      </div>

      {/* ── THE HERO LIVING RAILWAY CANVAS CONTAINER ── */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[4px] shadow-panel overflow-hidden relative">

        {/* The Living Railway Vector Canvas */}
        <div className="p-1 sm:p-1.5 bg-[#FFFFFF]">
          <RailwaySceneCanvas
            trains={trains}
            blocks={blocks}
            assets={assets}
            onSelectTrain={handleSelectTrain}
            onSelectBlock={handleSelectBlock}
            onSelectAsset={handleSelectAsset}
            onSelectSignal={handleSelectSignal}
            onSelectTrack={handleSelectTrack}
            departmentFilter={departmentFilter}
            compact={false}
            externalDemoTrigger={externalDemoTrigger}
          />
        </div>

        {/* ── COMPACT CONTEXTUAL SPATIAL INSPECTOR DRAWER ── */}
        {hasInspectorOpen && (
          <div className="absolute top-12 right-2 bottom-2 w-80 sm:w-88 bg-[#FFFFFF] border border-[#CBD5E1] shadow-panel-lift p-3.5 z-30 flex flex-col justify-between overflow-y-auto rounded-[4px] animate-slide-in">
            <div>
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2 mb-2.5">
                <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
                  {selectedTrain ? 'Train Kinematics'
                    : selectedSignal ? 'Signal Aspect'
                    : selectedTrack ? 'Track Geometry'
                    : selectedBlock ? 'Task Block'
                    : 'Asset Condition'}
                </span>
                <button
                  onClick={closeDrawer}
                  className="p-1 hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-[3px] text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 1. Train Inspector */}
              {selectedTrain && (
                <div className="space-y-2.5 font-sans text-xs">
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[3px]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#0F172A]">{selectedTrain.trainNumber} · {selectedTrain.trainName}</span>
                      <span className="text-[9px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] px-1.5 py-0.2 rounded-[2px] font-mono font-bold">
                        P{selectedTrain.priority}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-[#64748B] font-mono mt-0.5">{selectedTrain.origin} → {selectedTrain.destination}</div>
                  </div>

                  {/* Real-Time Speedometer */}
                  <div className="p-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[3px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[9.5px] text-[#64748B] uppercase flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-[#0F172A]" /> LIVE VELOCITY
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-[2px] border ${
                        selectedTrainPhysics?.accelState === 'BRAKING' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                        : selectedTrainPhysics?.accelState === 'ACCELERATING' ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                        : selectedTrainPhysics?.accelState === 'STOPPED' ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                        : 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                      }`}>
                        {selectedTrainPhysics?.accelState || 'CRUISING'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1.5">
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '26px', fontWeight: 700, color: '#0F172A' }}>
                        {selectedTrainPhysics ? Math.round(selectedTrainPhysics.speedKmH) : selectedTrain.speedKmH}
                        <span className="text-xs font-normal text-[#64748B] ml-1">km/h</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        Target: {selectedTrainPhysics ? Math.round(selectedTrainPhysics.targetSpeedKmH) : 130} km/h
                      </span>
                    </div>

                    <div className="w-full bg-[#F1F5F9] h-1.5 mt-1.5 rounded-[1px] overflow-hidden">
                      <div
                        className="h-full bg-[#0F172A] transition-all duration-100"
                        style={{ width: `${Math.min(100, ((selectedTrainPhysics?.speedKmH || selectedTrain.speedKmH) / 130) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                    <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-mono block">Location:</span>
                      <span className="font-mono font-bold text-[#0F172A]">
                        KM {selectedTrainPhysics ? selectedTrainPhysics.currentKm.toFixed(2) : selectedTrain.currentKm.toFixed(1)}
                      </span>
                    </div>
                    <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-mono block">Loco Unit:</span>
                      <span className="font-mono font-bold text-[#0F172A]">WAP-7 #{selectedTrain.locoNumber}</span>
                    </div>
                    <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-mono block">Next Signal:</span>
                      <span className={`font-mono font-bold ${
                        selectedTrainPhysics?.nextSignalAspect === 'RED' ? 'text-[#DC2626]'
                        : selectedTrainPhysics?.nextSignalAspect === 'YELLOW' ? 'text-[#D97706]'
                        : 'text-[#16A34A]'
                      }`}>
                        {selectedTrainPhysics?.nextSignalAspect || 'GREEN'} ({selectedTrainPhysics ? selectedTrainPhysics.nextSignalDistanceKm.toFixed(1) : '3.2'} km)
                      </span>
                    </div>
                    <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-mono block">Wheel Speed:</span>
                      <span className="font-mono font-bold text-[#0F172A]">
                        {selectedTrainPhysics ? Math.round((selectedTrainPhysics.speedKmH / 3.6 / 3.43) * 60) : 180} RPM
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('trains')}
                    className="w-full btn-pen-secondary py-1.5 text-[11px]"
                  >
                    Open Train Operations (COA)
                  </button>
                </div>
              )}

              {/* 2. Signal Inspector */}
              {selectedSignal && (
                <div className="space-y-2.5 font-sans text-xs">
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[3px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#0F172A]">{selectedSignal.id}</span>
                      <span className={`px-2 py-0.5 text-[9.5px] font-mono font-bold rounded-[2px] border ${
                        selectedSignal.aspect === 'GREEN' ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                        : selectedSignal.aspect === 'YELLOW' ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                        : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                      }`}>
                        {selectedSignal.aspect}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-[#64748B] font-mono mt-0.5">KM {selectedSignal.km}.0 ({selectedSignal.track} Mainline)</div>
                  </div>

                  <div className="space-y-1 text-[10.5px]">
                    <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-mono block">Interlocking Rule:</span>
                      <span className="font-mono font-semibold text-[#0F172A]">{selectedSignal.interlockingRule}</span>
                    </div>
                    <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-mono block">Track Circuit:</span>
                      <span className="font-mono font-semibold text-[#16A34A]">{selectedSignal.trackCircuit} (Normal)</span>
                    </div>
                    <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-mono block">Clearance Ahead:</span>
                      <span className="font-mono font-semibold text-[#0F172A]">Clear to KM {selectedSignal.nextClearanceKm}.0</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('dept-snt')}
                    className="w-full btn-pen-secondary py-1.5 text-[11px]"
                  >
                    Open S&T SMMS
                  </button>
                </div>
              )}

              {/* 3. Track Section Inspector */}
              {selectedTrack && (
                <div className="space-y-2.5 font-sans text-xs">
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[3px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#0F172A]">{selectedTrack.sectionId}</span>
                      <span className={`px-2 py-0.5 text-[9.5px] font-mono font-bold rounded-[2px] border ${
                        selectedTrack.tgiScore < 70 ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' : 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                      }`}>
                        TGI: {selectedTrack.tgiScore}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-[#64748B] font-mono mt-0.5">KM {selectedTrack.kmStart}.0 to KM {selectedTrack.kmEnd}.0 ({selectedTrack.track})</div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                    <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-mono block">Rail Type:</span>
                      <span className="font-mono font-bold text-[#0F172A]">{selectedTrack.railType}</span>
                    </div>
                    <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-mono block">Peak G:</span>
                      <span className={`font-mono font-bold ${selectedTrack.omsPeakG > 0.2 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                        {selectedTrack.omsPeakG}g
                      </span>
                    </div>
                    <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-mono block">Speed Limit:</span>
                      <span className="font-mono font-bold text-[#0F172A]">{selectedTrack.speedLimitKmph} km/h</span>
                    </div>
                    <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-mono block">Possession:</span>
                      <span className={`font-mono font-bold ${selectedTrack.activeWork ? 'text-[#D97706]' : 'text-[#16A34A]'}`}>
                        {selectedTrack.activeWork ? 'Active Work' : 'Clear Line'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('dept-track')}
                    className="w-full btn-pen-secondary py-1.5 text-[11px]"
                  >
                    Open Civil TMS
                  </button>
                </div>
              )}

              {/* 4. Task Block Inspector */}
              {selectedBlock && (
                <div className="space-y-2.5 font-sans text-xs">
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[3px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#0F172A]">{selectedBlock.blockCode}</span>
                      <StatusBadge status={selectedBlock.status} />
                    </div>
                    <div className="text-[10.5px] text-[#64748B] font-mono mt-0.5">{selectedBlock.department} · {selectedBlock.title}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                    <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-mono block">Section:</span>
                      <span className="font-mono font-bold text-[#0F172A]">{selectedBlock.kmStart} to {selectedBlock.kmEnd}</span>
                    </div>
                    <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-mono block">Duration:</span>
                      <span className="font-mono font-bold text-[#0F172A]">{selectedBlock.durationMinutes} min</span>
                    </div>
                    <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-mono block">Window:</span>
                      <span className="font-mono font-bold text-[#0F172A]">{selectedBlock.requestedStartTime} - {selectedBlock.requestedEndTime}</span>
                    </div>
                    <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-mono block">Shadow Club:</span>
                      <span className="font-mono font-bold text-[#16A34A]">
                        {selectedBlock.isShadowClubbed ? 'Clubbed with OHE' : 'Dedicated'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('planner')}
                    className="w-full btn-pen-secondary py-1.5 text-[11px]"
                  >
                    Open in Block Planner
                  </button>
                </div>
              )}

              {/* 5. Asset Inspector */}
              {selectedAssetItem && (
                <div className="space-y-2.5 font-sans text-xs">
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[3px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#0F172A]">{selectedAssetItem.code}</span>
                      <StatusBadge status={selectedAssetItem.status} />
                    </div>
                    <div className="text-[10.5px] text-[#64748B] font-mono mt-0.5">{selectedAssetItem.department} · {selectedAssetItem.name}</div>
                  </div>

                  <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0] text-[10.5px]">
                    <span className="text-[#64748B] font-mono block">Condition & RUL:</span>
                    <span className="font-mono font-bold text-[#0F172A]">{selectedAssetItem.conditionScore}/100 Condition (Est: {selectedAssetItem.predictedFailureDays} days)</span>
                  </div>

                  <div className="p-1.5 bg-[#F8FAFC] rounded-[2px] border border-[#E2E8F0] text-[10.5px]">
                    <span className="text-[#64748B] font-mono block">AI Diagnosis:</span>
                    <p className="text-[#334155] mt-0.5">{selectedAssetItem.xaiReasoning}</p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectAsset?.(selectedAssetItem);
                      onNavigate('assets');
                    }}
                    className="w-full btn-pen-secondary py-1.5 text-[11px]"
                  >
                    Inspect Asset
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Compact Operational Status Strip ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-3.5 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[4px] text-[11px] font-mono shadow-panel">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#2563EB]" onClick={() => onNavigate('trains')}>
            <span className="text-[#64748B]">TRAINS:</span>
            <span className="font-bold text-[#0F172A]">{trains.length}</span>
            <span className="text-[9.5px] text-[#16A34A]">(96.8% ON TIME)</span>
          </div>
          <span className="text-[#E2E8F0]">|</span>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#2563EB]" onClick={() => onNavigate('planner')}>
            <span className="text-[#64748B]">BLOCKS:</span>
            <span className="font-bold text-[#0F172A]">{activeBlocks.length}</span>
            <span className="text-[9.5px] text-[#2563EB]">(1 SHADOW)</span>
          </div>
          <span className="text-[#E2E8F0]">|</span>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#2563EB]" onClick={() => onNavigate('assets')}>
            <span className="text-[#64748B]">CRITICAL FLAWS:</span>
            <span className="font-bold text-[#DC2626]">{criticalAssets.length}</span>
          </div>
          <span className="text-[#E2E8F0]">|</span>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#2563EB]" onClick={() => onNavigate('conflicts')}>
            <span className="text-[#64748B]">CONFLICTS:</span>
            <span className="font-bold text-[#D97706]">{conflicts.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-[#64748B]">
          <span>EFFICIENCY:</span>
          <span className="text-[#16A34A] font-bold">98.4%</span>
          <span>·</span>
          <span>WINDOW SAVED:</span>
          <span className="text-[#2563EB] font-bold">+3.5h</span>
        </div>
      </div>
    </div>
  );
};
