// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { Users, Search, AlertTriangle, CheckCircle, Clock, HelpCircle, Sliders } from 'lucide-react';
import AddEmployeeModal from './AddEmployeeModal';
import PerformanceWizardModal from './PerformanceWizardModal';
import RosterImporterModal from './RosterImporterModal';
import AssociateProfileModal from './AssociateProfileModal';
import { calculateCVI } from '../store/cviHelper';
import RosterAuditor from './RosterAuditor';
import RentsDueAuditor from './RentsDueAuditor';


const getDeptStyle = (dept) => {
  switch (dept) {
    case 'Computing':
      return { bg: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.25)' };
    case 'Mobile':
      return { bg: 'rgba(249, 115, 22, 0.12)', color: '#fb923c', border: 'rgba(249, 115, 22, 0.25)' };
    case 'Home Theatre':
      return { bg: 'rgba(139, 92, 246, 0.12)', color: '#a78bfa', border: 'rgba(139, 92, 246, 0.25)' };
    case 'Front End':
      return { bg: 'rgba(6, 182, 212, 0.12)', color: '#22d3ee', border: 'rgba(6, 182, 212, 0.25)' };
    case 'Geek Squad':
      return { bg: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: 'rgba(239, 68, 68, 0.25)' };
    case 'Appliances':
      return { bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: 'rgba(16, 185, 129, 0.25)' };
    case 'General Sales':
      return { bg: 'rgba(236, 72, 153, 0.12)', color: '#f472b6', border: 'rgba(236, 72, 153, 0.25)' };
    default:
      return { bg: 'rgba(156, 163, 175, 0.12)', color: '#9ca3af', border: 'rgba(156, 163, 175, 0.25)' };
  }
};

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
  onDeleteEmployee,
  onCreatePeriod, 
  onBulkImportEmployees, 
  coachingLogs = [],
  followUpTasks = [],
  deptGoals = {
    'Front End': { memberships: 8.0, membershipsType: 'Hours', creditCards: 12.5, creditCardsType: 'Hours', warranty: 11.0, surveys: 1.0, rph: 640 },
    'General Sales': { memberships: 5000, membershipsType: 'Dollars', creditCards: 8000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 640 },
    'Appliances': { memberships: 15000, membershipsType: 'Dollars', creditCards: 10000, creditCardsType: 'Dollars', warranty: 12.0, surveys: 1.0, rph: 1200 },
    'Computing': { memberships: 8000, membershipsType: 'Dollars', creditCards: 10000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 900, basket: 150, m365: 60.0 },
    'Mobile': { memberships: 6000, membershipsType: 'Dollars', creditCards: 8000, creditCardsType: 'Dollars', warranty: 8.0, surveys: 1.0, rph: 700 },
    'Home Theatre': { memberships: 10000, membershipsType: 'Dollars', creditCards: 12000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 800, basket: 250, audio: 35.0 },
    'Geek Squad': { memberships: 5000, membershipsType: 'Dollars', creditCards: 15000, creditCardsType: 'Dollars', warranty: 12.0, surveys: 1.0, rph: 500 }
  },
  apiKey
}) {
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [activeDept, setActiveDept] = useState('All');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(tempSearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [tempSearch]);
  
  const [showAddForm, setShowAddForm] = useState(false);

  // Roster History and Performance Editor states
  const [showNewPeriodForm, setShowNewPeriodForm] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [copyOption, setCopyOption] = useState('roster-only');
  
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showImporter, setShowImporter] = useState(false);

  // View options & layout configuration settings
  const [activeSubView, setActiveSubView] = useState('list');
  const [showViewSettings, setShowViewSettings] = useState(false);
  const [isDense, setIsDense] = useState(window.innerWidth < 1024);
  const [visibleCols, setVisibleCols] = useState({
    hours: true,
    dept: true,
    memberships: true,
    creditCards: true,
    warranty: true,
    surveys: true,
    rph: true,
    basket: true,
    attach: true,
    status: true
  });

  const handleStartEdit = (emp) => {
    setEditingEmployee(emp);
  };

  const handleSaveEdit = (updatedMetrics) => {
    if (onEditEmployee && editingEmployee) {
      onEditEmployee(editingEmployee.id, updatedMetrics);
    }
    setEditingEmployee(null);
  };

  const DEPARTMENTS = ['All', 'Front End', 'General Sales', 'Appliances', 'Computing', 'Mobile', 'Home Theatre', 'Geek Squad'];

  // Audits employee metrics dynamically based on their department goals!
  const getMetricClass = (val, type, dept, emp) => {
    const goals = (deptGoals && (deptGoals[dept] || deptGoals['Front End'])) || {};
    const target = goals[type] !== undefined ? goals[type] : 0;
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
    if (type === 'basket') {
      return val >= target ? 'text-success' : val >= target - 30 ? 'text-warning' : 'text-danger';
    }
    if (type === 'm365') {
      return val >= target ? 'text-success' : val >= target - 10 ? 'text-warning' : 'text-danger';
    }
    if (type === 'audio') {
      return val >= target ? 'text-success' : val >= target - 10 ? 'text-warning' : 'text-danger';
    }
    return '';
  };

  const getPaceText = (val, type, dept, emp) => {
    const goals = (deptGoals && (deptGoals[dept] || deptGoals['Front End'])) || {};
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

  const renderMetricCell = (val, type, dept, emp, displayValue) => {
    
    const isDeptMetric = (
      type !== 'basket' && type !== 'm365' && type !== 'audio'
    ) || (
      (type === 'basket' && (dept === 'Computing' || dept === 'Home Theatre')) ||
      (type === 'm365' && dept === 'Computing') ||
      (type === 'audio' && dept === 'Home Theatre')
    );
    
    if (!isDeptMetric) {
      return (
        <td style={{ padding: isDense ? '0.45rem 0.5rem' : '0.85rem 0.75rem', textAlign: 'center', opacity: 0.15 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>—</span>
        </td>
      );
    }
    
    const metricClass = getMetricClass(val, type, dept, emp);
    let pillBg = 'transparent';
    let pillColor = 'var(--text-secondary)';
    let pillBorder = 'transparent';
    let hasPill = false;
    
    if (metricClass === 'text-success') {
      pillBg = 'rgba(16, 185, 129, 0.08)';
      pillColor = 'var(--success)';
      pillBorder = 'rgba(16, 185, 129, 0.2)';
      hasPill = true;
    } else if (metricClass === 'text-warning') {
      pillBg = 'rgba(245, 158, 11, 0.08)';
      pillColor = 'var(--warning)';
      pillBorder = 'rgba(245, 158, 11, 0.2)';
      hasPill = true;
    } else if (metricClass === 'text-danger') {
      pillBg = 'rgba(239, 68, 68, 0.08)';
      pillColor = 'var(--error)';
      pillBorder = 'rgba(239, 68, 68, 0.2)';
      hasPill = true;
    }
    
    const paceText = (type === 'memberships' || type === 'creditCards') ? getPaceText(val, type, dept, emp) : '';
    const showPace = val > 0 && paceText && paceText !== 'No pace';

    return (
      <td style={{ padding: isDense ? '0.45rem 0.5rem' : '0.85rem 0.75rem', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          <span style={{ 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            background: pillBg, 
            border: `1px solid ${pillBorder}`, 
            color: pillColor, 
            padding: hasPill ? '0.25rem 0.65rem' : '0rem', 
            borderRadius: '8px',
            minWidth: hasPill ? '64px' : 'auto',
            textAlign: 'center',
            display: 'inline-block'
          }}>
            {displayValue}
          </span>
          {showPace && (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontWeight: 500 }}>
              {paceText}
            </span>
          )}
        </div>
      </td>
    );
  };

  const renderMobileMetricBadge = (val, type, dept, emp, label, displayValue) => {
    
    const isDeptMetric = (
      type !== 'basket' && type !== 'm365' && type !== 'audio'
    ) || (
      (type === 'basket' && (dept === 'Computing' || dept === 'Home Theatre')) ||
      (type === 'm365' && dept === 'Computing') ||
      (type === 'audio' && dept === 'Home Theatre')
    );
    
    if (!isDeptMetric) return null;
    
    const metricClass = getMetricClass(val, type, dept, emp);
    let pillBg = 'rgba(255, 255, 255, 0.015)';
    let pillColor = 'var(--text-secondary)';
    let pillBorder = 'rgba(255, 255, 255, 0.05)';
    
    if (metricClass === 'text-success') {
      pillBg = 'rgba(16, 185, 129, 0.08)';
      pillColor = 'var(--success)';
      pillBorder = 'rgba(16, 185, 129, 0.2)';
    } else if (metricClass === 'text-warning') {
      pillBg = 'rgba(245, 158, 11, 0.08)';
      pillColor = 'var(--warning)';
      pillBorder = 'rgba(245, 158, 11, 0.2)';
    } else if (metricClass === 'text-danger') {
      pillBg = 'rgba(239, 68, 68, 0.08)';
      pillColor = 'var(--error)';
      pillBorder = 'rgba(239, 68, 68, 0.2)';
    }
    
    const pace = (type === 'memberships' || type === 'creditCards') ? getPaceText(val, type, dept, emp) : '';
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        background: pillBg, 
        color: pillColor, 
        border: `1px solid ${pillBorder}`, 
        borderRadius: '10px', 
        padding: '0.45rem 0.25rem',
        minHeight: '62px',
        justifyContent: 'center'
      }}>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.15rem' }}>
          {displayValue}
        </span>
        {pace && (
          <span style={{ fontSize: '0.55rem', opacity: 0.8, marginTop: '0.05rem', fontWeight: 500 }}>
            {pace}
          </span>
        )}
      </div>
    );
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

  const getEmployeeGap = (emp) => {
    const gaps = [];
    
    // memberships
    if (getMetricClass(emp.memberships, 'memberships', emp.dept, emp) === 'text-danger') {
      gaps.push('Memberships');
    }
    // creditCards
    if (getMetricClass(emp.creditCards, 'creditCards', emp.dept, emp) === 'text-danger') {
      gaps.push('Credit Cards');
    }
    // warranty
    if (getMetricClass(emp.warranty, 'warranty', emp.dept, emp) === 'text-danger') {
      gaps.push('GSP Attach');
    }
    // surveys
    if (getMetricClass(emp.surveys, 'surveys', emp.dept, emp) === 'text-danger') {
      gaps.push('5 Star Surveys');
    }
    // rph
    if (getMetricClass(emp.rph, 'rph', emp.dept, emp) === 'text-danger') {
      gaps.push('RPH');
    }
    // basket
    if ((emp.dept === 'Computing' || emp.dept === 'Home Theatre') && getMetricClass(emp.basket, 'basket', emp.dept, emp) === 'text-danger') {
      gaps.push('Basket');
    }
    // m365
    if (emp.dept === 'Computing' && getMetricClass(emp.m365, 'm365', emp.dept, emp) === 'text-danger') {
      gaps.push('M365 Attach');
    }
    // audio
    if (emp.dept === 'Home Theatre' && getMetricClass(emp.audio, 'audio', emp.dept, emp) === 'text-danger') {
      gaps.push('Audio Attach');
    }
    
    if (gaps.length === 0) return 'None';
    return gaps.join(' & ');
  };

  const filteredRoster = useMemo(() => {
    return roster.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = activeDept === 'All' || emp.dept === activeDept;
      return matchesSearch && matchesDept;
    });
  }, [roster, searchTerm, activeDept]);

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
              {Object.keys(rosterHistory || {}).map(p => (
                <option key={p} value={p} style={{ background: '#0b0f19', color: '#fff' }}>{p}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Subview Tabs bar */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.25rem' }}>
        <button
          className="btn"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubView === 'list' ? '2.5px solid var(--bby-blue)' : 'none',
            color: activeSubView === 'list' ? '#fff' : 'var(--text-muted)',
            borderRadius: 0,
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
          onClick={() => setActiveSubView('list')}
        >
          Performance Ledger
        </button>
        <button
          className="btn"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubView === 'audit' ? '2.5px solid var(--bby-blue)' : 'none',
            color: activeSubView === 'audit' ? '#fff' : 'var(--text-muted)',
            borderRadius: 0,
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
          onClick={() => setActiveSubView('audit')}
        >
          AI Metrics Auditor
        </button>
        <button
          className="btn"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubView === 'rentsDue' ? '2.5px solid var(--bby-blue)' : 'none',
            color: activeSubView === 'rentsDue' ? '#fff' : 'var(--text-muted)',
            borderRadius: 0,
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
          onClick={() => setActiveSubView('rentsDue')}
        >
          Rents Due Auditor
        </button>
      </div>

      {activeSubView === 'list' && (
        <>
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

          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.55rem 1rem', fontSize: '0.8rem', height: '38px', borderColor: 'var(--text-muted)' }} 
            onClick={() => {
              setShowImporter(true);
              setShowAddForm(false);
              setShowNewPeriodForm(false);
              setShowViewSettings(false);
            }}
          >
            Import CSV
          </button>

          <button 
            className="btn btn-secondary" 
            style={{ 
              padding: '0.55rem 1rem', 
              fontSize: '0.8rem', 
              height: '38px', 
              borderColor: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: showViewSettings ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
            }} 
            onClick={() => {
              setShowViewSettings(!showViewSettings);
              setShowAddForm(false);
              setShowNewPeriodForm(false);
            }}
          >
            <Sliders size={14} /> View Options
          </button>

          <div style={{ position: 'relative', width: '200px' }}>
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '2.5rem', paddingRight: '1rem', height: '38px', fontSize: '0.85rem' }}
              placeholder="Search by name..."
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '11px', left: '0.85rem' }} />
          </div>
        </div>
      </div>

      {/* View Settings Drawer */}
      {showViewSettings && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem 2rem', border: '1px solid rgba(255, 255, 255, 0.08)', animation: 'fadeIn 0.25s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <Sliders size={16} color="var(--bby-blue)" /> Roster Display Settings
            </h4>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <input 
                type="checkbox" 
                checked={isDense} 
                onChange={(e) => setIsDense(e.target.checked)} 
                style={{ cursor: 'pointer' }}
              />
              <span>Enable Dense Grid Layout</span>
            </label>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.25rem', padding: '0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
            {Object.keys(visibleCols).map(col => {
              const label = 
                col === 'hours' ? 'Hours' :
                col === 'dept' ? 'Department' :
                col === 'memberships' ? 'Memberships' :
                col === 'creditCards' ? 'BBY Cards' :
                col === 'warranty' ? 'GSP/Warranty' :
                col === 'surveys' ? '5 Star Surveys' :
                col === 'rph' ? 'RPH Index' :
                col === 'basket' ? 'Basket' :
                col === 'attach' ? 'Dept Attach' :
                col === 'status' ? 'Status' : col;

              return (
                <label key={col} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', color: '#fff' }}>
                  <input 
                    type="checkbox" 
                    checked={visibleCols[col]} 
                    onChange={(e) => setVisibleCols({ ...visibleCols, [col]: e.target.checked })} 
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

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

      {/* Add Associate Modal */}
      <AddEmployeeModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAddEmployee={onAddEmployee}
      />

      {/* Roster Table Card */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Desktop View */}
        <div className="desktop-only" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(16, 24, 48, 0.7)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: isDense ? '0.5rem 1rem' : '1rem 1rem', fontWeight: 600 }}>Associate</th>
                {visibleCols.hours && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center' }}><Clock size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'text-bottom' }} />Hours</th>}
                {visibleCols.dept && <th style={{ padding: isDense ? '0.5rem 1rem' : '1rem 1rem', fontWeight: 600 }}>Department</th>}
                {visibleCols.memberships && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center' }}>Memberships</th>}
                {visibleCols.creditCards && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center' }}>BBY Cards</th>}
                {visibleCols.warranty && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center' }}>Warranty/GSP</th>}
                {visibleCols.surveys && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center' }}>5 Star</th>}
                {visibleCols.rph && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center' }}>RPH</th>}
                {visibleCols.basket && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>Basket ($)</th>}
                {visibleCols.attach && <th style={{ padding: isDense ? '0.5rem 0.75rem' : '1rem 0.75rem', fontWeight: 600, textAlign: 'center' }}>Dept Attach</th>}
                {visibleCols.status && <th style={{ padding: isDense ? '0.5rem 1rem' : '1rem 1rem', fontWeight: 600 }}>Status</th>}
                <th style={{ padding: isDense ? '0.5rem 1rem' : '1rem 1rem', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap', width: '320px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan={2 + Object.values(visibleCols).filter(Boolean).length} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Users size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                    <p>No associates match your active filters.</p>
                  </td>
                </tr>
              ) : (
                filteredRoster.map(emp => {
                  const gap = getEmployeeGap(emp);
                  const isExceeding = gap === 'None' || gap === '';
                  const rowBg = isExceeding ? 'rgba(16, 185, 129, 0.018)' : emp.focus5 ? 'rgba(239, 68, 68, 0.018)' : 'rgba(255,255,255,0.005)';
                  const rowBorderLeft = isExceeding ? '4px solid var(--success)' : emp.focus5 ? '4px solid var(--error)' : '4px solid transparent';
                  const hoverBg = isExceeding ? 'rgba(16, 185, 129, 0.035)' : emp.focus5 ? 'rgba(239, 68, 68, 0.035)' : 'rgba(255,255,255,0.025)';
                  
                  return (
                    <tr 
                      key={emp.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-glass)',
                        borderLeft: rowBorderLeft,
                        background: rowBg,
                        transition: 'background 0.25s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
                      onMouseLeave={(e) => e.currentTarget.style.background = rowBg}
                    >
                      <td style={{ padding: isDense ? '0.45rem 1rem' : '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                          <span 
                            style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.3)', fontSize: '0.925rem', fontWeight: 700 }}
                            onClick={() => setSelectedProfileEmployee(emp)}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--bby-blue)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
                          >
                            {emp.name}
                          </span>
                          {emp.employeeNumber && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '-0.15rem' }}>
                              ID: {emp.employeeNumber}
                            </span>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {(() => {
                              const cvi = calculateCVI(emp, rosterHistory, activePeriod);
                              let badgeBg = 'rgba(255, 255, 255, 0.04)';
                              let badgeColor = 'var(--text-secondary)';
                              let badgeBorder = 'rgba(255, 255, 255, 0.08)';
                              let cviIcon = '▶';
                              if (cvi.includes('Accelerating')) {
                                badgeBg = 'rgba(16, 185, 129, 0.1)';
                                badgeColor = 'var(--success)';
                                badgeBorder = 'rgba(16, 185, 129, 0.2)';
                                cviIcon = '▲';
                              } else if (cvi.includes('Needs Review')) {
                                badgeBg = 'rgba(239, 68, 68, 0.15)';
                                badgeColor = 'var(--error)';
                                badgeBorder = 'rgba(239, 68, 68, 0.3)';
                                cviIcon = '▼';
                              } else if (cvi.includes('Neutral')) {
                                badgeBg = 'rgba(245, 158, 11, 0.1)';
                                badgeColor = 'var(--warning)';
                                badgeBorder = 'rgba(245, 158, 11, 0.2)';
                                cviIcon = '▶';
                              }
                              return (
                                <span 
                                  title="Coaching Velocity Index (Month over Month growth velocity)"
                                  style={{ 
                                    fontSize: '0.625rem', 
                                    background: badgeBg, 
                                    border: `1px solid ${badgeBorder}`, 
                                    color: badgeColor, 
                                    padding: '0.1rem 0.3rem', 
                                    borderRadius: '4px', 
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.15rem',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {cviIcon} CVI: {cvi.split(' ')[0]}
                                </span>
                              );
                            })()}
                            {emp.focus5 && (
                              <span style={{ fontSize: '0.625rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--error)', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                                🔥 FOCUS 5
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      {visibleCols.hours && (
                        <td style={{ padding: isDense ? '0.45rem 0.5rem' : '0.85rem 0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {emp.hours} hrs
                        </td>
                      )}
                      {visibleCols.dept && (
                        <td style={{ padding: isDense ? '0.25rem 1rem' : '0.5rem 1rem' }}>
                          {(() => {
                            const deptStyle = getDeptStyle(emp.dept);
                            return (
                              <select 
                                className="form-control"
                                style={{ 
                                  padding: '0.25rem 0.6rem', 
                                  fontSize: '0.75rem', 
                                  fontWeight: 700,
                                  background: deptStyle.bg, 
                                  border: `1px solid ${deptStyle.border}`,
                                  borderRadius: '20px',
                                  color: deptStyle.color,
                                  cursor: 'pointer',
                                  width: 'auto',
                                  minWidth: isDense ? '110px' : '130px',
                                  textAlign: 'center',
                                  appearance: 'none',
                                  WebkitAppearance: 'none',
                                  outline: 'none',
                                  textAlignLast: 'center'
                                }}
                                value={emp.dept}
                                onChange={(e) => onUpdateEmployeeDept && onUpdateEmployeeDept(emp.id, e.target.value)}
                              >
                                {DEPARTMENTS.filter(d => d !== 'All').map(d => (
                                  <option key={d} value={d} style={{ background: '#0e1220', color: '#fff' }}>{d}</option>
                                ))}
                              </select>
                            );
                          })()}
                        </td>
                      )}
                      {visibleCols.memberships && renderMetricCell(emp.memberships, 'memberships', emp.dept, emp, `${emp.memberships} Membs`)}
                      {visibleCols.creditCards && renderMetricCell(emp.creditCards, 'creditCards', emp.dept, emp, `${emp.creditCards} Apps`)}
                      {visibleCols.warranty && renderMetricCell(emp.warranty, 'warranty', emp.dept, emp, `${emp.warranty}%`)}
                      {visibleCols.surveys && renderMetricCell(emp.surveys, 'surveys', emp.dept, emp, emp.surveys === 0.2 ? 'Fail' : `${emp.surveys} ★`)}
                      {visibleCols.rph && renderMetricCell(emp.rph, 'rph', emp.dept, emp, `$${emp.rph}`)}
                      {visibleCols.basket && renderMetricCell(emp.basket, 'basket', emp.dept, emp, `$${parseFloat(emp.basket || 0).toFixed(0)}`)}
                      {visibleCols.attach && renderMetricCell(
                        emp.dept === 'Computing' ? emp.m365 : emp.dept === 'Home Theatre' ? emp.audio : 0, 
                        emp.dept === 'Computing' ? 'm365' : 'audio', 
                        emp.dept, 
                        emp, 
                        emp.dept === 'Computing' ? `${emp.m365 || 0}% M365` : emp.dept === 'Home Theatre' ? `${emp.audio || 0}% Audio` : '—'
                      )}
                      {visibleCols.status && (
                        <td style={{ padding: isDense ? '0.45rem 1rem' : '0.85rem 1rem' }}>
                          {getStatusBadge(gap)}
                        </td>
                      )}
                      <td style={{ padding: isDense ? '0.45rem 1rem' : '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap', width: '320px' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: isDense ? '0.25rem 0.45rem' : '0.35rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
                            onClick={() => handleStartEdit(emp)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: isDense ? '0.25rem 0.45rem' : '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => onCoachEmployee && onCoachEmployee({ ...emp, gap })}
                          >
                            Coach
                          </button>
                          <button 
                            className="btn btn-accent" 
                            style={{ padding: isDense ? '0.25rem 0.45rem' : '0.35rem 0.6rem', fontSize: '0.75rem', color: '#000' }}
                            onClick={() => onCreateLog && onCreateLog({ ...emp, gap })}
                          >
                            Log Builder
                          </button>
                          {onDeleteEmployee && (
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: isDense ? '0.25rem 0.45rem' : '0.35rem 0.6rem', fontSize: '0.75rem' }}
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${emp.name} from the roster?`)) {
                                  onDeleteEmployee(emp.id);
                                }
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="mobile-only" style={{ padding: '1rem', gap: '1rem' }}>
          {filteredRoster.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Users size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <p>No associates match your active filters.</p>
            </div>
          ) : (
            filteredRoster.map(emp => {
              const gap = getEmployeeGap(emp);
              const isExceeding = gap === 'None' || gap === '';
              const cardBg = isExceeding ? 'rgba(16, 185, 129, 0.018)' : emp.focus5 ? 'rgba(239, 68, 68, 0.018)' : 'rgba(255,255,255,0.005)';
              const cardBorderLeft = isExceeding ? '4px solid var(--success)' : emp.focus5 ? '4px solid var(--error)' : '1px solid var(--border-glass)';

              return (
                <div 
                  key={emp.id} 
                  style={{ 
                    background: cardBg, 
                    border: '1px solid var(--border-glass)', 
                    borderLeft: cardBorderLeft,
                    borderRadius: '16px', 
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Header: Name, Hours, and Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span 
                          style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.3)' }}
                          onClick={() => setSelectedProfileEmployee(emp)}
                        >
                          {emp.name}
                        </span>
                        {(() => {
                          const cvi = calculateCVI(emp, rosterHistory, activePeriod);
                          let badgeBg = 'rgba(255, 255, 255, 0.05)';
                          let badgeColor = 'var(--text-secondary)';
                          let badgeBorder = 'rgba(255, 255, 255, 0.1)';
                          let cviIcon = '▶';
                          if (cvi.includes('Accelerating')) {
                            badgeBg = 'rgba(16, 185, 129, 0.15)';
                            badgeColor = 'var(--success)';
                            badgeBorder = 'rgba(16, 185, 129, 0.3)';
                            cviIcon = '▲';
                          } else if (cvi.includes('Needs Review')) {
                            badgeBg = 'rgba(239, 68, 68, 0.15)';
                            badgeColor = 'var(--error)';
                            badgeBorder = 'rgba(239, 68, 68, 0.3)';
                            cviIcon = '▼';
                          } else if (cvi.includes('Neutral')) {
                            badgeBg = 'rgba(245, 158, 11, 0.15)';
                            badgeColor = 'var(--warning)';
                            badgeBorder = 'rgba(245, 158, 11, 0.3)';
                            cviIcon = '▶';
                          }
                          return (
                            <span 
                              title="Coaching Velocity Index (Month over Month growth velocity)"
                              style={{ 
                                fontSize: '0.65rem', 
                                background: badgeBg, 
                                border: `1px solid ${badgeBorder}`, 
                                color: badgeColor, 
                                padding: '0.15rem 0.35rem', 
                                borderRadius: '6px', 
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.15rem'
                              }}
                            >
                              {cviIcon} CVI: {cvi.split(' ')[0]}
                            </span>
                          );
                        })()}
                        {emp.focus5 && (
                          <span style={{ fontSize: '0.65rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.15rem 0.35rem', borderRadius: '6px', fontWeight: 700 }}>
                            🔥 FOCUS 5
                          </span>
                        )}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {emp.hours} hrs worked
                        {emp.employeeNumber && <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace' }}>• ID: {emp.employeeNumber}</span>}
                      </div>
                    </div>
                    {getStatusBadge(gap)}
                  </div>

                  {/* Department Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dept:</span>
                    {(() => {
                      const deptStyle = getDeptStyle(emp.dept);
                      return (
                        <select 
                          className="form-control"
                          style={{ 
                            padding: '0.25rem 0.6rem', 
                            fontSize: '0.75rem', 
                            fontWeight: 700,
                            background: deptStyle.bg, 
                            border: `1px solid ${deptStyle.border}`,
                            borderRadius: '20px',
                            color: deptStyle.color,
                            cursor: 'pointer',
                            width: 'auto',
                            textAlign: 'center',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            outline: 'none',
                            textAlignLast: 'center'
                          }}
                          value={emp.dept}
                          onChange={(e) => onUpdateEmployeeDept && onUpdateEmployeeDept(emp.id, e.target.value)}
                        >
                          {DEPARTMENTS.filter(d => d !== 'All').map(d => (
                            <option key={d} value={d} style={{ background: '#0e1220', color: '#fff' }}>{d}</option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>

                  {/* Metrics Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
                    gap: '0.65rem', 
                    background: 'rgba(0,0,0,0.15)', 
                    padding: '0.65rem', 
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.02)'
                  }}>
                    {renderMobileMetricBadge(emp.memberships, 'memberships', emp.dept, emp, 'Membs', emp.memberships)}
                    {renderMobileMetricBadge(emp.creditCards, 'creditCards', emp.dept, emp, 'Cards', emp.creditCards)}
                    {renderMobileMetricBadge(emp.warranty, 'warranty', emp.dept, emp, 'GSP', `${emp.warranty}%`)}
                    {renderMobileMetricBadge(emp.surveys, 'surveys', emp.dept, emp, 'Surveys', emp.surveys === 0.2 ? 'Fail' : emp.surveys)}
                    {renderMobileMetricBadge(emp.rph, 'rph', emp.dept, emp, 'RPH', `$${emp.rph}`)}
                    {emp.dept === 'Computing' ? (
                      renderMobileMetricBadge(emp.m365, 'm365', emp.dept, emp, 'M365', `${emp.m365 || 0}%`)
                    ) : emp.dept === 'Home Theatre' ? (
                      renderMobileMetricBadge(emp.audio, 'audio', emp.dept, emp, 'Audio', `${emp.audio || 0}%`)
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.45rem 0.25rem' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pace</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.15rem', color: '#fff' }}>
                          {emp.dept.substring(0, 4)}
                        </span>
                      </div>
                    )}
                    {(emp.dept === 'Computing' || emp.dept === 'Home Theatre') && 
                      renderMobileMetricBadge(emp.basket, 'basket', emp.dept, emp, 'Basket', `$${parseFloat(emp.basket || 0).toFixed(0)}`)}
                  </div>

                  {/* Actions Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', width: '100%' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}
                      onClick={() => handleStartEdit(emp)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', textAlign: 'center' }}
                      onClick={() => onCoachEmployee && onCoachEmployee({ ...emp, gap })}
                    >
                      Coach
                    </button>
                    <button 
                      className="btn btn-accent" 
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', color: '#000', textAlign: 'center' }}
                      onClick={() => onCreateLog && onCreateLog({ ...emp, gap })}
                    >
                      Log Builder
                    </button>
                    {onDeleteEmployee && (
                      <button 
                        className="btn btn-danger" 
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', textAlign: 'center' }}
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${emp.name} from the roster?`)) {
                            onDeleteEmployee(emp.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
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
                <div><strong>5 Star Surveys:</strong> {targets.surveys} mentions</div>
                <div><strong>RPH index:</strong> ${targets.rph}/hr target</div>
                {targets.basket !== undefined && <div><strong>Basket target:</strong> ${targets.basket}</div>}
                {targets.m365 !== undefined && <div><strong>M365 Attach:</strong> {targets.m365}%</div>}
                {targets.audio !== undefined && <div><strong>Audio Attach:</strong> {targets.audio}%</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}

      {activeSubView === 'audit' && (
        <RosterAuditor roster={roster} />
      )}

      {activeSubView === 'rentsDue' && (
        <RentsDueAuditor 
          roster={roster} 
          activePeriod={activePeriod}
          rosterHistory={rosterHistory}
          onBulkImportEmployees={onBulkImportEmployees}
          apiKey={apiKey}
        />
      )}

      {/* Performance Wizard Modal */}
      <PerformanceWizardModal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        employee={editingEmployee}
        onSave={handleSaveEdit}
        activePeriod={activePeriod}
        deptGoals={deptGoals}
      />

      {/* Roster CSV Importer Modal */}
      <RosterImporterModal
        isOpen={showImporter}
        onClose={() => setShowImporter(false)}
        onImport={(importedList) => {
          if (onBulkImportEmployees) {
            onBulkImportEmployees(importedList);
          }
          setShowImporter(false);
        }}
      />

      {/* Associate Profile Modal */}
      <AssociateProfileModal
        isOpen={!!selectedProfileEmployee}
        onClose={() => setSelectedProfileEmployee(null)}
        employee={selectedProfileEmployee}
        rosterHistory={rosterHistory}
        coachingLogs={coachingLogs}
        followUpTasks={followUpTasks}
        deptGoals={deptGoals}
        activePeriod={activePeriod}
      />

    </div>
  );
}
