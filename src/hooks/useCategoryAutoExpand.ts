import { useEffect } from 'react';

export function useCategoryAutoExpand(activeView: string, setCollapsedCategories: (updater: (prev: any) => any) => void) {
  useEffect(() => {
    setTimeout(() => {
      if (activeView === 'dashboard') {
        setCollapsedCategories((prev: any) => ({ ...prev, overview: false }));
      } else if (activeView === 'roster' || activeView === 'shadow' || activeView === 'floorLeader') {
        setCollapsedCategories((prev: any) => ({ ...prev, floorOps: false }));
      } else if (activeView === 'roleplay' || activeView === 'coach') {
        setCollapsedCategories((prev: any) => ({ ...prev, coachingPractice: false }));
      } else if (activeView === 'builder' || activeView === 'history' || activeView === 'playbook') {
        setCollapsedCategories((prev: any) => ({ ...prev, recordsSetup: false }));
      }
    }, 0);
  }, [activeView, setCollapsedCategories]);
}
