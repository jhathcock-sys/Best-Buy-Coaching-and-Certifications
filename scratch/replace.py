import sys

path = 'c:\\Users\\jhath\\projects\\Best Buy Coaching and Certifications\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Add imports
import_idx = -1
for i, line in enumerate(lines):
    if "import ErrorBoundary" in line:
        import_idx = i
        break

if import_idx != -1:
    lines.insert(import_idx + 1, "import Sidebar from './components/layout/Sidebar';\n")
    lines.insert(import_idx + 2, "import MobileNav from './components/layout/MobileNav';\n")

# 2. Replace Sidebar
start_sidebar = -1
end_sidebar = -1
for i, line in enumerate(lines):
    if "className=\"sidebar\"" in line:
        start_sidebar = i - 1 # include the comment {/* Sidebar Navigation */}
    if "className=\"main-content\"" in line:
        end_sidebar = i - 2
        break

sidebar_replacement = """      <Sidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        activeManager={activeManager}
        logout={logout}
        toggleCategory={toggleCategory}
        collapsedCategories={collapsedCategories}
        dbConnected={dbConnected}
        playbookSettings={playbookSettings}
        apiKey={apiKey}
      />
"""

if start_sidebar != -1 and end_sidebar != -1:
    lines = lines[:start_sidebar] + [sidebar_replacement] + lines[end_sidebar:]

# 3. Replace MobileNav
start_mobile = -1
end_mobile = -1
for i, line in enumerate(lines):
    if "className=\"bottom-nav\"" in line:
        start_mobile = i - 1 # include the comment {/* Mobile-Only Bottom Navigation Bar */}
    if "Service Worker Update Toast Banner" in line:
        end_mobile = i - 1 # go up to the blank line
        break

mobile_replacement = """      <MobileNav 
        activeView={activeView}
        setActiveView={setActiveView}
      />
"""

if start_mobile != -1 and end_mobile != -1:
    lines = lines[:start_mobile] + [mobile_replacement] + lines[end_mobile:]

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
