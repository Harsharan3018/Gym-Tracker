import React from 'react';

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    inactive: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    suspended: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    checkedIn: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
    checkedOut: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
    paid: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    info: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    default: 'bg-slate-700/50 text-slate-300 border border-slate-600/50',
  };

  const normalized = (typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '') : '') || variant;
  const badgeClass = variants[normalized] || variants[variant] || variants.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
      {children}
    </span>
  );
};

export default Badge;

