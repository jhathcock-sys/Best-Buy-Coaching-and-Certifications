import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../services/firebase';

export const parseRentsDueCSVCloud = async (text: string): Promise<any[] | null> => {
  if (!text || (!text.includes(',') && !text.includes('\t'))) return null;

  try {
    const functions = getFunctions(app);
    const parseCSV = httpsCallable(functions, 'parseRentsDueCSV');
    const result = await parseCSV({ csvText: text });
    
    // @ts-ignore
    if (result.data && result.data.parsedData) {
      // @ts-ignore
      return result.data.parsedData;
    }
    
    return null;
  } catch (e) {
    console.error("Cloud CSV parsing failed", e);
    return null;
  }
};

export const mapParsedRentsToRoster = (parsedEmployees: any[], comparisonRoster: any[]) => {
  let updatedCount = 0;
  let addedCount = 0;
  
  const importList = parsedEmployees.map(parsedEmp => {
    const nameKey = parsedEmp.name.toLowerCase().trim();
    const existing = comparisonRoster.find(r => r.name.toLowerCase().trim() === nameKey);
    
    const parsedRPH = parsedEmp.rph || (existing ? existing.rph : 640);
    const parsedRev = parsedEmp.revenue || (existing ? (existing.hours * existing.rph) : 0);
    const safeRPH = parsedRPH > 0 ? parsedRPH : 640;
    const calculatedHours = parsedRev > 0 ? Math.round((parsedRev / safeRPH) * 10) / 10 : (existing ? existing.hours : 0);
    
    if (existing) updatedCount++;
    else addedCount++;

    const rphTarget = parsedEmp.rphOwed || 640;

    return {
      ...(existing || {
        id: 'emp-' + Math.random().toString(36).substr(2, 9),
        role: 'Sales Advisor',
        zone: 'Sales Floor',
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(parsedEmp.name)}&backgroundColor=0b0f19`
      }),
      name: parsedEmp.name,
      hours: calculatedHours,
      rph: parsedRPH,
      rphTarget: rphTarget,
      creditCards: parsedEmp.apps || 0,
      memberships: parsedEmp.memberships || 0,
      warranty: parsedEmp.warranty || 0,
      metrics: {
        ...(existing ? existing.metrics : { rev: 0, bp: 0, pm: 0, bby: 0 }),
        rev: parsedRev,
        bp: parsedEmp.apps || 0,
        pm: parsedEmp.memberships || 0
      }
    };
  });
  
  return { importList, updatedCount, addedCount };
};
