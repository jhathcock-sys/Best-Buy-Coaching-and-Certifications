import React, { useState } from 'react';
import { Users, Search, AlertTriangle, CheckCircle, TrendingUp, Sparkles, Clock, HelpCircle } from 'lucide-react';

export default function StoreRoster({ 
  roster, 
  onCoachEmployee, 
  onCreateLog, 
  onUpdateEmployeeDept, 
  onAddEmployee, 
  activePeriod, 
  rosterHistory = {}, 
  onChangePeriod, 
  onEditEmployee, 
  onCreatePeriod, 
  deptGoals = {
    'Front End': { memberships: 8.0, membershipsType: 'Hours', creditCards: 12.5, creditCardsType: 'Hours', warranty: 11.0, surveys: 1.0, rph: 640 },
    'General Sales': { memberships: 5000, membershipsType: 'Dollars', creditCards: 8000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 640 },
    'Appliances': { memberships: 15000, membershipsType: 'Dollars', creditCards: 10000, creditCardsType: 'Dollars', warranty: 12.0, surveys: 1.0, rph: 1200 },
    'Computing': { memberships: 8000, membershipsType: 'Dollars', creditCards: 10000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 900 },
    'Mobile': { memberships: 6000, membershipsType: 'Dollars', creditCards: 8000, creditCardsType: 'Dollars', warranty: 8.0, surveys: 1.0, rph: 700 },
    'Home Theatre': { memberships: 10000, membershipsType: 'Dollars', creditCards: 12000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 800 },
    'Geek Squad': { memberships: 5000, membershipsType: 'Dollars', creditCards: 15000, creditCardsType: 'Dollars', warranty: 12.0, surveys: 1.0, rph: 500 }
  } 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDept, setActiveDept] = useState('All');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmpForm, setNewEmpForm] = useState({
    name: '',
    dept: 'Front End',
    hours: '',
    memberships: '',
    creditCards: '',
    warranty: '',
    surveys: '',
    rph: '',
    gap: 'None'
  });

  // Roster History and Performance Editor states
  const [showNewPeriodForm, setShowNewPeriodForm] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [copyOption, setCopyOption] = useState('roster-only');
  
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    dept: 'Front End',
    hours: 0,
    memberships: 0,
    creditCards: 0,
    warranty: 0,
    surveys: 5.0,
    rph: 0,
    gap: 'None'
  });

  const handleStartEdit = (emp) => {
    setEditingEmployee(emp);
    setEditForm({
      name: emp.name,
      dept: emp.dept,
      hours: emp.hours,
      memberships: emp.memberships,
      creditCards: emp.creditCards,
      warranty: emp.warranty,
      surveys: emp.surveys === 0.2 ? 'Failing' : emp.surveys.toString(),
      rph: emp.rph,
      gap: emp.gap || 'None'
    });
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim()) {
      alert("Name is required!");
      return;
    }
    const updated = {
      name: editForm.name.trim(),
      dept: editForm.dept,
      hours: parseFloat(editForm.hours) || 0,
      memberships: parseInt(editForm.memberships) || 0,
      creditCards: parseInt(editForm.creditCards) || 0,
      warranty: parseFloat(editForm.warranty) || 0,
      surveys: editForm.surveys === 'Failing' || editForm.surveys === 'failing' ? 0.2 : parseFloat(editForm.surveys) || 0,
      rph: parseInt(editForm.rph) || 0,
      gap: editForm.gap || 'None'
    };
    if (onEditEmployee) {
      onEditEmployee(editingEmployee.id, updated);
    }
    setEditingEmployee(null);
  };

  const handleSubmitAddEmployee = () => {
    if (!newEmpForm.name.trim()) {
      alert("Please enter the associate's name!");
      return;
    }
    const newEmp = {
      id: `emp-${Date.now()}`,
      name: newEmpForm.name.trim(),
      dept: newEmpForm.dept,
      hours: parseFloat(newEmpForm.hours) || 0,
      memberships: parseInt(newEmpForm.memberships) || 0,
      creditCards: parseInt(newEmpForm.creditCards) || 0,
      warranty: parseFloat(newEmpForm.warranty) || 0.0,
      surveys: newEmpForm.surveys === 'Failing' || newEmpForm.surveys === 'failing' ? 0.2 : parseFloat(newEmpForm.surveys) || 0.0,
      rph: parseInt(newEmpForm.rph) || 0,
      gap: newEmpForm.gap || 'None'
    };
    if (onAddEmployee) {
      onAddEmployee(newEmp);
    }
    setNewEmpForm({
      name: '',
      dept: 'Front End',
      hours: '',
      memberships: '',
      creditCards: '',
      warranty: '',
      surveys: '',
      rph: '',
      gap: 'None'
    });
    setShowAddForm(false);
  };

  const DEPARTMENTS = ['All', 'Front End', 'General Sales', 'Appliances', 'Computing', 'Mobile', 'Home Theatre', 'Geek Squad'];

  const DEFAULT_GOALS = {
    memberships: 8.0, membershipsType: 'Hours', 
    creditCards: 12.5, creditCardsType: 'Hours', 
    warranty: 11.0, surveys: 1.0, rph: 640 
  };

  // Audits employee metrics dynamically based on their department goals!
  const getMetricClass = (val, type, dept, emp) => {
    const goals = (deptGoals && (deptGoals[dept] || deptGoals['Front End'])) || DEFAULT_GOALS;
    const target = goals[type] !== undefined ? goals[type] : (DEFAULT_GOALS[type] || 0);
    const typeKey = type + 'Type';
    const isHoursType = goals[typeKey] === 'Hours';
    const isDollarsType = goals[typeKey] === 'Dollars';

    if (type === 'memberships') {
      if (isHoursType) {
        // Evaluate memberships by Hours Worked Pace (1 membership per X hours)
        // lower pace (fewer hours per membership) is better!
        const pace = emp.hours / (val || 0.001);
        return pace <= target ? 'text-success' : pace <= target + 3.0 ? 'text-warning' : 'text-danger';
      } else if (isDollarsType) {
        // Evaluate memberships by Dollar Revenue Pace (1 membership per $D revenue)
        // lower pace (fewer dollars per membership) is better!
        const revenue = emp.hours * emp.rph;
        const pace = revenue / (val || 0.001);
        return pace <= target ? 'text-success' : pace <= target + 2000 ? 'text-warning' : 'text-danger';
      }
      return val >= target ? 'text-success' : val >= target - 1 ? 'text-warning' : 'text-danger';
    }

    if (type === 'creditCards') {
      if (isHoursType) {
        // Evaluate credit cards by Hours Worked Pace (1 app per X hours)
        const pace = emp.hours / (val || 0.001);
        return pace <= target ? 'text-success' : pace <= target + 4.0 ? 'text-warning' : 'text-danger';
      } else if (isDollarsType) {
        // Evaluate credit cards by Dollar Revenue Pace (1 app per $D revenue)
        const revenue = emp.hours * emp.rph;
        const pace = revenue / (val || 0.001);
        return pace <= target ? 'text-success' : pace <= target + 3000 ? 'text-warning' : 'text-danger';
      }
      return val >= target ? 'text-success' : val >= target - 1 ? 'text-warning' : 'text-danger';
    }

    if (type === 'warranty') {
      return val >= target ? 'text-success' : val >= target - 3.0 ? 'text-warning' : 'text-danger';
    }
    if (type === 'surveys') {
      return val >= target ? 'text-success' : 'text-danger';
    }
    if (type === 'rph') {
      return val >= target ? 'text-success' : val >= target - 150 ? 'text-warning' : 'text-danger';
    }
    return '';
  };

  const getPaceText = (val, type, dept, emp) => {
    const goals = (deptGoals && (deptGoals[dept] || deptGoals['Front End'])) || DEFAULT_GOALS;
    const typeKey = type + 'Type';
    const isHoursType = goals[typeKey] === 'Hours';
    const isDollarsType = goals[typeKey] === 'Dollars';

    if (!val || val === 0) return 'No pace';

    if (isHoursType) {
      // 1 app/memb per X hours
      const pace = emp.hours / val;
      return `1 in ${pace.toFixed(1)} hrs`;
    } else if (isDollarsType) {
      // 1 app/memb per $D revenue
      const revenue = emp.hours * emp.rph;
      const pace = revenue / val;
      return `1 in $${Math.round(pace / 100) / 10}k rev`;
    }
    return '';
  };

  const getStatusBadge = (gap) => {
    if (gap === 'None' || !gap || gap.startsWith('None')) {
      return (
        <span className="tag-pill" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          <CheckCircle size={12} style={{ marginRight: '0.25rem' }} /> Hitting Target
        </span>
      );
    }
    return (
      <span className="tag-pill" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <AlertTriangle size={12} style={{ marginRight: '0.25rem' }} /> Gap: {gap}
      </span>
    );
  };

  const filteredRoster = roster.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = activeDept === 'All' || emp.dept === activeDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', width: '100%' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Store Performance Roster
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Review performance logs and hours for the selected period. Audited dynamically against department-specific goals.
          </p>
        </div>

        {/* Period Selector */}
        {rosterHistory && Object.keys(rosterHistory).length > 0 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            background: 'rgba(16, 24, 48, 0.4)', 
            border: '1px solid var(--border-glass)', 
            padding: '0.5rem 1.25rem', 
            borderRadius: '16px',
            boxShadow: 'var(--shadow-inset)'
          }}>
            <Clock size={16} color="var(--bby-yellow)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Period:</span>
            <select 
              value={activePeriod} 
              onChange={(e) => onChangePeriod && onChangePeriod(e.target.value)}
              className="form-control"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                outline: 'none',
                padding: '0 1.5rem 0 0',
                width: 'auto',
                height: 'auto',
                margin: 0,
                boxShadow: 'none'
              }}
            >
              {Object.keys(rosterHistory).map(p => (
                <option key={p} value={p} style={{ background: '#0b0f19', color: '#fff' }}>{p}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Roster Controls */}
      <div className="glass-card" style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        {/* Department Filters */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {DEPARTMENTS.map(dept => (
            <button 
              key={dept} 
              className={`tag-pill ${activeDept === dept ? 'tag-pill-active' : ''}`}
              style={{ cursor: 'pointer', padding: '0.45rem 1rem', fontSize: '0.8rem' }}
              onClick={() => setActiveDept(dept)}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Action block with Toggle and Search */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            style={{ 
              padding: '0.55rem 1rem', 
              fontSize: '0.8rem', 
              height: '38px', 
              borderColor: 'var(--bby-yellow)', 
              color: 'var(--bby-yellow)',
              background: showNewPeriodForm ? 'rgba(255, 230, 0, 0.05)' : 'transparent'
            }} 
            onClick={() => {
              setShowNewPeriodForm(!showNewPeriodForm);
              setShowAddForm(false);
            }}
          >
            {showNewPeriodForm ? 'Close Archive Form' : '+ New Month Archive'}
          </button>
          
          <button 
            className="btn btn-accent" 
            style={{ padding: '0.55rem 1rem', fontSize: '0.8rem', color: '#000', height: '38px' }} 
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowNewPeriodForm(false);
            }}
          >
            {showAddForm ? 'Close Associate Form' : '+ Add Associate'}
          </button>

          <div style={{ position: 'relative', width: '200px' }}>
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '2.5rem', paddingRight: '1rem', height: '38px', fontSize: '0.85rem' }}
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '11px', left: '0.85rem' }} />
          </div>
        </div>
      </div>

      {/* Collapsible Start New Period Card */}
      {showNewPeriodForm && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1.5px solid var(--bby-yellow)', padding: '1.5rem 2rem', animation: 'fadeIn 0.3s ease' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' }}>
            Start New Performance Period / Month Archive
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-0.5rem' }}>
            Create a fresh performance tracker for a new month or week. The existing month's data will be safely archived and accessible anytime using the period switcher.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>New Period Name:</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. June 2026, Week 23"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={newPeriodName}
                onChange={(e) => setNewPeriodName(e.target.value)}
              />
            </div>
            
            <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Data Cloning Option:</label>
              <select 
                className="form-control"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={copyOption}
                onChange={(e) => setCopyOption(e.target.value)}
              >
                <option value="roster-only">Carry over associates only (Metrics set to 0 - Recommended for new months)</option>
                <option value="roster-and-metrics">Carry over associates AND all current performance metrics</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem' }} onClick={() => setShowNewPeriodForm(false)}>
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              style={{ padding: '0.55rem 1.25rem', background: 'var(--bby-yellow)', color: '#000' }} 
              onClick={() => {
                if (!newPeriodName.trim()) {
                  alert("Please enter a valid period name!");
                  return;
                }
                if (rosterHistory && rosterHistory[newPeriodName.trim()]) {
                  if (!confirm(`A period named "${newPeriodName.trim()}" already exists. Do you want to overwrite it?`)) {
                    return;
                  }
                }
                if (onCreatePeriod) {
                  onCreatePeriod(newPeriodName.trim(), copyOption);
                }
                setNewPeriodName('');
                setShowNewPeriodForm(false);
              }}
            >
              Start New Period & Switch
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Add Associate Card */}
      {showAddForm && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1.5px solid var(--bby-blue)', padding: '1.5rem 2rem', animation: 'fadeIn 0.3s ease' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' }}>
            Add New Associate to Roster
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Associate Name:</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Sarah Jennings"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={newEmpForm.name}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Department:</label>
              <select 
                className="form-control"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={newEmpForm.dept}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, dept: e.target.value })}
              >
                {DEPARTMENTS.filter(d => d !== 'All').map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Monthly Hours Worked:</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="e.g. 45.5"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={newEmpForm.hours}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, hours: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Memberships Attach:</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="e.g. 6"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={newEmpForm.memberships}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, memberships: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Credit Card Apps:</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="e.g. 3"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={newEmpForm.creditCards}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, creditCards: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>GSP/Warranty Attach %:</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="e.g. 10.5"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={newEmpForm.warranty}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, warranty: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>5-Star Survey CSAT (1-5 or Failing):</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. 4.8 or Failing"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={newEmpForm.surveys}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, surveys: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem' }}>RPH ($ index):</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="e.g. 950"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={newEmpForm.rph}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, rph: e.target.value })}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Opportunity Gap Description (or None):</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. GSP Attach (4.0% vs 12.0%) or None"
              style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
              value={newEmpForm.gap}
              onChange={(e) => setNewEmpForm({ ...newEmpForm, gap: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem' }} onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }} onClick={handleSubmitAddEmployee}>
              Add Associate to Roster
            </button>
          </div>
        </div>
      )}

      {/* Roster Table Card */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(16, 24, 48, 0.7)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Associate</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 600, textAlign: 'center' }}><Clock size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'text-bottom' }} />Hours</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Department</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 600, textAlign: 'center' }}>Memberships</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 600, textAlign: 'center' }}>BBY Cards</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 600, textAlign: 'center' }}>Warranty/GSP</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 600, textAlign: 'center' }}>5-Star CSAT</th>
                <th style={{ padding: '1.25rem 1rem', fontWeight: 600, textAlign: 'center' }}>RPH</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Users size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                    <p>No associates match your active filters.</p>
                  </td>
                </tr>
              ) : (
                filteredRoster.map(emp => (
                  <tr 
                    key={emp.id} 
                    style={{ 
                      borderBottom: '1px solid var(--border-glass)',
                      background: 'rgba(255,255,255,0.01)',
                      transition: 'background 0.25s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                  >
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#fff' }}>
                      {emp.name}
                    </td>
                    <td style={{ padding: '1rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {emp.hours} hrs
                    </td>
                    <td style={{ padding: '0.5rem 1.5rem' }}>
                      <select 
                        className="form-control"
                        style={{ 
                          padding: '0.4rem 0.8rem', 
                          fontSize: '0.8rem', 
                          background: 'rgba(11,15,25,0.6)', 
                          border: '1px solid var(--border-glass)',
                          borderRadius: '8px',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          width: 'auto',
                          minWidth: '130px'
                        }}
                        value={emp.dept}
                        onChange={(e) => onUpdateEmployeeDept && onUpdateEmployeeDept(emp.id, e.target.value)}
                      >
                        {DEPARTMENTS.filter(d => d !== 'All').map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '1rem 1rem', textAlign: 'center', fontWeight: 700 }} className={getMetricClass(emp.memberships, 'memberships', emp.dept, emp)}>
                      <div>{emp.memberships} Membs</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        ({getPaceText(emp.memberships, 'memberships', emp.dept, emp)})
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1rem', textAlign: 'center', fontWeight: 700 }} className={getMetricClass(emp.creditCards, 'creditCards', emp.dept, emp)}>
                      <div>{emp.creditCards} Apps</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        ({getPaceText(emp.creditCards, 'creditCards', emp.dept, emp)})
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1rem', textAlign: 'center', fontWeight: 700 }} className={getMetricClass(emp.warranty, 'warranty', emp.dept, emp)}>
                      {emp.warranty}%
                    </td>
                    <td style={{ padding: '1rem 1rem', textAlign: 'center', fontWeight: 700 }} className={getMetricClass(emp.surveys, 'surveys', emp.dept, emp)}>
                      {emp.surveys === 0.2 ? 'Failing' : `${emp.surveys} Five-Star`}
                    </td>
                    <td style={{ padding: '1rem 1rem', textAlign: 'center', fontWeight: 700 }} className={getMetricClass(emp.rph, 'rph', emp.dept, emp)}>
                      ${emp.rph}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {getStatusBadge(emp.gap)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
                          onClick={() => handleStartEdit(emp)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => onCoachEmployee(emp)}
                        >
                          Coach
                        </button>
                        <button 
                          className="btn btn-accent" 
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', color: '#000' }}
                          onClick={() => onCreateLog(emp)}
                        >
                          Log Builder
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Targets Matrix Cheat Sheet */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bby-yellow)' }}>
          <HelpCircle size={18} /> Department-Specific Goals matrix
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          Best Buy standards adapt to match department specialties (e.g. Major Appliances prioritizes higher GSP% and RPH, while Computing prioritizes total Memberships).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {Object.entries(deptGoals || {}).map(([dept, targets]) => (
            <div 
              key={dept} 
              style={{ 
                padding: '1rem', 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border-glass)', 
                borderRadius: '12px',
                fontSize: '0.775rem'
              }}
            >
              <h4 style={{ fontWeight: 700, color: '#fff', marginBottom: '0.5rem', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                {dept}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--text-secondary)' }}>
                <div>
                  <strong>Memberships:</strong> {targets.membershipsType === 'Hours' ? `1 in ${targets.memberships} hrs` : targets.membershipsType === 'Dollars' ? `1 in $${(targets.memberships / 1000).toFixed(0)}k sales` : `${targets.memberships} goal`}
                </div>
                <div>
                  <strong>BBY Cards:</strong> {targets.creditCardsType === 'Hours' ? `1 in ${targets.creditCards} hrs` : targets.creditCardsType === 'Dollars' ? `1 in $${(targets.creditCards / 1000).toFixed(0)}k sales` : `${targets.creditCards} goal`}
                </div>
                <div><strong>GSP Attach:</strong> {targets.warranty}% attach</div>
                <div><strong>CSAT surveys:</strong> {targets.surveys} five-star</div>
                <div><strong>RPH index:</strong> ${targets.rph}/hr target</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Performance Metrics Modal */}
      {editingEmployee && (
        <div className="modal-overlay" onClick={() => setEditingEmployee(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ border: '2.5px solid var(--bby-blue)', maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', color: '#fff', fontFamily: 'var(--font-heading)', margin: 0 }}>
                Update Weekly Performance: {editingEmployee.name}
              </h3>
              <button 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }} 
                onClick={() => setEditingEmployee(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '80vh', overflowY: 'auto' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-0.5rem' }}>
                Modify performance metrics for the active period (<strong>{activePeriod}</strong>). The metrics will be audited dynamically against <strong>{editForm.dept}</strong> goals.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Associate Name:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Department:</label>
                  <select 
                    className="form-control"
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                    value={editForm.dept}
                    onChange={(e) => setEditForm({ ...editForm, dept: e.target.value })}
                  >
                    {DEPARTMENTS.filter(d => d !== 'All').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Hours Worked:</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                    value={editForm.hours}
                    onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Memberships Attach:</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                    value={editForm.memberships}
                    onChange={(e) => setEditForm({ ...editForm, memberships: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>BBY Credit Card Apps:</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                    value={editForm.creditCards}
                    onChange={(e) => setEditForm({ ...editForm, creditCards: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>GSP/Warranty Attach %:</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                    value={editForm.warranty}
                    onChange={(e) => setEditForm({ ...editForm, warranty: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>5-Star CSAT (1-5 or Failing):</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                    value={editForm.surveys}
                    onChange={(e) => setEditForm({ ...editForm, surveys: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>RPH index ($):</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                    value={editForm.rph}
                    onChange={(e) => setEditForm({ ...editForm, rph: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Opportunity Gap Description:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                  value={editForm.gap}
                  onChange={(e) => setEditForm({ ...editForm, gap: e.target.value })}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem' }} onClick={() => setEditingEmployee(null)}>
                  Discard
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.55rem 1.25rem', background: 'var(--bby-blue)' }} 
                  onClick={handleSaveEdit}
                >
                  Save Metrics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
