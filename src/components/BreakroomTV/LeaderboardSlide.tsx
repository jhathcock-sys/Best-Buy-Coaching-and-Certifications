import React from 'react';
import { Trophy } from 'lucide-react';

interface LeaderboardSlideProps {
  topAdvisors: any[];
}

export default function LeaderboardSlide({ topAdvisors }: LeaderboardSlideProps) {
  return (
    <div className="slide-fade-in flex-column flex-center" style={{ animation: 'fadeIn 1s ease' }}>
      <h2 style={{ fontSize: '3.5rem', marginBottom: '4rem', color: '#fff', display: 'flex', alignItems: 'center' }}>
        <Trophy size={40} color="var(--bby-yellow)" style={{ marginRight: '1rem' }} /> Store Top 3 Champions
      </h2>
      
      <div className="flex-center" style={{ alignItems: 'flex-end', gap: '2rem', height: '400px' }}>
        
        {/* Rank 2 */}
        {topAdvisors[1] && (
          <div className="flex-column align-center" style={{ animation: 'slideUp 0.8s ease' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>{topAdvisors[1].name}</div>
            <div className="flex-column align-center" style={{ background: 'linear-gradient(to top, rgba(192,192,192,0.1), rgba(192,192,192,0.3))', width: '200px', height: '250px', borderRadius: '16px 16px 0 0', justifyContent: 'flex-start', paddingTop: '2rem', border: '1px solid rgba(192,192,192,0.5)', borderBottom: 'none' }}>
              <div style={{ fontSize: '4rem', fontWeight: 800, color: 'silver' }}>2</div>
              <div style={{ marginTop: 'auto', marginBottom: '2rem', fontSize: '2rem', fontWeight: 800 }}>{((topAdvisors[1].memberships || 0) + (topAdvisors[1].creditCards || 0))} Wins</div>
            </div>
          </div>
        )}

        {/* Rank 1 */}
        {topAdvisors[0] && (
          <div className="flex-column align-center" style={{ animation: 'slideUp 1s ease' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--bby-yellow)', marginBottom: '1rem' }}>{topAdvisors[0].name}</div>
            <div className="flex-column align-center" style={{ background: 'linear-gradient(to top, rgba(255,215,0,0.15), rgba(255,215,0,0.4))', width: '220px', height: '320px', borderRadius: '16px 16px 0 0', justifyContent: 'flex-start', paddingTop: '2rem', border: '2px solid rgba(255,215,0,0.6)', borderBottom: 'none', boxShadow: '0 0 40px rgba(255,215,0,0.2)' }}>
              <div style={{ fontSize: '5rem', fontWeight: 800, color: 'gold' }}>1</div>
              <div style={{ marginTop: 'auto', marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 800 }}>{((topAdvisors[0].memberships || 0) + (topAdvisors[0].creditCards || 0))} Wins</div>
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {topAdvisors[2] && (
          <div className="flex-column align-center" style={{ animation: 'slideUp 0.6s ease' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: '#cd7f32' }}>{topAdvisors[2].name}</div>
            <div className="flex-column align-center" style={{ background: 'linear-gradient(to top, rgba(205,127,50,0.1), rgba(205,127,50,0.3))', width: '200px', height: '200px', borderRadius: '16px 16px 0 0', justifyContent: 'flex-start', paddingTop: '2rem', border: '1px solid rgba(205,127,50,0.5)', borderBottom: 'none' }}>
              <div style={{ fontSize: '4rem', fontWeight: 800, color: '#cd7f32' }}>3</div>
              <div style={{ marginTop: 'auto', marginBottom: '2rem', fontSize: '2rem', fontWeight: 800 }}>{((topAdvisors[2].memberships || 0) + (topAdvisors[2].creditCards || 0))} Wins</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
