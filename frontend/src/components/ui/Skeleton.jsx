import React from 'react';
import { twMerge } from 'tailwind-merge';

export default function Skeleton({ className }) {
  return (
    <div className={twMerge("animate-pulse bg-ethos-elevated rounded-md", className)} />
  );
}
