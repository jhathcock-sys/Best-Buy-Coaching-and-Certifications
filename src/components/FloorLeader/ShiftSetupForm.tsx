import { useState } from 'react';
import { Clock, User, Calendar } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function ShiftSetupForm({ activeManager }) {
  // Auto-detect if today is weekend (0=Sun, 6=Sat)
  const isTodayWeekend = () => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  };

  const setActiveShift = useStore((state) => state.setActiveShift);

  const [leaderName, setLeaderName] = useState(activeManager?.name || '');
  const [dailyRevenueGoal, setDailyRevenueGoal] = useState('10000');
  const [dailyAppsGoal, setDailyAppsGoal] = useState('10');
  const [dailyPmsGoal, setDailyPmsGoal] = useState('15');
  const [preExistingRevenue, setPreExistingRevenue] = useState('0');
  const [preExistingApps, setPreExistingApps] = useState('0');
  const [preExistingPms, setPreExistingPms] = useState('0');
  const [isWeekend, setIsWeekend] = useState(isTodayWeekend());

  const handleStartShift = (e) => {
    e.preventDefault();
    if (!leaderName.trim()) {
      alert('Please enter your name to start the floor lead shift.');
      return;
    }

    const newShift = {
      id: 'shift_' + Date.now(),
      leaderName: leaderName.trim(),
      manager: leaderName.trim(),
      type: 'floor-leader-shift',
      date: new Date().toLocaleDateString(),
      isWeekend: isWeekend,
      dailyRevenueGoal: parseFloat(dailyRevenueGoal) || 10000,
      dailyAppsGoal: parseInt(dailyAppsGoal) || 10,
      dailyPmsGoal: parseInt(dailyPmsGoal) || 15,
      preExistingRevenue: parseFloat(preExistingRevenue) || 0,
      preExistingApps: parseInt(preExistingApps) || 0,
      preExistingPms: parseInt(preExistingPms) || 0,
      hours: [
        { hourNumber: 1, pms: 0, apps: 0, revenue: 0, startRevenue: '', endRevenue: '' }
      ],
      zoneAssignments: {
        'Computing': [],
        'Mobile': [],
        'Home Theatre': [],
        'Front End': [],
        'Geek Squad': [],
        'Appliances': []
      },
      breakSchedule: [],
      activeBreaks: {},
      wins: []
    };
    setActiveShift(newShift);
  };

  return (
    <div className="glass-card" style={{ maxWidth: '540px', margin: '0 auto', padding: '2.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(0, 70, 190, 0.08)',
          border: '1px solid rgba(0,70,190,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <Clock size={28} color="var(--bby-blue)" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Start Floor Lead Shift</h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          Check-in to configure your weekday or weekend hourly targets.
        </p>
      </div>

      <form onSubmit={handleStartShift} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={16} /> Leader Name:
          </label>
          <input 
            type="text" 
            className="form-control form-control-sm"
            placeholder="Enter your name (e.g. Coach Jordan)"
            value={leaderName}
            onChange={(e) => setLeaderName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={16} /> Shift Schedule Period:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={() => setIsWeekend(false)}
              style={{
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                background: !isWeekend ? 'rgba(0, 70, 190, 0.15)' : 'rgba(255,255,255,0.01)',
                borderColor: !isWeekend ? 'var(--bby-blue)' : 'var(--border-glass)',
                color: !isWeekend ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Weekday (Goal: 2/2)
            </button>
            <button
              type="button"
              onClick={() => setIsWeekend(true)}
              style={{
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                background: isWeekend ? 'rgba(253, 216, 53, 0.08)' : 'rgba(255,255,255,0.01)',
                borderColor: isWeekend ? 'var(--bby-yellow)' : 'var(--border-glass)',
                color: isWeekend ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Weekend (Goal: 3/3)
            </button>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.45rem', textAlign: 'center' }}>
            *Weekday: 2 PMs & 2 Apps/hr | Weekend: 3 PMs & 3 Apps/hr. Both required to stay "On Track".
          </p>
        </div>

        <div className="form-group" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
          <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'block' }}>Daily Performance Goals</label>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Revenue Goal ($)</label>
              <input 
                type="number" 
                className="form-control form-control-sm" 
                placeholder="e.g. 10000"
                value={dailyRevenueGoal}
                onChange={(e) => setDailyRevenueGoal(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Credit Cards (Apps)</label>
              <input 
                type="number" 
                className="form-control form-control-sm" 
                placeholder="e.g. 10"
                value={dailyAppsGoal}
                onChange={(e) => setDailyAppsGoal(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PMs (Memberships)</label>
              <input 
                type="number" 
                className="form-control form-control-sm" 
                placeholder="e.g. 15"
                value={dailyPmsGoal}
                onChange={(e) => setDailyPmsGoal(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-group" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
          <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'block' }}>
            Carryover Metrics (Before Shift Started)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pre-existing Rev ($)</label>
              <input 
                type="number" 
                className="form-control form-control-sm" 
                placeholder="e.g. 1500"
                value={preExistingRevenue}
                onChange={(e) => setPreExistingRevenue(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pre-existing CC Apps</label>
              <input 
                type="number" 
                className="form-control form-control-sm" 
                placeholder="e.g. 2"
                value={preExistingApps}
                onChange={(e) => setPreExistingApps(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pre-existing PMs</label>
              <input 
                type="number" 
                className="form-control form-control-sm" 
                placeholder="e.g. 3"
                value={preExistingPms}
                onChange={(e) => setPreExistingPms(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
          Start Shift Monitoring
        </button>
      </form>
    </div>
  );
}
