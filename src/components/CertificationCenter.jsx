import React, { useState } from 'react';
import { Award, Shield, Laptop, Tv, Home, Compass, UserCheck, Star, X, Download, Printer } from 'lucide-react';

export default function CertificationCenter({ certifications, onNavigate, onStartRoleplay }) {
  const [selectedCert, setSelectedCert] = useState(null);

  const getIcon = (certId, color = 'var(--text-muted)') => {
    switch (certId) {
      case 'computing':
        return <Laptop size={32} style={{ color }} />;
      case 'home-theater':
        return <Tv size={32} style={{ color }} />;
      case 'geek-squad':
        return <Shield size={32} style={{ color }} />;
      case 'membership':
        return <Compass size={32} style={{ color }} />;
      default:
        return <Award size={32} style={{ color }} />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Best Buy Certification Hub</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Validate your expertise, unlock dynamic floor-badges, and earn official training certificates by demonstrating core consultative competencies.</p>
      </div>

      {/* Grid of Certifications */}
      <div className="badge-container">
        {certifications.map(cert => (
          <div 
            key={cert.id} 
            className={`glass-card badge-card ${cert.earned ? 'earned' : ''}`}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1.5rem',
              borderLeft: cert.earned ? '4px solid var(--bby-yellow)' : '1px solid var(--border-glass)'
            }}
          >
            <div style={{ display: 'flex', gap: '1.25rem', width: '100%' }}>
              <div className="badge-icon-wrapper">
                {getIcon(cert.id, cert.earned ? 'var(--bby-yellow)' : 'var(--text-muted)')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="badge-title" style={{ color: cert.earned ? '#fff' : 'var(--text-secondary)' }}>{cert.title}</h3>
                  {cert.earned && <Award size={18} color="var(--bby-yellow)" fill="var(--bby-yellow)" />}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{cert.category}</p>
                <p className="badge-desc">{cert.description}</p>
              </div>
            </div>

            <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge-status">
                  {cert.earned ? 'CERTIFIED' : 'INCOMPLETE'}
                </span>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Req: {cert.requirement}
                </p>
              </div>

              {cert.earned ? (
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  onClick={() => setSelectedCert(cert)}
                >
                  View Certificate
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  onClick={() => {
                    // Navigate directly to roleplay simulation matching this cert requirement
                    if (onStartRoleplay) {
                      onStartRoleplay(cert.scenarioId);
                    }
                  }}
                >
                  Take Exam
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Coaching Info Banner */}
      <div className="glass-card" style={{ background: 'rgba(0, 70, 190, 0.05)', borderColor: 'rgba(0, 70, 190, 0.15)', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ background: 'rgba(0, 70, 190, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
          <Star size={32} color="var(--bby-yellow)" fill="var(--bby-yellow)" />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>How Certifications Work</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Certifications are awarded automatically once you pass the designated customer roleplay simulation with a score of **80% or higher**. Your evaluation score is calculated based on how completely you execute the 5 stages of the Best Buy Consultative Sales Flow and hit key credit card and membership touchpoints.
          </p>
        </div>
      </div>

      {/* 4. PREMIUM CERTIFICATE MODAL VIEW */}
      {selectedCert && (
        <div className="modal-overlay" onClick={() => setSelectedCert(null)}>
          <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award color="var(--bby-yellow)" fill="var(--bby-yellow)" size={20} /> Certificate Viewer
              </h3>
              <button className="btn btn-secondary btn-icon" style={{ padding: '0.4rem' }} onClick={() => setSelectedCert(null)}>
                <X size={16} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '2.5rem' }}>
              <div className="certificate-frame">
                {/* Visual Blue Wave Graphics */}
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--bby-yellow)', fontWeight: 800, marginBottom: '0.5rem' }}>
                  BEST BUY ACADEMY
                </div>
                
                <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
                  CERTIFICATE OF EXPERTISE
                </h2>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                  This official document validates that the advisor
                </p>
                
                <h3 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--bby-yellow)', margin: '1rem 0' }}>
                  BlueCoach Sales Professional
                </h3>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                  has successfully demonstrated complete mastery in the sales flow, technical criteria, and service attachments of
                </p>
                
                <h4 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#fff', margin: '0.5rem 0 2rem 0' }}>
                  {selectedCert.title.toUpperCase()}
                </h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', width: '80%', margin: '0 auto' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>BlueCoach AI</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Coaching Partner Signature</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Validated Floor Leader</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Best Buy Store Signature</div>
                  </div>
                </div>

                {selectedCert.signature && (
                  <div style={{ marginTop: '1.5rem', fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'monospace', opacity: 0.7, wordBreak: 'break-all', padding: '0 2rem' }}>
                    Google Cloud Secure Key: {selectedCert.signature} • Verified: {selectedCert.verifiedAt}
                  </div>
                )}

                <div className="cert-seal">
                  BEST BUY<br />CERTIFIED
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handlePrint}>
                <Printer size={16} /> Print / Save PDF
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedCert(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
