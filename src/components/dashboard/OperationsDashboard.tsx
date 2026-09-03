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
    <div className="space-y-3 select-none">

      {/* ── Compact Operational Heading & Focus Strip ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#0D263D] border border-[#29455D] px-3.5 py-2.5 rounded-[4px] shadow-panel gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#46A06A] animate-pulse shrink-0" />
          <div className="flex items-baseline gap-2">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '14px', color: '#F7FAFC' }}>
              LIVE NETWORK
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#71879A' }}>
              Western Corridor · KM 100–160 · 25kV AC
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Department Focus Pills */}
          <div className="flex items-center gap-1 bg-[#071A2B] p-0.5 border border-[#29455D] rounded-[3px]">
            <span className="text-[9px] font-mono font-semibold text-[#71879A] px-1.5 flex items-center gap-1">
              <Filter className="w-2.5 h-2.5 text-[#79B8E6]" /> FOCUS:
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
                    ? 'bg-[#123551] text-[#79B8E6] border border-[#3B82C4]'
                    : 'text-[#71879A] hover:text-[#F7FAFC]'
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
            <Sparkles className="w-3 h-3 text-[#F7FAFC]" />
            <span>AI Optimizer</span>
          </button>
        </div>
      </div>

      {/* ── THE HERO LIVING RAILWAY CANVAS CONTAINER ── */}
      <div className="bg-[#0D263D] border border-[#29455D] rounded-[4px] shadow-panel overflow-hidden relative">

        {/* The Living Railway Vector Canvas */}
        <div className="p-1.5 sm:p-2 bg-[#0D263D]">
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
          <div className="absolute top-12 right-2 bottom-2 w-80 sm:w-88 bg-[#0D263D] border border-[#29455D] shadow-panel-lift p-3.5 z-30 flex flex-col justify-between overflow-y-auto rounded-[4px] animate-slide-in">
            <div>
              <div className="flex items-center justify-between border-b border-[#1E384F] pb-2 mb-2.5">
                <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#F7FAFC] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#79B8E6]" />
                  {selectedTrain ? 'Train Kinematics'
                    : selectedSignal ? 'Signal Aspect'
                    : selectedTrack ? 'Track Geometry'
                    : selectedBlock ? 'Task Block'
                    : 'Asset Condition'}
                </span>
                <button
                  onClick={closeDrawer}
                  className="p-1 hover:bg-[#123551] border border-[#29455D] rounded-[3px] text-[#A9BBCB] hover:text-[#F7FAFC] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 1. Train Inspector */}
              {selectedTrain && (
                <div className="space-y-2.5 font-sans text-xs">
                  <div className="p-2 bg-[#071A2B] border border-[#1E384F] rounded-[3px]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#F7FAFC]">{selectedTrain.trainNumber} · {selectedTrain.trainName}</span>
                      <span className="text-[9px] bg-[#123551] border border-[#3B82C4] text-[#79B8E6] px-1.5 py-0.2 rounded-[2px] font-mono font-bold">
                        P{selectedTrain.priority}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-[#71879A] font-mono mt-0.5">{selectedTrain.origin} → {selectedTrain.destination}</div>
                  </div>

                  {/* Real-Time Speedometer */}
                  <div className="p-2.5 bg-[#071A2B] border border-[#29455D] rounded-[3px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[9.5px] text-[#71879A] uppercase flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-[#79B8E6]" /> LIVE VELOCITY
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-[2px] border ${
                        selectedTrainPhysics?.accelState === 'BRAKING' ? 'bg-[rgba(212,85,85,0.15)] text-[#D45555] border-[rgba(212,85,85,0.4)]'
                        : selectedTrainPhysics?.accelState === 'ACCELERATING' ? 'bg-[rgba(59,130,196,0.15)] text-[#79B8E6] border-[rgba(59,130,196,0.4)]'
                        : selectedTrainPhysics?.accelState === 'STOPPED' ? 'bg-[rgba(215,166,58,0.15)] text-[#D7A63A] border-[rgba(215,166,58,0.4)]'
                        : 'bg-[rgba(70,160,106,0.15)] text-[#46A06A] border-[rgba(70,160,106,0.4)]'
                      }`}>
                        {selectedTrainPhysics?.accelState || 'CRUISING'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1.5">
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '26px', fontWeight: 700, color: '#F7FAFC' }}>
                        {selectedTrainPhysics ? Math.round(selectedTrainPhysics.speedKmH) : selectedTrain.speedKmH}
                        <span className="text-xs font-normal text-[#71879A] ml-1">km/h</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#71879A]">
                        Target: {selectedTrainPhysics ? Math.round(selectedTrainPhysics.targetSpeedKmH) : 130} km/h
                      </span>
                    </div>

                    <div className="w-full bg-[#123551] h-1.5 mt-1.5 rounded-[1px] overflow-hidden">
                      <div
                        className="h-full bg-[#3B82C4] transition-all duration-100"
                        style={{ width: `${Math.min(100, ((selectedTrainPhysics?.speedKmH || selectedTrain.speedKmH) / 130) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                    <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F]">
                      <span className="text-[#71879A] font-mono block">Location:</span>
                      <span className="font-mono font-bold text-[#F7FAFC]">
                        KM {selectedTrainPhysics ? selectedTrainPhysics.currentKm.toFixed(2) : selectedTrain.currentKm.toFixed(1)}
                      </span>
                    </div>
                    <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F]">
                      <span className="text-[#71879A] font-mono block">Loco Unit:</span>
                      <span className="font-mono font-bold text-[#F7FAFC]">WAP-7 #{selectedTrain.locoNumber}</span>
                    </div>
                    <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F]">
                      <span className="text-[#71879A] font-mono block">Next Signal:</span>
                      <span className={`font-mono font-bold ${
                        selectedTrainPhysics?.nextSignalAspect === 'RED' ? 'text-[#D45555]'
                        : selectedTrainPhysics?.nextSignalAspect === 'YELLOW' ? 'text-[#D7A63A]'
                        : 'text-[#46A06A]'
                      }`}>
                        {selectedTrainPhysics?.nextSignalAspect || 'GREEN'} ({selectedTrainPhysics ? selectedTrainPhysics.nextSignalDistanceKm.toFixed(1) : '3.2'} km)
                      </span>
                    </div>
                    <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F]">
                      <span className="text-[#71879A] font-mono block">Wheel Speed:</span>
                      <span className="font-mono font-bold text-[#F7FAFC]">
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
                  <div className="p-2 bg-[#071A2B] border border-[#1E384F] rounded-[3px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#F7FAFC]">{selectedSignal.id}</span>
                      <span className={`px-2 py-0.5 text-[9.5px] font-mono font-bold rounded-[2px] border ${
                        selectedSignal.aspect === 'GREEN' ? 'bg-[rgba(70,160,106,0.15)] text-[#46A06A] border-[rgba(70,160,106,0.4)]'
                        : selectedSignal.aspect === 'YELLOW' ? 'bg-[rgba(215,166,58,0.15)] text-[#D7A63A] border-[rgba(215,166,58,0.4)]'
                        : 'bg-[rgba(212,85,85,0.15)] text-[#D45555] border-[rgba(212,85,85,0.4)]'
                      }`}>
                        {selectedSignal.aspect}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-[#71879A] font-mono mt-0.5">KM {selectedSignal.km}.0 ({selectedSignal.track} Mainline)</div>
                  </div>

                  <div className="space-y-1 text-[10.5px]">
                    <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F]">
                      <span className="text-[#71879A] font-mono block">Interlocking Rule:</span>
                      <span className="font-mono font-semibold text-[#F7FAFC]">{selectedSignal.interlockingRule}</span>
                    </div>
                    <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F]">
                      <span className="text-[#71879A] font-mono block">Track Circuit:</span>
                      <span className="font-mono font-semibold text-[#46A06A]">{selectedSignal.trackCircuit} (Normal)</span>
                    </div>
                    <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F]">
                      <span className="text-[#71879A] font-mono block">Clearance Ahead:</span>
                      <span className="font-mono font-semibold text-[#F7FAFC]">Clear to KM {selectedSignal.nextClearanceKm}.0</span>
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
                  <div className="p-2 bg-[#071A2B] border border-[#1E384F] rounded-[3px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#F7FAFC]">{selectedTrack.sectionId}</span>
                      <span className={`px-2 py-0.5 text-[9.5px] font-mono font-bold rounded-[2px] border ${
                        selectedTrack.tgiScore < 70 ? 'bg-[rgba(212,85,85,0.15)] text-[#D45555] border-[rgba(212,85,85,0.4)]' : 'bg-[rgba(70,160,106,0.15)] text-[#46A06A] border-[rgba(70,160,106,0.4)]'
                      }`}>
                        TGI: {selectedTrack.tgiScore}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-[#71879A] font-mono mt-0.5">KM {selectedTrack.kmStart}.0 to KM {selectedTrack.kmEnd}.0 ({selectedTrack.track})</div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                    <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F]">
                      <span className="text-[#71879A] font-mono block">Rail Type:</span>
                      <span className="font-mono font-bold text-[#F7FAFC]">{selectedTrack.railType}</span>
                    </div>
                    <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F]">
                      <span className="text-[#71879A] font-mono block">Peak G:</span>
                      <span className={`font-mono font-bold ${selectedTrack.omsPeakG > 0.2 ? 'text-[#D45555]' : 'text-[#46A06A]'}`}>
                        {selectedTrack.omsPeakG}g
                      </span>
                    </div>
                    <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F]">
                      <span className="text-[#71879A] font-mono block">Speed Limit:</span>
                      <span className="font-mono font-bold text-[#F7FAFC]">{selectedTrack.speedLimitKmph} km/h</span>
                    </div>
                    <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F]">
                      <span className="text-[#71879A] font-mono block">Possession:</span>
                      <span className={`font-mono font-bold ${selectedTrack.activeWork ? 'text-[#D7A63A]' : 'text-[#46A06A]'}`}>
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
                  <div className="p-2 bg-[#071A2B] border border-[#1E384F] rounded-[3px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#F7FAFC]">{selectedBlock.blockCode}</span>
                      <StatusBadge status={selectedBlock.status} />
                    </div>
                    <div className="text-[10.5px] text-[#71879A] font-mono mt-0.5">{selectedBlock.department} · {selectedBlock.title}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                    <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F]">
                      <span className="text-[#71879A] font-mono block">Section:</span>
                      <span className="font-mono font-bold text-[#F7FAFC]">{selectedBlock.kmStart} to {selectedBlock.kmEnd}</span>
                    </div>
                    <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F]">
                      <span className="text-[#71879A] font-mono block">Duration:</span>
                      <span className="font-mono font-bold text-[#F7FAFC]">{selectedBlock.durationMinutes} min</span>
                    </div>
                    <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F]">
                      <span className="text-[#71879A] font-mono block">Window:</span>
                      <span className="font-mono font-bold text-[#F7FAFC]">{selectedBlock.requestedStartTime} - {selectedBlock.requestedEndTime}</span>
                    </div>
                    <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F]">
                      <span className="text-[#71879A] font-mono block">Shadow Club:</span>
                      <span className="font-mono font-bold text-[#46A06A]">
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
                  <div className="p-2 bg-[#071A2B] border border-[#1E384F] rounded-[3px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#F7FAFC]">{selectedAssetItem.code}</span>
                      <StatusBadge status={selectedAssetItem.status} />
                    </div>
                    <div className="text-[10.5px] text-[#71879A] font-mono mt-0.5">{selectedAssetItem.department} · {selectedAssetItem.name}</div>
                  </div>

                  <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F] text-[10.5px]">
                    <span className="text-[#71879A] font-mono block">Condition & RUL:</span>
                    <span className="font-mono font-bold text-[#F7FAFC]">{selectedAssetItem.conditionScore}/100 Condition (Est: {selectedAssetItem.predictedFailureDays} days)</span>
                  </div>

                  <div className="p-1.5 bg-[#071A2B] rounded-[2px] border border-[#1E384F] text-[10.5px]">
                    <span className="text-[#71879A] font-mono block">AI Diagnosis:</span>
                    <p className="text-[#A9BBCB] mt-0.5">{selectedAssetItem.xaiReasoning}</p>
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

      {/* ── Compact Operational Status Strip (Replaces bulky card grid) ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-2 bg-[#0D263D] border border-[#29455D] rounded-[4px] text-[11px] font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#79B8E6]" onClick={() => onNavigate('trains')}>
            <span className="text-[#71879A]">TRAINS:</span>
            <span className="font-bold text-[#F7FAFC]">{trains.length}</span>
            <span className="text-[9.5px] text-[#46A06A]">(96.8% ON TIME)</span>
          </div>
          <span className="text-[#1E384F]">|</span>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#79B8E6]" onClick={() => onNavigate('planner')}>
            <span className="text-[#71879A]">BLOCKS:</span>
            <span className="font-bold text-[#F7FAFC]">{activeBlocks.length}</span>
            <span className="text-[9.5px] text-[#79B8E6]">(1 SHADOW)</span>
          </div>
          <span className="text-[#1E384F]">|</span>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#79B8E6]" onClick={() => onNavigate('assets')}>
            <span className="text-[#71879A]">CRITICAL FLAWS:</span>
            <span className="font-bold text-[#D45555]">{criticalAssets.length}</span>
          </div>
          <span className="text-[#1E384F]">|</span>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#79B8E6]" onClick={() => onNavigate('conflicts')}>
            <span className="text-[#71879A]">CONFLICTS:</span>
            <span className="font-bold text-[#D7A63A]">{conflicts.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-[#71879A]">
          <span>EFFICIENCY:</span>
          <span className="text-[#46A06A] font-bold">98.4%</span>
          <span>·</span>
          <span>WINDOW SAVED:</span>
          <span className="text-[#79B8E6] font-bold">+3.5h</span>
        </div>
      </div>
    </div>
  );
};
