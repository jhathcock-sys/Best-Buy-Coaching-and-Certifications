import { StateCreator } from 'zustand';

export interface UiSlice {
  selectedCoachingRosterEmployee: any | null;
  setSelectedCoachingRosterEmployee: (emp: any | null) => void;
  
  prefillBuilderData: any | null;
  setPrefillBuilderData: (data: any | null) => void;
  
  prefillShadowEmployee: any | null;
  setPrefillShadowEmployee: (emp: any | null) => void;
  
  collapsedCategories: {
    overview: boolean;
    floorOps: boolean;
    coachingPractice: boolean;
    recordsSetup: boolean;
    [key: string]: boolean;
  };
  setCollapsedCategories: (cats: any) => void;
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
    ? set((state) => ({ collapsedCategories: cats(state.collapsedCategories) }))
    : set({ collapsedCategories: cats }),
  toggleCategory: (cat) => set((state) => ({
    collapsedCategories: {
      ...state.collapsedCategories,
      [cat]: !state.collapsedCategories[cat]
    }
  }))
});
