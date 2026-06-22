# Technical Debt & Health Check Analysis

I have completed a comprehensive survey of the codebase, analyzing the architecture, state management, and file structures. Here is the technical debt analysis and a proposed plan for remediation.

## Findings

### 1. Pervasive Lack of Type Safety (`@ts-nocheck`)
Almost every file in the project contains a `// @ts-nocheck` directive at the very top. This completely bypasses the TypeScript compiler, negating the benefits of using `.tsx`. Furthermore, prop types are frequently defined as `any` (e.g., `export default function StoreRoster({ onCoachEmployee }: any)`).

### 2. Massive Component Files (Incomplete Modularization)
While features like `StoreRoster`, `CoachSimulator`, and `PlaybookStudio` have dedicated subdirectories, their parent component files remain bloated (ranging from 15-20KB each). They contain complex UI state, massive return blocks, and inline helper functions that should be further modularized.

### 3. Tangled State Exports
`AppContext.jsx` currently acts as a middleman for several Zustand store actions (e.g., `storePin`, `dbConnected`, `login`, `logout`). This mixed paradigm (Context wrapping Zustand) directly contributed to the `storeId` bug we just fixed. Global state should be consumed strictly from `useStore`.

### 4. Extensive Inline Styling
The project relies heavily on inline styles (e.g., `style={{ display: 'flex', gap: '2rem' }}`) instead of CSS classes or a design system. This bloats the JSX significantly and makes maintaining visual consistency very difficult.

---

## Proposed Changes (Prioritized)

I propose a staged approach to tackle this technical debt without disrupting the live application.

### Phase 1: State Hook Cleanup (Recommended Starting Point)
- Update `App.tsx` and remaining core layout components to pull their state directly from `useStore` instead of `useApp()`.
- Remove the Zustand pass-through functions from `AppContext.jsx`, limiting Context strictly to React-specific environment configurations.

### Phase 2: Component Modularity
- Break down the massive `StoreRoster.tsx`, `PlaybookStudio.tsx`, and `RoleplayCenter.tsx` files.
- Extract complex UI state into custom hooks (e.g., expanding on the existing `useStoreRoster.ts` pattern).

### Phase 3: TypeScript Adoption
- Incrementally remove `// @ts-nocheck` from core components.
- Define proper `interface` objects for component props and state slices.

## User Review Required

> [!WARNING]
> Fixing the TypeScript warnings (Phase 3) will result in a massive number of minor file changes. It is usually best to do this *after* we are finished adding features.

If you approve, I will begin by executing **Phase 1: State Hook Cleanup** to fully bulletproof the Firebase connection logic and remove the dangerous Context middleman. Please let me know how you would like to proceed!
