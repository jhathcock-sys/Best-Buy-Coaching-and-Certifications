// @ts-nocheck
import { useState, useRef } from 'react';
import { parseScheduleImage } from '../services/ai';

export const normalizeZone = (rawZone) => {
  if (!rawZone) return 'Computing';
  const clean = rawZone.toLowerCase().trim();
  if (clean.includes('comp') || clean.includes('pc') || clean.includes('laptop') || clean.includes('sales')) return 'Computing';
  if (clean.includes('mob') || clean.includes('phone') || clean.includes('wireless') || clean.includes('mobile')) return 'Mobile';
  if (clean.includes('theat') || clean.includes('tv') || clean.includes('audio') || clean.includes('ht') || clean.includes('home')) return 'Home Theatre';
  if (clean.includes('front') || clean.includes('cash') || clean.includes('cs') || clean.includes('checkout') || clean.includes('customer') || clean.includes('ops') || clean.includes('register')) return 'Front End';
  if (clean.includes('gs') || clean.includes('geek') || clean.includes('squad') || clean.includes('serv')) return 'Geek Squad';
  if (clean.includes('app') || clean.includes('fridge') || clean.includes('wash')) return 'Appliances';
  return 'Computing'; // default fallback
};

// Fuzzy match name string to active roster list
export const fuzzyMatchName = (nameStr, roster) => {
  if (!nameStr) return null;
  const cleanStr = (s: any) => s.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const target = cleanStr(nameStr);
  if (!target) return null;

  // 1. Exact match
  let match = roster.find(emp => cleanStr(emp.name) === target);
  if (match) return match;

  // 2. Contains match
  const candidates = roster.filter(emp => {
    const empName = cleanStr(emp.name);
    return empName.includes(target) || target.includes(empName);
  });
  if (candidates.length === 1) return candidates[0];

  // 3. Token overlap match (e.g. "James H" matches "James Hathcock")
  const targetTokens = target.split(/\s+/);
  const bestMatch = roster.map(emp => {
    const empName = cleanStr(emp.name);
    const empTokens = empName.split(/\s+/);
    let score = 0;
    targetTokens.forEach(t => {
      if (empTokens.some(et => et.startsWith(t) || t.startsWith(et))) {
        score++;
      }
    });
    return { emp, score: score / Math.max(targetTokens.length, empTokens.length) };
  }).filter(res => res.score > 0.4)
    .sort((a, b) => b.score - a.score)[0];

  return bestMatch ? bestMatch.emp : null;
};

// Shift time parser
export const parseShiftHours = (shiftStr) => {
  if (!shiftStr) return { duration: 0, startTimeStr: '9:00 AM' };
  
  // Clean string and split by separators
  const parts = shiftStr.split(/[-—to]/).map(p => p.trim());
  if (parts.length < 2) return { duration: 0, startTimeStr: '9:00 AM' };

  const toMinutes = (timeStr) => {
    const match = timeStr.match(/(\d+):?(\d+)?\s*(AM|PM|am|pm)?/i);
    if (!match) return null;
    let h = parseInt(match[1], 10);
    let m = match[2] ? parseInt(match[2], 10) : 0;
    let ampm = match[3] ? match[3].toUpperCase() : '';

    if (!ampm) {
      // Guess PM for typical retail afternoon hours if not specified
      if (h >= 1 && h <= 7) ampm = 'PM';
      else if (h >= 8 && h <= 11) ampm = 'AM';
      else if (h === 12) ampm = 'PM';
      else ampm = 'PM';
    }

    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const startMin = toMinutes(parts[0]);
  let endMin = toMinutes(parts[1]);

  if (startMin === null || endMin === null) {
    return { duration: 0, startTimeStr: '9:00 AM' };
  }

  if (endMin < startMin) {
    endMin += 24 * 60; // crossover midnight
  }

  const duration = (endMin - startMin) / 60;

  const formatMins = (totalMins) => {
    let h = Math.floor(totalMins / 60) % 24;
    let m = totalMins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const pad = m < 10 ? '0' : '';
    return `${h}:${pad}${m} ${ampm}`;
  };

  return {
    duration,
    startTimeStr: formatMins(startMin)
  };
};

// Auto-generate break list based on shift duration
export const generateBreaks = (empId, empName, startTimeStr, durationHours) => {
  if (durationHours < 4 || !empId) return [];

  const parseToMins = (tStr) => {
    const [hm, ampm] = tStr.split(' ');
    let [h, m] = hm.split(':').map(Number);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const formatMins = (totalMins) => {
    let h = Math.floor(totalMins / 60) % 24;
    let m = totalMins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const pad = m < 10 ? '0' : '';
    return `${h}:${pad}${m} ${ampm}`;
  };

  const startMins = parseToMins(startTimeStr);
  const breaks = [];
  const baseTime = Date.now();

  if (durationHours >= 7.5) {
    // Two 15m breaks and a 30m lunch
    breaks.push({
      id: `break_${empId}_1_${baseTime}`,
      empId,
      name: empName,
      time: formatMins(startMins + 120), // 2 hours in
      type: '15 min Break',
      completed: false
    });
    breaks.push({
      id: `lunch_${empId}_${baseTime}`,
      empId,
      name: empName,
      time: formatMins(startMins + 240), // 4 hours in
      type: '30 min Lunch',
      completed: false
    });
    breaks.push({
      id: `break_${empId}_2_${baseTime}`,
      empId,
      name: empName,
      time: formatMins(startMins + 360), // 6 hours in
      type: '15 min Break',
      completed: false
    });
  } else if (durationHours >= 5.5) {
    // One 30m lunch
    breaks.push({
      id: `lunch_${empId}_${baseTime}`,
      empId,
      name: empName,
      time: formatMins(startMins + 210), // 3.5 hours in
      type: '30 min Lunch',
      completed: false
    });
  } else if (durationHours >= 4.0) {
    // One 15m break
    breaks.push({
      id: `break_${empId}_1_${baseTime}`,
      empId,
      name: empName,
      time: formatMins(startMins + 120), // 2 hours in
      type: '15 min Break',
      completed: false
    });
  }
  return breaks;
};

export const WEEKDAY_KEYS = ['mon', 'monday', 'tue', 'tuesday', 'wed', 'wednesday', 'thu', 'thursday', 'fri', 'friday', 'sat', 'saturday', 'sun', 'sunday'];
