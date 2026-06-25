import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ethos-bg disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-ethos-teal text-ethos-bg hover:bg-[#00c9b3] focus:ring-ethos-teal',
    ghost: 'bg-transparent text-ethos-teal hover:bg-ethos-teal-dim focus:ring-ethos-teal border border-transparent hover:border-ethos-teal',
    danger: 'bg-ethos-danger text-white hover:bg-red-600 focus:ring-ethos-danger',
    amber: 'bg-ethos-amber text-ethos-bg hover:bg-yellow-500 focus:ring-ethos-amber',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-8 text-lg',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
