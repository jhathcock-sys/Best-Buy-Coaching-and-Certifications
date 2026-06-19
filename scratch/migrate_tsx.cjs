const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.jsx')) {
      const newPath = fullPath.replace(/\.jsx$/, '.tsx');
      fs.renameSync(fullPath, newPath);
      
      let content = fs.readFileSync(newPath, 'utf8');
      if (!content.startsWith('// @ts-nocheck')) {
        content = '// @ts-nocheck\n' + content;
        fs.writeFileSync(newPath, content);
      }
      console.log(`Migrated ${file} to .tsx`);
    }
  }
}

processDir(path.join(__dirname, '../src/components'));
