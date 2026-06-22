const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../src/services/firebase.ts');
let content = fs.readFileSync(targetPath, 'utf8');

if (!content.includes("import { toast } from 'react-hot-toast';")) {
  content = "import { toast } from 'react-hot-toast';\n" + content;
}

// Replace console.error('...', e); with toast and console.error
content = content.replace(/catch \((.*?)\) \{\s*console\.error\((['"`])(.*?)\2,\s*\1\);\s*return false;\s*\}/g, (match, errVar, quote, msg) => {
  return `catch (${errVar}) {
    console.error(${quote}${msg}${quote}, ${errVar});
    toast.error(${quote}${msg}${quote});
    return false;
  }`;
});

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Firebase error toasts injected.');
