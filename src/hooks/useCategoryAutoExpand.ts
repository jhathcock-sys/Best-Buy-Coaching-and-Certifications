import { useEffect } from 'react';
import React from 'react';

export type CollapsedCategoriesState = Record<string, boolean>;

export function useCategoryAutoExpand(
  activeView: string,
  setCollapsedCategories: React.Dispatch<React.SetStateAction<CollapsedCategoriesState>>
) {
  useEffect(() => {
    if (activeView === 'dashboard') {
      setCollapsedCategories((prev) => ({ ...prev, overview: false }));
    } else if (activeView === 'roster' || activeView === 'shadow' || activeView === 'floorLeader') {
      setCollapsedCategories((prev) => ({ ...prev, floorOps: false }));
    } else if (activeView === 'roleplay' || activeView === 'coach') {
      setCollapsedCategories((prev) => ({ ...prev, coachingPractice: false }));
    } else if (activeView === 'builder' || activeView === 'history' || activeView === 'playbook') {
      setCollapsedCategories((prev) => ({ ...prev, recordsSetup: false }));
    }
  }, [activeView, setCollapsedCategories]);
}
