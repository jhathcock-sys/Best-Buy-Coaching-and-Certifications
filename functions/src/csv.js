const functions = require('firebase-functions');
const Papa = require('papaparse');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// 5. Parse Rents Due CSV on the backend
exports.parseRentsDueCSV = functions.https.onCall(async (data, context) => {
  // Security Veto Fix
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication.');
  }

  // Tech Debt Veto Fix: Lazy load JSDOM inside function scope
  const window = new JSDOM('').window;
  const DOMPurify = createDOMPurify(window);

  const payload = data.data || data;
  const text = payload.csvText;
  if (!text || typeof text !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Missing CSV text data');
  }

  if (!text.includes(',') && !text.includes('\t')) {
    return { parsedData: null };
  }

  try {
    const csvLines = text.trim().split(/\r?\n/);
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(50, csvLines.length); i++) {
      const lineLower = csvLines[i].toLowerCase();
      const hasNameCol = lineLower.includes('name') || lineLower.includes('employee') || lineLower.includes('advisor');
      const hasMetricCol = lineLower.includes('rph') || lineLower.includes('revenue') || lineLower.includes('rev') || lineLower.includes('apps') || lineLower.includes('warranty');
      if (hasNameCol && hasMetricCol && lineLower.includes(',')) {
        headerRowIndex = i;
        break;
      }
    }
    
    if (headerRowIndex === -1) {
      throw new functions.https.HttpsError('invalid-argument', 'Could not locate a valid header row containing employee and metric columns.');
    }
    
    const cleanedText = csvLines.slice(headerRowIndex).join('\n');

    const result = Papa.parse(cleanedText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });

    if (result.errors.length > 0) {
      console.warn("PapaParse encountered errors, attempting to salvage:", result.errors);
      if (result.data.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Failed to parse CSV: ' + JSON.stringify(result.errors));
      }
    }

    const rows = result.data;
    if (rows.length === 0) return { parsedData: null };

    const parsedData = rows.map((row) => {
      const getVal = (possibleKeys, defaultVal = 0) => {
        for (const pk of possibleKeys) {
          const regex = new RegExp(`\\b${pk.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
          const matchingKey = Object.keys(row).find(k => regex.test(k) || k.toLowerCase().trim() === pk);
          if (matchingKey && row[matchingKey] != null) {
            let val = row[matchingKey];
            if (typeof val === 'string') {
              val = parseFloat(val.replace(/[^0-9.-]+/g, ''));
            }
            // Strict boundary check for NaN and boolean coercion
            if (typeof val === 'number' && !Number.isNaN(val)) {
              return val;
            }
          }
        }
        return defaultVal;
      };

      const nameKey = Object.keys(row).find(k => k.toLowerCase().includes('name') || k.toLowerCase().includes('employee') || k.toLowerCase().includes('advisor'));
      // Data Ops Veto Fix: null check and safe fallback
      const rawName = nameKey && row[nameKey] != null ? String(row[nameKey]).trim() : '';
      const name = DOMPurify.sanitize(rawName) || 'Unknown';

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
    console.error("Cloud CSV parsing failed", error);
    throw new functions.https.HttpsError('internal', 'Cloud CSV parsing failed: ' + error.message);
  }
});
