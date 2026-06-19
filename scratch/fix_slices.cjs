const fs = require('fs');
const path = require('path');

const slices = ['authSlice.ts', 'shiftSlice.ts', 'playbookSlice.ts', 'metricsSlice.ts'];
const sliceTypes = ['AuthSlice', 'ShiftSlice', 'PlaybookSlice', 'MetricsSlice'];

slices.forEach((sliceFile, idx) => {
  const filePath = path.join(__dirname, '../src/store/slices', sliceFile);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add imports
  if (!content.includes('StateCreator')) {
    content = `import { StateCreator } from 'zustand';\nimport { StoreState, ${sliceTypes[idx]} } from '../../types/store';\n` + content;
  }

  // Type the factory function
  const regex = new RegExp(`export const create${sliceTypes[idx].replace('Slice', '')}Slice = \\(set, get\\) => \\{`);
  content = content.replace(regex, `export const create${sliceTypes[idx].replace('Slice', '')}Slice: StateCreator<StoreState, [], [], ${sliceTypes[idx]}> = (set, get) => {`);

  // Any specific fixes for the slice bodies if needed can be handled individually or with any assertions.
  // We'll run tsc after this to catch internal implementation type mismatches.

  fs.writeFileSync(filePath, content);
});

console.log('Typed slice factories');
