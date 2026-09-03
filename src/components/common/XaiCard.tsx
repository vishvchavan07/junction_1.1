import React from 'react';
import { AssetXaiFeature } from '../../types';
import { Cpu, CheckCircle, HelpCircle } from 'lucide-react';

interface XaiCardProps {
  title?: string;
  confidenceScore: number;
  reasoning: string;
  features?: AssetXaiFeature[];
  ruleTriggered?: string;
  onApplyRecommendation?: () => void;
  actionLabel?: string;
}

export const XaiCard: React.FC<XaiCardProps> = ({
  title = 'EXPLAINABLE AI (XAI) DECISION MATRIX',
  confidenceScore,
  reasoning,
  features = [],
  ruleTriggered,
  onApplyRecommendation,
  actionLabel = 'APPLY AI OPTIMIZATION',
}) => {
  const confidenceColor =
    confidenceScore >= 90 ? '#16A34A'
    : confidenceScore >= 75 ? '#D97706'
    : '#DC2626';

  return (
    <div
      className="p-3.5 text-xs relative overflow-hidden bg-[#FFFFFF]"
      style={{
        border: '1px solid #E2E8F0',
        borderRadius: '4px',
        boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.05)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2 mb-2.5">
        <div className="flex items-center gap-2" style={{ color: '#0F172A' }}>
          <Cpu style={{ width: 14, height: 14, color: '#2563EB' }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', color: '#0F172A', textTransform: 'uppercase' }}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: 500, color: '#64748B' }}>Confidence</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, color: confidenceColor }}>
            {confidenceScore}%
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="w-full mb-2.5 overflow-hidden" style={{ height: 2, backgroundColor: '#F1F5F9', borderRadius: '2px' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${confidenceScore}%`, backgroundColor: confidenceColor }}
        />
      </div>

      {/* Reasoning block */}
      <div className="mb-2.5" style={{ backgroundColor: '#F8FAFC', padding: '9px 11px', borderRadius: '3px', border: '1px solid #E2E8F0' }}>
        <div className="flex items-center gap-1.5 mb-1">
          <HelpCircle style={{ width: 11, height: 11, color: '#2563EB' }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', fontWeight: 600, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.07em' }}>AI Rationale</span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#334155', lineHeight: 1.5, margin: 0 }}>{reasoning}</p>
      </div>

      {/* Feature importance (SHAP) */}
      {features.length > 0 && (
        <div className="space-y-1.5 mb-2.5">
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>
            Feature Importance (SHAP)
          </div>
          {features.map((feat, idx) => (
            <div key={idx} style={{ backgroundColor: '#F8FAFC', padding: '6px 9px', borderRadius: '3px', display: 'flex', flexDirection: 'column', gap: 4, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: '11.5px' }}>
                <span style={{ color: '#0F172A', fontWeight: 500 }}>{feat.feature}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10.5px', fontWeight: 600, color: feat.impact === 'NEGATIVE' ? '#D97706' : '#16A34A' }}>
                  {feat.value}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ flex: 1, height: 2, backgroundColor: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${feat.importance * 100}%`,
                      height: '100%',
                      backgroundColor: feat.impact === 'NEGATIVE' ? '#D97706' : '#16A34A',
                    }}
                  />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#64748B', flexShrink: 0 }}>
                  {(feat.importance * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rule trigger */}
      {ruleTriggered && (
        <div style={{ padding: '7px 9px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '3px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', fontWeight: 600, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Safety Rule</span>
          <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10.5px', fontWeight: 600, color: '#B45309' }}>{ruleTriggered}</code>
        </div>
      )}

      {/* Action button */}
      {onApplyRecommendation && (
        <button
          onClick={onApplyRecommendation}
          className="btn-pen-primary w-full py-2 text-[11px]"
        >
          <CheckCircle style={{ width: 13, height: 13 }} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
