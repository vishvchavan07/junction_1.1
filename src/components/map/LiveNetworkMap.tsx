import React, { useState, useEffect } from 'react';
import { FixedAsset, TrainEntity, MaintenanceBlock } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { RailwaySceneCanvas } from '../railway/RailwaySceneCanvas';
import {
  Train,
  Layers,
  Eye,
  Zap,
  Radio,
  AlertTriangle,
  Info,
  Compass,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Sliders,
} from 'lucide-react';

interface LiveNetworkMapProps {
  assets: FixedAsset[];
  trains: TrainEntity[];
  blocks: MaintenanceBlock[];
  onSelectAsset: (asset: FixedAsset) => void;
  onSelectBlock: (block: MaintenanceBlock) => void;
}

export const LiveNetworkMap: React.FC<LiveNetworkMapProps> = ({
  assets,
  trains: initialTrains,
  blocks,
  onSelectAsset,
  onSelectBlock,
}) => {
  const [trains, setTrains] = useState<TrainEntity[]>(initialTrains);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'TRAIN' | 'ASSET' | 'BLOCK'; data: any } | null>(null);

  // Layer visibility
  const [showTrains,        setShowTrains]        = useState(true);
  const [showAssets,        setShowAssets]        = useState(true);
  const [showPossessions,   setShowPossessions]   = useState(true);
  const [showSignals,       setShowSignals]        = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTrains(prev =>
        prev.map(train => {
          const speedFactor = 0.05;
          let newKm = train.currentKm;
          if (train.assignedTrack === 'UP') {
            newKm += (train.speedKmH / 100) * speedFactor;
            if (newKm > 160) newKm = 100;
          } else {
            newKm -= (train.speedKmH / 100) * speedFactor;
            if (newKm < 100) newKm = 160;
          }
          return { ...train, currentKm: parseFloat(newKm.toFixed(2)) };
        })
      );
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const visibleTrains  = showTrains      ? trains  : [];
  const visibleAssets  = showAssets      ? assets  : [];
  const visibleBlocks  = showPossessions ? blocks  : [];

  const LayerBtn = ({
    active, onClick, children,
  }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-[10px] font-mono font-bold transition-colors cursor-pointer border rounded-[3px] ${
        active
          ? 'bg-[#123551] text-[#79B8E6] border-[#3B82C4]'
          : 'bg-[#071A2B] text-[#71879A] border-[#29455D] hover:text-[#F7FAFC]'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-3 select-none">

      {/* ── Top header & controls ───────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-[#0D263D] border border-[#29455D] p-3 rounded-[4px] shadow-panel gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 700, color: '#F7FAFC' }}>
              Live Network Schematic & Telemetry
            </span>
            <span className="bg-[#071A2B] text-[#79B8E6] text-[10px] font-mono px-2 py-0.5 border border-[#29455D] rounded-[2px] font-semibold">
              Western Corridor · KM 100–160
            </span>
          </div>
          <p className="text-[11px] text-[#71879A] mt-0.5">
            Real-time track occupancy · automatic block signalling aspects · multi-department possessions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Play / Pause / Reset */}
          <div className="flex items-center border border-[#29455D] bg-[#071A2B] rounded-[3px] overflow-hidden">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                isPlaying ? 'bg-[#123551] text-[#79B8E6]' : 'text-[#F7FAFC] hover:bg-[#0D263D]'
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? 'Live Sim' : 'Paused'}</span>
            </button>
            <button
              onClick={() => setTrains(initialTrains)}
              className="px-2 py-1 text-[#71879A] hover:text-[#F7FAFC] hover:bg-[#0D263D] border-l border-[#29455D] cursor-pointer"
              title="Reset Train Positions"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Layer toggles */}
          <div className="flex items-center gap-1">
            <LayerBtn active={showTrains}      onClick={() => setShowTrains(!showTrains)}>
              Trains ({trains.length})
            </LayerBtn>
            <LayerBtn active={showAssets}      onClick={() => setShowAssets(!showAssets)}>
              Assets ({assets.length})
            </LayerBtn>
            <LayerBtn active={showPossessions} onClick={() => setShowPossessions(!showPossessions)}>
              Blocks ({blocks.length})
            </LayerBtn>
            <LayerBtn active={showSignals}     onClick={() => setShowSignals(!showSignals)}>
              Signals
            </LayerBtn>
          </div>
        </div>
      </div>

      {/* ── Main canvas + inspector ─────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">

        {/* ── Left 9-cols: Illustrated schematic ─────────── */}
        <div className="xl:col-span-9 bg-[#0D263D] border border-[#29455D] rounded-[4px] shadow-panel overflow-hidden flex flex-col">
          {/* HUD top bar */}
          <div className="flex items-center justify-between border-b border-[#1E384F] px-3.5 py-1.5 text-[10px] font-mono text-[#71879A] bg-[#071A2B]">
            <div className="flex items-center gap-4">
              <span className="text-[#79B8E6] font-bold">GRID: WR-BCT-BRC-MAIN</span>
              <span>AUTO SIGNALLING: 1.0 KM HEADWAY</span>
              <span>25kV AC TRACTION: ENERGIZED</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#46A06A] animate-pulse" />
              <span className="text-[#46A06A] font-bold">COA SYNCED</span>
            </div>
          </div>

          {/* The illustrated SVG railway scene */}
          <div className="flex-1 p-1 bg-[#0D263D]">
            <RailwaySceneCanvas
              trains={visibleTrains}
              blocks={visibleBlocks}
              assets={visibleAssets}
              compact={false}
              onSelectTrain={train  => setSelectedEntity({ type: 'TRAIN', data: train })}
              onSelectBlock={block  => {
                setSelectedEntity({ type: 'BLOCK', data: block });
                onSelectBlock(block);
              }}
              onSelectAsset={asset  => {
                setSelectedEntity({ type: 'ASSET', data: asset });
                onSelectAsset(asset);
              }}
            />
          </div>

          {/* Bottom legend */}
          <div className="border-t border-[#1E384F] px-3.5 py-2 flex flex-wrap items-center justify-between text-[9px] font-mono text-[#71879A] gap-3 bg-[#071A2B]">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#F7FAFC]">LEGEND:</span>
              {[
                { color: '#46A06A', label: 'Healthy Asset' },
                { color: '#D7A63A', label: 'Warning'       },
                { color: '#D45555', label: 'Critical'      },
              ].map(l => (
                <span key={l.label} className="flex items-center gap-1">
                  <span className="w-2 h-2 inline-block rounded-[1px]" style={{ backgroundColor: l.color }} />
                  {l.label}
                </span>
              ))}
              <span className="flex items-center gap-1">
                <span className="inline-block w-4 h-2 rounded-[1px]" style={{
                  background: 'repeating-linear-gradient(45deg,rgba(215,166,58,0.3) 0,rgba(215,166,58,0.3) 3px,transparent 3px,transparent 6px)',
                  border: '1px solid rgba(215,166,58,0.5)',
                }} />
                Block Possession
              </span>
            </div>
            <span className="text-[#79B8E6] font-semibold">CLICK ANY ASSET / TRAIN TO INSPECT TELEMETRY</span>
          </div>
        </div>

        {/* ── Right 3-cols: Inspector ─────────────────────── */}
        <div className="xl:col-span-3 bg-[#0D263D] border border-[#29455D] rounded-[4px] shadow-panel flex flex-col">
          <div className="flex items-center justify-between border-b border-[#1E384F] px-3 py-2 bg-[#071A2B]">
            <span className="text-[11px] font-mono font-bold text-[#79B8E6] uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Entity Inspector
            </span>
            <span className="text-[9px] bg-[#123551] text-[#79B8E6] font-mono font-bold px-1.5 py-0.5 border border-[#3B82C4] rounded-[2px]">
              HUD
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {selectedEntity ? (
              <div className="space-y-2 text-xs">

                {/* ── Train inspector ── */}
                {selectedEntity.type === 'TRAIN' && (() => {
                  const t = selectedEntity.data;
                  return (
                    <div className="space-y-2">
                      <div className="p-2 bg-[#071A2B] border border-[#1E384F] rounded-[3px]">
                        <div className="text-[9px] text-[#71879A] font-mono font-bold">TRAIN COA DATA</div>
                        <div className="text-sm font-mono font-bold text-[#F7FAFC] mt-0.5">{t.trainNumber}</div>
                        <div className="text-[10px] text-[#A9BBCB] font-mono mt-0.5 leading-snug">{t.trainName}</div>
                      </div>
                      <div className="space-y-1 text-[10px] font-mono bg-[#071A2B] p-2 border border-[#1E384F] rounded-[3px]">
                        {[
                          ['Current KM',     `KM ${t.currentKm}`,  '#79B8E6'],
                          ['Speed',          `${t.speedKmH} km/h`, '#F7FAFC'],
                          ['Assigned Track', `${t.assignedTrack} MAIN`, '#79B8E6'],
                          ['Delay',          `${t.delayMinutes} min`, t.delayMinutes > 0 ? '#D7A63A' : '#46A06A'],
                          ['Rake',           t.rakeCapacity,        '#A9BBCB'],
                        ].map(([k, v, c]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <span className="text-[#71879A]">{k}:</span>
                            <span className="font-bold truncate" style={{ color: c as string }}>{v as string}</span>
                          </div>
                        ))}
                      </div>
                      {t.diverted && (
                        <div className="p-2 bg-[rgba(215,166,58,0.1)] border border-[rgba(215,166,58,0.35)] rounded-[3px] text-[10px] font-mono text-[#D7A63A]">
                          <span className="font-bold">DIVERSION ACTIVE: </span>{t.diversionRoute}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── Asset inspector ── */}
                {selectedEntity.type === 'ASSET' && (() => {
                  const a = selectedEntity.data;
                  return (
                    <div className="space-y-2">
                      <div className="p-2 bg-[#071A2B] border border-[#1E384F] rounded-[3px]">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-[11px] text-[#F7FAFC]">{a.code}</span>
                          <StatusBadge status={a.status} />
                        </div>
                        <div className="text-[10px] text-[#A9BBCB] font-mono mt-0.5">{a.name}</div>
                      </div>
                      <div className="space-y-1 text-[10px] font-mono bg-[#071A2B] p-2 border border-[#1E384F] rounded-[3px]">
                        {[
                          ['Department',        a.department,                         '#79B8E6'],
                          ['Location',          `${a.section} (${a.kmMarker})`,       '#F7FAFC'],
                          ['Condition Score',   `${a.conditionScore} / 100`,          '#46A06A'],
                          ['Failure Risk',      `${a.failureRiskProbability}%`,       '#D45555'],
                          ['Block Required',    a.blockRequired ? 'YES' : 'NO',       a.blockRequired ? '#D7A63A' : '#46A06A'],
                        ].map(([k, v, c]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <span className="text-[#71879A]">{k}:</span>
                            <span className="font-bold" style={{ color: c as string }}>{v as string}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-2 bg-[#071A2B] border border-[#1E384F] rounded-[3px] text-[10px] font-mono">
                        <span className="text-[#79B8E6] font-bold">XAI: </span>
                        <p className="text-[#A9BBCB] mt-0.5 leading-snug">{a.xaiReasoning}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* ── Block inspector ── */}
                {selectedEntity.type === 'BLOCK' && (() => {
                  const b = selectedEntity.data;
                  return (
                    <div className="space-y-2">
                      <div className="p-2 bg-[#071A2B] border border-[#1E384F] rounded-[3px]">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-[11px] text-[#79B8E6]">{b.blockCode}</span>
                          <StatusBadge status={b.status} />
                        </div>
                        <div className="text-[10px] text-[#F7FAFC] font-mono font-bold mt-1">{b.title}</div>
                      </div>
                      <div className="space-y-1 text-[10px] font-mono bg-[#071A2B] p-2 border border-[#1E384F] rounded-[3px]">
                        {[
                          ['Optimal Window',  `${b.aiOptimalStartTime} – ${b.aiOptimalEndTime}`, '#79B8E6'],
                          ['Duration',        `${b.durationMinutes} min`,                        '#F7FAFC'],
                          ['Departments',     b.departmentsInvolved.join(' + '),                  '#79B8E6'],
                          ['Affected Trains', `${b.affectedTrainCount} (${b.predictedDelayMinutes} min delay)`, '#46A06A'],
                        ].map(([k, v, c]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <span className="text-[#71879A]">{k}:</span>
                            <span className="font-bold" style={{ color: c as string }}>{v as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#71879A] space-y-2 p-4 border border-dashed border-[#29455D] rounded-[3px]">
                <Compass className="w-8 h-8 opacity-40 text-[#79B8E6]" />
                <p className="text-[11px] font-mono">No element selected</p>
                <p className="text-[9px] font-mono text-[#71879A]">
                  Click any train, turnout, possession block, or asset on the schematic to inspect full telemetry.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-[#1E384F] p-2 bg-[#071A2B] rounded-b-[4px]">
            <div className="text-[9px] text-[#71879A] font-mono text-center">
              Indian Railways Automatic Block System · High Density Corridor
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
