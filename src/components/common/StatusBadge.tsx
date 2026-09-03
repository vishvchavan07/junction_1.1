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
  // White Professional Railway Operations Status Palette
  let barColor    = '#16A34A';
  let textColor   = '#15803D';
  let bgColor     = '#F0FDF4';
  let borderColor = '#BBF7D0';
  let defaultLabel = 'Operational';

  switch (status) {
    case 'OPERATIONAL':
      barColor = '#16A34A'; textColor = '#15803D'; bgColor = '#F0FDF4'; borderColor = '#BBF7D0';
      defaultLabel = label || 'Operational'; break;
    case 'APPROVED':
    case 'COMPLETED':
      barColor = '#16A34A'; textColor = '#15803D'; bgColor = '#F0FDF4'; borderColor = '#BBF7D0';
      defaultLabel = label || (status === 'COMPLETED' ? 'Completed' : 'Approved'); break;
    case 'RESOLVED_BY_AI':
      barColor = '#16A34A'; textColor = '#15803D'; bgColor = '#F0FDF4'; borderColor = '#BBF7D0';
      defaultLabel = label || 'AI Resolved'; break;
    case 'WARNING':
    case 'PENDING':
    case 'REQUESTED':
    case 'MODIFIED':
      barColor = '#D97706'; textColor = '#B45309'; bgColor = '#FFFBEB'; borderColor = '#FDE68A';
      defaultLabel = label || (status === 'MODIFIED' ? 'Modified' : status === 'REQUESTED' ? 'Requested' : status === 'PENDING' ? 'Pending' : 'Warning'); break;
    case 'CRITICAL':
    case 'BLOCKED':
      barColor = '#DC2626'; textColor = '#B91C1C'; bgColor = '#FEF2F2'; borderColor = '#FECACA';
      defaultLabel = label || (status === 'BLOCKED' ? 'Blocked' : 'Critical'); break;
    case 'ACTIVE':
      barColor = '#DC2626'; textColor = '#B91C1C'; bgColor = '#FEF2F2'; borderColor = '#FECACA';
      defaultLabel = label || 'Active'; break;
    case 'REJECTED':
      barColor = '#DC2626'; textColor = '#B91C1C'; bgColor = '#FEF2F2'; borderColor = '#FECACA';
      defaultLabel = label || 'Rejected'; break;
    case 'AI_RECOMMENDED':
      barColor = '#2563EB'; textColor = '#1D4ED8'; bgColor = '#EFF6FF'; borderColor = '#BFDBFE';
      defaultLabel = label || 'AI Rec'; break;
    case 'OVERRIDDEN':
      barColor = '#EA580C'; textColor = '#C2410C'; bgColor = '#FFF7ED'; borderColor = '#FED7AA';
      defaultLabel = label || 'Overridden'; break;
    default:
      barColor = '#64748B'; textColor = '#475569'; bgColor = '#F8FAFC'; borderColor = '#E2E8F0';
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
        fontWeight: 600,
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
