const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/,\s*pushOfflineDataToCloud/g, '');

c = c.replace(/const seedCloud = async \(\) => \{[\s\S]*?seedCloud\(\);\s*/, '');

c = c.replace(/const unsubRoster = subscribeToRosterHistory\(storeId, \(h\) => \{[\s\S]*?\}\);/m, 
`const unsubRoster = subscribeToRosterHistory(storeId, (h) => {
      if (h) {
        setRosterHistory(h);
      }
    });`);

c = c.replace(/const unsubShifts = subscribeToFloorLeaderShifts\(storeId, \(shifts\) => \{[\s\S]*?\}\);/m,
`const unsubShifts = subscribeToFloorLeaderShifts(storeId, (shifts) => {
      if (shifts) {
        setFloorLeaderShifts(shifts);
      }
    });`);

fs.writeFileSync('src/App.tsx', c);
console.log('App.tsx refactored successfully.');
