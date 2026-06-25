import React from 'react';
import { Target } from 'lucide-react';

interface GoalsSlideProps {
  storeGoals: any;
}

export default function GoalsSlide({ storeGoals }: GoalsSlideProps) {
  return (
    <div className="slide-fade-in flex-column flex-center" style={{ animation: 'fadeIn 1s ease' }}>
      <h2 style={{ fontSize: '3.5rem', marginBottom: '4rem', color: '#fff', display: 'flex', alignItems: 'center' }}>
        <Target size={40} color="var(--bby-blue)" style={{ marginRight: '1rem' }} /> Daily Store Goals
      </h2>
      
      <div className="flex-center" style={{ gap: '4rem' }}>
        <div style={{ background: 'var(--white-alpha-05)', border: '1px solid var(--white-alpha-10)', borderRadius: '24px', padding: '3rem', width: '350px' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Memberships</h3>
          <div style={{ fontSize: '5rem', fontWeight: 800, margin: '1rem 0', color: storeGoals.pms.actual >= storeGoals.pms.goal ? 'var(--success)' : '#fff' }}>
            {storeGoals.pms.actual} <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>/ {storeGoals.pms.goal}</span>
          </div>
          <div style={{ background: 'var(--white-alpha-10)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ background: storeGoals.pms.actual >= storeGoals.pms.goal ? 'var(--success)' : 'var(--bby-blue)', width: `${Math.min(100, (storeGoals.pms.actual / storeGoals.pms.goal) * 100)}%`, height: '100%', transition: 'width 1s ease-in-out' }} />
          </div>
        </div>

        <div style={{ background: 'var(--white-alpha-05)', border: '1px solid var(--white-alpha-10)', borderRadius: '24px', padding: '3rem', width: '350px' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Credit Cards</h3>
          <div style={{ fontSize: '5rem', fontWeight: 800, margin: '1rem 0', color: storeGoals.apps.actual >= storeGoals.apps.goal ? 'var(--success)' : '#fff' }}>
            {storeGoals.apps.actual} <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>/ {storeGoals.apps.goal}</span>
          </div>
          <div style={{ background: 'var(--white-alpha-10)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ background: storeGoals.apps.actual >= storeGoals.apps.goal ? 'var(--success)' : 'var(--bby-yellow)', width: `${Math.min(100, (storeGoals.apps.actual / storeGoals.apps.goal) * 100)}%`, height: '100%', transition: 'width 1s ease-in-out' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
