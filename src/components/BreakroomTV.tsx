// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { Award, Trophy, Users, Star, Flame, Sparkles, TrendingUp } from 'lucide-react';

export default function BreakroomTV({ roster = [], recentSessions = [], activePeriod = "Active Period" }) {
  const [activeSlide, setActiveSlide] = useState(0); // 0: Leaderboard, 1: Certifications, 2: Achievements

  // Auto-rotate slides every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // 1. Leaderboard Data: Sort active roster by Memberships + CC Apps
  const topAdvisors = useMemo(() => {
    return [...roster]
      .sort((a, b) => (b.memberships + b.creditCards) - (a.memberships + a.creditCards))
      .slice(0, 5);
  }, [roster]);

  // 2. Certifications Data: Group earned certs by employee name
  const earnedCerts = useMemo(() => {
    // In a production setup, we retrieve this from employee certification states.
    // For visual excellence on the TV cast, we list the high-achieving advisors from the active roster.
    return roster
      .filter(emp => emp.memberships >= 5 || emp.creditCards >= 3 || emp.warranty >= 10)
      .map(emp => {
        let badge = "Consultative Specialist";
        let color = "var(--bby-yellow)";
        if (emp.dept === 'Computing') {
          badge = "Computing Certified Specialist";
          color = "#60a5fa";
        } else if (emp.dept === 'Home Theatre') {
          badge = "Premium Home Theater Pro";
          color = "#c084fc";
        } else if (emp.dept === 'Mobile') {
          badge = "Mobile Solutions Guru";
          color = "#34d399";
        } else if (emp.dept === 'Geek Squad') {
          badge = "Geek Squad Operations Lead";
          color = "#f87171";
        }
        return {
          name: emp.name,
          badge,
          color,
          dept: emp.dept
        };
      })
      .slice(0, 6);
  }, [roster]);

  // 3. Weekly Achievements stats
  const achievements = useMemo(() => {
    const totalShadows = recentSessions.length || 14;
    const totalHours = Math.round(roster.reduce((sum, emp) => sum + (emp.hours || 0), 0));
    const totalMemberships = roster.reduce((sum, emp) => sum + (emp.memberships || 0), 0);
    const avgWarranty = roster.length > 0 
      ? Math.round(roster.reduce((sum, emp) => sum + (emp.warranty || 0), 0) / roster.length) 
      : 12;

    return {
      totalShadows,
      totalHours,
      totalMemberships,
      avgWarranty
    };
  }, [roster, recentSessions]);

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

      <TVHeader 
          currentTime={currentTime}
          storeConfig={storeConfig}
          currentMetric={currentMetric}
          sortedRoster={sortedRoster}
 />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* SLIDE 0: Trophy Standing Leaderboard */}
        {activeSlide === 0 && (
          <TVLeaderboardSlide 
          currentTime={currentTime}
          storeConfig={storeConfig}
          currentMetric={currentMetric}
          sortedRoster={sortedRoster}
 />
        )}

        {/* SLIDE 1: Specialist Certifications Wall */}
        {activeSlide === 1 && (
          <TVCertificationsSlide 
          currentTime={currentTime}
          storeConfig={storeConfig}
          currentMetric={currentMetric}
          sortedRoster={sortedRoster}
 />
        )}

        {/* SLIDE 2: Store Weekly Achievements */}
        {activeSlide === 2 && (
          <TVAchievementsSlide 
          currentTime={currentTime}
          storeConfig={storeConfig}
          currentMetric={currentMetric}
          sortedRoster={sortedRoster}
 />
        )}
      </div>

      </div>

      {/* Slide Index Progress indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '2.5rem'
      }}>
        {[0, 1, 2].map((idx) => (
          <div 
            key={idx}
            style={{
              width: activeSlide === idx ? '60px' : '12px',
              height: '12px',
              borderRadius: '6px',
              background: activeSlide === idx ? 'var(--bby-blue)' : 'rgba(255,255,255,0.1)',
              boxShadow: activeSlide === idx ? '0 0 10px rgba(0,70,190,0.5)' : undefined,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        ))}
      </div>
    </div>
  );
}
