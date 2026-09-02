import React, { useState } from 'react';
import { FixedAsset, DepartmentType, AssetCondition } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { XaiCard } from '../common/XaiCard';
import { 
  Layers, 
  Search, 
  Filter, 
  TrendingDown, 
  Activity, 
  Calendar, 
  AlertOctagon, 
  CheckCircle2, 
  Wrench, 
  ArrowRight,
  Sparkles,
  Zap,
  Radio,
  FileSpreadsheet,
  Train,
  Eye
} from 'lucide-react';

interface AssetIntelligenceProps {
  assets: FixedAsset[];
  selectedAsset: FixedAsset | null;
  onSelectAsset: (asset: FixedAsset) => void;
  onRequestBlock: (asset: FixedAsset) => void;
  onNavigateToOverview?: () => void;
}

export const AssetIntelligence: React.FC<AssetIntelligenceProps> = ({
  assets,
  selectedAsset: externalSelected,
  onSelectAsset,
  onRequestBlock,
  onNavigateToOverview
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<'ALL' | DepartmentType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AssetCondition>('ALL');
  const [activeAsset, setActiveAsset] = useState<FixedAsset>(externalSelected || assets[0]);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.kmMarker.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || asset.department === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || asset.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleRowClick = (asset: FixedAsset) => {
    setActiveAsset(asset);
    onSelectAsset(asset);
  };

  return (
    <div className="space-y-4 select-none font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-[#FFFFFF] border border-[#1A1815] p-4 rounded-[2px] shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-lg text-[#1A1815] tracking-tight">
              Asset Health & Predictive Intelligence
            </span>
            <span className="bg-[#FAF7F2] text-[#1A1815] text-[10px] px-2 py-0.5 border border-[#D8D1C5] font-mono font-bold rounded-[2px]">
              TMS + TDMS + SMMS REGISTRY
            </span>
          </div>
          <p className="text-[11.5px] text-[#615A4F] mt-0.5">
            Real-time condition monitoring, track geometry indices (TGI), ultrasonic flaw scans (USFD), and RUL degradation curves.
          </p>
        </div>

        {/* Network Health Metric */}
        <div className="flex items-center gap-4 bg-[#F7F4EE] border border-[#D8D1C5] p-3 rounded-[2px] text-xs shrink-0">
          <div>
            <div className="text-[9.5px] text-[#615A4F] font-mono font-bold">NETWORK HEALTH INDEX</div>
            <div className="text-xl font-mono font-bold text-[#15803D]">88.4%</div>
          </div>
          <div className="w-24 bg-[#EDE7DC] h-2 rounded-[1px] overflow-hidden">
            <div className="h-full bg-[#15803D]" style={{ width: '88.4%' }}></div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#1A1815] p-3 rounded-[2px] shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#F7F4EE] border border-[#D8D1C5] px-3 py-1.5 flex-1 min-w-[200px] max-w-md rounded-[2px]">
          <Search className="w-4 h-4 text-[#615A4F]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Asset Code, Location, or KM (e.g. PT-227, KM 127)..."
            className="bg-transparent border-none outline-none text-xs text-[#1A1815] font-mono w-full"
          />
        </div>

        {/* Department Filters */}
        <div className="flex items-center gap-1 bg-[#F7F4EE] border border-[#D8D1C5] p-0.5 rounded-[2px]">
          {(['ALL', 'TRACK', 'OHE', 'SNT'] as const).map(dept => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-[1px] cursor-pointer transition-colors ${
                deptFilter === dept ? 'bg-[#1A1815] text-[#FFFFFF]' : 'text-[#615A4F] hover:text-[#1A1815]'
              }`}
            >
              {dept === 'ALL' ? 'ALL DEPTS' : dept}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-[#F7F4EE] border border-[#D8D1C5] p-0.5 rounded-[2px]">
          {(['ALL', 'CRITICAL', 'WARNING', 'OPERATIONAL'] as const).map(stat => (
            <button
              key={stat}
              onClick={() => setStatusFilter(stat)}
              className={`px-2 py-1 text-[9.5px] font-mono font-bold rounded-[1px] cursor-pointer transition-colors ${
                statusFilter === stat
                  ? stat === 'CRITICAL' ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]' :
                    stat === 'WARNING' ? 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]' :
                    stat === 'OPERATIONAL' ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]' : 'bg-[#1A1815] text-[#FFFFFF]'
                  : 'text-[#615A4F] hover:text-[#1A1815]'
              }`}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left 7 cols (Data Table) / Right 5 cols (Asset Detail & XAI Drawer) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Column: High Density Asset Master Table (7 cols) */}
        <div className="xl:col-span-7 bg-[#FFFFFF] border border-[#1A1815] rounded-[2px] shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 border-b border-[#D8D1C5] bg-[#F7F4EE] flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-[#1A1815] uppercase tracking-wider text-[11px]">
              Asset Registry (Showing {filteredAssets.length} of {assets.length})
            </span>
            <span className="text-[10px] text-[#615A4F] font-mono">Click row to inspect diagnostic curves</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] text-[#615A4F] border-b border-[#D8D1C5] text-[9.5px] font-mono font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">ASSET CODE</th>
                  <th className="py-2.5 px-3">DEPT</th>
                  <th className="py-2.5 px-3">LOCATION</th>
                  <th className="py-2.5 px-3">TRACK</th>
                  <th className="py-2.5 px-3 text-right">HEALTH</th>
                  <th className="py-2.5 px-3 text-right">FAIL RISK</th>
                  <th className="py-2.5 px-3 text-center">BLOCK?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE7DC] font-mono text-[11px]">
                {filteredAssets.map(asset => {
                  const isSelected = activeAsset?.id === asset.id;
                  return (
                    <tr
                      key={asset.id}
                      onClick={() => handleRowClick(asset)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-[#F7F4EE] border-l-4 border-[#1A1815]' 
                          : 'hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <td className="py-2 px-3">
                        <StatusBadge status={asset.status} />
                      </td>
                      <td className="py-2 px-3 font-bold text-[#1A1815]">
                        {asset.code}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[9px] bg-[#FAF7F2] text-[#615A4F] px-1.5 py-0.2 border border-[#D8D1C5] rounded-[1px]">
                          {asset.department}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[#615A4F] font-sans text-[11px]">
                        {asset.section} ({asset.kmMarker})
                      </td>
                      <td className="py-2 px-3 text-[#1A1815] font-bold">
                        {asset.track}
                      </td>
                      <td className="py-2 px-3 text-right font-bold">
                        <span className={
                          asset.conditionScore < 65 ? 'text-[#B91C1C]' :
                          asset.conditionScore < 80 ? 'text-[#B45309]' : 'text-[#15803D]'
                        }>
                          {asset.conditionScore}/100
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-bold">
                        <span className={asset.failureRiskProbability > 70 ? 'text-[#B91C1C]' : 'text-[#1A1815]'}>
                          {asset.failureRiskProbability}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-bold">
                        {asset.blockRequired ? (
                          <span className="text-[9px] text-[#B91C1C] bg-[#FEF2F2] px-1.5 py-0.2 border border-[#FECACA] rounded-[1px]">
                            REQ
                          </span>
                        ) : (
                          <span className="text-[9px] text-[#615A4F]">NO</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Asset Deep-Dive & XAI Inspection (5 cols) */}
        <div className="xl:col-span-5 space-y-3">
          {activeAsset ? (
            <div className="space-y-3">
              {/* Asset Health Overview Card */}
              <div className="bg-[#FFFFFF] border border-[#1A1815] p-4 space-y-3 rounded-[2px] shadow-sm">
                <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={activeAsset.status} />
                    <span className="font-mono font-bold text-sm text-[#1A1815]">{activeAsset.code}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#615A4F]">ID: {activeAsset.id}</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#1A1815]">{activeAsset.name}</h3>
                  <div className="text-[11.5px] text-[#615A4F] mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono">
                    <span>Section: <strong className="text-[#1A1815]">{activeAsset.section}</strong></span>
                    <span>KM: <strong className="text-[#1A1815]">{activeAsset.kmMarker}</strong></span>
                    <span>Track: <strong className="text-[#1A1815]">{activeAsset.track} MAIN</strong></span>
                    <span>Traffic: <strong className="text-[#1A1815]">{activeAsset.gmtAccumulated} GMT/yr</strong></span>
                  </div>
                </div>

                {/* Condition Degradation Trend Curve Visualizer */}
                <div className="p-3 bg-[#F7F4EE] border border-[#D8D1C5] rounded-[2px] space-y-2">
                  <div className="flex justify-between items-center text-[9.5px] font-mono text-[#615A4F] font-bold">
                    <span>CONDITION DEGRADATION TIMELINE (6 MONTHS)</span>
                    <span className="text-[#B45309] flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Deteriorating
                    </span>
                  </div>

                  {/* Simulated Degradation Bars */}
                  <div className="grid grid-cols-6 gap-2 pt-2 text-center text-[9px] font-mono">
                    <div>
                      <div className="h-12 bg-[#EDE7DC] flex items-end justify-center p-0.5 rounded-[1px]">
                        <div className="w-full bg-[#15803D]" style={{ height: '92%' }}></div>
                      </div>
                      <span className="text-[#615A4F] mt-1 block">MAR</span>
                    </div>
                    <div>
                      <div className="h-12 bg-[#EDE7DC] flex items-end justify-center p-0.5 rounded-[1px]">
                        <div className="w-full bg-[#15803D]" style={{ height: '88%' }}></div>
                      </div>
                      <span className="text-[#615A4F] mt-1 block">APR</span>
                    </div>
                    <div>
                      <div className="h-12 bg-[#EDE7DC] flex items-end justify-center p-0.5 rounded-[1px]">
                        <div className="w-full bg-[#15803D]" style={{ height: '82%' }}></div>
                      </div>
                      <span className="text-[#615A4F] mt-1 block">MAY</span>
                    </div>
                    <div>
                      <div className="h-12 bg-[#EDE7DC] flex items-end justify-center p-0.5 rounded-[1px]">
                        <div className="w-full bg-[#B45309]" style={{ height: '76%' }}></div>
                      </div>
                      <span className="text-[#615A4F] mt-1 block">JUN</span>
                    </div>
                    <div>
                      <div className="h-12 bg-[#EDE7DC] flex items-end justify-center p-0.5 rounded-[1px]">
                        <div className="w-full bg-[#B45309]" style={{ height: '70%' }}></div>
                      </div>
                      <span className="text-[#615A4F] mt-1 block">JUL</span>
                    </div>
                    <div>
                      <div className="h-12 bg-[#EDE7DC] flex items-end justify-center p-0.5 rounded-[1px]">
                        <div className={`w-full ${activeAsset.conditionScore < 65 ? 'bg-[#B91C1C]' : 'bg-[#B45309]'}`} style={{ height: `${activeAsset.conditionScore}%` }}></div>
                      </div>
                      <span className="text-[#1A1815] font-bold mt-1 block">AUG</span>
                    </div>
                  </div>
                </div>

                {/* Specific Departmental Telemetry */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#F7F4EE] p-2.5 border border-[#D8D1C5] rounded-[2px] font-mono">
                  {activeAsset.tgiScore && (
                    <div>
                      <span className="text-[10px] text-[#615A4F] block">TRACK GEOMETRY (TGI):</span>
                      <strong className="text-[#1A1815]">{activeAsset.tgiScore}</strong>
                    </div>
                  )}
                  {activeAsset.omsPeakG && (
                    <div>
                      <span className="text-[10px] text-[#615A4F] block">OMS PEAK ACCEL:</span>
                      <strong className="text-[#B45309]">{activeAsset.omsPeakG}g</strong>
                    </div>
                  )}
                  {activeAsset.oheContactWireWearPercent && (
                    <div>
                      <span className="text-[10px] text-[#615A4F] block">WIRE WEAR:</span>
                      <strong className="text-[#B91C1C]">{activeAsset.oheContactWireWearPercent}% wear</strong>
                    </div>
                  )}
                  {activeAsset.pointStrokeSeconds && (
                    <div>
                      <span className="text-[10px] text-[#615A4F] block">POINT STROKE TIME:</span>
                      <strong className="text-[#B45309]">{activeAsset.pointStrokeSeconds}s</strong>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-[#615A4F] block">PREDICTED RUL:</span>
                    <strong className="text-[#1A1815]">{activeAsset.predictedFailureDays} days</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#615A4F] block">MAINTENANCE DUE:</span>
                    <strong className="text-[#B45309]">{activeAsset.maintenanceDue ? 'YES' : 'NO'}</strong>
                  </div>
                </div>
              </div>

              {/* Explainable AI (XAI) Feature Importance Matrix */}
              <XaiCard
                confidenceScore={activeAsset.failureRiskProbability}
                reasoning={activeAsset.xaiReasoning}
                features={activeAsset.xaiFeatures}
                ruleTriggered={`IF [${activeAsset.code}].Condition < 70 AND Traffic > 35 GMT THEN TRIGGER SHADOW_BLOCK`}
                onApplyRecommendation={() => onRequestBlock(activeAsset)}
                actionLabel="SCHEDULE AUTOMATIC MAINTENANCE BLOCK"
              />

              {/* Maintenance Inspection History */}
              <div className="bg-[#FFFFFF] border border-[#1A1815] p-4 space-y-2 rounded-[2px] shadow-sm">
                <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-2">
                  <span className="text-xs font-mono font-bold uppercase text-[#1A1815] flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-[#1A1815]" /> INSPECTION & MAINTENANCE LOG
                  </span>
                  <span className="text-[10px] font-mono text-[#615A4F]">Last: {activeAsset.lastInspectionDate}</span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  {activeAsset.history.map((h, i) => (
                    <div key={i} className="p-2 bg-[#F7F4EE] border border-[#D8D1C5] rounded-[2px]">
                      <div className="flex justify-between text-[10px] text-[#615A4F] mb-0.5">
                        <span className="font-bold text-[#1A1815]">{h.type}</span>
                        <span>{h.date}</span>
                      </div>
                      <p className="text-[11px] font-sans text-[#1A1815]">{h.description}</p>
                      <div className="text-[9px] text-[#615A4F] mt-1">Engineer: {h.technician}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[#615A4F] border border-dashed border-[#D8D1C5] rounded-[2px] bg-[#FFFFFF]">
              Select an asset from the table to inspect diagnostic parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
