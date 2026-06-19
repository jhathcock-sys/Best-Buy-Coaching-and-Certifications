const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../src/components/Dashboard.tsx');
let content = fs.readFileSync(dashPath, 'utf8');

// Fix the syntax errors caused by my aggressive e => replacement
content = content.replace(/stat\(e: any\) =>/g, 'state =>');
content = content.replace(/zon\(e: any\) =>/g, 'zone =>');
content = content.replace(/valu\(e: any\) =>/g, 'value =>');
content = content.replace(/typ\(e: any\) =>/g, 'type =>');
content = content.replace(/tru\(e: any\)/g, 'true');
content = content.replace(/fals\(e: any\)/g, 'false');

fs.writeFileSync(dashPath, content);
console.log('Fixed syntax errors');
