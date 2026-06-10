import React, { useState } from 'react';
import { Clock, Trash2 } from 'lucide-react';

export default function BreakRunSheet({ breakSchedule = [], roster = [], onAddBreak, onToggleBreak, onDeleteBreak }) {
  const [breakForm, setBreakForm] = useState({
    empId: '',
    time: '12:00 PM',
    type: '15 min Break'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!breakForm.empId) {
      alert('Please select an associate for the break!');
      return;
    }
    const emp = roster.find(e => e.id === breakForm.empId);
    if (!emp) return;

    const newBreak = {
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
    const toMins = (t) => {
      const [hm, ampm] = t.split(' ');
      let [h, m] = hm.split(':').map(Number);
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };
    return toMins(a.time) - toMins(b.time);
  });

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--info)' }}>
        <Clock size={20} /> Breaks & Lunches Run Sheet
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
        Timetable run sheet: coordinate scheduled breaks and lunches to prevent sales floor coverage gaps.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Add Break Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingRight: '1rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>Schedule Break</h4>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Associate:</label>
              <select 
                className="form-control"
                style={{ fontSize: '0.8rem' }}
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
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Target Time:</label>
                <select 
                  className="form-control"
                  style={{ fontSize: '0.8rem' }}
                  value={breakForm.time}
                  onChange={(e) => setBreakForm({ ...breakForm, time: e.target.value })}
                >
                  {['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Break Type:</label>
                <select 
                  className="form-control"
                  style={{ fontSize: '0.8rem' }}
                  value={breakForm.type}
                  onChange={(e) => setBreakForm({ ...breakForm, type: e.target.value })}
                >
                  <option value="15 min Break">15 min Break</option>
                  <option value="30 min Lunch">30 min Lunch</option>
                  <option value="45 min Lunch">45 min Lunch</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              + Add Shift Break
            </button>
          </form>
        </div>

        {/* Timetable List */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Today's Break Run Sheet</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto' }}>
            {sortedBreaks.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', border: '1px dashed rgba(255,255,255,0.04)', borderRadius: '12px' }}>
                No breaks scheduled yet for today's run sheet.
              </div>
            ) : (
              sortedBreaks.map((b) => (
                <div 
                  key={b.id} 
                  style={{ 
                    padding: '0.85rem 1rem', 
                    background: b.completed ? 'rgba(16, 185, 129, 0.03)' : 'rgba(255, 255, 255, 0.01)', 
                    border: `1px solid ${b.completed ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-glass)'}`, 
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      type="checkbox" 
                      checked={b.completed}
                      onChange={() => onToggleBreak(b.id)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: b.completed ? 'var(--text-muted)' : '#fff', textDecoration: b.completed ? 'line-through' : 'none' }}>
                        {b.name}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        {b.time} — <strong>{b.type}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }}
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
