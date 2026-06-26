import React, { useState } from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { Employee, BreakEntry } from '../types';

interface BreakRunSheetProps {
  breakSchedule?: BreakEntry[];
  roster?: Employee[];
  onAddBreak: (entry: BreakEntry) => void;
  onToggleBreak: (id: string) => void;
  onDeleteBreak: (id: string) => void;
}

export default function BreakRunSheet({ 
  breakSchedule = [], 
  roster = [], 
  onAddBreak, 
  onToggleBreak, 
  onDeleteBreak 
}: BreakRunSheetProps) {
  const [breakForm, setBreakForm] = useState({
    empId: '',
    time: '12:00 PM',
    type: '15 min Break'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakForm.empId) {
      alert('Please select an associate for the break!');
      return;
    }
    const emp = roster.find(e => e.id === breakForm.empId);
    if (!emp) return;

    const newBreak: BreakEntry = {
      id: 'break_' + Date.now(),
      empId: breakForm.empId,
      name: emp.name,
      time: breakForm.time,
      type: breakForm.type,
      completed: false
    };

    onAddBreak(newBreak);
    setBreakForm(prev => ({ ...prev, empId: '' }));
  };

  const sortedBreaks = [...breakSchedule].sort((a, b) => {
    const toMins = (t: string) => {
      const [hm, ampm] = t.split(' ');
      const parts = hm.split(':').map(Number);
      let h = parts[0];
      const m = parts[1];
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };
    return toMins(a.time) - toMins(b.time);
  });

  return (
    <div className="glass-card p-xl">
      <h3 className="text-xl mb-sm flex align-center gap-sm font-heading" style={{ color: 'var(--info)' }}>
        <Clock size={20} /> Breaks & Lunches Run Sheet
      </h3>
      <p className="text-secondary text-sm mb-lg">
        Timetable run sheet: coordinate scheduled breaks and lunches to prevent sales floor coverage gaps.
      </p>

      <div className="dashboard-grid">
        
        {/* Add Break Form */}
        <div className="flex-column gap-lg" style={{ paddingRight: '1rem' }}>
          <h4 className="font-bold border-b-glass pb-sm">Schedule Break</h4>
          
          <form onSubmit={handleSubmit} className="flex-column gap-md">
            <div className="form-group">
              <label className="form-label text-sm">Select Associate:</label>
              <select 
                className="form-control text-sm cursor-pointer"
                value={breakForm.empId}
                onChange={(e) => setBreakForm({ ...breakForm, empId: e.target.value })}
                required
              >
                <option value="">-- Choose Associate --</option>
                {roster.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label text-sm">Target Time:</label>
                <select 
                  className="form-control text-sm cursor-pointer"
                  value={breakForm.time}
                  onChange={(e) => setBreakForm({ ...breakForm, time: e.target.value })}
                >
                  {['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label text-sm">Break Type:</label>
                <select 
                  className="form-control text-sm cursor-pointer"
                  value={breakForm.type}
                  onChange={(e) => setBreakForm({ ...breakForm, type: e.target.value })}
                >
                  <option value="15 min Break">15 min Break</option>
                  <option value="30 min Lunch">30 min Lunch</option>
                  <option value="45 min Lunch">45 min Lunch</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary p-sm text-sm mt-xs cursor-pointer">
              + Add Shift Break
            </button>
          </form>
        </div>

        {/* Timetable List */}
        <div>
          <h4 className="font-bold border-b-glass pb-sm mb-md">Today's Break Run Sheet</h4>
          
          <div className="flex-column gap-sm" style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {sortedBreaks.length === 0 ? (
              <div className="p-xl text-center text-muted text-sm border-glass rounded-xl" style={{ borderStyle: 'dashed' }}>
                No breaks scheduled yet for today's run sheet.
              </div>
            ) : (
              sortedBreaks.map((b) => (
                <div 
                  key={b.id} 
                  className="flex align-center justify-between p-md rounded-xl"
                  style={{ 
                    background: b.completed ? 'var(--success-alpha-15)' : 'rgba(255, 255, 255, 0.01)', 
                    border: `1px solid ${b.completed ? 'var(--success-alpha-15)' : 'var(--border-glass)'}`
                  }}
                >
                  <div className="flex align-center gap-md">
                    <input 
                      type="checkbox" 
                      checked={b.completed}
                      onChange={() => onToggleBreak(b.id)}
                      className="cursor-pointer"
                      style={{ width: '16px', height: '16px' }}
                    />
                    <div>
                      <div className="font-bold text-sm" style={{ color: b.completed ? 'var(--text-muted)' : '#fff', textDecoration: b.completed ? 'line-through' : 'none' }}>
                        {b.name}
                      </div>
                      <div className="text-secondary mt-xs" style={{ fontSize: '0.725rem' }}>
                        {b.time} — <strong>{b.type}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="bg-transparent border-none text-muted cursor-pointer flex-center"
                    style={{ transition: 'color 0.2s', padding: 0 }}
                    onClick={() => onDeleteBreak(b.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
