import { StateCreator } from 'zustand';
import { StoreState, ShiftSlice } from '../../types/store';
import { saveFloorLeaderShiftToCloud, deleteFloorLeaderShiftFromCloud } from '../../services/firebase';
import { ShiftSchema } from '../../schemas';
import { safeJsonParse } from './constants';

export const createShiftSlice: StateCreator<StoreState, [], [], ShiftSlice> = (set, get) => {
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
    floorLeaderShifts: [],
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
      if (dbConnected) {
        saveFloorLeaderShiftToCloud(shiftWithTime);
      }
    },

    deleteFloorLeaderShift: (shiftId) => {
      const floorLeaderShifts = get().floorLeaderShifts || [];
      const dbConnected = get().dbConnected;
      const updated = (Array.isArray(floorLeaderShifts) ? floorLeaderShifts : []).filter(s => s.id !== shiftId);
      
      set({ floorLeaderShifts: updated });
      if (dbConnected) {
        deleteFloorLeaderShiftFromCloud(shiftId);
      }
    }
  };
};
