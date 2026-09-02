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
    confidenceScore >= 90 ? '#15803D'
    : confidenceScore >= 75 ? '#B45309'
    : '#B91C1C';

  return (
    <div className="bg-[#FFFFFF] border border-[#1A1815] p-4 text-xs font-sans relative overflow-hidden rounded-[2px] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-2.5 mb-3">
        <div className="flex items-center gap-2 text-[#1A1815]">
          <Cpu className="w-4 h-4 text-[#1A1815]" />
          <span className="font-semibold tracking-wide uppercase text-[11px] font-mono">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#615A4F] text-[10px] font-mono font-medium">CONFIDENCE:</span>
          <span className="font-bold text-[11px] font-mono" style={{ color: confidenceColor }}>
            {confidenceScore}%
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="w-full bg-[#F0EBE1] h-1.5 mb-3 overflow-hidden border border-[#D8D1C5] rounded-[1px]">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${confidenceScore}%`,
            backgroundColor: confidenceColor,
          }}
        />
      </div>

      {/* Reasoning block */}
      <div className="bg-[#F7F4EE] p-3 border border-[#D8D1C5] mb-3 leading-relaxed rounded-[2px]">
        <div className="text-[10px] text-[#615A4F] font-mono font-semibold mb-1 flex items-center gap-1 uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-[#1A1815]" />
          AI Synthesis & Operational Rationale
        </div>
        <p className="text-[#1A1815] text-[12px] font-sans">{reasoning}</p>
      </div>

      {/* Feature importance (SHAP) */}
      {features.length > 0 && (
        <div className="space-y-1.5 mb-3">
          <div className="text-[10px] text-[#615A4F] font-mono font-semibold uppercase tracking-wider">
            Feature Importance (SHAP Contribution):
          </div>
          {features.map((feat, idx) => (
            <div key={idx} className="bg-[#F7F4EE] p-2 border border-[#D8D1C5] rounded-[2px] flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-sans">
                <span className="text-[#1A1815] font-medium">{feat.feature}</span>
                <span
                  className="font-mono font-semibold"
                  style={{ color: feat.impact === 'NEGATIVE' ? '#B45309' : '#15803D' }}
                >
                  {feat.value}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#E8E1D5] h-1 rounded-sm overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${feat.importance * 100}%`,
                      backgroundColor: feat.impact === 'NEGATIVE' ? '#B45309' : '#15803D',
                    }}
                  />
                </div>
                <span className="text-[9px] font-mono text-[#615A4F] shrink-0">
                  +{(feat.importance * 100).toFixed(0)}% wt
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rule trigger */}
      {ruleTriggered && (
        <div className="p-2.5 bg-[#FFFBEB] border border-[#FDE68A] text-[11px] mb-3 rounded-[2px] flex items-center justify-between">
          <span className="text-[#B45309] font-mono font-semibold text-[10px] uppercase">ACTIVE SAFETY RULE:</span>
          <code className="text-[#B45309] font-mono font-bold text-[11px]">{ruleTriggered}</code>
        </div>
      )}

      {/* Action button */}
      {onApplyRecommendation && (
        <button
          onClick={onApplyRecommendation}
          className="w-full btn-pen-primary py-2.5 text-[11px] font-mono uppercase tracking-wider"
        >
          <CheckCircle className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
