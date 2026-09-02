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
    <div className="space-y-4 select-none">

      {/* ── Active Operational Command Ribbon ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#FFFFFF] border border-[#1A1815] p-3 sm:px-4 rounded-[2px] shadow-sm gap-3">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#15803D] animate-pulse shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-sm text-[#1A1815]">
                Western Railway Main Corridor
              </span>
              <span className="text-[10px] font-mono text-[#615A4F] bg-[#F7F4EE] border border-[#D8D1C5] px-1.5 py-0.2 rounded-[2px]">
                KM 100 – 160 · 25kV AC
              </span>
            </div>
            <p className="text-[11px] text-[#615A4F] font-sans">
              Active Kinematic Simulation & Signal-Reactive Headway Control
            </p>
          </div>
        </div>

        {/* Action Controls & Multi-Horizon Optimizer Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRunOptimization}
            className="btn-pen-primary text-[11px] font-mono uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run AI Optimizer</span>
          </button>
          <button
            onClick={() => onNavigate('map')}
            className="btn-pen-secondary text-[11px] font-mono"
          >
            <Train className="w-3.5 h-3.5 text-[#1A1815]" />
            <span>Full Map</span>
          </button>
        </div>
      </div>

      {/* ── THE LIVING RAILWAY CANVAS CONTAINER ── */}
      <div className="bg-[#FFFFFF] border border-[#1A1815] rounded-[2px] shadow-sm overflow-hidden relative">

        {/* Canvas Toolbar & Department Focus Filter */}
        <div className="p-2.5 sm:px-4 border-b border-[#D8D1C5] bg-[#F7F4EE] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#1A1815]">
              Living Railway Canvas
            </span>
            <span className="hidden md:inline text-[10px] text-[#615A4F] font-sans">
              (Click signals to toggle RED/YELLOW/GREEN; click trains to inspect kinematics)
            </span>
          </div>

          {/* Department Focus Pills */}
          <div className="flex items-center gap-1 bg-[#FFFFFF] p-0.5 border border-[#D8D1C5] rounded-[2px]">
            <span className="text-[9.5px] font-mono font-semibold text-[#615A4F] px-1.5 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#1A1815]" /> FOCUS:
            </span>
            {[
              { label: 'ALL', value: 'ALL' },
              { label: 'CIVIL TRACK', value: 'TRACK' },
              { label: 'OHE TRACTION', value: 'OHE' },
              { label: 'SIGNALS', value: 'SNT' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setDepartmentFilter(f.value as any)}
                className={`px-2 py-0.5 text-[9.5px] font-mono font-bold rounded-[1px] transition-colors cursor-pointer ${
                  departmentFilter === f.value
                    ? 'bg-[#1A1815] text-[#FFFFFF]'
                    : 'text-[#615A4F] hover:bg-[#F7F4EE]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* The Living Railway Vector Canvas */}
        <div className="p-2 sm:p-4 bg-[#F7F4EE]">
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

        {/* ── CONTEXTUAL SPATIAL INSPECTOR DRAWER ── */}
        {hasInspectorOpen && (
          <div className="absolute top-11 right-2 bottom-2 w-80 sm:w-96 bg-[#FFFFFF] border border-[#1A1815] shadow-2xl p-4 z-30 flex flex-col justify-between overflow-y-auto rounded-[2px] animate-slide-in">
            <div>
              <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-2 mb-3">
                <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#1A1815] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#1A1815]" />
                  {selectedTrain ? 'Locomotive Kinematics Inspector'
                    : selectedSignal ? 'Signal Aspect Inspector'
                    : selectedTrack ? 'Track Geometry Inspector'
                    : selectedBlock ? 'Task Block Inspector'
                    : 'Asset Condition Inspector'}
                </span>
                <button
                  onClick={closeDrawer}
                  className="p-1 hover:bg-[#F7F4EE] border border-[#D8D1C5] rounded-[2px] text-[#615A4F] hover:text-[#1A1815] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 1. Train Inspector with Real-Time Kinematics */}
              {selectedTrain && (
                <div className="space-y-3 font-sans text-xs">
                  <div className="p-2.5 bg-[#F7F4EE] border border-[#D8D1C5] rounded-[2px]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#1A1815]">{selectedTrain.trainNumber} · {selectedTrain.trainName}</span>
                      <span className="text-[9px] bg-[#FFFFFF] border border-[#D8D1C5] px-1.5 py-0.5 rounded-[1px] font-mono font-bold">
                        PRIORITY {selectedTrain.priority}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#615A4F] font-mono mt-1">{selectedTrain.origin} → {selectedTrain.destination}</div>
                  </div>

                  {/* Real-Time Speedometer & Dynamics */}
                  <div className="p-3 bg-[#FFFFFF] border border-[#1A1815] rounded-[2px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[10px] text-[#615A4F] uppercase flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-[#1A1815]" /> LIVE VELOCITY
                      </span>
                      <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded-[1px] border ${
                        selectedTrainPhysics?.accelState === 'BRAKING' ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
                        : selectedTrainPhysics?.accelState === 'ACCELERATING' ? 'bg-[#EFF6FF] text-[#1E3A5F] border-[#BFDBFE]'
                        : selectedTrainPhysics?.accelState === 'STOPPED' ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                        : 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                      }`}>
                        {selectedTrainPhysics?.accelState || 'CRUISING'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-3xl font-mono font-black text-[#1A1815]">
                        {selectedTrainPhysics ? Math.round(selectedTrainPhysics.speedKmH) : selectedTrain.speedKmH}
                        <span className="text-xs font-normal text-[#615A4F] ml-1">km/h</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#615A4F]">
                        Target: {selectedTrainPhysics ? Math.round(selectedTrainPhysics.targetSpeedKmH) : 130} km/h
                      </span>
                    </div>

                    {/* Dynamic Velocity Bar */}
                    <div className="w-full bg-[#EDE7DC] h-1.5 mt-2 rounded-[1px] overflow-hidden">
                      <div
                        className="h-full bg-[#1A1815] transition-all duration-100"
                        style={{ width: `${Math.min(100, ((selectedTrainPhysics?.speedKmH || selectedTrain.speedKmH) / 130) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-[#F7F4EE] rounded-[2px]">
                      <span className="text-[#615A4F] font-mono block">Current KM:</span>
                      <span className="font-mono font-bold text-[#1A1815]">
                        KM {selectedTrainPhysics ? selectedTrainPhysics.currentKm.toFixed(2) : selectedTrain.currentKm.toFixed(1)}
                      </span>
                    </div>
                    <div className="p-2 bg-[#F7F4EE] rounded-[2px]">
                      <span className="text-[#615A4F] font-mono block">Loco Unit:</span>
                      <span className="font-mono font-bold text-[#1A1815]">WAP-7 #{selectedTrain.locoNumber}</span>
                    </div>
                    <div className="p-2 bg-[#F7F4EE] rounded-[2px]">
                      <span className="text-[#615A4F] font-mono block">Signal Ahead:</span>
                      <span className={`font-mono font-bold ${
                        selectedTrainPhysics?.nextSignalAspect === 'RED' ? 'text-[#B91C1C]'
                        : selectedTrainPhysics?.nextSignalAspect === 'YELLOW' ? 'text-[#B45309]'
                        : 'text-[#15803D]'
                      }`}>
                        {selectedTrainPhysics?.nextSignalAspect || 'GREEN'} ({selectedTrainPhysics ? selectedTrainPhysics.nextSignalDistanceKm.toFixed(1) : '3.2'} km)
                      </span>
                    </div>
                    <div className="p-2 bg-[#F7F4EE] rounded-[2px]">
                      <span className="text-[#615A4F] font-mono block">Wheel Rotation:</span>
                      <span className="font-mono font-bold text-[#1A1815]">
                        {selectedTrainPhysics ? Math.round((selectedTrainPhysics.speedKmH / 3.6 / 3.43) * 60) : 180} RPM
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[2px] text-[10.5px]">
                    <span className="text-[#15803D] font-mono font-bold">KAVACH AUTOMATIC PROTECTION: </span>
                    <span className="text-[#15803D]">Continuous Speed Supervision active. Target braking distance computed in real-time.</span>
                  </div>

                  <button
                    onClick={() => onNavigate('trains')}
                    className="w-full btn-pen-primary py-2 text-[11px] font-mono uppercase"
                  >
                    Manage in Train Operations (COA)
                  </button>
                </div>
              )}

              {/* 2. Signal Inspector */}
              {selectedSignal && (
                <div className="space-y-3 font-sans text-xs">
                  <div className="p-2.5 bg-[#F7F4EE] border border-[#D8D1C5] rounded-[2px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#1A1815]">{selectedSignal.id}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-[2px] border ${
                        selectedSignal.aspect === 'GREEN' ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                        : selectedSignal.aspect === 'YELLOW' ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                        : 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
                      }`}>
                        {selectedSignal.aspect} ASPECT
                      </span>
                    </div>
                    <div className="text-[11px] text-[#615A4F] font-mono mt-1">Location: KM {selectedSignal.km}.0 ({selectedSignal.track} Mainline)</div>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="p-2 bg-[#F7F4EE] rounded-[2px]">
                      <span className="text-[#615A4F] font-mono block">Interlocking Logic:</span>
                      <span className="font-mono font-semibold text-[#1A1815]">{selectedSignal.interlockingRule}</span>
                    </div>
                    <div className="p-2 bg-[#F7F4EE] rounded-[2px]">
                      <span className="text-[#615A4F] font-mono block">Track Circuit Telemetry:</span>
                      <span className="font-mono font-semibold text-[#15803D]">{selectedSignal.trackCircuit} (Normal)</span>
                    </div>
                    <div className="p-2 bg-[#F7F4EE] rounded-[2px]">
                      <span className="text-[#615A4F] font-mono block">Headway Clearance:</span>
                      <span className="font-mono font-semibold text-[#1A1815]">Clear up to KM {selectedSignal.nextClearanceKm}.0</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#615A4F] font-mono italic">
                    Tip: Click the signal mast on the canvas to cycle through GREEN → YELLOW → RED aspects.
                  </p>

                  <button
                    onClick={() => onNavigate('dept-snt')}
                    className="w-full btn-pen-primary py-2 text-[11px] font-mono uppercase"
                  >
                    Open S&T Interlocking (SMMS)
                  </button>
                </div>
              )}

              {/* 3. Track Section Inspector */}
              {selectedTrack && (
                <div className="space-y-3 font-sans text-xs">
                  <div className="p-2.5 bg-[#F7F4EE] border border-[#D8D1C5] rounded-[2px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#1A1815]">{selectedTrack.sectionId}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-[2px] border ${
                        selectedTrack.tgiScore < 70 ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]' : 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                      }`}>
                        TGI: {selectedTrack.tgiScore}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#615A4F] font-mono mt-1">KM {selectedTrack.kmStart}.0 to KM {selectedTrack.kmEnd}.0 ({selectedTrack.track} Line)</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-[#F7F4EE] rounded-[2px]">
                      <span className="text-[#615A4F] font-mono block">Rail Specification:</span>
                      <span className="font-mono font-bold text-[#1A1815]">{selectedTrack.railType}</span>
                    </div>
                    <div className="p-2 bg-[#F7F4EE] rounded-[2px]">
                      <span className="text-[#615A4F] font-mono block">OMS Peak Acceleration:</span>
                      <span className={`font-mono font-bold ${selectedTrack.omsPeakG > 0.2 ? 'text-[#B91C1C]' : 'text-[#15803D]'}`}>
                        {selectedTrack.omsPeakG}g
                      </span>
                    </div>
                    <div className="p-2 bg-[#F7F4EE] rounded-[2px]">
                      <span className="text-[#615A4F] font-mono block">Speed Restriction:</span>
                      <span className="font-mono font-bold text-[#1A1815]">{selectedTrack.speedLimitKmph} km/h PSR</span>
                    </div>
                    <div className="p-2 bg-[#F7F4EE] rounded-[2px]">
                      <span className="text-[#615A4F] font-mono block">Possession State:</span>
                      <span className={`font-mono font-bold ${selectedTrack.activeWork ? 'text-[#B45309]' : 'text-[#15803D]'}`}>
                        {selectedTrack.activeWork ? 'Tamping Active' : 'Clear Line'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('dept-track')}
                    className="w-full btn-pen-primary py-2 text-[11px] font-mono uppercase"
                  >
                    Open Civil TMS Profile
                  </button>
                </div>
              )}

              {/* 4. Task Block Inspector */}
              {selectedBlock && (
                <div className="space-y-3 font-sans text-xs">
                  <div className="p-2.5 bg-[#F7F4EE] border border-[#D8D1C5] rounded-[2px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#1A1815]">{selectedBlock.blockCode}</span>
                      <StatusBadge status={selectedBlock.status} />
                    </div>
                    <div className="text-[11px] text-[#615A4F] font-mono mt-1">{selectedBlock.department} · {selectedBlock.title}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-[#F7F4EE] rounded-[2px]">
                      <span className="text-[#615A4F] font-mono block">Section Range:</span>
                      <span className="font-mono font-bold text-[#1A1815]">{selectedBlock.kmStart} to {selectedBlock.kmEnd}</span>
                    </div>
                    <div className="p-2 bg-[#F7F4EE] rounded-[2px]">
                      <span className="text-[#615A4F] font-mono block">Granted Window:</span>
                      <span className="font-mono font-bold text-[#1A1815]">{selectedBlock.durationMinutes} min</span>
                    </div>
                    <div className="p-2 bg-[#F7F4EE] rounded-[2px]">
                      <span className="text-[#615A4F] font-mono block">Time Schedule:</span>
                      <span className="font-mono font-bold text-[#1A1815]">{selectedBlock.requestedStartTime} - {selectedBlock.requestedEndTime}</span>
                    </div>
                    <div className="p-2 bg-[#F7F4EE] rounded-[2px]">
                      <span className="text-[#615A4F] font-mono block">Shadow Clubbing:</span>
                      <span className="font-mono font-bold text-[#15803D]">
                        {selectedBlock.isShadowClubbed ? 'Clubbed with OHE' : 'Dedicated Window'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('planner')}
                    className="w-full btn-pen-primary py-2 text-[11px] font-mono uppercase"
                  >
                    Open in AI Block Planner
                  </button>
                </div>
              )}

              {/* 5. Asset Inspector */}
              {selectedAssetItem && (
                <div className="space-y-3 font-sans text-xs">
                  <div className="p-2.5 bg-[#F7F4EE] border border-[#D8D1C5] rounded-[2px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#1A1815]">{selectedAssetItem.code}</span>
                      <StatusBadge status={selectedAssetItem.status} />
                    </div>
                    <div className="text-[11px] text-[#615A4F] font-mono mt-1">{selectedAssetItem.department} · {selectedAssetItem.name}</div>
                  </div>

                  <div className="p-2 bg-[#F7F4EE] rounded-[2px] text-[11px]">
                    <span className="text-[#615A4F] font-mono block">Failure Risk / RUL:</span>
                    <span className="font-mono font-bold text-[#1A1815]">{selectedAssetItem.conditionScore}/100 Condition (Est Failure: {selectedAssetItem.predictedFailureDays} days)</span>
                  </div>

                  <div className="p-2 bg-[#F7F4EE] rounded-[2px] text-[11px]">
                    <span className="text-[#615A4F] font-mono block">AI Diagnosis:</span>
                    <p className="text-[#1A1815] mt-0.5">{selectedAssetItem.xaiReasoning}</p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectAsset?.(selectedAssetItem);
                      onNavigate('assets');
                    }}
                    className="w-full btn-pen-primary py-2 text-[11px] font-mono uppercase"
                  >
                    Inspect in Asset Intelligence
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Operational Quick Summary Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {[
          { label: 'Asset Fleet', val: '12,482', sub: '98.4% OPR', tab: 'assets' as NavTab, icon: Layers },
          { label: 'Critical Flaws', val: String(criticalAssets.length), sub: '2 Blocks Req', tab: 'assets' as NavTab, icon: AlertTriangle, color: '#B91C1C' },
          { label: 'Active Blocks', val: String(activeBlocks.length), sub: '1 Shadow Clubbed', tab: 'planner' as NavTab, icon: CalendarClock },
          { label: 'Trains in Transit', val: String(trains.length), sub: '96.8% Punctual', tab: 'trains' as NavTab, icon: Train },
          { label: 'Conflicts', val: String(conflicts.length), sub: 'Auto-Resolving', tab: 'conflicts' as NavTab, icon: AlertTriangle, color: '#B45309' },
          { label: 'Throughput ROI', val: '+3.5h', sub: 'Corridor Window Saved', tab: 'insights' as NavTab, icon: TrendingUp, color: '#15803D' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(kpi.tab)}
              className="p-3 bg-[#FFFFFF] border border-[#D8D1C5] hover:border-[#1A1815] rounded-[2px] transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#615A4F] uppercase">
                <span>{kpi.label}</span>
                <Icon className="w-3.5 h-3.5" style={{ color: kpi.color || '#1A1815' }} />
              </div>
              <div className="text-xl font-bold text-[#1A1815] mt-1.5" style={{ color: kpi.color || '#1A1815' }}>
                {kpi.val}
              </div>
              <div className="text-[9.5px] font-mono text-[#615A4F] mt-0.5">{kpi.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
