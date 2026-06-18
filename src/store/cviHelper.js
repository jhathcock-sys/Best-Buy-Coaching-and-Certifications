export function calculateCVI(employee, rosterHistory, activePeriod) {
  if (!employee || !rosterHistory || !activePeriod) return '0% (Neutral)';
  
  const sortedPeriods = Object.keys(rosterHistory).sort((a, b) => {
    const parsePeriod = (p) => {
      if (!p || typeof p !== 'string') return new Date(0);
      const parts = p.trim().split(/\s+/);
      const month = parts[0] || 'Jan';
      const yearStr = parts[1] || '2026';
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = months.findIndex(m => month.toLowerCase().startsWith(m.toLowerCase()));
      const safeMonthIdx = monthIdx === -1 ? 0 : monthIdx;
      const parsedYear = parseInt(yearStr) || 2026;
      return new Date(parsedYear, safeMonthIdx);
    };
    return parsePeriod(a) - parsePeriod(b);
  });
  
  const curIdx = sortedPeriods.indexOf(activePeriod);
  if (curIdx <= 0) return '0% (Neutral)';
  
  const prevPeriod = sortedPeriods[curIdx - 1];
  const prevEmp = rosterHistory[prevPeriod]?.find(e => e.id === employee.id || e.name === employee.name);
  if (!prevEmp) return '0% (Neutral)';
  
  // Compute deltas
  const metrics = ['memberships', 'creditCards', 'warranty', 'surveys', 'rph'];
  let totalPctChange = 0;
  let countedMetrics = 0;
  
  metrics.forEach(m => {
    const curVal = employee[m] || 0;
    const prevVal = prevEmp[m] || 0;
    if (prevVal !== 0 || curVal !== 0) {
      const prevDenom = prevVal === 0 ? 1 : prevVal;
      const pct = ((curVal - prevVal) / prevDenom) * 100;
      totalPctChange += pct;
      countedMetrics++;
    }
  });
  
  if (countedMetrics === 0) return '0% (Neutral)';
  const avgChange = Math.round(totalPctChange / countedMetrics);
  
  if (avgChange > 5) {
    return `+${avgChange}% (Accelerating)`;
  } else if (avgChange < -5) {
    return `${avgChange}% (Needs Review)`;
  } else {
    return `${avgChange}% (Neutral)`;
  }
}
