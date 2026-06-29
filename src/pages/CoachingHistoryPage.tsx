import React, { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, Volume2, BookOpen, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CoachingLog } from '../types';
import { calculateCoachingImpact } from '../utils/coachingImpact';

const EMPTY_ARR: CoachingLog[] = [];

export default function CoachingHistory() {
  const coachingLogs = useStore(state => state.coachingLogs) || EMPTY_ARR;
  const rawDailySnapshots = useStore(state => state.dailySnapshots);
  const onDeleteLog = useStore(state => state.deleteCoachingLog);
  const [searchTerm, setSearchTerm] = useState('');

  const dailySnapshots = useMemo(() => {
    if (!rawDailySnapshots) return [];
    return Object.keys(rawDailySnapshots).map(date => ({
      date,
      employees: rawDailySnapshots[date]
    }));
  }, [rawDailySnapshots]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedSession, setSelectedSession] = useState<CoachingLog | null>(null);
  
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

  const handleSpeech = (text: string) => {
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

  const filteredSessions = useMemo(() => {
    return coachingLogs.filter(session => {
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
  }, [coachingLogs, searchTerm, categoryFilter]);

  const handleDelete = (logToDelete: CoachingLog, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete this coaching log for ${logToDelete.employeeName || logToDelete.customerName}?`)) {
      const logId = logToDelete.id || logToDelete.timestamp.toString();
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
    <div className="flex-column gap-2xl">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-xs">Coaching History Hub</h1>
        <p className="text-secondary">
          Review and manage archived coaching sessions, floor observations, and consulting roleplays.
        </p>
      </div>

      {/* Controls */}
      <div className="glass-card glass-card-compact flex-between flex-wrap gap-lg">
        <div className="flex-row gap-xs flex-wrap">
          {['All', 'Observation', 'Practice', 'Roleplay'].map(cat => (
            <button 
              key={cat} 
              data-testid={`category-filter-${cat.toLowerCase()}`}
              className={`tag-pill cursor-pointer px-md py-sm text-sm ${categoryFilter === cat ? 'tag-pill-active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'All' ? 'All Logs' : cat === 'Practice' ? 'GROW Practice' : cat === 'Roleplay' ? 'Consult Roleplays' : 'Floor Observations'}
            </button>
          ))}
        </div>

        <div className="relative w-250px">
          <input 
            type="text" 
            data-testid="search-input"
            className="form-control search-input text-sm"
            placeholder="Search by associate or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} color="var(--text-muted)" className="search-icon-pos" />
        </div>
      </div>

      {/* History Grid */}
      <div className="history-grid">
        {filteredSessions.length === 0 ? (
          <div className="glass-card grid-col-full p-3rem text-center text-secondary flex-column align-center gap-sm">
            <BookOpen size={32} color="var(--text-muted)" className="opacity-50" />
            <p>No coaching logs match your active filters.</p>
          </div>
        ) : (
          filteredSessions.map((session, index) => {
            const impact = calculateCoachingImpact(session.employeeId, session.date, dailySnapshots);
            
            return (
            <div 
              key={index} 
              data-testid={`session-card-${index}`}
              className="glass-card session-card cursor-pointer"
              onClick={() => {
                setSelectedSession(session);
                handleStopSpeech();
              }}
            >
              <div>
                {/* Header: Avatar, Name, Score, Trash */}
                <div className="flex-between align-start gap-sm">
                  <div className="flex-row align-center gap-sm">
                    <img src={session.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="" className="avatar-sm border-glass" />
                    <div>
                      <h4 className="text-base font-bold text-white m-0">{session.employeeName || session.customerName}</h4>
                      <span className={`tag-pill tag-mini ${session.category?.includes('Observation') ? 'tag-obs' : session.category?.includes('Practice') ? 'tag-prac' : 'tag-role'}`}>
                        {session.category}
                      </span>
                      {session.coachName && (
                        <div className="text-xxs text-muted mt-0-2rem font-medium">
                          Coach: {session.coachName}
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    data-testid={`delete-session-btn-${index}`}
                    className="btn btn-secondary btn-icon btn-icon-transparent cursor-pointer"
                    onClick={(e) => handleDelete(session, e)}
                  >
                    <Trash2 size={14} color="var(--error)" />
                  </button>
                </div>

                <p className="session-notes">
                  {session.notes}
                </p>
              </div>

              {/* Footer: Date & Score Indicator */}
              <div className="session-footer">
                <span className="flex-row align-center gap-xs"><Clock size={12} /> {session.date?.split(' ')[0]}</span>
                
                {impact === 'HIGH_IMPACT' && (
                  <span className="tag-pill tag-mini text-success" style={{ backgroundColor: 'var(--success-glow)', border: '1px solid var(--success)' }}>
                    High Impact 🟢
                  </span>
                )}
                {impact === 'NEEDS_FOLLOW_UP' && (
                  <span className="tag-pill tag-mini text-error" style={{ backgroundColor: 'var(--error-glow)', border: '1px solid var(--error)' }}>
                    Needs Follow Up 🔴
                  </span>
                )}
                {impact === 'NEUTRAL' && (
                  <span className="tag-pill tag-mini text-muted border-glass">
                    Neutral Impact ⚪
                  </span>
                )}
                {impact === 'PENDING' && (
                  <span className="tag-pill tag-mini text-muted border-glass">
                    Impact Pending ⏳
                  </span>
                )}

                {session.score !== 100 && (
                  <span className={`font-bold ${session.score >= 80 ? 'text-success' : 'text-error'}`}>
                    Score: {session.score}%
                  </span>
                )}
              </div>
            </div>
          )})
        )}
      </div>

      {/* Details Modal */}
      {selectedSession && (
        <div className="modal-overlay cursor-pointer" onClick={() => setSelectedSession(null)}>
          <div className="modal-content modal-border-bby cursor-auto" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex-row align-center gap-sm">
                <img src={selectedSession.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="" className="avatar-sm" />
                <div>
                  <h3 className="text-1-15rem text-white font-heading m-0">
                    Coaching Review: {selectedSession.employeeName || selectedSession.customerName}
                  </h3>
                  <span className="text-0-7rem text-muted">
                    {selectedSession.category} | {selectedSession.date} {selectedSession.coachName ? `| Coach: ${selectedSession.coachName}` : ''}
                  </span>
                </div>
              </div>
              <button 
                data-testid="modal-close-icon"
                className="btn-close-transparent cursor-pointer" 
                onClick={() => setSelectedSession(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body modal-body-scroll">
              <div className="notes-code-block">
                {selectedSession.notes}
              </div>

              {/* Text-to-Speech controls */}
              <div className="tts-controls-container">
                <h4 className="text-0-825rem text-secondary flex-row align-center gap-sm m-0">
                  <Volume2 size={15} color="var(--bby-yellow)" /> Coaching Plan Reader (Text-to-Speech)
                </h4>
                <div className="flex-row gap-sm mt-xs">
                  <button 
                    data-testid="tts-play-btn"
                    className={`btn btn-tts cursor-pointer ${isPlayingSpeech && !isPausedSpeech ? 'btn-secondary' : 'btn-accent'}`} 
                    onClick={() => handleSpeech(selectedSession.notes)}
                  >
                    <Volume2 size={13} /> {isPlayingSpeech ? (isPausedSpeech ? 'Resume' : 'Pause') : 'Read Plan Aloud'}
                  </button>
                  {isPlayingSpeech && (
                    <button 
                      data-testid="tts-stop-btn"
                      className="btn btn-secondary btn-tts-stop cursor-pointer" 
                      onClick={handleStopSpeech}
                    >
                      Stop
                    </button>
                  )}
                </div>
                {isPlayingSpeech && (
                  <div className="tts-status">
                    <span className="pulse-dot pulse-dot-mini"></span>
                    <span>{isPausedSpeech ? 'Paused' : 'Currently speaking...'}</span>
                  </div>
                )}
              </div>

              <div className="flex-end">
                <button 
                  data-testid="modal-close-btn"
                  className="btn btn-secondary btn-close-modal cursor-pointer" 
                  onClick={() => setSelectedSession(null)}
                >
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
