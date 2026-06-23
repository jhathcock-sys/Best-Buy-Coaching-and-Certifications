import os
import re
import shutil

src_dir = r"c:\Users\jhath\projects\Best Buy Coaching and Certifications\src"
components_dir = os.path.join(src_dir, "components")
pages_dir = os.path.join(src_dir, "pages")

os.makedirs(pages_dir, exist_ok=True)

pages = [
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
]

# Move files and rename
for page in pages:
    old_path = os.path.join(components_dir, page)
    new_page_name = page.replace(".tsx", "Page.tsx")
    new_path = os.path.join(pages_dir, new_page_name)
    
    if os.path.exists(old_path):
        shutil.move(old_path, new_path)
        
        # Update imports in the new file
        with open(new_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Any import starting with './' needs to point to '../components/'
        content = re.sub(r"(from\s+['\"])\./(.*?)['\"]", r"\1../components/\2'", content)
        # Handle 'import "./..."'
        content = re.sub(r"(import\s+['\"])\./(.*?)['\"]", r"\1../components/\2'", content)
        
        with open(new_path, "w", encoding="utf-8") as f:
            f.write(content)

# Update App.tsx
app_path = os.path.join(src_dir, "App.tsx")
with open(app_path, "r", encoding="utf-8") as f:
    app_content = f.read()

for page in pages:
    base_name = page.replace(".tsx", "")
    new_base_name = base_name + "Page"
    
    # Update lazy load and standard imports
    app_content = app_content.replace(f"./components/{base_name}", f"./pages/{new_base_name}")
    # Update JSX elements
    app_content = re.sub(rf"<{base_name}(\s|>)", rf"<{new_base_name}\1", app_content)
    # Update the component assignments
    app_content = re.sub(rf"const {base_name} =", rf"const {new_base_name} =", app_content)
    # Update imports like `import AdvisorDashboard from ...`
    app_content = re.sub(rf"import {base_name} from", rf"import {new_base_name} from", app_content)

with open(app_path, "w", encoding="utf-8") as f:
    f.write(app_content)
    
print("Migration complete!")
