import { 
  LayoutDashboard, ClipboardList, ShieldCheck, 
  Clock, Compass, Users, Archive 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);

  const setActiveView = (view: string) => navigate(view === 'dashboard' ? '/' : '/' + view);

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <button 
        type="button"
        className={`bottom-nav-item cursor-pointer ${activeView === 'dashboard' ? 'active' : ''}`}
        aria-current={activeView === 'dashboard' ? 'page' : undefined}
        onClick={() => setActiveView('dashboard')}
        data-testid="mobile-nav-dashboard"
      >
        <LayoutDashboard size={20} aria-hidden="true" />
        <span>Dash</span>
      </button>
      <button 
        type="button"
        className={`bottom-nav-item cursor-pointer ${activeView === 'roster' ? 'active' : ''}`}
        aria-current={activeView === 'roster' ? 'page' : undefined}
        onClick={() => setActiveView('roster')}
        data-testid="mobile-nav-roster"
      >
        <ClipboardList size={20} aria-hidden="true" />
        <span>Roster</span>
      </button>
      <button 
        type="button"
        className={`bottom-nav-item cursor-pointer ${activeView === 'shadow' ? 'active' : ''}`}
        aria-current={activeView === 'shadow' ? 'page' : undefined}
        onClick={() => setActiveView('shadow')}
        data-testid="mobile-nav-shadow"
      >
        <ShieldCheck size={20} aria-hidden="true" />
        <span>Shadow</span>
      </button>
      <button 
        type="button"
        className={`bottom-nav-item cursor-pointer ${activeView === 'floorLeader' ? 'active' : ''}`}
        aria-current={activeView === 'floorLeader' ? 'page' : undefined}
        onClick={() => setActiveView('floorLeader')}
        data-testid="mobile-nav-floor-leader"
      >
        <Clock size={20} aria-hidden="true" />
        <span>Floor Lead</span>
      </button>
      <button 
        type="button"
        className={`bottom-nav-item cursor-pointer ${activeView === 'roleplay' ? 'active' : ''}`}
        aria-current={activeView === 'roleplay' ? 'page' : undefined}
        onClick={() => setActiveView('roleplay')}
        data-testid="mobile-nav-roleplay"
      >
        <Compass size={20} aria-hidden="true" />
        <span>Arena</span>
      </button>
      <button 
        type="button"
        className={`bottom-nav-item cursor-pointer ${activeView === 'coach' || activeView === 'builder' ? 'active' : ''}`}
        aria-current={activeView === 'coach' || activeView === 'builder' ? 'page' : undefined}
        onClick={() => setActiveView('coach')}
        data-testid="mobile-nav-coach"
      >
        <Users size={20} aria-hidden="true" />
        <span>Coach</span>
      </button>
      <button 
        type="button"
        className={`bottom-nav-item cursor-pointer ${activeView === 'history' ? 'active' : ''}`}
        aria-current={activeView === 'history' ? 'page' : undefined}
        onClick={() => setActiveView('history')}
        data-testid="mobile-nav-history"
      >
        <Archive size={20} aria-hidden="true" />
        <span>History</span>
      </button>
    </nav>
  );
}
