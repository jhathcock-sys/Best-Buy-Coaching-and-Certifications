const fs = require('fs');
const path = require('path');

const filesToRefactor = [
  'src/components/BreakroomTV.tsx',
  'src/components/CoachSimulator.tsx',
  'src/components/FiveStarAuditor.tsx',
  'src/components/FloorAudit.tsx',
  'src/components/FloorLeaderTracker.tsx',
  'src/components/LiveFloorShadow.tsx',
  'src/components/Playbook/CustomScenariosTab.tsx',
  'src/components/PlaybookStudio.tsx',
  'src/components/RoleplayCenter.tsx',
  'src/components/RosterAuditor.tsx',
  'src/components/ShiftSimulator.tsx',
  'src/components/StoreRoster.tsx',
  'src/components/SyncManager.tsx'
];

const useStoreProps = [
  'apiKey', 
  'dbConnected', 
  'handleSaveFirebaseConfig', 
  'playbookSettings', 
  'isAuthenticated', 
  'storePin', 
  'login', 
  'logout'
];

for (const file of filesToRefactor) {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Ensure useStore is imported if needed
  if (content.includes('useApp(') && !content.includes('useStore')) {
    // find useApp import and add useStore right after it.
    // The relative path depends on file location.
    const depth = file.split('/').length - 2;
    const dots = Array(depth).fill('..').join('/');
    const prefix = dots ? dots + '/' : './';
    const useStoreImport = `import { useStore } from '${prefix}store/useStore';`;
    content = content.replace(/(import { useApp } from '.*';)/, `$1\n${useStoreImport}`);
  }

  // Parse the useApp destructuring
  const useAppRegex = /const\s*{\s*([^}]+)\s*}\s*=\s*useApp\(\);/g;
  let match;
  while ((match = useAppRegex.exec(content)) !== null) {
    const original = match[0];
    const props = match[1].split(',').map(p => p.trim()).filter(Boolean);
    
    let appProps = [];
    let storeProps = [];
    
    for (const p of props) {
      if (useStoreProps.includes(p)) storeProps.push(p);
      else appProps.push(p);
    }
    
    let replacement = '';
    
    if (appProps.length > 0) {
      replacement += `const { ${appProps.join(', ')} } = useApp();\n`;
    }
    
    for (const p of storeProps) {
      // Indent based on original
      const indentMatch = original.match(/^\s*/);
      const indent = indentMatch ? indentMatch[0] : '';
      replacement += `${replacement ? indent : ''}const ${p} = useStore((state) => state.${p});\n`;
    }
    
    // remove trailing newline
    replacement = replacement.replace(/\n$/, '');
    
    content = content.replace(original, replacement);
  }

  fs.writeFileSync(filePath, content);
  console.log(`Refactored ${file}`);
}
