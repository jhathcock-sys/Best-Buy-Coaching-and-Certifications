import Papa from 'papaparse';

export const parseRentsDueCSVLocal = (text: string): any[] | null => {
  if (!text || (!text.includes(',') && !text.includes('\t'))) return null;

  try {
    const result = Papa.parse(text.trim(), {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });

    if (result.errors.length > 0 && result.data.length === 0) {
      return null;
    }

    const rows = result.data as any[];
    if (rows.length === 0) return null;

    const firstRow = rows[0];
    const keys = Object.keys(firstRow).map(k => k.toLowerCase());
    
    const hasName = keys.some(k => k.includes('name') || k.includes('employee') || k.includes('advisor'));
    if (!hasName) return null;

    const parsedData = rows.map((row) => {
      const getVal = (possibleKeys: string[], defaultVal: any = 0) => {
        for (const pk of possibleKeys) {
          const matchingKey = Object.keys(row).find(k => k.toLowerCase().includes(pk));
          if (matchingKey && row[matchingKey] !== undefined && row[matchingKey] !== null) {
            let val = row[matchingKey];
            if (typeof val === 'string') {
              val = val.replace(/[^0-9.-]+/g, '');
              val = parseFloat(val);
              if (isNaN(val)) continue;
            }
            return val;
          }
        }
        return defaultVal;
      };

      const nameKey = Object.keys(row).find(k => k.toLowerCase().includes('name') || k.toLowerCase().includes('employee') || k.toLowerCase().includes('advisor'));
      const name = nameKey ? row[nameKey] : "Unknown";

      const rph = getVal(['rph', 'rev/hr', 'revenue per hour']);
      const rphOwed = getVal(['rph goal', 'rph owed', 'rph target'], 640);
      const rphStatus = rph >= rphOwed ? 'on-track' : 'off-track';

      const revenue = getVal(['revenue', 'rev', 'total rev']);
      const revenueOwed = getVal(['rev goal', 'rev owed', 'revenue target'], 0);
      const revenueStatus = revenue >= revenueOwed ? 'on-track' : 'off-track';

      const apps = getVal(['apps', 'bps', 'credit', 'bp']);
      const appsOwed = getVal(['apps goal', 'apps owed', 'app target'], 0);
      const appsStatus = apps >= appsOwed ? 'on-track' : 'off-track';

      const memberships = getVal(['memberships', 'plus', 'total members', 'bby+']);
      const membershipsOwed = getVal(['member goal', 'memberships owed'], 0);
      const membershipsStatus = memberships >= membershipsOwed ? 'on-track' : 'off-track';

      const warranty = getVal(['warranty', 'gsp', 'attach']);
      const warrantyGoal = getVal(['warranty goal', 'gsp target'], 11.0);
      const warrantyStatus = warranty >= warrantyGoal ? 'on-track' : 'off-track';

      return {
        name: String(name).trim(),
        rph, rphOwed, rphStatus,
        revenue, revenueOwed, revenueStatus,
        apps, appsOwed, appsStatus,
        memberships, membershipsOwed, membershipsStatus,
        warranty, warrantyGoal, warrantyStatus
      };
    });

    return parsedData;
  } catch (e) {
    console.error("Local CSV parsing failed", e);
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
