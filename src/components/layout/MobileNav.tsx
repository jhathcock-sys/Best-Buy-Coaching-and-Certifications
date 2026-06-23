import React from 'react';
import { 
  LayoutDashboard, ClipboardList, ShieldCheck, 
  Clock, Compass, Users, Archive 
} from 'lucide-react';

interface MobileNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function MobileNav({ activeView, setActiveView }: MobileNavProps) {
  return (
    <div className="bottom-nav">
      <button 
        className={`bottom-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveView('dashboard')}
        data-testid="mobile-nav-dashboard"
      >
        <LayoutDashboard size={20} />
        <span>Dash</span>
      </button>
      <button 
        className={`bottom-nav-item ${activeView === 'roster' ? 'active' : ''}`}
        onClick={() => setActiveView('roster')}
        data-testid="mobile-nav-roster"
      >
        <ClipboardList size={20} />
        <span>Roster</span>
      </button>
      <button 
        className={`bottom-nav-item ${activeView === 'shadow' ? 'active' : ''}`}
        onClick={() => setActiveView('shadow')}
        data-testid="mobile-nav-shadow"
      >
        <ShieldCheck size={20} />
        <span>Shadow</span>
      </button>
      <button 
        className={`bottom-nav-item ${activeView === 'floorLeader' ? 'active' : ''}`}
        onClick={() => setActiveView('floorLeader')}
        data-testid="mobile-nav-floor-leader"
      >
        <Clock size={20} />
        <span>Floor Lead</span>
      </button>
      <button 
        className={`bottom-nav-item ${activeView === 'roleplay' ? 'active' : ''}`}
        onClick={() => setActiveView('roleplay')}
        data-testid="mobile-nav-roleplay"
      >
        <Compass size={20} />
        <span>Arena</span>
      </button>
      <button 
        className={`bottom-nav-item ${activeView === 'coach' || activeView === 'builder' ? 'active' : ''}`}
        onClick={() => setActiveView('coach')}
        data-testid="mobile-nav-coach"
      >
        <Users size={20} />
        <span>Coach</span>
      </button>
      <button 
        className={`bottom-nav-item ${activeView === 'history' ? 'active' : ''}`}
        onClick={() => setActiveView('history')}
        data-testid="mobile-nav-history"
      >
        <Archive size={20} />
        <span>History</span>
      </button>
    </div>
  );
}
