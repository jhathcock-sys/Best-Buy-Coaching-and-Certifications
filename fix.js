import fs from 'fs';

const mockStore = \i.mock('../../store/useStore', () => ({
  useStore: vi.fn().mockImplementation((selector) => {
    const state = {
      coachingLogs: [],
      shifts: [],
      managers: [],
      departments: [],
      roster: [],
      activePeriod: null,
      deptGoals: {},
      rosterHistory: {},
      playbookSettings: {}
    };
    return selector ? selector(state) : state;
  }),
}));\;

const fixTest = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/vi\\.mock\\([^;]+;\\n\\}\\)\\);/, mockStore);
  fs.writeFileSync(file, content);
};

fixTest('src/pages/__tests__/CoachingHistoryPage.test.tsx');
fixTest('src/pages/__tests__/CommandCenter.test.tsx');
fixTest('src/pages/__tests__/FloorLeaderTrackerPage.test.tsx');
fixTest('src/pages/__tests__/CoachSimulatorPage.test.tsx');
fixTest('src/pages/__tests__/AuraHUDPage.test.tsx');
