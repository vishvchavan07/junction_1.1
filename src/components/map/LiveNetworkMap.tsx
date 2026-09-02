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

  // Train movement simulation loop — logic unchanged
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

  // Filtered scene data driven by layer toggles
  const visibleTrains  = showTrains      ? trains  : [];
  const visibleAssets  = showAssets      ? assets  : [];
  const visibleBlocks  = showPossessions ? blocks  : [];

  const LayerBtn = ({
    active, onClick, children,
  }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
        active
          ? 'bg-[#1A1208] text-[#FAF7F2] border-[#1A1208]'
          : 'bg-white text-[#5C5347] border-[#C4BAA8] hover:bg-[#EDE7DA]'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-4 select-none font-mono">

      {/* ── Top header & controls ───────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-[#F5F0E8] border border-[#C4BAA8] p-3.5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg text-[#1A1208]">
              Live Network Schematic & Telemetry
            </span>
            <span className="bg-[#EDE7DA] text-[#5C5347] text-[10px] font-mono px-2 py-0.5 border border-[#C4BAA8] font-bold">
              Western Corridor · KM 100.0 – 160.0
            </span>
          </div>
          <p className="text-[11px] text-[#5C5347]">
            Real-time track occupancy, automatic block signalling aspects, and multi-department possessions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Play / Pause / Reset */}
          <div className="flex items-center border border-[#C4BAA8] bg-white overflow-hidden">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-2.5 py-1.5 font-mono text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                isPlaying ? 'bg-[#1A1208] text-[#FAF7F2]' : 'text-[#1A1208] hover:bg-[#EDE7DA]'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Live Sim' : 'Paused'}</span>
            </button>
            <button
              onClick={() => setTrains(initialTrains)}
              className="px-2 py-1.5 text-[#8B8073] hover:text-[#1A1208] hover:bg-[#EDE7DA] border-l border-[#C4BAA8] cursor-pointer"
              title="Reset Train Positions"
            >
              <RotateCcw className="w-3.5 h-3.5" />
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
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

        {/* ── Left 9-cols: Illustrated schematic ─────────── */}
        <div className="xl:col-span-9 bg-white border border-[#C4BAA8] overflow-hidden flex flex-col">
          {/* HUD top bar */}
          <div className="flex items-center justify-between border-b border-[#D9D0C0] px-4 py-2 text-[10px] font-mono text-[#8B8073]">
            <div className="flex items-center gap-4">
              <span className="text-[#8B1A1A] font-bold">GRID: WR-BCT-BRC-MAIN</span>
              <span>AUTO SIGNALLING: 1.0 KM HEADWAY</span>
              <span>25kV AC TRACTION: ENERGIZED</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#166534] animate-pulse" />
              <span className="text-[#166534] font-bold">COA SYNCED</span>
            </div>
          </div>

          {/* The illustrated SVG railway scene */}
          <div className="flex-1 min-h-[420px]">
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
          <div className="border-t border-[#D9D0C0] px-4 py-2.5 flex flex-wrap items-center justify-between text-[9px] font-mono text-[#8B8073] gap-3">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#1A1208]">LEGEND:</span>
              {[
                { color: '#166534', label: 'Healthy Asset' },
                { color: '#92400E', label: 'Warning'       },
                { color: '#7F1D1D', label: 'Critical'      },
              ].map(l => (
                <span key={l.label} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 inline-block" style={{ backgroundColor: l.color }} />
                  {l.label}
                </span>
              ))}
              <span className="flex items-center gap-1">
                <span className="inline-block w-5 h-2" style={{
                  background: 'repeating-linear-gradient(45deg,#92400E33 0,#92400E33 4px,transparent 4px,transparent 8px)',
                  border: '1px solid #92400E60',
                }} />
                Block Possession
              </span>
            </div>
            <span className="text-[#8B1A1A] font-bold">CLICK ANY ASSET / TRAIN TO INSPECT TELEMETRY</span>
          </div>
        </div>

        {/* ── Right 3-cols: Inspector ─────────────────────── */}
        <div className="xl:col-span-3 bg-[#F5F0E8] border border-[#C4BAA8] flex flex-col">
          <div className="flex items-center justify-between border-b border-[#C4BAA8] px-3 py-2.5">
            <span className="text-[11px] font-mono font-bold text-[#8B1A1A] uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4" /> Entity Inspector
            </span>
            <span className="text-[9px] bg-[#EDE7DA] text-[#8B8073] font-mono font-bold px-1.5 py-0.5 border border-[#C4BAA8]">
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
                      <div className="p-2.5 bg-white border border-[#D9D0C0]">
                        <div className="text-[9px] text-[#8B8073] font-mono font-bold">TRAIN COA DATA</div>
                        <div className="text-sm font-mono font-bold text-[#1E3A5F] mt-0.5">{t.trainNumber}</div>
                        <div className="text-[10px] text-[#5C5347] font-mono mt-0.5 leading-snug">{t.trainName}</div>
                      </div>
                      <div className="space-y-1 text-[10px] font-mono bg-white p-2.5 border border-[#D9D0C0]">
                        {[
                          ['Current KM',     `KM ${t.currentKm}`,  '#1E3A5F'],
                          ['Speed',          `${t.speedKmH} km/h`, '#1A1208'],
                          ['Assigned Track', `${t.assignedTrack} MAIN`, '#1E3A5F'],
                          ['Delay',          `${t.delayMinutes} min`, t.delayMinutes > 0 ? '#92400E' : '#166534'],
                          ['Rake',           t.rakeCapacity,        '#1A1208'],
                        ].map(([k, v, c]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <span className="text-[#8B8073]">{k}:</span>
                            <span className="font-bold truncate" style={{ color: c as string }}>{v as string}</span>
                          </div>
                        ))}
                      </div>
                      {t.diverted && (
                        <div className="p-2 bg-[#FFFBEB] border border-[#92400E]/40 text-[10px] font-mono text-[#92400E]">
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
                      <div className="p-2.5 bg-white border border-[#D9D0C0]">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-[11px] text-[#1A1208]">{a.code}</span>
                          <StatusBadge status={a.status} />
                        </div>
                        <div className="text-[10px] text-[#5C5347] font-mono mt-0.5">{a.name}</div>
                      </div>
                      <div className="space-y-1 text-[10px] font-mono bg-white p-2.5 border border-[#D9D0C0]">
                        {[
                          ['Department',        a.department,                         '#1E3A5F'],
                          ['Location',          `${a.section} (${a.kmMarker})`,       '#1A1208'],
                          ['Condition Score',   `${a.conditionScore} / 100`,          '#166534'],
                          ['Failure Risk',      `${a.failureRiskProbability}%`,       '#7F1D1D'],
                          ['Block Required',    a.blockRequired ? 'YES' : 'NO',       a.blockRequired ? '#92400E' : '#166534'],
                        ].map(([k, v, c]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <span className="text-[#8B8073]">{k}:</span>
                            <span className="font-bold" style={{ color: c as string }}>{v as string}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-2 bg-white border border-[#D9D0C0] text-[10px] font-mono">
                        <span className="text-[#8B1A1A] font-bold">XAI: </span>
                        <p className="text-[#5C5347] mt-0.5 leading-snug">{a.xaiReasoning}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* ── Block inspector ── */}
                {selectedEntity.type === 'BLOCK' && (() => {
                  const b = selectedEntity.data;
                  return (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-white border border-[#D9D0C0]">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-[11px] text-[#8B1A1A]">{b.blockCode}</span>
                          <StatusBadge status={b.status} />
                        </div>
                        <div className="text-[10px] text-[#1A1208] font-mono font-bold mt-1">{b.title}</div>
                      </div>
                      <div className="space-y-1 text-[10px] font-mono bg-white p-2.5 border border-[#D9D0C0]">
                        {[
                          ['Optimal Window',  `${b.aiOptimalStartTime} – ${b.aiOptimalEndTime}`, '#8B1A1A'],
                          ['Duration',        `${b.durationMinutes} min`,                        '#1A1208'],
                          ['Departments',     b.departmentsInvolved.join(' + '),                  '#1E3A5F'],
                          ['Affected Trains', `${b.affectedTrainCount} (${b.predictedDelayMinutes} min delay)`, '#166534'],
                        ].map(([k, v, c]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <span className="text-[#8B8073]">{k}:</span>
                            <span className="font-bold" style={{ color: c as string }}>{v as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#8B8073] space-y-2 p-4 border border-dashed border-[#C4BAA8]">
                <Compass className="w-8 h-8 opacity-40" />
                <p className="text-[11px] font-mono">No element selected.</p>
                <p className="text-[9px] font-mono text-[#C4BAA8]">
                  Click any train, turnout, possession block, or asset on the schematic to inspect full telemetry.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-[#C4BAA8] p-2.5">
            <div className="text-[9px] text-[#C4BAA8] font-mono text-center">
              Indian Railways Automatic Block System · High Density Corridor
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
