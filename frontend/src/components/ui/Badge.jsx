import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Badge({ children, variant = 'teal', className }) {
  const variants = {
    teal: 'bg-ethos-teal-dim text-ethos-teal border border-ethos-teal/20',
    amber: 'bg-ethos-amber-dim text-ethos-amber border border-ethos-amber/20',
    muted: 'bg-ethos-elevated text-ethos-muted border border-ethos-border',
    danger: 'bg-red-500/10 text-ethos-danger border border-red-500/20',
  };

  return (
    <span className={twMerge(clsx("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", variants[variant], className))}>
      {children}
    </span>
  );
}
