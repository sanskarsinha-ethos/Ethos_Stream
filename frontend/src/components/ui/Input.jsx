import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = forwardRef(({ className, label, error, helperText, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-ethos-muted mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={twMerge(clsx(
          "flex h-10 w-full rounded-md bg-ethos-elevated border border-ethos-border px-3 py-2 text-sm text-ethos-white placeholder:text-ethos-muted focus:outline-none focus:ring-2 focus:ring-ethos-teal focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          error && "border-ethos-danger focus:ring-ethos-danger",
          className
        ))}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-ethos-danger">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-ethos-muted">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
