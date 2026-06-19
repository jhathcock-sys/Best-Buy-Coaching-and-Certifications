const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');
c = c.replace(/const unsubFloorLeader = subscribeToFloorLeaderShifts\(storeId, \(shifts\) => \{[\s\S]*?localStorage\.setItem\('bby_floor_leader_shifts', JSON\.stringify\(mergedShifts\)\);\s*\}\s*\);\s*/,
`const unsubFloorLeader = subscribeToFloorLeaderShifts(storeId, (shifts) => {
      if (shifts) {
        setFloorLeaderShifts(shifts);
      }
    });\n`);
fs.writeFileSync('src/App.tsx', c);
console.log('App.tsx floorLeaderShifts refactored successfully.');
