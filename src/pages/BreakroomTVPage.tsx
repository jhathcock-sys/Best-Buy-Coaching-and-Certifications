import React, { useState, useEffect, useMemo } from 'react';
import { Award, Trophy, Target, Star, Flame, MonitorPlay, TrendingUp, X } from 'lucide-react';

import { useStore } from '../store/useStore';

const EMPTY_OBJ = {};
const EMPTY_ARR: any[] = [];

import GoalsSlide from '../components/BreakroomTV/GoalsSlide';
import LeaderboardSlide from '../components/BreakroomTV/LeaderboardSlide';
import WinsSlide from '../components/BreakroomTV/WinsSlide';

export default function BreakroomTV({ onClose }: any) {
  const rawActivePeriod = useStore((state) => state.activePeriod);
  const activePeriod = rawActivePeriod || "Active Period";
  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;
  const _rawroster = rawActivePeriod ? (rosterHistory[rawActivePeriod] || EMPTY_OBJ) : EMPTY_OBJ;
  
  const roster: any[] = React.useMemo(() => Object.values(_rawroster).sort((a: any, b: any) => (a?.name || '').localeCompare(b?.name || '')), [_rawroster]);
  const recentSessions = useStore((state) => state.coachingLogs) || EMPTY_ARR;
  const deptGoals = useStore((state) => state.deptGoals) || EMPTY_OBJ;
  const apiKey = useStore((state) => state.apiKey);

  const [activeSlide, setActiveSlide] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 15000);
    
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(slideTimer);
      clearInterval(clockTimer);
    };
  }, []);

  const storeGoals = {
    revenue: { actual: 42500, goal: 50000 },
    pms: { actual: 18, goal: 20 },
    apps: { actual: 12, goal: 15 }
  };

  const topAdvisors = useMemo(() => {
    return [...roster]
      .sort((a, b) => ((b.memberships || 0) + (b.creditCards || 0)) - ((a.memberships || 0) + (a.creditCards || 0)))
      .slice(0, 3);
  }, [roster]);

  const recentWins = useMemo(() => {
    if (recentSessions.length > 0) {
      return recentSessions.slice(0, 4).map((s: any) => ({
        name: roster.find((r: any) => r.id === s.empId)?.name || 'Advisor',
        win: s.focus || 'Delivered an excellent customer experience',
        time: s.date
      }));
    }
    return [
      { name: "Sarah J.", win: "Logged 2 Total Memberships in 1 transaction!", time: "2 hours ago" },
      { name: "Michael R.", win: "Perfect 100% on Premium TV Roleplay", time: "3 hours ago" },
      { name: "David K.", win: "Secured a massive $4k Computing basket", time: "4 hours ago" }
    ];
  }, [recentSessions, roster]);

  if (!rawActivePeriod || Object.keys(_rawroster).length === 0) {
    return (
      <div className="flex-center" style={{ width: '100vw', height: '100vh', background: 'var(--bg-space)', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spin" style={{ fontSize: '3rem', color: 'var(--bby-blue)', marginBottom: '1rem' }}>+</div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-column" style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at center, #0d152b 0%, #060913 100%)',
      color: '#fff',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      padding: '3rem 4rem'
    }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(0, 70, 190, 0.12) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(253, 216, 53, 0.04) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      {onClose && (
        <button className="flex-center" style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'var(--white-alpha-10)', border: 'none', color: '#fff', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', zIndex: 100 }} onClick={onClose}>
          <X size={24} />
        </button>
      )}

      <div className="flex-between" style={{ alignItems: 'flex-start', zIndex: 10, borderBottom: '1px solid var(--white-alpha-10)', paddingBottom: '2rem' }}>
        <div>
          <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <MonitorPlay size={32} color="var(--bby-blue)" />
            <h1 style={{ fontSize: '2.5rem', margin: 0, letterSpacing: '0.02em', fontWeight: 800 }}>BlueCoach Kiosk</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', margin: 0 }}>
            {activePeriod} Performance Dashboard
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--bby-yellow)', lineHeight: 1 }}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="flex-column flex-center" style={{ flex: 1, zIndex: 10, position: 'relative' }}>
        {activeSlide === 0 && <GoalsSlide storeGoals={storeGoals} />}
        {activeSlide === 1 && <LeaderboardSlide topAdvisors={topAdvisors} />}
        {activeSlide === 2 && <WinsSlide recentWins={recentWins} />}
        <style>{`
          @keyframes slideInRight {
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(100px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>

      <div className="flex-center" style={{ gap: '1.5rem', marginTop: '2.5rem', zIndex: 10 }}>
        {[0, 1, 2].map((idx) => (
          <div 
            key={idx}
            style={{
              width: activeSlide === idx ? '80px' : '16px',
              height: '16px',
              borderRadius: '8px',
              background: activeSlide === idx ? 'var(--bby-blue)' : 'var(--white-alpha-20)',
              boxShadow: activeSlide === idx ? '0 0 15px rgba(0,70,190,0.8)' : undefined,
              transition: 'var(--transition-normal)'
            }}
          />
        ))}
      </div>
    </div>
  );
}
