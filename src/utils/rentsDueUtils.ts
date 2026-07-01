import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../services/firebase';
import { Employee } from '../types';

export interface ParsedRentsData {
  name?: string;
  rph?: number;
  rphOwed?: number;
  revenue?: number;
  revenueOwed?: number;
  apps?: number;
  appsOwed?: number;
  memberships?: number;
  membershipsOwed?: number;
  warranty?: number;
  warrantyGoal?: number;
}

export const parseRentsDueCSVCloud = async (text: string): Promise<ParsedRentsData[] | null> => {
  if (!text || (!text.includes(',') && !text.includes('\t'))) return null;

  try {
    const functions = getFunctions(app);
    const parseCSV = httpsCallable(functions, 'parseRentsDueCSV');
    const result = await parseCSV({ csvText: text });
    
    if (result.data && typeof result.data === 'object' && 'parsedData' in result.data) {
      return (result.data as { parsedData: ParsedRentsData[] }).parsedData;
    }
    
    return null;
  } catch (e) {
    console.error("Cloud CSV parsing failed", e);
    return null;
  }
};

export const mapParsedRentsToRoster = (parsedEmployees: ParsedRentsData[], comparisonRoster: Employee[]) => {
  let updatedCount = 0;
  let addedCount = 0;
  
  const importList = parsedEmployees.map(parsedEmp => {
    const nameKey = parsedEmp.name?.toLowerCase()?.trim() || '';
    const existing = comparisonRoster.find(r => r.name?.toLowerCase()?.trim() === nameKey);
    
    const parsedRPH = parsedEmp.rph || (existing ? existing.rph : 640);
    const parsedRev = parsedEmp.revenue || (existing ? (existing.hours * existing.rph) : 0);
    const safeRPH = parsedRPH > 0 ? parsedRPH : 640;
    const calculatedHours = parsedRev > 0 ? Math.round((parsedRev / safeRPH) * 10) / 10 : (existing ? existing.hours : 0);
    
    if (existing) updatedCount++;
    else addedCount++;

    return {
      ...(existing || {
        id: 'emp-' + Math.random().toString(36).substring(2, 11),
        dept: 'Sales Floor',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(parsedEmp.name || '')}&backgroundColor=0b0f19`,
        surveys: 0
      }),
      name: parsedEmp.name || 'Unknown Employee',
      hours: calculatedHours,
      rph: parsedRPH,
      rphOwed: parsedEmp.rphOwed ?? (existing ? existing.rphOwed : 640),
      creditCards: parsedEmp.apps || 0,
      memberships: parsedEmp.memberships || 0,
      warranty: parsedEmp.warranty || 0,
      revenue: parsedRev,
      apps: parsedEmp.apps || 0,
      revenueOwed: parsedEmp.revenueOwed ?? (existing ? existing.revenueOwed : parsedRev),
      appsOwed: parsedEmp.appsOwed ?? (existing ? existing.appsOwed : (parsedEmp.apps || 0)),
      membershipsOwed: parsedEmp.membershipsOwed ?? (existing ? existing.membershipsOwed : (parsedEmp.memberships || 0))
    } as Employee;
  });
  
  return { importList, updatedCount, addedCount };
};
