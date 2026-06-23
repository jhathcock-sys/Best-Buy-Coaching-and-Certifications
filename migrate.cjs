const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(srcDir, 'components');
const pagesDir = path.join(srcDir, 'pages');

if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

const pages = [
  "Dashboard.tsx",
  "StoreRoster.tsx",
  "RoleplayCenter.tsx",
  "CoachSimulator.tsx",
  "PlaybookStudio.tsx",
  "CoachingHistory.tsx",
  "LiveFloorShadow.tsx",
  "AdvisorDashboard.tsx",
  "FloorLeaderTracker.tsx",
  "TrendReporting.tsx",
  "BreakroomTV.tsx",
  "DailyLineupBuilder.tsx"
];

pages.forEach(page => {
  const oldPath = path.join(componentsDir, page);
  const newPageName = page.replace('.tsx', 'Page.tsx');
  const newPath = path.join(pagesDir, newPageName);

  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    let content = fs.readFileSync(newPath, 'utf8');

    // Update relative imports to point back to components/
    // Example: import X from './X' -> import X from '../components/X'
    content = content.replace(/(from\s+['"])\.\/([^'"]+['"])/g, '$1../components/$2');
    content = content.replace(/(import\s+['"])\.\/([^'"]+['"])/g, '$1../components/$2');

    fs.writeFileSync(newPath, content, 'utf8');
  }
});

const appPath = path.join(srcDir, 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');

pages.forEach(page => {
  const baseName = page.replace('.tsx', '');
  const newBaseName = baseName + 'Page';

  appContent = appContent.replace(new RegExp(`\\./components/${baseName}`, 'g'), `./pages/${newBaseName}`);
  appContent = appContent.replace(new RegExp(`<${baseName}(\\s|>)`, 'g'), `<${newBaseName}$1`);
  appContent = appContent.replace(new RegExp(`const ${baseName} =`, 'g'), `const ${newBaseName} =`);
  appContent = appContent.replace(new RegExp(`import ${baseName} from`, 'g'), `import ${newBaseName} from`);
});

fs.writeFileSync(appPath, appContent, 'utf8');
console.log('Migration complete!');
