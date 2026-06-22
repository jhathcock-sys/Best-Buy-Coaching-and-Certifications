// @ts-nocheck
import React from 'react';
import { Trophy, Star, Activity, Monitor, Watch, Headphones, Smartphone, CreditCard, ShieldCheck } from 'lucide-react';

export default function TVHeader({ 
  currentTime,
  storeConfig,
  currentMetric,
  sortedRoster
 }) {
  return (
    <>
      {/* Fullscreen TV Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid rgba(255, 255, 255, 0.05)',
        paddingBottom: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            background: 'var(--bby-blue)', 
            color: '#fff', 
            padding: '0.4rem 1.2rem', 
            borderRadius: '8px', 
            fontWeight: 800, 
            fontSize: '1.3rem', 
            letterSpacing: '1px',
            border: '2px solid rgba(255,255,255,0.1)'
          }}>
            BEST BUY
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FloorVision Performance Board
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Active Period: <strong style={{ color: '#fff' }}>{activePeriod}</strong>
          </span>
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            border: '1px solid rgba(16, 185, 129, 0.25)', 
            padding: '0.5rem 1rem', 
            borderRadius: '30px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#34d399'
          }}>
            <span className="indicator-dot active" style={{ width: '8px', height: '8px', background: '#34d399', boxShadow: '0 0 8px #34d399' }} /> Live Cast Active
          </div>
        </div>
      </div>

      {/* Main Slide Carousel Area */}
    </>
  );
}
