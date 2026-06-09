import React, { useMemo } from 'react';
import { Award, TrendingUp, Compass, ShieldCheck, CreditCard, Star, DollarSign, ArrowUpRight, MessageSquare, Play } from 'lucide-react';

export default function Dashboard({ metrics, certifications, recentSessions, onNavigate }) {
  // Circular Gauge Helper
  const CircularGauge = ({ value, max = 100, label, suffix = "%", color, icon: Icon, description }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="glass-card metric-card">
        <div className="metric-circle-container">
          <svg className="metric-svg">
            <circle className="metric-circle-bg" cx="55" cy="55" r={radius} />
            <circle 
              className="metric-circle-fill" 
              cx="55" 
              cy="55" 
              r={radius} 
              stroke={color}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="metric-val">
            {value}{suffix}
          </div>
        </div>
        <div className="metric-label">{label}</div>
        <div className="metric-sub">{description}</div>
        <Icon style={{ color: color, position: 'absolute', top: '1rem', right: '1rem', opacity: 0.15, width: 24, height: 24 }} />
      </div>
    );
  };

  // Get active suggestions based on metric thresholds
  const suggestions = useMemo(() => {
    const list = [];
    if (metrics.memberships < 60) {
      list.push({
        id: 1,
        type: 'warning',
        text: 'Membership attach rate is currently 52% (Goal: 65%). Practice pitching My Best Buy Total early in discovery.',
        actionLabel: 'Total Support Roleplay',
        navTarget: 'roleplay'
      });
    }
    if (metrics.warranty < 15) {
      list.push({
        id: 2,
        type: 'info',
        text: 'Geek Squad Protection attach rate is 12% (Goal: 18%). Try the OLED TV setup scenario to practice warranty attach.',
        actionLabel: 'HT OLED Roleplay',
        navTarget: 'roleplay'
      });
    }
    if (metrics.surveys < 4.8) {
      list.push({
        id: 3,
        type: 'warning',
        text: 'Customer 5-Star Survey Index is 4.7. Try building stronger rapport at the beginning of interactions.',
        actionLabel: 'Connect Training',
        navTarget: 'roleplay'
      });
    }
    if (list.length === 0) {
      list.push({
        id: 0,
        type: 'success',
        text: 'All core sales metrics are currently meeting or exceeding store goals. Excellent job maintaining Best Buy standards!',
        actionLabel: 'Take HT Exam',
        navTarget: 'certification'
      });
    }
    return list;
  }, [metrics]);

  const activeCerts = useMemo(() => {
    return certifications.filter(c => c.earned).length;
  }, [certifications]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Advisor Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, Advisor. Here is your current sales performance and coaching checklist.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => onNavigate('playbook')}>
            <TrendingUp size={16} /> Playbook Studio
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('roleplay')}>
            <Play size={16} fill="white" /> Start Practice
          </button>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="metrics-grid">
        <CircularGauge 
          value={metrics.memberships} 
          label="Membership Attach" 
          suffix="%"
          color="var(--bby-blue)" 
          icon={Compass} 
          description="Plus & Total Memberships"
        />
        <div className="glass-card metric-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(255, 230, 0, 0.08)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', border: '1px solid rgba(255, 230, 0, 0.2)' }}>
            <CreditCard size={32} color="var(--bby-yellow)" />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>{metrics.creditCards}</div>
          <div className="metric-label" style={{ marginTop: '0.25rem' }}>BBY Credit Cards</div>
          <div className="metric-sub">Submitted Applications</div>
        </div>
        <CircularGauge 
          value={metrics.warranty} 
          label="Protection Attach" 
          suffix="%"
          color="var(--success)" 
          icon={ShieldCheck} 
          description="Geek Squad Protection"
        />
        <CircularGauge 
          value={metrics.surveys} 
          max={5}
          label="5-Star Surveys" 
          suffix="/5"
          color="var(--info)" 
          icon={Star} 
          description="Customer Survey Index"
        />
        <div className="glass-card metric-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <DollarSign size={32} color="var(--info)" />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>${metrics.rph}</div>
          <div className="metric-label" style={{ marginTop: '0.25rem' }}>RPH</div>
          <div className="metric-sub">Revenue Per Hour (Goal: $1,200)</div>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Certifications & Suggestions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Coaching Recommendations */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--bby-yellow)" /> Smart Co-Coach Recommendations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {suggestions.map(s => (
                <div 
                  key={s.id} 
                  style={{ 
                    padding: '1.25rem', 
                    borderRadius: '12px', 
                    background: s.type === 'warning' ? 'var(--warning-glow)' : s.type === 'success' ? 'var(--success-glow)' : 'var(--info-glow)', 
                    border: `1.5px solid ${s.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' : s.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <p style={{ fontSize: '0.9rem', color: s.type === 'warning' ? '#fde047' : s.type === 'success' ? '#a7f3d0' : '#a5f3fc', lineHeight: 1.5 }}>
                    {s.text}
                  </p>
                  <button 
                    className="btn btn-secondary" 
                    style={{ alignSelf: 'flex-start', padding: '0.4rem 0.85rem', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                    onClick={() => onNavigate(s.navTarget)}
                  >
                    {s.actionLabel} <ArrowUpRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="var(--bby-blue)" /> Certification Status
              </h3>
              <span className="tag-pill tag-pill-active">{activeCerts} of {certifications.length} Earned</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {certifications.slice(0, 3).map(cert => (
                <div 
                  key={cert.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1rem', 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    border: '1px solid var(--border-glass)',
                    borderRadius: '12px' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      padding: '0.5rem', 
                      borderRadius: '8px', 
                      background: cert.earned ? 'rgba(255, 230, 0, 0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${cert.earned ? 'rgba(255,230,0,0.3)' : 'var(--border-glass)'}`
                    }}>
                      <Award size={20} color={cert.earned ? 'var(--bby-yellow)' : 'var(--text-muted)'} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>{cert.title}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cert.category}</p>
                    </div>
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: cert.earned ? 'var(--bby-yellow)' : 'var(--text-muted)' 
                  }}>
                    {cert.earned ? 'EARNED' : 'LOCKED'}
                  </span>
                </div>
              ))}
              <button className="btn btn-secondary" style={{ width: '100%', padding: '0.65rem' }} onClick={() => onNavigate('certification')}>
                View Certification Center
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Sessions Log */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} color="var(--info)" /> Recent Coaching & Roleplay Sessions
          </h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentSessions.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <MessageSquare size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.95rem' }}>No roleplays completed yet.</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Start your first training customer simulation to see metrics and feedback logs.</p>
              </div>
            ) : (
              recentSessions.map((session, index) => (
                <div 
                  key={index} 
                  style={{ 
                    padding: '1rem', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--border-glass)', 
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={session.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                      <h4 style={{ fontSize: '0.9rem' }}>{session.customerName}</h4>
                    </div>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 700, 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '6px', 
                      background: session.score >= 80 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: session.score >= 80 ? 'var(--success)' : 'var(--error)'
                    }}>
                      Score: {session.score}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Category: {session.category}</span>
                    <span>{session.date}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                    "{session.notes.substring(0, 100)}..."
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
