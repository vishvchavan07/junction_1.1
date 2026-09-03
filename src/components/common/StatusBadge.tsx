import React from 'react';

export type StatusBadgeType =
  | 'OPERATIONAL'
  | 'WARNING'
  | 'CRITICAL'
  | 'BLOCKED'
  | 'AI_RECOMMENDED'
  | 'APPROVED'
  | 'PENDING'
  | 'ACTIVE'
  | 'RESOLVED_BY_AI'
  | 'COMPLETED'
  | 'REQUESTED'
  | 'MODIFIED'
  | 'REJECTED'
  | 'OVERRIDDEN';

interface StatusBadgeProps {
  status: StatusBadgeType | string;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
  // Blue Professional Railway Operations Status Palette
  let barColor    = '#46A06A';
  let textColor   = '#46A06A';
  let bgColor     = 'rgba(70, 160, 106, 0.12)';
  let borderColor = 'rgba(70, 160, 106, 0.35)';
  let defaultLabel = 'Operational';

  switch (status) {
    case 'OPERATIONAL':
      barColor = '#46A06A'; textColor = '#46A06A'; bgColor = 'rgba(70, 160, 106, 0.12)'; borderColor = 'rgba(70, 160, 106, 0.35)';
      defaultLabel = label || 'Operational'; break;
    case 'APPROVED':
    case 'COMPLETED':
      barColor = '#46A06A'; textColor = '#46A06A'; bgColor = 'rgba(70, 160, 106, 0.12)'; borderColor = 'rgba(70, 160, 106, 0.35)';
      defaultLabel = label || (status === 'COMPLETED' ? 'Completed' : 'Approved'); break;
    case 'RESOLVED_BY_AI':
      barColor = '#46A06A'; textColor = '#46A06A'; bgColor = 'rgba(70, 160, 106, 0.12)'; borderColor = 'rgba(70, 160, 106, 0.35)';
      defaultLabel = label || 'AI Resolved'; break;
    case 'WARNING':
    case 'PENDING':
    case 'REQUESTED':
    case 'MODIFIED':
      barColor = '#D7A63A'; textColor = '#D7A63A'; bgColor = 'rgba(215, 166, 58, 0.12)'; borderColor = 'rgba(215, 166, 58, 0.35)';
      defaultLabel = label || (status === 'MODIFIED' ? 'Modified' : status === 'REQUESTED' ? 'Requested' : status === 'PENDING' ? 'Pending' : 'Warning'); break;
    case 'CRITICAL':
    case 'BLOCKED':
      barColor = '#D45555'; textColor = '#D45555'; bgColor = 'rgba(212, 85, 85, 0.12)'; borderColor = 'rgba(212, 85, 85, 0.35)';
      defaultLabel = label || (status === 'BLOCKED' ? 'Blocked' : 'Critical'); break;
    case 'ACTIVE':
      barColor = '#D45555'; textColor = '#D45555'; bgColor = 'rgba(212, 85, 85, 0.12)'; borderColor = 'rgba(212, 85, 85, 0.35)';
      defaultLabel = label || 'Active'; break;
    case 'REJECTED':
      barColor = '#D45555'; textColor = '#D45555'; bgColor = 'rgba(212, 85, 85, 0.12)'; borderColor = 'rgba(212, 85, 85, 0.35)';
      defaultLabel = label || 'Rejected'; break;
    case 'AI_RECOMMENDED':
      barColor = '#79B8E6'; textColor = '#79B8E6'; bgColor = 'rgba(59, 130, 196, 0.15)'; borderColor = 'rgba(59, 130, 196, 0.4)';
      defaultLabel = label || 'AI Rec'; break;
    case 'OVERRIDDEN':
      barColor = '#C96A45'; textColor = '#C96A45'; bgColor = 'rgba(201, 106, 69, 0.12)'; borderColor = 'rgba(201, 106, 69, 0.35)';
      defaultLabel = label || 'Overridden'; break;
    default:
      barColor = '#71879A'; textColor = '#A9BBCB'; bgColor = '#0D263D'; borderColor = '#29455D';
      defaultLabel = label || status;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border ${className}`}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderRadius: '3px',
        fontFamily: "'Inter', sans-serif",
        fontSize: '10.5px',
        fontWeight: 500,
        letterSpacing: '0.02em',
      }}
    >
      <span
        style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: barColor, display: 'inline-block', flexShrink: 0 }}
      />
      <span style={{ color: textColor }}>{label || defaultLabel}</span>
    </div>
  );
};
