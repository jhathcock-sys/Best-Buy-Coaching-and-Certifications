const fs = require('fs');
const path = 'c:\\Users\\jhath\\projects\\Best Buy Coaching and Certifications\\src\\App.tsx';

let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');

// 1. Add imports
let import_idx = lines.findIndex(line => line.includes("import ErrorBoundary"));
if (import_idx !== -1) {
    lines.splice(import_idx + 1, 0, "import Sidebar from './components/layout/Sidebar';");
    lines.splice(import_idx + 2, 0, "import MobileNav from './components/layout/MobileNav';");
}

// 2. Replace Sidebar
let start_sidebar = lines.findIndex(line => line.includes('className="sidebar"')) - 1;
let end_sidebar = lines.findIndex(line => line.includes('className="main-content"')) - 2;

const sidebar_replacement = `      <Sidebar 
        activeView={activeView as string}
        setActiveView={setActiveView}
        activeManager={activeManager}
        logout={logout}
        toggleCategory={toggleCategory}
        collapsedCategories={collapsedCategories}
        dbConnected={dbConnected}
        playbookSettings={playbookSettings}
        apiKey={apiKey}
      />`;

if (start_sidebar !== -1 && end_sidebar !== -1) {
    lines.splice(start_sidebar, end_sidebar - start_sidebar + 1, sidebar_replacement);
}

// 3. Replace MobileNav
let start_mobile = lines.findIndex(line => line.includes('className="bottom-nav"')) - 1;
let end_mobile = lines.findIndex(line => line.includes('Service Worker Update Toast Banner')) - 1;

const mobile_replacement = `      <MobileNav 
        activeView={activeView as string}
        setActiveView={setActiveView}
      />`;

if (start_mobile !== -1 && end_mobile !== -1) {
    lines.splice(start_mobile, end_mobile - start_mobile + 1, mobile_replacement);
}

fs.writeFileSync(path, lines.join('\n'));
