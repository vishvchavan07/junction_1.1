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
  // Muted industrial railway status palette
  let barColor    = '#4D8B68';
  let textColor   = '#4D8B68';
  let bgColor     = '#EDF5F0';
  let borderColor = '#96C4AE';
  let defaultLabel = 'Operational';

  switch (status) {
    case 'OPERATIONAL':
      barColor = '#4D8B68'; textColor = '#4D8B68'; bgColor = '#EDF5F0'; borderColor = '#96C4AE';
      defaultLabel = label || 'Operational'; break;
    case 'APPROVED':
    case 'COMPLETED':
      barColor = '#4D8B68'; textColor = '#4D8B68'; bgColor = '#EDF5F0'; borderColor = '#96C4AE';
      defaultLabel = label || (status === 'COMPLETED' ? 'Completed' : 'Approved'); break;
    case 'RESOLVED_BY_AI':
      barColor = '#4D8B68'; textColor = '#4D8B68'; bgColor = '#EDF5F0'; borderColor = '#96C4AE';
      defaultLabel = label || 'AI Resolved'; break;
    case 'WARNING':
    case 'PENDING':
    case 'REQUESTED':
    case 'MODIFIED':
      barColor = '#D49A32'; textColor = '#C4891F'; bgColor = '#FBF5E6'; borderColor = '#E0BF7A';
      defaultLabel = label || (status === 'MODIFIED' ? 'Modified' : status === 'REQUESTED' ? 'Requested' : status === 'PENDING' ? 'Pending' : 'Warning'); break;
    case 'CRITICAL':
    case 'BLOCKED':
      barColor = '#C84B43'; textColor = '#C84B43'; bgColor = '#F9EEEE'; borderColor = '#DCA09C';
      defaultLabel = label || (status === 'BLOCKED' ? 'Blocked' : 'Critical'); break;
    case 'ACTIVE':
      barColor = '#C84B43'; textColor = '#C84B43'; bgColor = '#F9EEEE'; borderColor = '#DCA09C';
      defaultLabel = label || 'Active'; break;
    case 'REJECTED':
      barColor = '#C84B43'; textColor = '#C84B43'; bgColor = '#F9EEEE'; borderColor = '#DCA09C';
      defaultLabel = label || 'Rejected'; break;
    case 'AI_RECOMMENDED':
      barColor = '#1E3A5F'; textColor = '#1E3A5F'; bgColor = '#EEF2F8'; borderColor = '#B0C4DC';
      defaultLabel = label || 'AI Rec'; break;
    case 'OVERRIDDEN':
      barColor = '#A9674B'; textColor = '#A9674B'; bgColor = '#F5EDE8'; borderColor = '#C4957E';
      defaultLabel = label || 'Overridden'; break;
    default:
      barColor = '#77736C'; textColor = '#4B4A46'; bgColor = '#F0ECE4'; borderColor = '#D5CEC1';
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
