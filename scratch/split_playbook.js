const fs = require('fs');

const code = fs.readFileSync('src/components/PlaybookStudio.tsx', 'utf8');
const lines = code.split('\n');

const getTabContent = (startStr, endStr) => {
  const start = lines.findIndex(l => l.includes(startStr));
  let end;
  if (endStr) {
    end = lines.findIndex((l, i) => i > start && l.includes(endStr));
  } else {
    end = lines.length;
  }
  return lines.slice(start, end).join('\n');
};

const engineContent = getTabContent(\{activeTab === 'engine' && (\, \{activeTab === 'prompts' && (\);
const promptsContent = getTabContent(\{activeTab === 'prompts' && (\, \{activeTab === 'supervisors' && (\);
const supervisorsContent = getTabContent(\{activeTab === 'supervisors' && (\, \{activeTab === 'vocab' && (\);
const vocabContent = getTabContent(\{activeTab === 'vocab' && (\, \{activeTab === 'targets' && (\);
const targetsContent = getTabContent(\{activeTab === 'targets' && (\, \{activeTab === 'scenarios' && (\);
const syncContent = getTabContent(\{activeTab === 'sync' && (\, \</div>\);

console.log('engine size:', engineContent.length);
console.log('prompts size:', promptsContent.length);
console.log('supervisors size:', supervisorsContent.length);
console.log('vocab size:', vocabContent.length);
console.log('targets size:', targetsContent.length);
console.log('sync size:', syncContent.length);

