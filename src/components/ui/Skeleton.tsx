import React from 'react';
import './Skeleton.css';

export const Skeleton = ({ width, height, borderRadius = '8px', className = '' }) => {
  return (
    <div 
      className={`skeleton-loader ${className}`} 
      style={{ width, height, borderRadius }} 
    />
  );
};

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <Skeleton width="40%" height="24px" className="mb-md" />
    <Skeleton width="100%" height="40px" className="mb-sm" />
    <Skeleton width="80%" height="16px" />
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Skeleton width="40px" height="40px" borderRadius="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Skeleton width="30%" height="16px" />
          <Skeleton width="70%" height="12px" />
        </div>
      </div>
    ))}
  </div>
);
