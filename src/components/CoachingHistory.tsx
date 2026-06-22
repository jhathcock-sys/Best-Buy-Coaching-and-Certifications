import { useState, useEffect } from 'react';
import { Search, Trash2, Volume2, BookOpen, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function CoachingHistory() {
  const coachingLogs = useStore(state => state.coachingLogs) || [];
  const onDeleteLog = useStore(state => state.deleteCoachingLog);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Speech synthesis states
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isPausedSpeech, setIsPausedSpeech] = useState(false);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeech = (text) => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlayingSpeech) {
      if (isPausedSpeech) {
        window.speechSynthesis.resume();
        setIsPausedSpeech(false);
      } else {
        window.speechSynthesis.pause();
        setIsPausedSpeech(true);
      }
      return;
    }

    // Clean up markdown formatting for better reading
    const cleanText = text
      .replace(/## 📋 /g, '')
      .replace(/\* \*\*(.*?)\*\*/g, '$1')
      .replace(/---/g, '')
      .replace(/### 🔍 /g, '')
      .replace(/\*/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => {
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    };
    utterance.onerror = () => {
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    };

    setIsPlayingSpeech(true);
    setIsPausedSpeech(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSpeech(false);
    setIsPausedSpeech(false);
  };

  const filteredSessions = coachingLogs.filter(session => {
    const name = (session.employeeName || session.customerName || '').toLowerCase();
    const notes = (session.notes || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || notes.includes(searchTerm.toLowerCase());
    
    // Normalize category filters
    const cat = (session.category || '').toLowerCase();
    let matchesCategory = true;
    if (categoryFilter === 'Roleplay') {
      matchesCategory = cat.includes('roleplay') || cat.includes('consult');
    } else if (categoryFilter === 'Practice') {
      matchesCategory = cat.includes('practice') || cat.includes('grow');
    } else if (categoryFilter === 'Observation') {
      matchesCategory = cat.includes('observation') || cat.includes('floor');
    }
    
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (logToDelete, e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete this coaching log for ${logToDelete.employeeName || logToDelete.customerName}?`)) {
      const logId = logToDelete.id || logToDelete.timestamp;
      if (logId && onDeleteLog) {
        onDeleteLog(logId);
        if (selectedSession === logToDelete) {
          setSelectedSession(null);
          handleStopSpeech();
        }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Coaching History Hub</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review and manage archived coaching sessions, floor observations, and consulting roleplays.
        </p>
      </div>

      {/* Controls */}
      <div className="glass-card" style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {['All', 'Observation', 'Practice', 'Roleplay'].map(cat => (
            <button 
              key={cat} 
              className={`tag-pill ${categoryFilter === cat ? 'tag-pill-active' : ''}`}
              style={{ cursor: 'pointer', padding: '0.45rem 1rem', fontSize: '0.8rem' }}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'All' ? 'All Logs' : cat === 'Practice' ? 'GROW Practice' : cat === 'Roleplay' ? 'Consult Roleplays' : 'Floor Observations'}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '250px' }}>
          <input 
            type="text" 
            className="form-control" 
            style={{ paddingLeft: '2.5rem', paddingRight: '1rem', height: '38px', fontSize: '0.85rem' }}
            placeholder="Search by associate or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '11px', left: '0.85rem' }} />
        </div>
      </div>

      {/* History Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filteredSessions.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen size={32} color="var(--text-muted)" style={{ opacity: 0.5 }} />
            <p>No coaching logs match your active filters.</p>
          </div>
        ) : (
          filteredSessions.map((session, index) => (
            <div 
              key={index} 
              className="glass-card"
              style={{ 
                padding: '1.25rem', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
              onClick={() => {
                setSelectedSession(session);
                handleStopSpeech();
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--bby-blue)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-glass)';
              }}
            >
              <div>
                {/* Header: Avatar, Name, Score, Trash */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={session.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="" style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border-glass)' }} />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 }}>{session.employeeName || session.customerName}</h4>
                      <span className="tag-pill" style={{ 
                        fontSize: '0.65rem', 
                        padding: '0.15rem 0.45rem', 
                        marginTop: '0.2rem',
                        background: session.category?.includes('Observation') ? 'rgba(16, 185, 129, 0.08)' : session.category?.includes('Practice') ? 'rgba(0, 70, 190, 0.08)' : 'rgba(255, 230, 0, 0.08)',
                        color: session.category?.includes('Observation') ? 'var(--success)' : session.category?.includes('Practice') ? '#a5f3fc' : 'var(--bby-yellow)',
                        borderColor: 'transparent'
                      }}>
                        {session.category}
                      </span>
                      {session.coachName && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 500 }}>
                          Coach: {session.coachName}
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    className="btn btn-secondary btn-icon" 
                    style={{ padding: '0.35rem', minWidth: 'auto', height: 'auto', borderColor: 'transparent', background: 'transparent' }}
                    onClick={(e) => handleDelete(session, e)}
                  >
                    <Trash2 size={14} color="var(--error)" />
                  </button>
                </div>

                <p style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--text-muted)', 
                  lineHeight: 1.4, 
                  marginTop: '1rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {session.notes}
                </p>
              </div>

              {/* Footer: Date & Score Indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {session.date?.split(' ')[0]}</span>
                {session.score !== 100 && (
                  <span style={{ 
                    fontWeight: 700,
                    color: session.score >= 80 ? 'var(--success)' : 'var(--error)'
                  }}>Score: {session.score}%</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {selectedSession && (
        <div className="modal-overlay" onClick={() => setSelectedSession(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ border: '2.5px solid var(--bby-blue)', maxWidth: '650px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={selectedSession.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', fontFamily: 'var(--font-heading)', margin: 0 }}>
                    Coaching Review: {selectedSession.employeeName || selectedSession.customerName}
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {selectedSession.category} | {selectedSession.date} {selectedSession.coachName ? `| Coach: ${selectedSession.coachName}` : ''}
                  </span>
                </div>
              </div>
              <button 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }} 
                onClick={() => setSelectedSession(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '70vh', overflowY: 'auto' }}>
              <div 
                style={{ 
                  background: 'rgba(11, 15, 25, 0.7)', 
                  border: '1px solid var(--border-glass)',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {selectedSession.notes}
              </div>

              {/* Text-to-Speech controls */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem', 
                padding: '0.85rem 1rem', 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border-glass)', 
                borderRadius: '12px' 
              }}>
                <h4 style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Volume2 size={15} color="var(--bby-yellow)" /> Coaching Plan Reader (Text-to-Speech)
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button 
                    className={`btn ${isPlayingSpeech && !isPausedSpeech ? 'btn-secondary' : 'btn-accent'}`} 
                    style={{ flex: 1, padding: '0.4rem 0.8rem', fontSize: '0.75rem', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    onClick={() => handleSpeech(selectedSession.notes)}
                  >
                    <Volume2 size={13} /> {isPlayingSpeech ? (isPausedSpeech ? 'Resume' : 'Pause') : 'Read Plan Aloud'}
                  </button>
                  {isPlayingSpeech && (
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', height: 'auto' }}
                      onClick={handleStopSpeech}
                    >
                      Stop
                    </button>
                  )}
                </div>
                {isPlayingSpeech && (
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bby-yellow)', display: 'inline-block' }}></span>
                    <span>{isPausedSpeech ? 'Paused' : 'Currently speaking...'}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem' }} onClick={() => setSelectedSession(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
