import React, { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, Volume2, BookOpen, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { SkeletonList } from '../components/ui/Skeleton';
import { CoachingLog } from '../types';
import { calculateCoachingImpact } from '../utils/coachingImpact';
import CoachingSessionCard from '../components/CoachingHistory/CoachingSessionCard';
import CoachingDetailsModal from '../components/CoachingHistory/CoachingDetailsModal';

const EMPTY_ARR: CoachingLog[] = [];

export default function CoachingHistory() {
  const coachingLogs = useStore(state => state.coachingLogs);
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
    return (coachingLogs || EMPTY_ARR).filter(session => {
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

  if (!coachingLogs) {
    return (
      <div className="flex-column gap-2xl">
        <div>
          <h1 className="text-3xl mb-xs">Coaching History Hub</h1>
          <p className="text-secondary">
            Review and manage archived coaching sessions, floor observations, and consulting roleplays.
          </p>
        </div>
        <div className="glass-card p-3rem flex-column gap-md">
          <SkeletonList count={3} />
        </div>
      </div>
    );
  }

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
              <CoachingSessionCard
                key={index}
                index={index}
                session={session}
                impact={impact}
                onSelect={(s) => {
                  setSelectedSession(s);
                  handleStopSpeech();
                }}
                onDelete={handleDelete}
              />
            );
          })
        )}
      </div>

      {/* Details Modal */}
      {selectedSession && (
        <CoachingDetailsModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          isPlayingSpeech={isPlayingSpeech}
          isPausedSpeech={isPausedSpeech}
          onSpeechPlay={handleSpeech}
          onSpeechStop={handleStopSpeech}
        />
      )}

    </div>
  );
}
