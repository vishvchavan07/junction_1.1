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
    confidenceScore >= 90 ? '#4D8B68'
    : confidenceScore >= 75 ? '#D49A32'
    : '#C84B43';

  return (
    <div className="bg-[#FBF9F4] border border-[#D5CEC1] p-4 text-xs relative overflow-hidden" style={{ borderRadius: '6px', boxShadow: '0px 1px 4px rgba(29,31,30,0.05)' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-2.5 mb-3">
        <div className="flex items-center gap-2" style={{ color: '#1D1F1E' }}>
          <Cpu style={{ width: 15, height: 15, color: '#4B4A46' }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.03em', color: '#1D1F1E', textTransform: 'uppercase' }}>{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: 500, color: '#77736C' }}>Confidence</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 600, color: confidenceColor }}>
            {confidenceScore}%
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="w-full mb-3 overflow-hidden" style={{ height: 2, backgroundColor: '#E8E2D8', borderRadius: '2px' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${confidenceScore}%`, backgroundColor: confidenceColor }}
        />
      </div>

      {/* Reasoning block */}
      <div className="mb-3" style={{ backgroundColor: '#F0ECE4', padding: '10px 12px', borderRadius: '4px' }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <HelpCircle style={{ width: 12, height: 12, color: '#4B4A46' }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: 500, color: '#77736C', textTransform: 'uppercase', letterSpacing: '0.07em' }}>AI rationale</span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: '#1D1F1E', lineHeight: 1.55, margin: 0 }}>{reasoning}</p>
      </div>

      {/* Feature importance (SHAP) */}
      {features.length > 0 && (
        <div className="space-y-1.5 mb-3">
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: 500, color: '#77736C', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
            Feature importance (SHAP)
          </div>
          {features.map((feat, idx) => (
            <div key={idx} style={{ backgroundColor: '#F0ECE4', padding: '7px 10px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: '12px' }}>
                <span style={{ color: '#1D1F1E', fontWeight: 500 }}>{feat.feature}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, color: feat.impact === 'NEGATIVE' ? '#D49A32' : '#4D8B68' }}>
                  {feat.value}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 2, backgroundColor: '#D5CEC1', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${feat.importance * 100}%`,
                      height: '100%',
                      backgroundColor: feat.impact === 'NEGATIVE' ? '#D49A32' : '#4D8B68',
                    }}
                  />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#77736C', flexShrink: 0 }}>
                  {(feat.importance * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rule trigger */}
      {ruleTriggered && (
        <div style={{ padding: '8px 10px', backgroundColor: '#FBF5E6', border: '1px solid #E0BF7A', borderRadius: '4px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: 500, color: '#C4891F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active safety rule</span>
          <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, color: '#C4891F' }}>{ruleTriggered}</code>
        </div>
      )}

      {/* Action button */}
      {onApplyRecommendation && (
        <button
          onClick={onApplyRecommendation}
          style={{
            width: '100%',
            padding: '8px 14px',
            backgroundColor: '#1D1F1E',
            color: '#F2EADF',
            border: '1px solid #1D1F1E',
            borderRadius: '4px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          <CheckCircle style={{ width: 14, height: 14 }} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
