const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/AddEmployeeModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix implicitly any parameters
content = content.replace(/\(e\) =>/g, '(e: any) =>');
content = content.replace(/e\.preventDefault/g, '(e as any).preventDefault');

fs.writeFileSync(filePath, content);
console.log('Fixed AddEmployeeModal e type');
