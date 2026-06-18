import { useState, useMemo } from 'react';
import { TrendingUp, Calendar, DollarSign, Award, CreditCard, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function TrendReporting() {
  const dailySnapshots = useStore(state => state.dailySnapshots || {});
  
  const [viewLevel, setViewLevel] = useState('daily'); // daily, weekly, monthly
  const [targetEntity, setTargetEntity] = useState('Store Total'); // 'Store Total' or Employee Name

  // 1. Get all unique employee names from all snapshots for the dropdown
  const allEmployees = useMemo(() => {
    const names = new Set();
    Object.values(dailySnapshots).forEach(snapshotArray => {
      snapshotArray.forEach(emp => {
        if (emp.name) names.add(emp.name);
      });
    });
    return Array.from(names).sort();
  }, [dailySnapshots]);

  // 2. Process data based on selection and aggregation level
  const chartData = useMemo(() => {
    const sortedDates = Object.keys(dailySnapshots).sort();
    if (sortedDates.length === 0) return [];

    const aggregated = {}; // Key will be date/week/month string

    sortedDates.forEach(dateStr => {
      const snapshotArray = dailySnapshots[dateStr];
      if (!Array.isArray(snapshotArray)) return;

      // Determine grouping key based on viewLevel
      let groupKey = dateStr;
      const dateObj = new Date(dateStr + 'T12:00:00'); // Prevent timezone offset issues
      
      if (viewLevel === 'monthly') {
        groupKey = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });
      } else if (viewLevel === 'weekly') {
        // Simple ISO week logic or just week-start date
        const day = dateObj.getDay();
        const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const weekStart = new Date(dateObj.setDate(diff));
        groupKey = `Week of ${weekStart.toISOString().split('T')[0]}`;
      }

      if (!aggregated[groupKey]) {
        aggregated[groupKey] = { key: groupKey, revenue: 0, apps: 0, memberships: 0 };
      }

      // Sum up the data for the target entity
      snapshotArray.forEach(emp => {
        if (targetEntity === 'Store Total' || emp.name === targetEntity) {
          aggregated[groupKey].revenue += (emp.revenue || 0);
          aggregated[groupKey].apps += (emp.apps || 0);
          aggregated[groupKey].memberships += (emp.memberships || 0);
        }
      });
    });

    return Object.values(aggregated);
  }, [dailySnapshots, viewLevel, targetEntity]);

  // Find max values for CSS bar chart scaling
  const maxRev = Math.max(1, ...chartData.map(d => d.revenue));
  const maxApps = Math.max(1, ...chartData.map(d => d.apps));
  const maxPms = Math.max(1, ...chartData.map(d => d.memberships));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800 }}>
          <TrendingUp size={36} color="var(--bby-blue)" />
          Trend Reporting
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
          Track daily, weekly, and monthly performance trends based on Rents Due snapshots.
        </p>
      </div>

      {/* Controls */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', padding: '1.5rem', marginBottom: '2rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 200px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Aggregation Level</label>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '8px' }}>
            {['daily', 'weekly', 'monthly'].map(level => (
              <button
                key={level}
                onClick={() => setViewLevel(level)}
                style={{
                  flex: 1,
                  padding: '0.5rem 1rem',
                  border: 'none',
                  background: viewLevel === level ? 'var(--bby-blue)' : 'transparent',
                  color: viewLevel === level ? '#fff' : 'var(--text-muted)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: viewLevel === level ? 700 : 500,
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease'
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 250px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Entity</label>
          <div style={{ position: 'relative' }}>
            <select
              className="form-input"
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
              style={{ paddingRight: '2rem', appearance: 'none', width: '100%' }}
            >
              <option value="Store Total">Store Total</option>
              {allEmployees.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <ChevronDown size={16} color="var(--text-secondary)" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Charts / Data */}
      {chartData.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Calendar size={48} color="rgba(255,255,255,0.1)" />
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>No Snapshot Data Found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
            There are no saved "Rents Due" snapshots. Upload a Rents Due sheet in the Auditor to start tracking trends!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* REVENUE TREND */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#fff', fontSize: '1.25rem' }}>
              <DollarSign size={20} color="var(--bby-yellow)" /> Revenue Trend
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '250px', paddingTop: '2rem' }}>
              {chartData.map(data => {
                const heightPct = Math.max(5, (data.revenue / maxRev) * 100);
                return (
                  <div key={data.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%' }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div 
                        style={{ 
                          width: '100%', 
                          maxWidth: '60px', 
                          height: `${heightPct}%`, 
                          background: 'linear-gradient(to top, rgba(0, 70, 190, 0.4), var(--bby-blue))',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.5s ease'
                        }} 
                        title={`$${data.revenue.toLocaleString()}`}
                      />
                      <span style={{ position: 'absolute', top: `calc(${100 - heightPct}% - 1.5rem)`, fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>
                        ${(data.revenue / 1000).toFixed(1)}k
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                      {data.key}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MEMBERSHIPS TREND */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#fff', fontSize: '1.25rem' }}>
              <Award size={20} color="#10b981" /> Memberships Trend
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', paddingTop: '2rem' }}>
              {chartData.map(data => {
                const heightPct = Math.max(5, (data.memberships / maxPms) * 100);
                return (
                  <div key={data.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%' }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div 
                        style={{ 
                          width: '100%', 
                          maxWidth: '60px', 
                          height: `${heightPct}%`, 
                          background: 'linear-gradient(to top, rgba(16, 185, 129, 0.4), #10b981)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.5s ease'
                        }} 
                        title={`${data.memberships} PMs`}
                      />
                      <span style={{ position: 'absolute', top: `calc(${100 - heightPct}% - 1.5rem)`, fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>
                        {data.memberships}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CREDIT CARDS TREND */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#fff', fontSize: '1.25rem' }}>
              <CreditCard size={20} color="#f59e0b" /> Credit Cards Trend
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', paddingTop: '2rem' }}>
              {chartData.map(data => {
                const heightPct = Math.max(5, (data.apps / maxApps) * 100);
                return (
                  <div key={data.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%' }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div 
                        style={{ 
                          width: '100%', 
                          maxWidth: '60px', 
                          height: `${heightPct}%`, 
                          background: 'linear-gradient(to top, rgba(245, 158, 11, 0.4), #f59e0b)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.5s ease'
                        }} 
                        title={`${data.apps} Apps`}
                      />
                      <span style={{ position: 'absolute', top: `calc(${100 - heightPct}% - 1.5rem)`, fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>
                        {data.apps}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
