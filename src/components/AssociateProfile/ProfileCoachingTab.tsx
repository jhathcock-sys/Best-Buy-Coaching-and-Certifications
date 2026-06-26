import React, { ReactNode, useState, useEffect } from 'react';
import { Volume2, Square, Clock, AlertCircle } from 'lucide-react';
import { CoachingLog } from '../../types';
import { formatMarkdownNotes } from '../../utils/profileUtils';

interface ProfileCoachingTabProps {
  associateLogs: CoachingLog[];
}

export default function ProfileCoachingTab({ 
  associateLogs,
 }: ProfileCoachingTabProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [playingLogId, setPlayingLogId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlayTTS = (logId: string, text: string) => {
    if (playingLogId === logId) {
      window.speechSynthesis.cancel();
      setPlayingLogId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[#*`_-]/g, ' ')
      .replace(/DISC Focus:/gi, ' DISC Focus step is ')
      .replace(/WHAT:/gi, ' What needs to be done: ')
      .replace(/HOW:/gi, ' How they should sell: ')
      .replace(/WHY:/gi, ' Why it matters: ');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setPlayingLogId(null);
    utterance.onerror = () => setPlayingLogId(null);
    setPlayingLogId(logId);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
            <div className="flex-column gap-md animate-fade-in" data-testid="profile-coaching-tab">
              {!associateLogs || associateLogs.length === 0 ? (
                <div className="text-center p-xl bg-white-alpha-05 rounded-xl border-glass">
                  <AlertCircle size={24} color="var(--text-muted)" className="mb-sm" />
                  <p className="text-sm text-muted m-0">
                    No coaching or shadowing logs recorded for this associate yet.
                  </p>
                </div>
              ) : (
                <div className="flex-column gap-sm">
                  {(associateLogs || []).map((log: CoachingLog) => {
                    const isExpanded = expandedLogId === log.id;
                    const isPlaying = playingLogId === log.id;

                    return (
                      <div 
                        key={log.id || log.timestamp}
                        className="glass-card-sm flex-column gap-sm"
                        data-testid="coaching-log-item"
                      >
                        <div className="flex-between flex-wrap gap-sm align-center">
                          <div className="flex-row align-center gap-sm">
                            <span 
                              className={`tag-pill text-xxs border-current ${log.category === 'Live Shadowing' ? 'bg-success-alpha-15 text-success' : 'bg-primary-alpha-15 text-primary'}`}
                            >
                              {log.category}
                            </span>
                            <span className="text-sm text-white font-semibold">
                              Score: {log.score}%
                            </span>
                          </div>
                          <span className="text-xs text-muted flex-row align-center gap-xs">
                            <Clock size={12} /> {log.date}
                          </span>
                        </div>

                        {/* Collapsed Preview vs Expanded Details */}
                        {!isExpanded ? (
                          <div className="flex-between align-center mt-xs">
                            <p className="text-xs text-secondary truncate max-w-80 m-0">
                              {log.notes || 'GROW log plan.'}
                            </p>
                            <button 
                              className="btn-link text-xs font-semibold cursor-pointer text-bby-blue bg-transparent border-none"
                              onClick={() => setExpandedLogId(log.id)}
                              data-testid="view-notes-btn"
                            >
                              View Notes
                            </button>
                          </div>
                        ) : (
                          <div className="mt-sm pt-sm border-top flex-column gap-sm">
                            {/* TTS buttons row */}
                            <div className="flex-between align-center">
                              <span className="text-xs text-muted">Coaching Plan Document</span>
                              <div className="flex-row gap-xs">
                                <button 
                                  className={`btn ${isPlaying ? 'btn-danger' : 'btn-secondary'} text-xxs flex-row align-center gap-xs px-sm py-xs cursor-pointer`}
                                  onClick={() => handlePlayTTS(log.id, log.notes)}
                                  data-testid="play-tts-btn"
                                >
                                  {isPlaying ? (
                                    <>
                                      <Square size={12} /> Stop Audio
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 size={12} /> Read aloud
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                            
                            <div className="bg-black-alpha-20 px-md py-sm rounded-xl border-glass overflow-x-auto">
                              {formatMarkdownNotes(log.notes)}
                            </div>

                            <button 
                              className="btn-link text-xs text-muted bg-transparent border-none cursor-pointer mt-xs align-self-end"
                              onClick={() => setExpandedLogId(null)}
                            >
                              Collapse Details
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
    </>
  );
}
