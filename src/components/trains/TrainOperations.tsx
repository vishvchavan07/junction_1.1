import React, { useState } from 'react';
import { TrainEntity } from '../../types';
import { Train, TrendingUp, Eye } from 'lucide-react';

interface TrainOperationsProps {
  trains: TrainEntity[];
  onRerouteTrain?: (trainId: string) => void;
  onNavigateToOverview?: () => void;
}

export const TrainOperations: React.FC<TrainOperationsProps> = ({
  trains: initialTrains,
  onRerouteTrain,
  onNavigateToOverview,
}) => {
  const [trains, setTrains] = useState<TrainEntity[]>(initialTrains);
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredTrains = trains.filter(t => {
    if (filterType === 'ALL') return true;
    if (filterType === 'PASSENGER') return ['VANDE_BHARAT', 'RAJDHANI_SUPERFAST', 'MAIL_EXPRESS', 'EMU_SUBURBAN'].includes(t.trainType);
    if (filterType === 'FREIGHT') return t.trainType.includes('FREIGHT') || t.trainType.includes('BTPN');
    return true;
  });

  const handleToggleDiversion = (trainId: string) => {
    setTrains(prev =>
      prev.map(t => {
        if (t.id === trainId) {
          return {
            ...t,
            diverted: !t.diverted,
            diversionRoute: !t.diverted
              ? 'Diverted via Down Line Bi-directional signalling (50 km/h PSR)'
              : undefined,
            delayMinutes: !t.diverted ? t.delayMinutes + 6 : Math.max(0, t.delayMinutes - 6),
          };
        }
        return t;
      })
    );
    if (onRerouteTrain) onRerouteTrain(trainId);
  };

  const FilterBtn = ({ id, label }: { id: string; label: string }) => (
    <button
      onClick={() => setFilterType(id)}
      className={`px-3 py-1.5 text-[10px] font-mono font-bold transition-colors cursor-pointer ${
        filterType === id
          ? 'bg-[#1A1815] text-[#FFFFFF]'
          : 'text-[#615A4F] hover:bg-[#FAF7F2]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4 select-none font-sans">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-[#FFFFFF] border border-[#1A1815] p-4 rounded-[2px] shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-lg text-[#1A1815] tracking-tight">
              Train Operations & COA Corridor Monitor
            </span>
            <span className="bg-[#FAF7F2] text-[#1A1815] text-[10px] px-2 py-0.5 border border-[#D8D1C5] font-mono font-bold rounded-[2px]">
              COA / DISPATCH
            </span>
          </div>
          <p className="text-[11.5px] text-[#615A4F] mt-0.5">
            Real-time schedule adherence, freight rake forecasts, TSR speed supervision, and dynamic single-line diversions.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-[#F7F4EE] border border-[#D8D1C5] p-3 rounded-[2px] shrink-0">
          <div>
            <div className="text-[9.5px] text-[#615A4F] font-mono font-bold uppercase">Corridor Punctuality</div>
            <div className="text-2xl font-mono font-bold text-[#15803D]">96.8%</div>
          </div>
          <div className="text-[10.5px] text-[#15803D] font-mono flex items-center gap-1 font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> +2.4% vs last week
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Train Paths',  value: `${trains.length} Active`,              sub: '4 Superfast / 2 Goods', color: '#1A1815'  },
          { label: 'Total Freight Tonnage', value: '6,750 T',                            sub: 'Coal + Petroleum Rakes', color: '#B45309'  },
          { label: 'Corridor Occupancy',  value: '74.2%',                                sub: 'Optimal Headroom',       color: '#15803D'  },
          { label: 'Diversions Active',   value: String(trains.filter(t => t.diverted).length), sub: 'Single Line Working', color: '#B45309' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[#FFFFFF] border border-[#D8D1C5] hover:border-[#1A1815] rounded-[2px] p-3.5 transition-colors">
            <div className="text-[9.5px] text-[#615A4F] font-mono font-bold uppercase">{kpi.label}</div>
            <div className="text-xl font-bold mt-1 text-[#1A1815]">{kpi.value}</div>
            <div className="text-[9.5px] font-mono mt-1 text-[#615A4F]">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-0 bg-[#FFFFFF] border border-[#1A1815] rounded-[2px] overflow-hidden">
        <span className="text-[9.5px] text-[#615A4F] font-mono font-bold uppercase px-3 border-r border-[#D8D1C5]">
          TRAIN CATEGORY:
        </span>
        <FilterBtn id="ALL"       label={`All Trains (${trains.length})`} />
        <FilterBtn id="PASSENGER" label="Passenger & Superfast" />
        <FilterBtn id="FREIGHT"   label="Goods & Freight Rakes" />
      </div>

      {/* Train Schedule Table */}
      <div className="bg-[#FFFFFF] border border-[#1A1815] rounded-[2px] shadow-sm overflow-hidden">
        <div className="border-b border-[#D8D1C5] bg-[#F7F4EE] px-4 py-2.5 flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-[#1A1815] uppercase tracking-wider flex items-center gap-2">
            <Train className="w-4 h-4 text-[#1A1815]" />
            COA Live Train Timetable & Section Dispatch
          </span>
          <span className="text-[9.5px] text-[#615A4F] font-mono">Real-time GPS / Axle Counter Telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] font-mono">
            <thead>
              <tr className="bg-[#FAF7F2] text-[#615A4F] border-b border-[#D8D1C5] text-[9.5px] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Train No.</th>
                <th className="py-2.5 px-3">Train Name</th>
                <th className="py-2.5 px-3">Route</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Track</th>
                <th className="py-2.5 px-3 text-right">Speed</th>
                <th className="py-2.5 px-3 text-right">Delay</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE7DC]">
              {filteredTrains.map(train => (
                <tr key={train.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-3 px-3 font-bold text-[#1A1815]">{train.trainNumber}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#1A1815] font-sans">{train.trainName}</div>
                    <div className="text-[9.5px] text-[#615A4F]">Loco: {train.locoNumber} · {train.rakeCapacity}</div>
                  </td>
                  <td className="py-3 px-3 text-[#615A4F]">
                    {train.origin} → {train.destination}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#1A1815]">
                    {train.currentSection} (KM {train.currentKm})
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 bg-[#F7F4EE] text-[#1A1815] border border-[#D8D1C5] rounded-[1px]">
                      {train.assignedTrack} MAIN
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#1A1815]">
                    {train.speedKmH} km/h
                  </td>
                  <td className="py-3 px-3 text-right font-bold">
                    <span style={{
                      color: train.delayMinutes > 10 ? '#B91C1C'
                           : train.delayMinutes > 0  ? '#B45309'
                           : '#15803D',
                    }}>
                      {train.delayMinutes === 0 ? 'ON TIME' : `+${train.delayMinutes} min`}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {onNavigateToOverview && (
                        <button
                          onClick={onNavigateToOverview}
                          title="Track on Railway Canvas"
                          className="p-1 px-2 text-[9.5px] bg-[#FFFFFF] hover:bg-[#F7F4EE] text-[#1A1815] border border-[#D8D1C5] rounded-[2px] flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> Canvas
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleDiversion(train.id)}
                        className={`px-2 py-1 text-[9.5px] font-bold border rounded-[2px] transition-colors cursor-pointer ${
                          train.diverted
                            ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]'
                            : 'bg-[#FFFFFF] border-[#D8D1C5] text-[#615A4F] hover:text-[#1A1815]'
                        }`}
                      >
                        {train.diverted ? 'DIVERTED' : 'DIVERT'}
                      </button>
                    </div>
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
