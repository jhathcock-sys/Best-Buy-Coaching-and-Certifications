import React, { useState, useEffect, useMemo } from 'react';
import { Award, Trophy, Target, Star, Flame, MonitorPlay, TrendingUp, X } from 'lucide-react';

import { useStore } from '../store/useStore';

const EMPTY_OBJ = {};
const EMPTY_ARR: any[] = [];

export default function BreakroomTV({ onClose }: any) {
  const activePeriod = useStore((state) => state.activePeriod) || "Active Period";
  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;
  const _rawroster = rosterHistory[activePeriod] || EMPTY_OBJ;
  const roster = React.useMemo(() => Object.values(_rawroster).sort((a: any, b: any) => a.name.localeCompare(b.name)), [_rawroster]);
  const recentSessions = useStore((state) => state.coachingLogs) || EMPTY_ARR;
  const deptGoals = useStore((state) => state.deptGoals) || EMPTY_OBJ;
  const apiKey = useStore((state) => state.apiKey);
  const [activeSlide, setActiveSlide] = useState(0); // 0: Store Goals, 1: Top 3 Leaderboard, 2: Recent Wins
  const [currentTime, setCurrentTime] = useState(new Date());

  // Auto-rotate slides every 15 seconds
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

  // 1. Store Goals Dummy Data (Since we don't have store-level globals yet)
  const storeGoals = {
    revenue: { actual: 42500, goal: 50000 },
    pms: { actual: 18, goal: 20 },
    apps: { actual: 12, goal: 15 }
  };

  // 2. Leaderboard Data: Sort active roster by Memberships + CC Apps
  const topAdvisors = useMemo(() => {
    return [...roster]
      .sort((a, b) => ((b.memberships || 0) + (b.creditCards || 0)) - ((a.memberships || 0) + (a.creditCards || 0)))
      .slice(0, 3);
  }, [roster]);

  // 3. Recent Wins (Simulated from recent sessions or hardcoded if empty)
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

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at center, #0d152b 0%, #060913 100%)',
      color: '#fff',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      padding: '3rem 4rem'
    }}>
      {/* Background decorative glow elements */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(0, 70, 190, 0.12) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(253, 216, 53, 0.04) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      {/* Exit Button */}
      {onClose && (
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10000, color: '#fff' }}
        >
          <X size={24} />
        </button>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <MonitorPlay size={32} color="var(--bby-blue)" />
            <h1 style={{ fontSize: '2.5rem', margin: 0, fontFamily: 'var(--font-heading)', letterSpacing: '0.02em', fontWeight: 800 }}>BlueCoach Kiosk</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', margin: 0 }}>
            {activePeriod} Performance Dashboard
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--bby-yellow)', lineHeight: 1 }}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Main Slide Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, position: 'relative' }}>
        
        {/* SLIDE 0: Store Goals vs Actuals */}
        {activeSlide === 0 && (
          <div className="slide-fade-in" style={{ textAlign: 'center', animation: 'fadeIn 1s ease' }}>
            <h2 style={{ fontSize: '3.5rem', marginBottom: '4rem', color: '#fff' }}><Target size={40} color="var(--bby-blue)" style={{ marginRight: '1rem', verticalAlign: 'middle' }}/> Daily Store Goals</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem' }}>
              
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '3rem', width: '350px' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Memberships</h3>
                <div style={{ fontSize: '5rem', fontWeight: 800, margin: '1rem 0', color: storeGoals.pms.actual >= storeGoals.pms.goal ? 'var(--success)' : '#fff' }}>
                  {storeGoals.pms.actual} <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>/ {storeGoals.pms.goal}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ background: storeGoals.pms.actual >= storeGoals.pms.goal ? 'var(--success)' : 'var(--bby-blue)', width: `${Math.min(100, (storeGoals.pms.actual / storeGoals.pms.goal) * 100)}%`, height: '100%', transition: 'width 1s ease-in-out' }} />
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '3rem', width: '350px' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Credit Cards</h3>
                <div style={{ fontSize: '5rem', fontWeight: 800, margin: '1rem 0', color: storeGoals.apps.actual >= storeGoals.apps.goal ? 'var(--success)' : '#fff' }}>
                  {storeGoals.apps.actual} <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>/ {storeGoals.apps.goal}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ background: storeGoals.apps.actual >= storeGoals.apps.goal ? 'var(--success)' : 'var(--bby-yellow)', width: `${Math.min(100, (storeGoals.apps.actual / storeGoals.apps.goal) * 100)}%`, height: '100%', transition: 'width 1s ease-in-out' }} />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SLIDE 1: Top 3 Leaderboard */}
        {activeSlide === 1 && (
          <div className="slide-fade-in" style={{ textAlign: 'center', animation: 'fadeIn 1s ease' }}>
            <h2 style={{ fontSize: '3.5rem', marginBottom: '4rem', color: '#fff' }}><Trophy size={40} color="var(--bby-yellow)" style={{ marginRight: '1rem', verticalAlign: 'middle' }}/> Store Top 3 Champions</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '2rem', height: '400px' }}>
              
              {/* Rank 2 */}
              {topAdvisors[1] && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideUp 0.8s ease' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>{topAdvisors[1].name}</div>
                  <div style={{ background: 'linear-gradient(to top, rgba(192,192,192,0.1), rgba(192,192,192,0.3))', width: '200px', height: '250px', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', paddingTop: '2rem', border: '1px solid rgba(192,192,192,0.5)', borderBottom: 'none' }}>
                    <div style={{ fontSize: '4rem', fontWeight: 800, color: 'silver' }}>2</div>
                    <div style={{ marginTop: 'auto', marginBottom: '2rem', fontSize: '2rem', fontWeight: 800 }}>{((topAdvisors[1].memberships || 0) + (topAdvisors[1].creditCards || 0))} Wins</div>
                  </div>
                </div>
              )}

              {/* Rank 1 */}
              {topAdvisors[0] && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideUp 1s ease' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--bby-yellow)', marginBottom: '1rem' }}>{topAdvisors[0].name}</div>
                  <div style={{ background: 'linear-gradient(to top, rgba(255,215,0,0.15), rgba(255,215,0,0.4))', width: '220px', height: '320px', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', paddingTop: '2rem', border: '2px solid rgba(255,215,0,0.6)', borderBottom: 'none', boxShadow: '0 0 40px rgba(255,215,0,0.2)' }}>
                    <div style={{ fontSize: '5rem', fontWeight: 800, color: 'gold' }}>1</div>
                    <div style={{ marginTop: 'auto', marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 800 }}>{((topAdvisors[0].memberships || 0) + (topAdvisors[0].creditCards || 0))} Wins</div>
                  </div>
                </div>
              )}

              {/* Rank 3 */}
              {topAdvisors[2] && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideUp 0.6s ease' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: '#cd7f32' }}>{topAdvisors[2].name}</div>
                  <div style={{ background: 'linear-gradient(to top, rgba(205,127,50,0.1), rgba(205,127,50,0.3))', width: '200px', height: '200px', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', paddingTop: '2rem', border: '1px solid rgba(205,127,50,0.5)', borderBottom: 'none' }}>
                    <div style={{ fontSize: '4rem', fontWeight: 800, color: '#cd7f32' }}>3</div>
                    <div style={{ marginTop: 'auto', marginBottom: '2rem', fontSize: '2rem', fontWeight: 800 }}>{((topAdvisors[2].memberships || 0) + (topAdvisors[2].creditCards || 0))} Wins</div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* SLIDE 2: Recent Wins / Feed */}
        {activeSlide === 2 && (
          <div className="slide-fade-in" style={{ animation: 'fadeIn 1s ease', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '3.5rem', marginBottom: '3rem', color: '#fff', textAlign: 'center' }}><Flame size={40} color="var(--error)" style={{ marginRight: '1rem', verticalAlign: 'middle' }}/> Floor Wins Feed</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {recentWins.map((win: any, idx: number) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', animation: `slideInRight ${0.4 + idx * 0.2}s ease forwards`, opacity: 0, transform: 'translateX(50px)' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bby-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800 }}>
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
            <style>{`
              @keyframes slideInRight {
                to { opacity: 1; transform: translateX(0); }
              }
              @keyframes slideUp {
                from { opacity: 0; transform: translateY(100px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        )}
      </div>

      {/* Slide Index Progress indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem',
        marginTop: '2.5rem',
        zIndex: 10
      }}>
        {[0, 1, 2].map((idx) => (
          <div 
            key={idx}
            style={{
              width: activeSlide === idx ? '80px' : '16px',
              height: '16px',
              borderRadius: '8px',
              background: activeSlide === idx ? 'var(--bby-blue)' : 'rgba(255,255,255,0.2)',
              boxShadow: activeSlide === idx ? '0 0 15px rgba(0,70,190,0.8)' : undefined,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        ))}
      </div>
    </div>
  );
}
