import React, { useState, useEffect, useMemo } from 'react';
import { Award, Trophy, Target, Star, Flame, MonitorPlay, TrendingUp, X } from 'lucide-react';

import { useStore } from '../store/useStore';
import { Employee, CoachingLog } from '../types';

import GoalsSlide from '../components/BreakroomTV/GoalsSlide';
import LeaderboardSlide from '../components/BreakroomTV/LeaderboardSlide';
import WinsSlide from '../components/BreakroomTV/WinsSlide';

import './BreakroomTVPage.css';

const EMPTY_OBJ = {};
const EMPTY_ARR: CoachingLog[] = [];

interface BreakroomTVProps {
  onClose?: () => void;
}

export interface StoreGoals {
  revenue: { actual: number; goal: number };
  pms: { actual: number; goal: number };
  apps: { actual: number; goal: number };
}

export interface RecentWin {
  name: string;
  win: string;
  time: string;
}

export default function BreakroomTV({ onClose }: BreakroomTVProps) {
  const rawActivePeriod = useStore((state) => state.activePeriod);
  const activePeriod = rawActivePeriod || "Active Period";
  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;
  const _rawroster = rawActivePeriod ? (rosterHistory[rawActivePeriod] || EMPTY_OBJ) : EMPTY_OBJ;
  
  const roster = React.useMemo(() => (Object.values(_rawroster) as Employee[]).sort((a, b) => (a?.name || '').localeCompare(b?.name || '')), [_rawroster]);
  const recentSessions = useStore((state) => state.coachingLogs) || EMPTY_ARR;

  // REMOVED: unused deptGoals and apiKey selectors per Tech Debt Analyst VETO

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

  const storeGoals: StoreGoals = {
    revenue: { actual: 42500, goal: 50000 },
    pms: { actual: 18, goal: 20 },
    apps: { actual: 12, goal: 15 }
  };

  const topAdvisors = useMemo(() => {
    return [...roster]
      .sort((a, b) => ((b?.memberships || 0) + (b?.creditCards || 0)) - ((a?.memberships || 0) + (a?.creditCards || 0)))
      .slice(0, 3);
  }, [roster]);

  const recentWins = useMemo(() => {
    if (recentSessions?.length > 0) {
      return recentSessions.slice(0, 4).map((s) => ({
        name: roster.find((r) => r?.id === s?.employeeId)?.name || 'Advisor',
        win: s?.category || 'Delivered an excellent customer experience',
        time: s?.date || 'Recently'
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
      <div className="flex-center bg-space text-white breakroom-fullscreen" data-testid="breakroom-loading">
        <div className="text-center">
          <div className="animate-spin text-bby-blue mb-md text-3xl">+</div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-column text-white breakroom-fullscreen breakroom-bg" data-testid="breakroom-tv-container">
      <div className="breakroom-glow-blue" />
      <div className="breakroom-glow-yellow" />

      {onClose && (
        <button data-testid="close-breakroom-tv-btn" className="flex-center cursor-pointer border-none text-white transition-normal breakroom-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      )}

      <div className="flex-between align-start breakroom-header">
        <div>
          <div className="flex-center justify-start gap-sm mb-sm">
            <MonitorPlay size={32} color="var(--bby-blue)" />
            <h1 className="m-0 tracking-tight font-bold text-3xl">BlueCoach Kiosk</h1>
          </div>
          <p className="text-secondary m-0 text-xl">
            {activePeriod} Performance Dashboard
          </p>
        </div>
        <div className="text-right">
          <div className="text-bby-yellow font-bold text-3xl leading-none">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-muted mt-sm font-semibold text-xl">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="flex-column flex-center breakroom-content">
        {activeSlide === 0 && <GoalsSlide storeGoals={storeGoals} />}
        {activeSlide === 1 && <LeaderboardSlide topAdvisors={topAdvisors} />}
        {activeSlide === 2 && <WinsSlide recentWins={recentWins} />}
      </div>

      <div className="flex-center gap-lg mt-xl z-10">
        {[0, 1, 2].map((idx) => (
          <div 
            key={idx}
            className={`breakroom-dot ${activeSlide === idx ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
