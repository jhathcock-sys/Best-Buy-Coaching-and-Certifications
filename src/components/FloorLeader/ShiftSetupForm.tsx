import React, { useState, useEffect } from 'react';
import { Clock, User, Calendar } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ShiftEvent } from '../../types';

export default function ShiftSetupForm() {
  // Auto-detect if today is weekend (0=Sun, 6=Sat)
  const isTodayWeekend = () => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  };

  const activeManager = useStore((state) => state.activeManager);
  const setActiveShift = useStore((state) => state.setActiveShift);

  const [leaderName, setLeaderName] = useState('');
  const [dailyRevenueGoal, setDailyRevenueGoal] = useState('10000');
  const [dailyAppsGoal, setDailyAppsGoal] = useState('10');
  const [dailyPmsGoal, setDailyPmsGoal] = useState('15');
  const [preExistingRevenue, setPreExistingRevenue] = useState('0');
  const [preExistingApps, setPreExistingApps] = useState('0');
  const [preExistingPms, setPreExistingPms] = useState('0');
  const [isWeekend, setIsWeekend] = useState(isTodayWeekend());

  useEffect(() => {
    if (activeManager?.name && !leaderName) {
      setLeaderName(activeManager.name);
    }
  }, [activeManager, leaderName]);

  const handleStartShift = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!leaderName.trim()) {
      alert('Please enter your name to start the floor lead shift.');
      return;
    }

    const newShift: ShiftEvent = {
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
    <div className="glass-card max-w-lg mx-auto p-xl">
      <div className="text-center mb-xl">
        <div className="flex-center mx-auto mb-md rounded-full border" style={{ width: '56px', height: '56px', background: 'rgba(0, 70, 190, 0.08)', borderColor: 'rgba(0,70,190,0.25)' }}>
          <Clock size={28} color="var(--bby-blue)" />
        </div>
        <h2 className="text-2xl font-bold">Start Floor Lead Shift</h2>
        <p className="text-sm text-secondary mt-xs">
          Check-in to configure your weekday or weekend hourly targets.
        </p>
      </div>

      <form onSubmit={handleStartShift} className="flex-column gap-xl">
        <div className="form-group">
          <label className="form-label flex-center justify-start gap-xs">
            <User size={16} /> Leader Name:
          </label>
          <input 
            type="text" 
            className="form-control form-control-sm"
            placeholder="Enter your name (e.g. Coach Jordan)"
            value={leaderName}
            onChange={(e) => setLeaderName(e.target.value)}
            required
            data-testid="input-leader-name"
          />
        </div>

        <div className="form-group">
          <label className="form-label flex-center justify-start gap-xs">
            <Calendar size={16} /> Shift Schedule Period:
          </label>
          <div className="grid grid-cols-2 gap-md mt-xs">
            <button
              type="button"
              onClick={() => setIsWeekend(false)}
              className="btn"
              style={{
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                background: !isWeekend ? 'rgba(0, 70, 190, 0.15)' : 'rgba(255,255,255,0.01)',
                borderColor: !isWeekend ? 'var(--bby-blue)' : 'var(--border-glass)',
                color: !isWeekend ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              data-testid="btn-weekday-toggle"
            >
              Weekday (Goal: 2/2)
            </button>
            <button
              type="button"
              onClick={() => setIsWeekend(true)}
              className="btn"
              style={{
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                background: isWeekend ? 'rgba(253, 216, 53, 0.08)' : 'rgba(255,255,255,0.01)',
                borderColor: isWeekend ? 'var(--bby-yellow)' : 'var(--border-glass)',
                color: isWeekend ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              data-testid="btn-weekend-toggle"
            >
              Weekend (Goal: 3/3)
            </button>
          </div>
          <p className="text-xs text-muted mt-sm text-center">
            *Weekday: 2 PMs & 2 Apps/hr | Weekend: 3 PMs & 3 Apps/hr. Both required to stay "On Track".
          </p>
        </div>

        <div className="form-group border-t border-glass pt-lg">
          <label className="form-label font-bold mb-md block">Daily Performance Goals</label>
          
          <div className="grid grid-cols-3 gap-md">
            <div className="flex-column gap-xs">
              <label className="form-label text-xs text-secondary">Revenue Goal ($)</label>
              <input 
                type="number" 
                className="form-control form-control-sm" 
                placeholder="e.g. 10000"
                value={dailyRevenueGoal}
                onChange={(e) => setDailyRevenueGoal(e.target.value)}
                data-testid="input-revenue-goal"
              />
            </div>
            <div className="flex-column gap-xs">
              <label className="form-label text-xs text-secondary">Credit Cards (Apps)</label>
              <input 
                type="number" 
                className="form-control form-control-sm" 
                placeholder="e.g. 10"
                value={dailyAppsGoal}
                onChange={(e) => setDailyAppsGoal(e.target.value)}
                data-testid="input-apps-goal"
              />
            </div>
            <div className="flex-column gap-xs">
              <label className="form-label text-xs text-secondary">PMs (Memberships)</label>
              <input 
                type="number" 
                className="form-control form-control-sm" 
                placeholder="e.g. 15"
                value={dailyPmsGoal}
                onChange={(e) => setDailyPmsGoal(e.target.value)}
                data-testid="input-pms-goal"
              />
            </div>
          </div>
        </div>

        <div className="form-group border-t border-glass pt-lg">
          <label className="form-label font-bold mb-md block">
            Carryover Metrics (Before Shift Started)
          </label>
          <div className="grid grid-cols-3 gap-md">
            <div className="flex-column gap-xs">
              <label className="form-label text-xs text-secondary">Pre-existing Rev ($)</label>
              <input 
                type="number" 
                className="form-control form-control-sm" 
                placeholder="e.g. 1500"
                value={preExistingRevenue}
                onChange={(e) => setPreExistingRevenue(e.target.value)}
                data-testid="input-pre-revenue"
              />
            </div>
            <div className="flex-column gap-xs">
              <label className="form-label text-xs text-secondary">Pre-existing CC Apps</label>
              <input 
                type="number" 
                className="form-control form-control-sm" 
                placeholder="e.g. 2"
                value={preExistingApps}
                onChange={(e) => setPreExistingApps(e.target.value)}
                data-testid="input-pre-apps"
              />
            </div>
            <div className="flex-column gap-xs">
              <label className="form-label text-xs text-secondary">Pre-existing PMs</label>
              <input 
                type="number" 
                className="form-control form-control-sm" 
                placeholder="e.g. 3"
                value={preExistingPms}
                onChange={(e) => setPreExistingPms(e.target.value)}
                data-testid="input-pre-pms"
              />
            </div>
          </div>
        </div>

        <button type="submit" data-testid="start-shift-btn" className="btn btn-primary w-full p-md mt-sm">
          Start Shift Monitoring
        </button>
      </form>
    </div>
  );
}
