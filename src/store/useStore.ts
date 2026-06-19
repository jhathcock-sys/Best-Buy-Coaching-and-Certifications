import { create } from 'zustand';
import { createAuthSlice } from './slices/authSlice';
import { createShiftSlice } from './slices/shiftSlice';
import { createPlaybookSlice } from './slices/playbookSlice';
import { createMetricsSlice } from './slices/metricsSlice';

import { StoreState } from '../types/store';

export const useStore = create<StoreState>((...a) => ({
  ...createAuthSlice(...a),
  ...createShiftSlice(...a),
  ...createPlaybookSlice(...a),
  ...createMetricsSlice(...a)
}));
