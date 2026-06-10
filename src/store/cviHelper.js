export function calculateCVI(employee, rosterHistory, activePeriod) {
  if (!employee || !rosterHistory || !activePeriod) return '0% (Neutral)';
  
  const sortedPeriods = Object.keys(rosterHistory).sort((a, b) => {
    const parsePeriod = (p) => {
      const [month, year] = p.split(' ');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = months.findIndex(m => month.startsWith(m)) || 0;
      return new Date(parseInt(year), monthIdx);
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
