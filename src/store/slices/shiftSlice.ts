import { StateCreator } from 'zustand';
import { StoreState, ShiftSlice } from '../../types/store';
import { saveFloorLeaderShiftToCloud, deleteFloorLeaderShiftFromCloud } from '../../services/firebase';
import { ShiftSchema } from '../../schemas';
import { safeJsonParse } from './constants';

export const createShiftSlice: StateCreator<StoreState, [], [], ShiftSlice> = (set, get) => {
  let initialActiveShift = null;

  return {
    floorLeaderShifts: [],
    activeShift: initialActiveShift,

    setFloorLeaderShifts: (floorLeaderShifts) => set({ floorLeaderShifts }),
    
    setActiveShift: (activeShift) => {
      set({ activeShift });
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
        const storeId = get().storeId;
        if (storeId) {
          saveFloorLeaderShiftToCloud(storeId, shiftWithTime);
        }
      }
    },

    deleteFloorLeaderShift: (shiftId) => {
      const floorLeaderShifts = get().floorLeaderShifts || [];
      const dbConnected = get().dbConnected;
      const updated = (Array.isArray(floorLeaderShifts) ? floorLeaderShifts : []).filter(s => s.id !== shiftId);
      
      set({ floorLeaderShifts: updated });
      if (dbConnected) {
        const storeId = get().storeId;
        if (storeId) {
          deleteFloorLeaderShiftFromCloud(storeId, shiftId);
        }
      }
    }
  };
};
