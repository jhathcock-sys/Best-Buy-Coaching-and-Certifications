import React from 'react';
import { Flame } from 'lucide-react';

interface WinsSlideProps {
  recentWins: any[];
}

export default function WinsSlide({ recentWins }: WinsSlideProps) {
  return (
    <div className="slide-fade-in" style={{ animation: 'fadeIn 1s ease', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '3.5rem', marginBottom: '3rem', color: '#fff', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Flame size={40} color="var(--error)" style={{ marginRight: '1rem' }} /> Floor Wins Feed
      </h2>
      
      <div className="flex-column" style={{ gap: '1.5rem' }}>
        {recentWins.map((win: any, idx: number) => (
          <div key={idx} className="flex-center" style={{ justifyContent: 'flex-start', background: 'var(--white-alpha-05)', border: '1px solid var(--white-alpha-10)', borderRadius: '16px', padding: '2rem', gap: '2rem', animation: `slideInRight ${0.4 + idx * 0.2}s ease forwards`, opacity: 0, transform: 'translateX(50px)' }}>
            <div className="flex-center" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bby-blue)', fontSize: '2rem', fontWeight: 800 }}>
              {win.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: 'var(--bby-yellow)' }}>{win.name}</h3>
              <p style={{ fontSize: '1.5rem', margin: 0, color: '#fff' }}>"{win.win}"</p>
            </div>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
              {win.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
