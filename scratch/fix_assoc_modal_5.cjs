const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/AssociateProfileModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/import \{ \(globalThis as any\)\.generateMonthlyOneOnOne \} from '\.\.\/services\/ai';/, '');

fs.writeFileSync(filePath, content);
console.log('Fixed AssociateProfileModal bad import');
