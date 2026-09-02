import React from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Cpu,
  ShieldCheck,
  Zap,
  Activity,
  Flame,
} from 'lucide-react';

export const AiInsights: React.FC = () => {
  const ShapBar = ({ label, pct, color }: { label: string; pct: number; color: string }) => (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-[#1A1208] font-mono">{label}</span>
        <strong style={{ color }} className="font-mono">{pct}%</strong>
      </div>
      <div className="w-full bg-[#F5F0E8] h-2 border border-[#D9D0C0] overflow-hidden">
        <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-5 select-none font-mono">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-[#F5F0E8] border border-[#C4BAA8] p-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xl text-[#1A1208] tracking-tight">
              AI Model Insights & Infrastructure ROI
            </span>
            <span className="bg-[#EFF6FF] text-[#1E3A5F] text-[9px] px-2 py-0.5 border border-[#BFDBFE] font-mono font-bold">
              XGBoost + OR-Tools + SHAP
            </span>
          </div>
          <p className="text-[11px] text-[#5C5347] mt-0.5">
            Predictive ML telemetry, RUL projections, and multi-department synchronization analytics.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#C4BAA8] p-2.5">
          <Cpu className="w-4 h-4 text-[#8B1A1A]" />
          <span className="text-[#8B8073] text-[10px] font-mono">MODEL ACCURACY:</span>
          <span className="text-[#8B1A1A] font-mono font-bold">94.2% ROC-AUC</span>
        </div>
      </div>

      {/* ── KPI Metrics Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Prevented Rail Failures', value: '14',     sub: '100% Zero Derailments',       color: '#7F1D1D', icon: ShieldCheck },
          { label: 'Shadow Block Gain',        value: '210 min', sub: 'Downtime eliminated / week', color: '#1E3A5F', icon: Zap         },
          { label: 'Tamping Machine ROI',      value: '92.4%', sub: '+18.6% vs manual scheduling', color: '#166534', icon: Activity    },
          { label: 'Passenger Delay Impact',   value: '−76.4%', sub: 'Compared to manual BDMS',    color: '#166534', icon: TrendingDown },
        ].map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white border border-[#C4BAA8] p-4" style={{ borderTopWidth: '3px', borderTopColor: m.color }}>
              <div className="flex justify-between items-center text-[9px] text-[#8B8073] font-mono font-bold mb-2 uppercase">
                <span>{m.label}</span>
                <Icon className="w-4 h-4" style={{ color: m.color }} />
              </div>
              <div className="text-3xl font-display font-bold" style={{ color: m.color }}>{m.value}</div>
              <div className="text-[9px] text-[#8B8073] mt-1">{m.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Analysis Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Corridor Degradation Heatmap */}
        <div className="bg-white border border-[#C4BAA8] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-2.5">
            <span className="text-[11px] font-mono font-bold text-[#1A1208] uppercase flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#92400E]" />
              Corridor Degradation Risk Heatmap (by Kilometre)
            </span>
            <span className="text-[9px] text-[#8B8073] font-mono">KM 100 to 160</span>
          </div>
          <p className="text-[10px] text-[#5C5347]">
            High-density stress sectors with compounded GMT tonnage, turnout switch friction, and dynamic versine variations.
          </p>
          <div className="space-y-2">
            {[
              { km: 'KM 125.0 – 128.5 (Vapi – Udvada)',     pct: '89%', label: 'Critical',  color: '#7F1D1D', bg: '#FEF2F2', border: '#7F1D1D' },
              { km: 'KM 106.0 – 108.0 (Bhilad – Sanjan)',   pct: '72%', label: 'Warning',   color: '#92400E', bg: '#FFFBEB', border: '#92400E' },
              { km: 'KM 138.0 – 143.0 (Valsad – Dungri)',   pct: '12%', label: 'Normal',    color: '#166534', bg: '#F0FDF4', border: '#D9D0C0' },
              { km: 'KM 148.0 – 156.0 (Dungri – Surat)',    pct: '18%', label: 'Normal',    color: '#166534', bg: '#F0FDF4', border: '#D9D0C0' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 text-[11px] font-mono border"
                style={{ backgroundColor: row.bg, borderColor: `${row.border}60` }}>
                <span className="font-bold text-[#1A1208]">{row.km}</span>
                <span className="font-bold" style={{ color: row.color }}>{row.pct} {row.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Global SHAP Feature Importance */}
        <div className="bg-white border border-[#C4BAA8] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-2.5">
            <span className="text-[11px] font-mono font-bold text-[#8B1A1A] uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#8B1A1A]" />
              Global SHAP Feature Importance Weights
            </span>
            <span className="text-[9px] text-[#8B8073] font-mono">XGBoost Rank</span>
          </div>
          <p className="text-[10px] text-[#5C5347]">
            Relative contribution of inspection parameters in predicting maintenance blocks.
          </p>
          <div className="space-y-3">
            <ShapBar label="1. Track Geometry Index (TGI) Degradation Rate"   pct={34.2} color="#8B1A1A"  />
            <ShapBar label="2. SCADA Thermal Delta & Contact Wire Thickness"   pct={28.6} color="#92400E"  />
            <ShapBar label="3. OMS Lateral / Vertical Peak Accelerations"      pct={18.4} color="#1E3A5F"  />
            <ShapBar label="4. Accumulated Gross Million Tonnes (GMT)"         pct={12.1} color="#5C5347"  />
            <ShapBar label="5. Electric Point Machine Stroke Current & Time"   pct={6.7}  color="#8B8073"  />
          </div>
        </div>
      </div>
    </div>
  );
};
