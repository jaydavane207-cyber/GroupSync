import React from 'react';
import Badge from './Badge';

export const StatusBadge = ({ status = 'active' }) => {
  const map = {
    active: { label: 'Active', variant: 'success' },
    recruiting: { label: 'Recruiting', variant: 'primary' },
    pending: { label: 'Pending', variant: 'warning' },
    completed: { label: 'Completed', variant: 'default' },
    closed: { label: 'Closed', variant: 'danger' },
  };

  const current = map[status.toLowerCase()] || { label: status, variant: 'default' };

  return <Badge variant={current.variant}>{current.label}</Badge>;
};

export default StatusBadge;
