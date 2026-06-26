import { useState, useMemo } from 'react';
import { TrendingUp, Calendar, DollarSign, Award, CreditCard, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Employee } from '../types';

interface TrendDataPoint {
  key: string;
  revenue: number;
  apps: number;
  memberships: number;
  hours: number;
  surveys: number;
}

interface TrendBarChartProps {
  title: React.ReactNode;
  data: TrendDataPoint[];
  maxValue: number;
  valueAccessor: (d: TrendDataPoint) => number;
  gradientColors: [string, string];
  formatLabel: (val: number) => string;
  formatTooltip: (val: number) => string;
}

const TrendBarChart = ({ title, data, maxValue, valueAccessor, gradientColors, formatLabel, formatTooltip }: TrendBarChartProps) => (
  <div className="glass-card p-xl">
    <h3 className="flex-row align-center gap-sm mb-lg text-white text-xl">
      {title}
    </h3>
    <div className="flex-row align-end gap-md pt-xl mt-md" style={{ height: '200px' }}>
      {data.map(d => {
        const value = valueAccessor(d);
        const heightPct = Math.max(5, (value / (maxValue || 1)) * 100);
        return (
          <div key={d.key} className="flex-1 flex-column align-center gap-sm h-full">
            <div className="relative w-full h-full flex-row align-end justify-center">
              <div 
                className="w-full rounded-t-md transition-all duration-500"
                style={{ 
                  maxWidth: '60px',
                  height: `${heightPct}%`, 
                  background: `linear-gradient(to top, ${gradientColors[0]}, ${gradientColors[1]})`
                }} 
                title={formatTooltip(value)}
              />
              <span 
                className="absolute text-xs font-bold text-white" 
                style={{ top: `calc(${100 - heightPct}% - 1.5rem)` }}
              >
                {formatLabel(value)}
              </span>
            </div>
            <span className="text-xs text-muted text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
              {d.key}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

export default function TrendReporting() {
  const dailySnapshots = useStore(state => state.dailySnapshots) || {};
  const isPlaybookHydrated = useStore(state => state.isPlaybookHydrated);
  
  const [viewLevel, setViewLevel] = useState('daily'); // daily, weekly, monthly
  const [targetEntity, setTargetEntity] = useState('Store Total'); // 'Store Total' or Employee Name

  // 1. Get all unique employee names from all snapshots for the dropdown
  const allEmployees = useMemo(() => {
    const names = new Set<string>();
    Object.values(dailySnapshots).forEach((snapshotArray) => {
      if (Array.isArray(snapshotArray)) {
        snapshotArray.forEach((emp: Employee) => {
          if (emp.name) names.add(emp.name);
        });
      }
    });
    return Array.from(names).sort();
  }, [dailySnapshots]);

  // 2. Process data based on selection and aggregation level
  const chartData = useMemo(() => {
    const sortedDates = Object.keys(dailySnapshots).sort();
    if (sortedDates.length === 0) return [];

    const aggregated: Record<string, TrendDataPoint> = {}; // Key will be date/week/month string

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
        aggregated[groupKey] = { key: groupKey, revenue: 0, apps: 0, memberships: 0, hours: 0, surveys: 0 };
      }

      // Sum up the data for the target entity
      snapshotArray.forEach((emp: Employee) => {
        if (targetEntity === 'Store Total' || emp.name === targetEntity) {
          aggregated[groupKey].revenue += (emp.rph * emp.hours || 0);
          aggregated[groupKey].hours += (emp.hours || 0);
          aggregated[groupKey].apps += (emp.creditCards || 0);
          aggregated[groupKey].memberships += (emp.memberships || 0);
          aggregated[groupKey].surveys += (emp.surveys || 0);
        }
      });
    });

    return Object.values(aggregated);
  }, [dailySnapshots, viewLevel, targetEntity]);

  // Find max values for CSS bar chart scaling
  const maxRev = Math.max(1, ...chartData.map(d => d.revenue));
  const maxApps = Math.max(1, ...chartData.map(d => d.apps));
  const maxPms = Math.max(1, ...chartData.map(d => d.memberships));
  const maxRph = Math.max(1, ...chartData.map(d => d.hours > 0 ? (d.revenue / d.hours) : 0));

  if (!isPlaybookHydrated) {
    return (
      <div className="flex-center flex-column w-full h-full gap-md min-h-screen">
        <div className="w-50px h-50px border-4 border-solid border-white-alpha-10 border-bby-yellow-t-4 rounded-full animate-spin"></div>
        <span className="text-secondary text-sm font-semibold uppercase tracking-widest animate-fade-in">Loading Trends...</span>
      </div>
    );
  }

  return (
    <div className="flex-column mx-auto w-full pb-3xl" style={{ maxWidth: '1200px' }}>
      
      {/* Header */}
      <div className="flex-column gap-sm mb-xl">
        <h1 className="text-4xl m-0 flex-row align-center gap-md font-bold text-white">
          <TrendingUp size={36} color="var(--bby-blue)" />
          Trend Reporting
        </h1>
        <p className="text-secondary text-lg m-0">
          Track daily, weekly, and monthly performance trends based on Rents Due snapshots.
        </p>
      </div>

      {/* Controls */}
      <div className="glass-card flex-row flex-wrap gap-xl p-xl mb-xl align-center">
        <div className="flex-column gap-sm flex-1" style={{ minWidth: '200px' }}>
          <label className="text-sm font-bold text-secondary">Aggregation Level</label>
          <div className="flex-row bg-black-alpha-30 p-xs rounded-lg">
            {['daily', 'weekly', 'monthly'].map(level => (
              <button
                key={level}
                onClick={() => setViewLevel(level)}
                data-testid={`agg-level-${level}`}
                className={`flex-1 py-sm px-md border-none rounded-md cursor-pointer font-semibold capitalize transition-all ${
                  viewLevel === level ? 'bg-bby-blue text-white' : 'bg-transparent text-muted'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-column gap-sm flex-1" style={{ minWidth: '250px' }}>
          <label className="text-sm font-bold text-secondary">Target Entity</label>
          <div className="relative w-full">
            <select
              className="form-input w-full pr-xl appearance-none"
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
              data-testid="target-entity-select"
            >
              <option value="Store Total">Store Total</option>
              {allEmployees.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <ChevronDown size={16} color="var(--text-secondary)" className="absolute right-md top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Charts / Data */}
      {chartData.length === 0 ? (
        <div className="glass-card p-3xl text-center flex-column align-center gap-md">
          <Calendar size={48} color="rgba(255,255,255,0.1)" />
          <h3 className="m-0 text-xl text-white">No Snapshot Data Found</h3>
          <p className="text-muted" style={{ maxWidth: '400px' }}>
            There are no saved "Rents Due" snapshots. Upload a Rents Due sheet in the Auditor to start tracking trends!
          </p>
        </div>
      ) : (
        <div className="flex-column gap-2xl">
          <TrendBarChart 
            title={<><DollarSign size={24} color="var(--bby-yellow)" /> Revenue Trend</>}
            data={chartData}
            maxValue={maxRev}
            valueAccessor={(d) => d.revenue}
            gradientColors={['rgba(0, 70, 190, 0.4)', 'var(--bby-blue)']}
            formatLabel={(val) => `$${(val / 1000).toFixed(1)}k`}
            formatTooltip={(val) => `$${val.toLocaleString()}`}
          />
          
          <TrendBarChart 
            title={<><Award size={24} color="var(--success)" /> Memberships Trend</>}
            data={chartData}
            maxValue={maxPms}
            valueAccessor={(d) => d.memberships}
            gradientColors={['rgba(16, 185, 129, 0.4)', 'var(--success)']}
            formatLabel={(val) => val.toString()}
            formatTooltip={(val) => `${val} PMs`}
          />

          <TrendBarChart 
            title={<><CreditCard size={24} color="var(--warning)" /> Credit Cards Trend</>}
            data={chartData}
            maxValue={maxApps}
            valueAccessor={(d) => d.apps}
            gradientColors={['rgba(245, 158, 11, 0.4)', 'var(--warning)']}
            formatLabel={(val) => val.toString()}
            formatTooltip={(val) => `${val} Apps`}
          />

          <TrendBarChart 
            title={<><TrendingUp size={24} color="#8b5cf6" /> Revenue Per Hour (RPH) Trend</>}
            data={chartData}
            maxValue={maxRph}
            valueAccessor={(d) => d.hours > 0 ? (d.revenue / d.hours) : 0}
            gradientColors={['rgba(139, 92, 246, 0.4)', '#8b5cf6']}
            formatLabel={(val) => `$${Math.round(val)}`}
            formatTooltip={(val) => `$${Math.round(val)}/hr`}
          />
        </div>
      )}

    </div>
  );
}
