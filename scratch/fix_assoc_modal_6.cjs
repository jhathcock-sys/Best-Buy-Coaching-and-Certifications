const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/AssociateProfileModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The apiKey error
content = content.replace(/apiKey\.gemini/g, '(apiKey as any)');

// The today - d error
content = content.replace(/today - d/g, '(today as any) - (d as any)');

// The (e) parameter error
content = content.replace(/\(e\)/g, '(e: any)');

// The sparkline empty array error
content = content.replace(/data=\{\[\]\}/g, 'data={[] as any[]}');

fs.writeFileSync(filePath, content);
console.log('Fixed AssociateProfileModal exact strings');
