# Tech Debt Resolution Report: React & Zustand Architecture

The Research Agent has completed an exhaustive review of modern React best practices, the official Zustand documentation, and authoritative patterns to resolve the core structural flaws identified during our codebase audit. 

Here are the canonical, approved code patterns we must adopt to resolve the inconsistencies:

## 1. Zustand Atomicity & Infinite Renders

**The Anti-Pattern:**
Returning anonymous objects (like `{}`) or arrays as fallback values inside a Zustand selector or during render (e.g., `useStore(state => state.data || {})`). This forces React to see a new memory reference every time the component renders, completely destroying memoization (`useMemo`, `React.memo`) and causing infinite render loops.

**The Canonical Resolution:**
1. **Stable Fallback References:** Define empty fallback objects/arrays outside of the component or use strict atomic selectors.
2. **`useShallow`:** When selecting multiple properties from a Zustand store, wrap the selector in `useShallow` (from `zustand/react/shallow`).

```tsx
import { useShallow } from 'zustand/react/shallow';

// ✅ GOOD: Stable reference defined outside the component (won't trigger re-renders)
const EMPTY_ROSTER = {};

function RosterComponent({ activePeriod }) {
  // ✅ GOOD: Returns a stable reference if the data is missing
  const rawRoster = useStore(state => 
    state.rosterHistory?.[activePeriod] ?? EMPTY_ROSTER
  );
  
  // ✅ GOOD: For multiple fields, useShallow prevents re-renders
  const { isDense, visibleCols } = useStore(useShallow(state => ({
    isDense: state.isDense,
    visibleCols: state.visibleCols
  })));
}
```

## 2. Stale State Hydration Traps

**The Anti-Pattern:**
Initializing local `useState` with a global value that hydrates asynchronously from Firebase. `const [selectedPeriod, setSelectedPeriod] = useState(activePeriod);` will lock onto the initial `undefined` or `null` value forever.

**The Canonical Resolution:**
The modern React standard is **The Key Reset Pattern**. Instead of writing complex `useEffect` synchronization logic, force React to mount the component *only after* the async data is ready, or use the `key` prop to re-initialize the state when the default value arrives.

```tsx
// ✅ GOOD: The Key Reset Pattern
// In the Parent Component:
if (!activePeriod) return <SkeletonLoader />;

// By passing `activePeriod` as the key, React will completely remount the component 
// if activePeriod ever changes, guaranteeing `useState(activePeriod)` inside is fresh.
return <RentsDueAuditor key={activePeriod} initialPeriod={activePeriod} />;
```

If it strictly must sync within the same component without remounting (e.g., a dropdown that defaults to the global setting but can be changed locally), use a targeted `useEffect` for one-way sync:

```tsx
// ⚠️ ACCEPTABLE: One-way sync using useEffect
const [selectedPeriod, setSelectedPeriod] = useState(activePeriod);

useEffect(() => {
  if (activePeriod) {
    setSelectedPeriod(activePeriod);
  }
}, [activePeriod]);
```

## 3. Hydration Guards

**The Anti-Pattern:**
Allowing a component tree to render while its required global context (like `playbookSettings`) is still loading, resulting in `null` destructuring crashes.

**The Canonical Resolution:**
Use the **Early Return Pattern** combined with Skeleton loaders at the route or container level. Guard the entry point so children can safely assume data exists.

```tsx
// ✅ GOOD: Hydration Guard at the Container Level
export default function DashboardRoute() {
  const isHydrating = useStore(state => state.isHydrating);
  const playbookSettings = useStore(state => state.playbookSettings);

  // 1. Guard against missing async data
  if (isHydrating || !playbookSettings) {
    return (
      <div className="p-md">
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    );
  }

  // 2. Safe to render children. 
  // Children can now safely assume `playbookSettings` is fully populated.
  return <DashboardContent settings={playbookSettings} />;
}
```

## 4. God Object Hook Refactoring

**The Anti-Pattern:**
A single custom hook (`useStoreRoster.ts`) that manages network requests, parsing logic, AND localized view state (like UI toggles `isDense`, `visibleCols`), mixing concerns and bloating exports.

**The Canonical Resolution:**
Apply the **Separation of Concerns / View Model Pattern**. Split the God hook into two distinct domains: **Data Layer** and **View Layer**.

**Step 1: The Data Hook** (Focuses strictly on Firebase/API and caching)
```tsx
export function useRosterData(storeId: string) {
  // Only handles network state, caching, and raw data formatting
  const { data, isLoading, error } = useQuery(...);
  return { roster: data, isLoading, error };
}
```

**Step 2: The View Hook** (Focuses strictly on UI state)
```tsx
export function useRosterView() {
  // Only handles ephemeral UI toggles, sorting, and filtering
  const [isDense, setIsDense] = useState(false);
  const [visibleCols, setVisibleCols] = useState(['name', 'role']);
  
  return { isDense, setIsDense, visibleCols, setVisibleCols };
}
```

**Step 3: Component Composition**
```tsx
export function RosterTable({ storeId }) {
  // Clean, modular composition inside the dumb component
  const { roster, isLoading } = useRosterData(storeId);
  const { isDense, visibleCols } = useRosterView();

  if (isLoading) return <Skeleton />;
  
  return (
    <Table className={isDense ? 'p-sm' : 'p-lg'}>
       {/* render roster... */}
    </Table>
  );
}
```
