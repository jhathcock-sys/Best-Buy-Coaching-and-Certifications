import React from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  width: string | number;
  height: string | number;
  borderRadius?: string | number;
  className?: string;
  'data-testid'?: string;
}

export const Skeleton = ({ width, height, borderRadius = '8px', className = '', 'data-testid': testId }: SkeletonProps) => {
  return (
    <div 
      className={`skeleton-loader ${className}`} 
      style={{ width, height, borderRadius }} 
      data-testid={testId || 'skeleton-loader'}
    />
  );
};

export interface SkeletonCardProps {
  'data-testid'?: string;
}

export const SkeletonCard = ({ 'data-testid': testId }: SkeletonCardProps = {}) => (
  <div className="skeleton-card" data-testid={testId || 'skeleton-card'}>
    <Skeleton width="40%" height="24px" className="mb-md" />
    <Skeleton width="100%" height="40px" className="mb-sm" />
    <Skeleton width="80%" height="16px" />
  </div>
);

export interface SkeletonListProps {
  count?: number;
  'data-testid'?: string;
}

export const SkeletonList = ({ count = 3, 'data-testid': testId }: SkeletonListProps) => (
  <div className="flex-column gap-md" data-testid={testId || 'skeleton-list'}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={`skeleton-item-${i}`} className="flex-row align-center gap-md" data-testid={`${testId || 'skeleton-list'}-item-${i}`}>
        <Skeleton width="40px" height="40px" borderRadius="50%" />
        <div className="flex-1 flex-column gap-sm">
          <Skeleton width="30%" height="16px" />
          <Skeleton width="70%" height="12px" />
        </div>
      </div>
    ))}
  </div>
);
