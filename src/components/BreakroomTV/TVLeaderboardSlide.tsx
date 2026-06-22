import React from 'react';
import { Trophy, Star, Activity, Monitor, Watch, Headphones, Smartphone, CreditCard, ShieldCheck } from 'lucide-react';

export default function TVLeaderboardSlide({ 
  currentTime,
  storeConfig,
  currentMetric,
  sortedRoster,
  topAdvisors
 }) {
  return (
    <>
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Trophy size={36} color="var(--bby-yellow)" /> Store Sales Leaderboard Standing
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '-1rem', marginBottom: '2rem' }}>
              Celebrating the store's top consultative sales advisors by membership volume.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topAdvisors.map((emp, index) => (
                <div 
                  key={emp.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: index === 0 ? '2px solid rgba(253, 216, 53, 0.3)' : '1px solid var(--border-glass)',
                    boxShadow: index === 0 ? '0 8px 32px rgba(253, 216, 53, 0.04)' : undefined,
                    padding: '1.5rem 2.5rem',
                    borderRadius: '20px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    {/* Rank Circle */}
                    <div style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      background: index === 0 ? 'var(--bby-yellow)' : index === 1 ? '#e2e8f0' : index === 2 ? '#cd7f32' : 'rgba(255,255,255,0.05)',
                      color: index < 3 ? '#000' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.3rem'
                    }}>
                      {index + 1}
                    </div>
                    
                    <div>
                      <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>{emp.name}</span>
                      <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginLeft: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                        {emp.dept}
                      </span>
                    </div>
                  </div>

                  {/* Performance stats row */}
                  <div style={{ display: 'flex', gap: '3.5rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--bby-blue)' }}>{emp.memberships}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Memberships</div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--bby-yellow)' }}>{emp.creditCards}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>BBY Cards</div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>{emp.warranty}%</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>GSP Attach</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
    </>
  );
}
