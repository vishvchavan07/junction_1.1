import React from 'react';
import { FixedAsset } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { FileSpreadsheet, AlertTriangle, Train, Wrench } from 'lucide-react';

interface TrackDepartmentProps {
  assets: FixedAsset[];
  onRequestBlock: (asset: FixedAsset) => void;
  onNavigateToOverview?: () => void;
}

export const TrackDepartment: React.FC<TrackDepartmentProps> = ({
  assets,
  onRequestBlock,
  onNavigateToOverview
}) => {
  const trackAssets = assets.filter(a => a.department === 'TRACK');

  return (
    <div className="space-y-4 select-none font-sans">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-[#FFFFFF] border border-[#1A1815] p-4 rounded-[2px] shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-lg text-[#1A1815] tracking-tight">
              Track Management System (TMS) Portal
            </span>
            <span className="bg-[#FAF7F2] text-[#B45309] text-[10px] px-2 py-0.5 border border-[#FDE68A] font-mono font-bold rounded-[2px]">
              CIVIL ENGINEERING
            </span>
          </div>
          <p className="text-[11.5px] text-[#615A4F] mt-0.5">
            Track Geometry Index (TGI), OMS lateral accelerations, USFD rail flaw scans, and mechanized tamping schedules.
          </p>
        </div>
        <div className="bg-[#F7F4EE] border border-[#D8D1C5] p-2.5 px-3 rounded-[2px] text-xs font-mono shrink-0">
          <span className="text-[9px] text-[#615A4F] font-bold block uppercase">LEAD CIVIL ENGINEER:</span>
          <span className="text-[#1A1815] font-bold">Sai Dhapte (Sr. DEN / Track)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Track Assets',     value: '842 Assets', sub: '94.1% In Tolerance',          color: '#15803D' },
          { label: 'TGI Compliance',   value: 'Avg 82.4',   sub: 'Good / Very Good Category',   color: '#15803D' },
          { label: 'TTM Tamping Due',  value: '17 km',      sub: 'Duomatic 08-32 Assigned',     color: '#B45309' },
          { label: 'USFD Flaw Alerts', value: '1 Flaw',     sub: 'Turnout PT-227-II Observe',   color: '#B91C1C' },
        ].map(k => (
          <div key={k.label} className="bg-[#FFFFFF] border border-[#D8D1C5] hover:border-[#1A1815] rounded-[2px] p-3.5 transition-colors">
            <div className="text-[9.5px] text-[#615A4F] font-mono font-bold uppercase">{k.label}</div>
            <div className="text-xl font-bold mt-1 text-[#1A1815]">{k.value}</div>
            <div className="text-[9.5px] font-mono mt-1 text-[#615A4F]">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Asset List */}
      <div className="bg-[#FFFFFF] border border-[#1A1815] rounded-[2px] shadow-sm overflow-hidden">
        <div className="border-b border-[#D8D1C5] bg-[#F7F4EE] px-4 py-2.5 flex justify-between items-center">
          <span className="text-[11px] font-mono font-bold text-[#1A1815] uppercase flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#1A1815]" />
            Civil Infrastructure Status (Rails, Sleepers, Switches)
          </span>
          <span className="text-[9.5px] text-[#615A4F] font-mono">TMS Synchronized</span>
        </div>

        <div className="divide-y divide-[#EDE7DC]">
          {trackAssets.map(asset => (
            <div key={asset.id} className="p-4 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={asset.status} />
                  <span className="font-mono font-bold text-[11px] text-[#1A1815]">{asset.code}</span>
                  <span className="text-[12px] text-[#1A1815] font-semibold">{asset.name}</span>
                </div>
                <div className="text-[10.5px] text-[#615A4F] font-mono">
                  Location: <strong className="text-[#1A1815]">{asset.section} ({asset.kmMarker})</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px] bg-[#F7F4EE] p-2.5 border border-[#D8D1C5] rounded-[2px] font-mono">
                {[
                  ['TRACK GEOMETRY (TGI):', asset.tgiScore || 'N/A', asset.tgiScore && asset.tgiScore < 75 ? '#B45309' : '#15803D'],
                  ['OMS ACCELERATION:', asset.omsPeakG ? `${asset.omsPeakG}g` : '0.12g', asset.omsPeakG && asset.omsPeakG > 0.25 ? '#B91C1C' : '#1A1815'],
                  ['USFD SCAN STATUS:', asset.usfdFlawStatus || 'CLEAR', asset.usfdFlawStatus === 'OBSERVE' ? '#B45309' : '#15803D'],
                  ['GMT ACCUMULATION:', `${asset.gmtAccumulated} GMT/yr`, '#1A1815'],
                ].map(([k, v, c]) => (
                  <div key={k as string}>
                    <span className="text-[9px] text-[#615A4F] font-bold block">{k as string}</span>
                    <strong style={{ color: c as string }}>{v as any}</strong>
                  </div>
                ))}
              </div>

              <p className="text-[11.5px] text-[#615A4F] font-sans leading-snug">
                <strong className="text-[#1A1815] font-mono">TMS Health Summary: </strong>{asset.xaiReasoning}
              </p>

              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                {onNavigateToOverview && (
                  <button
                    onClick={onNavigateToOverview}
                    className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F7F4EE] text-[#1A1815] border border-[#D8D1C5] text-[10.5px] font-mono font-semibold rounded-[2px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Train className="w-3.5 h-3.5 text-[#1A1815]" />
                    <span>Inspect on Railway Canvas</span>
                  </button>
                )}

                <button
                  onClick={() => onRequestBlock(asset)}
                  className="btn-pen-primary px-3 py-1.5 text-[10.5px] font-mono uppercase cursor-pointer"
                >
                  <Wrench className="w-3 h-3" />
                  Request Tamping Possession
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
