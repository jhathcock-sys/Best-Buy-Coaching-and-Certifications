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
        <svg viewBox="0 0 100 100" width="32" height="32" style={{ marginRight: '0.2rem', flexShrink: 0 }}>
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
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid var(--border-glass)', 
          borderRadius: '16px', 
          padding: '0.85rem 1rem', 
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.15rem'
        }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--bby-yellow)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logged in as</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{activeManager.name}</span>
            <button 
              onClick={logout} 
              data-testid="manager-logout-btn"
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--error)', 
                fontSize: '0.65rem', 
                cursor: 'pointer', 
                padding: 0,
                fontWeight: 600,
                textTransform: 'uppercase'
              }}
            >
              Log Out
            </button>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.2 }}>{activeManager.role}</span>
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
              <Radar className="menu-item-icon" style={{ color: 'var(--bby-yellow)' }} /> Aura Radar
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
      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {dbConnected ? (
          <div className="api-key-indicator" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div className="indicator-dot active" style={{ background: 'var(--success)', boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)' }} />
            <span style={{ color: '#a7f3d0' }}>Cloud Database Synced</span>
          </div>
        ) : (
          <div className="api-key-indicator" style={{ background: 'var(--warning-glow)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div className="indicator-dot inactive" style={{ background: 'var(--bby-yellow)', boxShadow: '0 0 8px rgba(255, 230, 0, 0.4)' }} />
            <span style={{ color: '#fde047' }}>Local Sandbox Active</span>
          </div>
        )}

        {playbookSettings.useGemini && apiKey.trim().length > 10 && (
          <div className="api-key-indicator" style={{ background: 'var(--info-glow)', border: '1px solid rgba(6,182,212,0.15)' }}>
            <div className="indicator-dot active" />
            <span style={{ color: '#a5f3fc' }}>Gemini Free Mode Active</span>
          </div>
        )}
      </div>
    </nav>
  );
}
