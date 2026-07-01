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

import Papa from 'papaparse';
import DOMPurify from 'dompurify';

export const parseRentsDueCSVLocal = async (
  text: string, 
  userMapping?: Record<string, string>
): Promise<{ parsedData?: ParsedRentsData[]; requiresMapping?: boolean; fields?: string[]; rawData?: any[]; prefilledMapping?: Record<string, string> } | null> => {
  if (!text || (!text.includes(',') && !text.includes('\t'))) return null;

  try {
    const csvLines = text.trim().split(/\r?\n/);
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(50, csvLines.length); i++) {
      const lineLower = csvLines[i].toLowerCase();
      const hasNameCol = lineLower.includes('name') || lineLower.includes('employee') || lineLower.includes('advisor');
      const hasMetricCol = lineLower.includes('rph') || lineLower.includes('revenue') || lineLower.includes('rev') || lineLower.includes('apps') || lineLower.includes('warranty');
      if ((hasNameCol || hasMetricCol) && (lineLower.includes(',') || lineLower.includes('\t'))) {
        headerRowIndex = i;
        break;
      }
    }
    
    if (headerRowIndex === -1) {
       // if we can't find a header row, we might just parse the whole thing and let the user map it
       headerRowIndex = 0;
    }
    
    const cleanedText = csvLines.slice(headerRowIndex).join('\n');

    const result = Papa.parse(cleanedText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });

    if (result.errors.length > 0 && result.data.length === 0) {
      return null;
    }

    const fields = result.meta.fields || [];
    const rows = result.data as any[];

    // Heuristics to find columns
    const findField = (possibleKeys: string[]) => {
      for (const pk of possibleKeys) {
        const regex = new RegExp(`\\b${pk.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
        const match = fields.find(f => regex.test(f) || f.toLowerCase().trim() === pk);
        if (match) return match;
      }
      return '';
    };

    const prefilledMapping: Record<string, string> = {
      name: findField(['name', 'employee', 'advisor']),
      rph: findField(['rph', 'rev/hr', 'revenue per hour']),
      rphOwed: findField(['rph goal', 'rph owed', 'rph target']),
      revenue: findField(['revenue', 'rev', 'total rev']),
      revenueOwed: findField(['rev goal', 'rev owed', 'revenue target']),
      apps: findField(['apps', 'bps', 'credit', 'bp']),
      appsOwed: findField(['apps goal', 'apps owed', 'app target']),
      memberships: findField(['memberships', 'plus', 'total members', 'bby+']),
      membershipsOwed: findField(['member goal', 'memberships owed']),
      warranty: findField(['warranty', 'gsp', 'attach']),
      warrantyGoal: findField(['warranty goal', 'gsp target']),
    };

    if (!userMapping) {
      // Check if standard columns (Name, Revenue or RPH) are missing
      if (!prefilledMapping.name || (!prefilledMapping.rph && !prefilledMapping.revenue)) {
        return { requiresMapping: true, fields, rawData: rows, prefilledMapping };
      }
    }

    const mappingToUse = userMapping || prefilledMapping;

    const parsedData = rows.map((row) => {
      const getMappedVal = (key: string, defaultVal = 0) => {
        const mappedField = mappingToUse[key];
        if (mappedField && row[mappedField] != null) {
          let val = row[mappedField];
          if (typeof val === 'string') {
            val = parseFloat(val.replace(/[^0-9.-]+/g, ''));
          }
          if (typeof val === 'number' && !Number.isNaN(val)) {
            return val;
          }
        }
        return defaultVal;
      };

      const rawName = mappingToUse.name && row[mappingToUse.name] != null ? String(row[mappingToUse.name]).trim() : '';
      const name = DOMPurify.sanitize(rawName) || 'Unknown';

      const rph = getMappedVal('rph');
      const rphOwed = getMappedVal('rphOwed', 640);
      const revenue = getMappedVal('revenue');
      const revenueOwed = getMappedVal('revenueOwed', 0);
      const apps = getMappedVal('apps');
      const appsOwed = getMappedVal('appsOwed', 0);
      const memberships = getMappedVal('memberships');
      const membershipsOwed = getMappedVal('membershipsOwed', 0);
      const warranty = getMappedVal('warranty');
      const warrantyGoal = getMappedVal('warrantyGoal', 11.0);

      const rphStatus = rph >= rphOwed ? 'on-track' : 'off-track';
      const revenueStatus = revenue >= revenueOwed ? 'on-track' : 'off-track';
      const appsStatus = apps >= appsOwed ? 'on-track' : 'off-track';
      const membershipsStatus = memberships >= membershipsOwed ? 'on-track' : 'off-track';
      const warrantyStatus = warranty >= warrantyGoal ? 'on-track' : 'off-track';

      return {
        name,
        rph, rphOwed, rphStatus,
        revenue, revenueOwed, revenueStatus,
        apps, appsOwed, appsStatus,
        memberships, membershipsOwed, membershipsStatus,
        warranty, warrantyGoal, warrantyStatus
      };
    });

    return { parsedData };
  } catch (error) {
    console.error("Local CSV parsing failed", error);
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
