import { Employee } from '../types';

export interface DailySnapshot {
  date: string;
  employees: Employee[];
}

export function calculateCoachingImpact(
  employeeId: string, 
  coachingDate: string, 
  dailySnapshots: DailySnapshot[]
): 'HIGH_IMPACT' | 'NEUTRAL' | 'NEEDS_FOLLOW_UP' | 'PENDING' {
  const coachingTime = new Date(coachingDate.split(' ')[0]).getTime();
  
  if (isNaN(coachingTime)) return 'PENDING';

  // We need to find snapshots for the given employee
  const snapshotsForEmployee = dailySnapshots
    .map(snap => ({
      date: new Date(snap.date.split(' ')[0]).getTime(),
      employee: snap.employees.find(e => e.id === employeeId)
    }))
    .filter(snap => snap.employee !== undefined && !isNaN(snap.date));

  const preSnapshots = snapshotsForEmployee.filter(s => {
    const diffDays = (coachingTime - s.date) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= 7;
  });

  const postSnapshots = snapshotsForEmployee.filter(s => {
    const diffDays = (s.date - coachingTime) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= 7;
  });

  if (postSnapshots.length === 0) {
    return 'PENDING';
  }

  const getAvg = (snaps: typeof snapshotsForEmployee) => {
    if (snaps.length === 0) return { memberships: 0, rph: 0 };
    const sum = snaps.reduce((acc, curr) => {
      const emp = curr.employee!;
      acc.memberships += (emp.memberships || 0);
      const hours = emp.hours || 0;
      const rph = emp.rph || 0;
      const revenue = emp.revenue !== undefined ? emp.revenue : (rph * hours);
      acc.revenue += revenue;
      acc.hours += hours;
      return acc;
    }, { memberships: 0, revenue: 0, hours: 0 });
    return {
      memberships: sum.memberships / snaps.length,
      rph: sum.hours > 0 ? sum.revenue / sum.hours : 0
    };
  };

  const preAvg = getAvg(preSnapshots);
  const postAvg = getAvg(postSnapshots);

  const preMem = preAvg.memberships || 0.1;
  const preRph = preAvg.rph || 0.1;

  const memChange = (postAvg.memberships - preAvg.memberships) / preMem;
  const rphChange = (postAvg.rph - preAvg.rph) / preRph;

  if (memChange > 0.05 || rphChange > 0.05) {
    return 'HIGH_IMPACT';
  } else if (memChange < 0 || rphChange < 0) {
    return 'NEEDS_FOLLOW_UP';
  }

  return 'NEUTRAL';
}
