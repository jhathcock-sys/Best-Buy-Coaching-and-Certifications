import React from 'react';
import { Trophy, Star, Activity, Monitor, Watch, Headphones, Smartphone, CreditCard, ShieldCheck, Flame, Sparkles, TrendingUp, Users } from 'lucide-react';

export default function TVAchievementsSlide({ 
  currentTime,
  storeConfig,
  currentMetric,
  sortedRoster,
  achievements
 }) {
  return (
    <>
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Flame size={36} color="#ef4444" style={{ filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.5))' }} /> Store Weekly Achievements
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '-1rem', marginBottom: '3rem' }}>
              Active logs, developmental progress, and collective performance totals this week.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
              
              {/* Card 1: Shadows */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,70,190,0.1) 0%, rgba(6,9,19,0.4) 100%)',
                border: '1.5px solid var(--bby-blue)',
                padding: '2.5rem 2rem',
                borderRadius: '24px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0, 70, 190, 0.05)'
              }}>
                <Trophy size={40} color="var(--bby-blue)" style={{ margin: '0 auto 1.5rem auto' }} />
                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>{achievements.totalShadows}</div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sim Practice Sessions</h3>
              </div>

              {/* Card 2: Memberships */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(253,216,53,0.06) 0%, rgba(6,9,19,0.4) 100%)',
                border: '1.5px solid var(--bby-yellow)',
                padding: '2.5rem 2rem',
                borderRadius: '24px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(253, 216, 53, 0.02)'
              }}>
                <Sparkles size={40} color="var(--bby-yellow)" style={{ margin: '0 auto 1.5rem auto' }} />
                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>{achievements.totalMemberships}</div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Memberships Logged</h3>
              </div>

              {/* Card 3: GSP Avg */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,9,19,0.4) 100%)',
                border: '1.5px solid #10b981',
                padding: '2.5rem 2rem',
                borderRadius: '24px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.03)'
              }}>
                <TrendingUp size={40} color="#10b981" style={{ margin: '0 auto 1.5rem auto' }} />
                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>{achievements.avgWarranty}%</div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Average GSP Attach</h3>
              </div>

              {/* Card 4: Hours */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(6,9,19,0.4) 100%)',
                border: '1.5px solid #a855f7',
                padding: '2.5rem 2rem',
                borderRadius: '24px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(168, 85, 247, 0.03)'
              }}>
                <Users size={40} color="#a855f7" style={{ margin: '0 auto 1.5rem auto' }} />
                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>{achievements.totalHours}</div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Store Coaching Hours</h3>
              </div>

            </div>
          </div>
    </>
  );
}
