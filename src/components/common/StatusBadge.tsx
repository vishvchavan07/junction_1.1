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
  let barColor  = '#15803D';   // restrained signal green
  let textColor = '#15803D';
  let bgColor   = '#F0FDF4';
  let borderColor = '#BBF7D0';
  let defaultLabel = 'OPR';

  switch (status) {
    case 'OPERATIONAL':
      barColor = '#15803D'; textColor = '#15803D'; bgColor = '#F0FDF4'; borderColor = '#BBF7D0';
      defaultLabel = label || 'OPR'; break;
    case 'APPROVED':
    case 'COMPLETED':
      barColor = '#15803D'; textColor = '#15803D'; bgColor = '#F0FDF4'; borderColor = '#BBF7D0';
      defaultLabel = label || (status === 'COMPLETED' ? 'COMPLETED' : 'APPROVED'); break;
    case 'RESOLVED_BY_AI':
      barColor = '#15803D'; textColor = '#15803D'; bgColor = '#F0FDF4'; borderColor = '#BBF7D0';
      defaultLabel = label || 'AI RESOLVED'; break;
    case 'WARNING':
    case 'PENDING':
    case 'REQUESTED':
    case 'MODIFIED':
      barColor = '#B45309'; textColor = '#B45309'; bgColor = '#FFFBEB'; borderColor = '#FDE68A';
      defaultLabel = label || (status === 'MODIFIED' ? 'MODIFIED' : status === 'REQUESTED' ? 'REQUESTED' : status === 'PENDING' ? 'PENDING' : 'WARNING'); break;
    case 'CRITICAL':
    case 'BLOCKED':
      barColor = '#B91C1C'; textColor = '#B91C1C'; bgColor = '#FEF2F2'; borderColor = '#FECACA';
      defaultLabel = label || (status === 'BLOCKED' ? 'BLOCKED' : 'CRITICAL'); break;
    case 'ACTIVE':
      barColor = '#B91C1C'; textColor = '#B91C1C'; bgColor = '#FEF2F2'; borderColor = '#FECACA';
      defaultLabel = label || 'ACTIVE'; break;
    case 'REJECTED':
      barColor = '#B91C1C'; textColor = '#B91C1C'; bgColor = '#FEF2F2'; borderColor = '#FECACA';
      defaultLabel = label || 'REJECTED'; break;
    case 'AI_RECOMMENDED':
      barColor = '#1E3A5F'; textColor = '#1E3A5F'; bgColor = '#EFF6FF'; borderColor = '#BFDBFE';
      defaultLabel = label || 'AI REC'; break;
    case 'OVERRIDDEN':
      barColor = '#785D3F'; textColor = '#785D3F'; bgColor = '#F7F3EE'; borderColor = '#E5DFD5';
      defaultLabel = label || 'OVERRIDDEN'; break;
    default:
      barColor = '#615A4F'; textColor = '#615A4F'; bgColor = '#F0EBE1'; borderColor = '#D8D1C5';
      defaultLabel = label || status;
  }

  return (
    <div
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider border rounded-[2px] ${className}`}
      style={{ backgroundColor: bgColor, borderColor: borderColor }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0"
        style={{ backgroundColor: barColor }}
      />
      <span style={{ color: textColor }}>{label || defaultLabel}</span>
    </div>
  );
};
