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
      >
        <LayoutDashboard size={20} />
        <span>Dash</span>
      </button>
      <button 
        className={`bottom-nav-item ${activeView === 'roster' ? 'active' : ''}`}
        onClick={() => setActiveView('roster')}
      >
        <ClipboardList size={20} />
        <span>Roster</span>
      </button>
      <button 
        className={`bottom-nav-item ${activeView === 'shadow' ? 'active' : ''}`}
        onClick={() => setActiveView('shadow')}
      >
        <ShieldCheck size={20} />
        <span>Shadow</span>
      </button>
      <button 
        className={`bottom-nav-item ${activeView === 'floorLeader' ? 'active' : ''}`}
        onClick={() => setActiveView('floorLeader')}
      >
        <Clock size={20} />
        <span>Floor Lead</span>
      </button>
      <button 
        className={`bottom-nav-item ${activeView === 'roleplay' ? 'active' : ''}`}
        onClick={() => setActiveView('roleplay')}
      >
        <Compass size={20} />
        <span>Arena</span>
      </button>
      <button 
        className={`bottom-nav-item ${activeView === 'coach' || activeView === 'builder' ? 'active' : ''}`}
        onClick={() => setActiveView('coach')}
      >
        <Users size={20} />
        <span>Coach</span>
      </button>
      <button 
        className={`bottom-nav-item ${activeView === 'history' ? 'active' : ''}`}
        onClick={() => setActiveView('history')}
      >
        <Archive size={20} />
        <span>History</span>
      </button>
    </div>
  );
}
