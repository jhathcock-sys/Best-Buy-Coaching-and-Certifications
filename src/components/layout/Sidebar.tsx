import React from 'react';
import { 
  Compass, Users, BookOpen, LayoutDashboard, Sparkles, 
  ShieldCheck, ClipboardList, Archive, Clock, 
  ChevronDown, ChevronRight, TrendingUp, MonitorPlay, CalendarDays, Radar
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  activeManager: any;
  logout: () => void;
  toggleCategory: (category: string) => void;
  collapsedCategories: any;
  dbConnected: boolean;
  playbookSettings: any;
  apiKey: string;
}

export default function Sidebar({
  activeView,
  setActiveView,
  activeManager,
  logout,
  toggleCategory,
  collapsedCategories,
  dbConnected,
  playbookSettings,
  apiKey
}: SidebarProps) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <svg viewBox="0 0 100 100" width="32" height="32" className="mr-xs shrink-0">
          <g transform="rotate(-12 50 50)">
            <path d="M 10,25 L 75,25 L 90,50 L 75,75 L 10,75 Z" fill="#FFE000" />
            <circle cx="22" cy="50" r="5" fill="#0b0f19" />
            <text x="52" y="46" fontFamily="'Inter', sans-serif, Arial" fontWeight="900" fontSize="16" fill="#000" textAnchor="middle" letterSpacing="-0.5">BEST</text>
            <text x="52" y="66" fontFamily="'Inter', sans-serif, Arial" fontWeight="900" fontSize="16" fill="#000" textAnchor="middle" letterSpacing="-0.5">BUY</text>
          </g>
        </svg>
        <div className="logo-text">Floor<span>Vision</span></div>
      </div>

      {activeManager && (
        <div className="bg-white-alpha-02 border-glass rounded-16 px-md py-sm-md mb-lg flex-column gap-xs">
          <span className="text-xxs text-bby-yellow font-bold uppercase tracking-wider">Logged in as</span>
          <div className="flex-between align-center">
            <span className="text-sm font-bold text-white">{activeManager.name}</span>
            <button 
              onClick={logout} 
              data-testid="manager-logout-btn"
              className="bg-transparent border-none text-error text-xxs cursor-pointer p-0 font-semibold uppercase"
            >
              Log Out
            </button>
          </div>
          <span className="text-xxs text-secondary leading-relaxed">{activeManager.role}</span>
        </div>
      )}

      <ul className="sidebar-menu">
        <li className="menu-group-header" onClick={() => toggleCategory('overview')}>
          <span>Overview</span>
          {collapsedCategories.overview ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </li>
        {!collapsedCategories.overview && (
          <>
            <li 
              className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
              data-testid="nav-dashboard"
            >
              <LayoutDashboard className="menu-item-icon" /> Dashboard
            </li>
          </>
        )}

        <li className="menu-group-header" onClick={() => toggleCategory('floorOps')}>
          <span>Floor Operations</span>
          {collapsedCategories.floorOps ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </li>
        {!collapsedCategories.floorOps && (
          <>
            <li 
              className={`menu-item ${activeView === 'roster' ? 'active' : ''}`}
              onClick={() => setActiveView('roster')}
              data-testid="nav-roster"
            >
              <ClipboardList className="menu-item-icon" /> Store Roster
            </li>
            <li 
              className={`menu-item ${activeView === 'shadow' ? 'active' : ''}`}
              onClick={() => setActiveView('shadow')}
              data-testid="nav-shadow"
            >
              <ShieldCheck className="menu-item-icon" /> Floor Shadowing
            </li>
            <li 
              className={`menu-item ${activeView === 'aura' ? 'active' : ''}`}
              onClick={() => setActiveView('aura')}
              data-testid="nav-aura"
            >
              <Radar className="menu-item-icon text-bby-yellow" /> Aura Radar
            </li>
            <li 
              className={`menu-item ${activeView === 'dailyLineup' ? 'active' : ''}`}
              onClick={() => setActiveView('dailyLineup')}
              data-testid="nav-daily-lineup"
            >
              <CalendarDays className="menu-item-icon" /> Daily Lineup
            </li>
            <li 
              className={`menu-item ${activeView === 'floorLeader' ? 'active' : ''}`}
              onClick={() => setActiveView('floorLeader')}
              data-testid="nav-floor-leader"
            >
              <Clock className="menu-item-icon" /> Floor Leader
            </li>
            <li 
              className={`menu-item ${activeView === 'trends' ? 'active' : ''}`}
              onClick={() => setActiveView('trends')}
              data-testid="nav-trends"
            >
              <TrendingUp className="menu-item-icon" /> Trend Reporting
            </li>
            <li 
              className={`menu-item ${activeView === 'tv' ? 'active' : ''}`}
              onClick={() => setActiveView('tv')}
              data-testid="nav-tv"
            >
              <MonitorPlay className="menu-item-icon" /> Breakroom TV (Kiosk)
            </li>
          </>
        )}

        <li className="menu-group-header" onClick={() => toggleCategory('coachingPractice')}>
          <span>Coaching & Practice</span>
          {collapsedCategories.coachingPractice ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </li>
        {!collapsedCategories.coachingPractice && (
          <>
            <li 
              className={`menu-item ${activeView === 'roleplay' ? 'active' : ''}`}
              onClick={() => setActiveView('roleplay')}
              data-testid="nav-roleplay"
            >
              <Compass className="menu-item-icon" /> Consult Arena
            </li>
            <li 
              className={`menu-item ${activeView === 'coach' ? 'active' : ''}`}
              onClick={() => setActiveView('coach')}
              data-testid="nav-coach"
            >
              <Users className="menu-item-icon" /> Coach Simulator
            </li>
          </>
        )}

        <li className="menu-group-header" onClick={() => toggleCategory('recordsSetup')}>
          <span>Records & Setup</span>
          {collapsedCategories.recordsSetup ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </li>
        {!collapsedCategories.recordsSetup && (
          <>
            <li 
              className={`menu-item ${activeView === 'builder' ? 'active' : ''}`}
              onClick={() => setActiveView('builder')}
              data-testid="nav-builder"
            >
              <Sparkles className="menu-item-icon" /> Coaching Generator
            </li>
            <li 
              className={`menu-item ${activeView === 'history' ? 'active' : ''}`}
              onClick={() => setActiveView('history')}
              data-testid="nav-history"
            >
              <Archive className="menu-item-icon" /> History Hub
            </li>
            <li 
              className={`menu-item ${activeView === 'playbook' ? 'active' : ''}`}
              onClick={() => setActiveView('playbook')}
              data-testid="nav-playbook"
            >
              <BookOpen className="menu-item-icon" /> Playbook Studio
            </li>
          </>
        )}
      </ul>

      {/* Sidebar Footer Status Indicator */}
      <div className="sidebar-footer flex-column gap-sm">
        {dbConnected ? (
          <div className="api-key-indicator bg-success-alpha border-success-alpha-20">
            <div className="indicator-dot active bg-success shadow-success-glow" />
            <span className="text-success-light">Cloud Database Synced</span>
          </div>
        ) : (
          <div className="api-key-indicator bg-warning-alpha border-warning-alpha-20">
            <div className="indicator-dot inactive bg-bby-yellow shadow-warning-glow" />
            <span className="text-warning-light">Local Sandbox Active</span>
          </div>
        )}

        {playbookSettings.useGemini && apiKey.trim().length > 10 && (
          <div className="api-key-indicator bg-cyan-alpha border-cyan-alpha">
            <div className="indicator-dot active" />
            <span className="text-info-light">Gemini Free Mode Active</span>
          </div>
        )}
      </div>
    </nav>
  );
}
