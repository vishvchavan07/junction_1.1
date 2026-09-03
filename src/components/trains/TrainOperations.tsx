import React, { useState, useEffect, useRef } from 'react';
import { TrainEntity } from '../../types';
import {
  Train,
  TrendingUp,
  Eye,
  Package,
  AlertTriangle,
  ArrowRight,
  Clock,
  Gauge,
  MapPin,
  User,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Activity,
  Radio,
} from 'lucide-react';

interface TrainOperationsProps {
  trains: TrainEntity[];
  onRerouteTrain?: (trainId: string) => void;
  onNavigateToOverview?: () => void;
}

const CORRIDOR_KM_START = 100;
const CORRIDOR_KM_END   = 160;

function getTrainTypeConfig(type: string) {
  if (type === 'VANDE_BHARAT')         return { label: 'Vande Bharat',  color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' };
  if (type === 'RAJDHANI_SUPERFAST')   return { label: 'Rajdhani',      color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' };
  if (type === 'MAIL_EXPRESS')         return { label: 'Mail Express',   color: '#0F172A', bg: '#F8FAFC', border: '#CBD5E1' };
  if (type === 'EMU_SUBURBAN')         return { label: 'Suburban EMU',  color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' };
  if (type.includes('BOXN'))           return { label: 'Coal Freight',   color: '#92400E', bg: '#FFFBEB', border: '#FDE68A' };
  if (type.includes('BTPN'))           return { label: 'POL Tanker',     color: '#B45309', bg: '#FFF7ED', border: '#FED7AA' };
  return                                        { label: type,            color: '#0F172A', bg: '#F8FAFC', border: '#E2E8F0' };
}

function getDelayColor(delay: number): string {
  if (delay === 0)  return '#16A34A';
  if (delay <= 5)   return '#D97706';
  if (delay <= 15)  return '#EA580C';
  return '#DC2626';
}

function getSpeedBarColor(type: string): string {
  if (type === 'VANDE_BHARAT')       return '#1D4ED8';
  if (type === 'RAJDHANI_SUPERFAST') return '#7C3AED';
  if (type.includes('BTPN') || type.includes('BOXN')) return '#92400E';
  return '#0F172A';
}

function getMaxSpeed(type: string): number {
  if (type === 'VANDE_BHARAT')       return 160;
  if (type === 'RAJDHANI_SUPERFAST') return 140;
  if (type === 'MAIL_EXPRESS')       return 120;
  if (type === 'EMU_SUBURBAN')       return 100;
  return 75;
}

// Animated speed number with live telemetry flicker
const AnimatedSpeed: React.FC<{ target: number }> = ({ target }) => {
  const [displayed, setDisplayed] = useState(target);

  useEffect(() => {
    if (target === 0) { setDisplayed(0); return; }
    const interval = setInterval(() => {
      setDisplayed(Math.max(0, Math.round(target + (Math.random() * 4 - 2))));
    }, 1200);
    return () => clearInterval(interval);
  }, [target]);

  return <>{displayed}</>;
};

// Corridor position minimap
const CorridorMinimap: React.FC<{ trains: TrainEntity[] }> = ({ trains }) => {
  const KM_RANGE = CORRIDOR_KM_END - CORRIDOR_KM_START;

  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[4px] p-3 shadow-panel">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9.5px] font-mono font-bold text-[#0F172A] uppercase flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-[#16A34A]" />
          Live Corridor Occupancy · KM 100 to 160 · Western Railway
        </span>
        <span className="text-[8.5px] text-[#64748B] font-mono">GPS / Axle Counter Feed</span>
      </div>

      <div className="relative h-14 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[3px] overflow-hidden px-2">
        {[100, 110, 120, 130, 140, 150, 160].map(km => (
          <div
            key={km}
            className="absolute top-0 bottom-0"
            style={{ left: `${((km - CORRIDOR_KM_START) / KM_RANGE) * 100}%` }}
          >
            <div className="w-px h-full bg-[#E2E8F0]" />
            <span
              className="absolute bottom-0.5 text-[7px] font-mono text-[#94A3B8]"
              style={{ transform: 'translateX(-50%)' }}
            >
              {km}
            </span>
          </div>
        ))}

        <span className="absolute top-1 left-1 text-[7px] font-mono font-bold text-[#64748B]">UP</span>
        <span className="absolute top-6 left-1 text-[7px] font-mono font-bold text-[#64748B]">DN</span>

        {trains.map(train => {
          const pct = ((train.currentKm - CORRIDOR_KM_START) / KM_RANGE) * 100;
          const isUp = train.assignedTrack === 'UP';
          const cfg = getTrainTypeConfig(train.trainType);
          const isStopped = train.speedKmH === 0;

          return (
            <div
              key={train.id}
              className="absolute flex flex-col items-center"
              style={{
                left: `${Math.max(2, Math.min(96, pct))}%`,
                top: isUp ? '4px' : '24px',
                transform: 'translateX(-50%)',
              }}
              title={`${train.trainNumber} · KM ${train.currentKm} · ${train.speedKmH} km/h`}
            >
              <div
                className="rounded-[1px] text-white flex items-center justify-center font-mono font-bold"
                style={{
                  width: 22, height: 10, fontSize: 6,
                  backgroundColor: isStopped ? '#D97706' : cfg.color,
                  boxShadow: `0 0 0 1.5px ${cfg.color}40`,
                }}
              >
                {train.trainNumber.replace('BOXN-', '').replace('BTPN-', '').replace('EMU-', '')}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
        {[
          { label: 'Superfast', color: '#1D4ED8' },
          { label: 'Express',   color: '#0F172A' },
          { label: 'Freight',   color: '#92400E' },
          { label: 'Stopped',   color: '#D97706' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-3 h-1.5 rounded-[1px]" style={{ backgroundColor: l.color }} />
            <span className="text-[8px] font-mono text-[#64748B]">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Individual train card
const TrainCard: React.FC<{
  train: TrainEntity;
  onToggleDiversion: (id: string) => void;
  onViewCanvas?: () => void;
}> = ({ train, onToggleDiversion, onViewCanvas }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = getTrainTypeConfig(train.trainType);
  const maxSpeed = getMaxSpeed(train.trainType);
  const speedPct = Math.min(100, (train.speedKmH / maxSpeed) * 100);
  const barColor = getSpeedBarColor(train.trainType);
  const isStopped = train.speedKmH === 0;
  const isFreight = train.trainType.includes('BOXN') || train.trainType.includes('BTPN') || train.trainType.includes('FREIGHT');

  return (
    <div
      className={`bg-[#FFFFFF] border rounded-[4px] transition-all duration-200 overflow-hidden ${
        train.diverted
          ? 'border-[#FDE68A]'
          : 'border-[#E2E8F0] hover:border-[#CBD5E1] shadow-panel'
      }`}
    >
      <div className="h-[3px]" style={{ backgroundColor: cfg.color }} />

      <div
        className="p-3 cursor-pointer flex flex-col sm:flex-row sm:items-center gap-3"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-mono font-bold text-[12px] px-1.5 py-0.5 rounded-[2px] border"
              style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
            >
              {train.trainNumber}
            </span>
            <span className="font-sans font-semibold text-[12.5px] text-[#0F172A] truncate">
              {train.trainName}
            </span>
            {train.diverted && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] rounded-[2px] flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" />
                DIVERTED
              </span>
            )}
            <span className="text-[8.5px] font-mono text-[#64748B] px-1 py-0.2 border border-[#E2E8F0] rounded-[2px] bg-[#F8FAFC]">
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] font-mono text-[#64748B]">
            <MapPin className="w-2.5 h-2.5 shrink-0" />
            <span>{train.currentSection} · KM {train.currentKm}</span>
            <span className="text-[#E2E8F0]">·</span>
            <span>{train.origin}</span>
            <ArrowRight className="w-2.5 h-2.5" />
            <span>{train.destination}</span>
          </div>
        </div>

        {/* Speed gauge */}
        <div className="shrink-0 w-36">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-[9px] font-mono text-[#64748B] uppercase">Speed</span>
            <span className="flex items-baseline gap-0.5">
              <span className="font-mono font-bold" style={{ fontSize: 18, color: isStopped ? '#D97706' : cfg.color }}>
                <AnimatedSpeed target={train.speedKmH} />
              </span>
              <span className="text-[9px] font-mono text-[#64748B]">km/h</span>
            </span>
          </div>
          <div className="w-full h-2 bg-[#F1F5F9] rounded-[1px] overflow-hidden border border-[#E2E8F0]">
            <div
              className="h-full rounded-[1px] transition-all duration-1000"
              style={{
                width: `${speedPct}%`,
                backgroundColor: isStopped ? '#D97706' : barColor,
                boxShadow: isStopped ? 'none' : `0 0 4px ${barColor}60`,
              }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[7px] font-mono text-[#94A3B8]">0</span>
            <span className="text-[7px] font-mono text-[#94A3B8]">{maxSpeed} max</span>
          </div>
        </div>

        {/* Delay + track + expand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center">
            <div className="text-[8.5px] font-mono text-[#64748B] mb-0.5">DELAY</div>
            <span
              className="font-mono font-bold text-[12px] px-2 py-0.5 rounded-[2px]"
              style={{
                color: getDelayColor(train.delayMinutes),
                backgroundColor: `${getDelayColor(train.delayMinutes)}15`,
                border: `1px solid ${getDelayColor(train.delayMinutes)}30`,
              }}
            >
              {train.delayMinutes === 0 ? 'ON TIME' : `+${train.delayMinutes}m`}
            </span>
          </div>

          <div className="text-center hidden sm:block">
            <div className="text-[8.5px] font-mono text-[#64748B] mb-0.5">TRACK</div>
            <span className="font-mono font-bold text-[11px] px-2 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[2px] text-[#0F172A]">
              {train.assignedTrack}
            </span>
          </div>

          <button
            className="p-1.5 border border-[#E2E8F0] rounded-[3px] hover:bg-[#F8FAFC] text-[#64748B] cursor-pointer transition-colors"
            onClick={e => { e.stopPropagation(); setExpanded(x => !x); }}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#F1F5F9] bg-[#F8FAFC] p-3 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
            {[
              { label: 'Loco Unit',   value: train.locoNumber    },
              { label: 'Rake Config', value: train.rakeCapacity  },
              { label: 'Sched. Dep.', value: train.scheduledTime },
              { label: 'Est. Arr.',   value: train.estimatedTime },
            ].map(d => (
              <div key={d.label} className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[3px] p-2">
                <span className="text-[9px] font-mono text-[#64748B] block">{d.label}:</span>
                <span className="font-mono font-semibold text-[#0F172A]">{d.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10.5px]">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[3px] p-2 flex items-center gap-2">
              <User className="w-3 h-3 text-[#64748B] shrink-0" />
              <div>
                <span className="text-[9px] font-mono text-[#64748B] block">DRIVER:</span>
                <span className="font-mono font-semibold text-[#0F172A]">{train.driverName}</span>
              </div>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[3px] p-2 flex items-center gap-2">
              <User className="w-3 h-3 text-[#64748B] shrink-0" />
              <div>
                <span className="text-[9px] font-mono text-[#64748B] block">GUARD:</span>
                <span className="font-mono font-semibold text-[#0F172A]">{train.guardName}</span>
              </div>
            </div>
          </div>

          {isFreight && train.goodsForecastTonnes && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[3px] p-2 flex items-center gap-2 text-[10.5px]">
              <Package className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
              <span className="font-mono text-[#92400E]">
                Freight Load: <strong>{train.goodsForecastTonnes.toLocaleString()} Tonnes</strong>
              </span>
            </div>
          )}

          {train.diverted && train.diversionRoute && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[3px] p-2 text-[10.5px] font-mono">
              <span className="text-[9px] font-bold text-[#B45309] block">DIVERSION ROUTE:</span>
              <span className="text-[#92400E]">{train.diversionRoute}</span>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="text-[#64748B]">PRIORITY: P{train.priority}</span>
              <span className="text-[#E2E8F0]">|</span>
              <span className="font-bold" style={{ color: isStopped ? '#D97706' : '#16A34A' }}>
                {isStopped ? 'STATIONARY' : 'MOVING'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onViewCanvas && (
                <button
                  onClick={onViewCanvas}
                  className="btn-pen-secondary px-2.5 py-1.5 text-[10.5px]"
                >
                  <Eye className="w-3 h-3" />
                  Canvas
                </button>
              )}
              <button
                onClick={() => onToggleDiversion(train.id)}
                className={`px-2.5 py-1.5 text-[10.5px] font-mono font-bold border rounded-[4px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                  train.diverted
                    ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309] hover:bg-[#FEF3C7]'
                    : 'bg-[#FFFFFF] border-[#CBD5E1] text-[#475569] hover:text-[#0F172A] hover:border-[#94A3B8]'
                }`}
              >
                <RotateCw className="w-3 h-3" />
                {train.diverted ? 'UNDO DIVERSION' : 'DIVERT VIA SLW'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const TrainOperations: React.FC<TrainOperationsProps> = ({
  trains: initialTrains,
  onRerouteTrain,
  onNavigateToOverview,
}) => {
  const [trains, setTrains] = useState<TrainEntity[]>(initialTrains);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'delay' | 'speed'>('priority');

  const handleToggleDiversion = (trainId: string) => {
    setTrains(prev =>
      prev.map(t => {
        if (t.id !== trainId) return t;
        return {
          ...t,
          diverted: !t.diverted,
          diversionRoute: !t.diverted
            ? 'Diverted via Down Line Bi-directional signalling (50 km/h PSR)'
            : undefined,
          delayMinutes: !t.diverted ? t.delayMinutes + 6 : Math.max(0, t.delayMinutes - 6),
        };
      })
    );
    if (onRerouteTrain) onRerouteTrain(trainId);
  };

  const filteredTrains = trains
    .filter(t => {
      if (filterType === 'ALL') return true;
      if (filterType === 'PASSENGER')
        return ['VANDE_BHARAT', 'RAJDHANI_SUPERFAST', 'MAIL_EXPRESS', 'EMU_SUBURBAN'].includes(t.trainType);
      if (filterType === 'FREIGHT')
        return t.trainType.includes('BOXN') || t.trainType.includes('BTPN') || t.trainType.includes('FREIGHT');
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return a.priority - b.priority;
      if (sortBy === 'delay')    return b.delayMinutes - a.delayMinutes;
      if (sortBy === 'speed')    return b.speedKmH - a.speedKmH;
      return 0;
    });

  const onTimeCount   = trains.filter(t => t.delayMinutes === 0).length;
  const diverted      = trains.filter(t => t.diverted).length;
  const totalFreight  = trains.filter(t => t.goodsForecastTonnes).reduce((s, t) => s + (t.goodsForecastTonnes || 0), 0);
  const punctualityPct = Math.round((onTimeCount / trains.length) * 100);
  const avgSpeed       = Math.round(trains.reduce((s, t) => s + t.speedKmH, 0) / trains.length);

  return (
    <div className="space-y-3 select-none font-sans">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-[#FFFFFF] border border-[#E2E8F0] px-4 py-3 rounded-[4px] shadow-panel gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
              Train Operations &amp; COA Corridor Monitor
            </span>
            <span className="bg-[#F0FDF4] text-[#16A34A] text-[9px] px-2 py-0.5 border border-[#BBF7D0] font-mono font-bold rounded-[2px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              LIVE
            </span>
            <span className="bg-[#F8FAFC] text-[#475569] text-[9px] px-2 py-0.5 border border-[#E2E8F0] font-mono font-bold rounded-[2px]">
              COA / DISPATCH
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Real-time GPS telemetry, axle counter tracking, TSR supervision, and dynamic single-line diversions.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2.5 rounded-[4px] shrink-0">
          <div>
            <div className="text-[8.5px] text-[#64748B] font-mono font-bold uppercase">Corridor Punctuality</div>
            <div className="text-2xl font-mono font-bold text-[#16A34A]">{punctualityPct}%</div>
          </div>
          <div className="text-[10px] text-[#16A34A] font-mono flex items-center gap-1 font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> +2.4% vs last week
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          {
            label: 'Active Trains', value: String(trains.length),
            sub: `${trains.filter(t => ['VANDE_BHARAT','RAJDHANI_SUPERFAST','MAIL_EXPRESS'].includes(t.trainType)).length} Superfast · ${trains.filter(t => t.trainType.includes('BOXN') || t.trainType.includes('BTPN')).length} Goods`,
            icon: Train, accent: '#0F172A',
          },
          {
            label: 'Avg Corridor Speed', value: `${avgSpeed} km/h`,
            sub: 'Across all active paths',
            icon: Gauge, accent: '#2563EB',
          },
          {
            label: 'Freight Throughput', value: `${(totalFreight / 1000).toFixed(1)}k T`,
            sub: 'Coal + POL combined',
            icon: Package, accent: '#92400E',
          },
          {
            label: 'SLW Diversions', value: String(diverted),
            sub: diverted > 0 ? 'Single Line Working active' : 'All on primary path',
            icon: AlertTriangle, accent: diverted > 0 ? '#D97706' : '#16A34A',
          },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[4px] p-3 shadow-panel hover:border-[#CBD5E1] transition-colors"
              style={{ borderTopWidth: 3, borderTopColor: kpi.accent }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8.5px] font-mono font-bold text-[#64748B] uppercase">{kpi.label}</span>
                <Icon className="w-3.5 h-3.5" style={{ color: kpi.accent }} />
              </div>
              <div className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {kpi.value}
              </div>
              <div className="text-[9px] font-mono text-[#64748B] mt-0.5">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Corridor minimap */}
      <CorridorMinimap trains={trains} />

      {/* Filter + Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-0.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[4px] p-0.5 shadow-panel">
          <span className="text-[8.5px] font-mono font-bold text-[#64748B] px-2.5">FILTER:</span>
          {[
            { id: 'ALL',       label: `All (${trains.length})` },
            { id: 'PASSENGER', label: 'Passenger'              },
            { id: 'FREIGHT',   label: 'Freight'                },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1 text-[10px] font-mono font-bold rounded-[3px] transition-colors cursor-pointer ${
                filterType === f.id ? 'bg-[#0F172A] text-[#FFFFFF]' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[4px] p-0.5 shadow-panel">
          <span className="text-[8.5px] font-mono font-bold text-[#64748B] px-2.5">SORT:</span>
          {[
            { id: 'priority', label: 'Priority' },
            { id: 'delay',    label: 'Delay'    },
            { id: 'speed',    label: 'Speed'    },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id as 'priority' | 'delay' | 'speed')}
              className={`px-3 py-1 text-[10px] font-mono font-bold rounded-[3px] transition-colors cursor-pointer ${
                sortBy === s.id ? 'bg-[#0F172A] text-[#FFFFFF]' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Train cards */}
      <div className="space-y-2">
        {filteredTrains.map(train => (
          <TrainCard
            key={train.id}
            train={train}
            onToggleDiversion={handleToggleDiversion}
            onViewCanvas={onNavigateToOverview}
          />
        ))}
        {filteredTrains.length === 0 && (
          <div className="text-center py-10 text-[#94A3B8] font-mono text-sm bg-[#FFFFFF] border border-[#E2E8F0] rounded-[4px]">
            No trains match the selected filter.
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-3.5 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[4px] text-[10.5px] font-mono shadow-panel">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[#16A34A]" />
            <span className="text-[#64748B]">ON-TIME:</span>
            <span className="font-bold text-[#16A34A]">{punctualityPct}%</span>
          </div>
          <span className="text-[#E2E8F0]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B]">DIVERTED:</span>
            <span className="font-bold" style={{ color: diverted > 0 ? '#D97706' : '#0F172A' }}>
              {diverted} train{diverted !== 1 ? 's' : ''}
            </span>
          </div>
          <span className="text-[#E2E8F0]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B]">FREIGHT:</span>
            <span className="font-bold text-[#92400E]">{(totalFreight / 1000).toFixed(1)}k T</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[9.5px] text-[#64748B]">
          <Clock className="w-3 h-3" />
          <span>GPS sync: Live · Axle counters: Nominal</span>
        </div>
      </div>
    </div>
  );
};
