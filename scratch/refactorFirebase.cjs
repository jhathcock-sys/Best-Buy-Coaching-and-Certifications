const fs = require('fs');
let c = fs.readFileSync('src/services/firebase.ts', 'utf8');

c = c.replace(/\/\/ Seed initial offline data to cloud when connecting first time![\s\S]*?export const pushOfflineDataToCloud = async [\s\S]*?catch \(e\) \{[\s\S]*?console\.error\('Failed to push offline data to cloud:', e\);[\s\S]*?return false;\s*\}\s*\};\s*/, '');

fs.writeFileSync('src/services/firebase.ts', c);
console.log('firebase.ts pushOfflineDataToCloud removed successfully.');
