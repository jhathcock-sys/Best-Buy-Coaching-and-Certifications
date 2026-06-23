import React from 'react';

interface GlassCardTemplateProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export default function GlassCardTemplate({ title, children, icon, className = '' }: GlassCardTemplateProps) {
  return (
    <div className={`glass-card rounded-xl p-md ${className}`} style={{ border: '1px solid var(--border-glass)' }}>
      <div className="flex-row align-center gap-sm mb-sm">
        {icon && <div className="text-bby-yellow">{icon}</div>}
        <h3 className="text-lg" style={{ fontFamily: 'var(--font-heading)', color: '#fff', margin: 0 }}>
          {title}
        </h3>
      </div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </div>
    </div>
  );
}
