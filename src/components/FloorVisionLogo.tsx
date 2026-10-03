import React from 'react';
import { Eye } from 'lucide-react';

interface FloorVisionLogoProps {
  className?: string;
  iconSize?: number;
}

export default function FloorVisionLogo({ className = '', iconSize = 28 }: FloorVisionLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Eye size={iconSize} className="text-bby-blue drop-shadow-md" />
      <span className="font-bold tracking-tight bg-slate-900 from-bby-blue text-transparent bg-clip-text drop-shadow-sm">
        FloorVision
      </span>
    </div>
  );
}
