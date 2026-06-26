import { StateCreator } from 'zustand';
import { Employee } from '../../types';

export interface UiSlice {
  selectedCoachingRosterEmployee: Employee | null;
  setSelectedCoachingRosterEmployee: (emp: Employee | null) => void;
  
  prefillBuilderData: Employee | null;
  setPrefillBuilderData: (data: Employee | null) => void;
  
  prefillShadowEmployee: Employee | null;
  setPrefillShadowEmployee: (emp: Employee | null) => void;
  
  collapsedCategories: {
    overview: boolean;
    floorOps: boolean;
    coachingPractice: boolean;
    recordsSetup: boolean;
    [key: string]: boolean;
  };
  setCollapsedCategories: (cats: Partial<UiSlice['collapsedCategories']> | ((prev: UiSlice['collapsedCategories']) => Partial<UiSlice['collapsedCategories']>)) => void;
  toggleCategory: (cat: string) => void;
}

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  selectedCoachingRosterEmployee: null,
  setSelectedCoachingRosterEmployee: (emp) => set({ selectedCoachingRosterEmployee: emp }),
  
  prefillBuilderData: null,
  setPrefillBuilderData: (data) => set({ prefillBuilderData: data }),
  
  prefillShadowEmployee: null,
  setPrefillShadowEmployee: (emp) => set({ prefillShadowEmployee: emp }),
  
  collapsedCategories: {
    overview: false,
    floorOps: false,
    coachingPractice: false,
    recordsSetup: false
  },
  setCollapsedCategories: (cats) => typeof cats === 'function' 
    ? set((state) => ({ collapsedCategories: { ...state.collapsedCategories, ...cats(state.collapsedCategories) } }))
    : set((state) => ({ collapsedCategories: { ...state.collapsedCategories, ...cats } })),
  toggleCategory: (cat) => set((state) => ({
    collapsedCategories: {
      ...state.collapsedCategories,
      [cat]: !state.collapsedCategories[cat]
    }
  }))
});
