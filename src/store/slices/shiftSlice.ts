// @ts-nocheck
import { StateCreator } from 'zustand';
import { StoreState, ShiftSlice } from '../../types/store';
import { saveFloorLeaderShiftToCloud, deleteFloorLeaderShiftFromCloud } from '../../services/firebase';
import { ShiftSchema } from '../../schemas';
import { safeJsonParse } from './constants';

export const createShiftSlice: StateCreator<StoreState, [], [], ShiftSlice> = (set, get) => {
  const initialFloorLeaderShifts = safeJsonParse(localStorage.getItem('bby_floor_leader_shifts'), []);

  let initialActiveShift = null;
  const rawActiveShift = safeJsonParse(localStorage.getItem('bby_active_shift'), null);
  if (rawActiveShift) {
    const result = ShiftSchema.safeParse(rawActiveShift);
    if (result.success) {
      initialActiveShift = result.data;
    } else {
      console.error('Failed to validate active shift from localStorage:', result.error);
    }
  }

  return {
    floorLeaderShifts: initialFloorLeaderShifts,
    activeShift: initialActiveShift,

    setFloorLeaderShifts: (floorLeaderShifts) => set({ floorLeaderShifts }),
    
    setActiveShift: (activeShift) => {
      set({ activeShift });
      if (activeShift) {
        localStorage.setItem('bby_active_shift', JSON.stringify(activeShift));
      } else {
        localStorage.removeItem('bby_active_shift');
      }
    },

    saveFloorLeaderShift: (newShift) => {
      const floorLeaderShifts = get().floorLeaderShifts || [];
      const dbConnected = get().dbConnected;
      const shiftWithTime = { ...newShift, lastUpdated: Date.now() };
      
      const existsIndex = floorLeaderShifts.findIndex(s => s.id === shiftWithTime.id);
      let updated;
      if (existsIndex >= 0) {
        updated = [...floorLeaderShifts];
        updated[existsIndex] = shiftWithTime;
      } else {
        updated = [shiftWithTime, ...floorLeaderShifts];
      }
      
      set({ floorLeaderShifts: updated });
      localStorage.setItem('bby_floor_leader_shifts', JSON.stringify(updated));
      if (dbConnected) {
        saveFloorLeaderShiftToCloud(shiftWithTime);
      }
    },

    deleteFloorLeaderShift: (shiftId) => {
      const floorLeaderShifts = get().floorLeaderShifts || [];
      const dbConnected = get().dbConnected;
      const updated = (Array.isArray(floorLeaderShifts) ? floorLeaderShifts : []).filter(s => s.id !== shiftId);
      
      try {
        const deleted = JSON.parse(localStorage.getItem('bby_deleted_shifts') || '[]');
        if (!deleted.includes(shiftId)) {
          localStorage.setItem('bby_deleted_shifts', JSON.stringify([...deleted, shiftId]));
        }
      } catch (e) {
        console.error('Failed to update bby_deleted_shifts', e);
      }

      set({ floorLeaderShifts: updated });
      localStorage.setItem('bby_floor_leader_shifts', JSON.stringify(updated));
      if (dbConnected) {
        deleteFloorLeaderShiftFromCloud(shiftId);
      }
    }
  };
};
