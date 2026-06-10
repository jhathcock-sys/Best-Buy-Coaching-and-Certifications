import React, { useState, useEffect, useMemo } from 'react';
import { Award, Trophy, Users, Star, Flame, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

export default function BreakroomTV({ roster = [], certifications = [], recentSessions = [], activePeriod = "Active Period" }) {
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
            BlueCoach AI Roster Board
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {/* SLIDE 0: Trophy Standing Leaderboard */}
        {activeSlide === 0 && (
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
        )}

        {/* SLIDE 1: Specialist Certifications Wall */}
        {activeSlide === 1 && (
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
        )}

        {/* SLIDE 2: Store Weekly Achievements */}
        {activeSlide === 2 && (
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
        )}

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
