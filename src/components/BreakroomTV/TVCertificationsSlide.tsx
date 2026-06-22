// @ts-nocheck
import React from 'react';
import { Trophy, Star, Activity, Monitor, Watch, Headphones, Smartphone, CreditCard, ShieldCheck } from 'lucide-react';

export default function TVCertificationsSlide({ 
  currentTime,
  storeConfig,
  currentMetric,
  sortedRoster
 }) {
  return (
    <>
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Award size={36} color="var(--info)" /> Specialist Certifications Wall
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '-1rem', marginBottom: '2.5rem' }}>
              Celebrating employee skills development and unlocked certifications.
            </p>

            {earnedCerts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem',
                border: '2px dashed var(--border-glass)',
                borderRadius: '24px',
                color: 'var(--text-muted)'
              }}>
                <Sparkles size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p style={{ fontSize: '1.3rem' }}>Unlock specialist badges through consultative simulators today!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {earnedCerts.map((cert, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid var(--border-glass)`,
                      borderLeft: `5px solid ${cert.color}`,
                      borderRadius: '16px',
                      padding: '1.5rem 2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 15px rgba(255,255,255,0.02)`
                    }}>
                      <Star size={30} color={cert.color} fill={cert.color} />
                    </div>
                    
                    <div>
                      <h4 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#fff' }}>{cert.name}</h4>
                      <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>{cert.badge}</p>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                        Dept: {cert.dept}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
    </>
  );
}
