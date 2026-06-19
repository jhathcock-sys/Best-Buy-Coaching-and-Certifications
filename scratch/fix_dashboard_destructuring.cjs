const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../src/components/Dashboard.tsx');
let content = fs.readFileSync(dashPath, 'utf8');

content = content.replace(/activePeriod \|\| "",/g, 'activePeriod = "",');

fs.writeFileSync(dashPath, content);
console.log('Fixed destructuring syntax error');
