const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/AssociateProfileModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix implicitly any parameters
content = content.replace(/\(logId, text\) =>/g, '(logId: any, text: any) =>');
content = content.replace(/const renderFormattedText = \(text\) => \{/g, 'const renderFormattedText = (text: any) => {');
content = content.replace(/\(line, i\)/g, '(line: any, i: number)');
content = content.replace(/new Date\(b\.timestamp\) - new Date\(a\.timestamp\)/g, '(new Date(b.timestamp) as any) - (new Date(a.timestamp) as any)');
content = content.replace(/b\.timestamp - a\.timestamp/g, '(b.timestamp || 0) - (a.timestamp || 0)');

// Fix apiKeys to apiKey
content = content.replace(/apiKeys/g, 'apiKey');

// Fix Type 'any[]' is not assignable to type 'never[]' (empty arrays mapped to Sparkline)
content = content.replace(/data=\{\[\]\}/g, 'data={[] as any[]}');

// Fix error generating review assignment
content = content.replace(/setOneOnOneReview\("Error generating review. Please check your API key."\);/g, 'setOneOnOneReview({ error: "Error generating review. Please check your API key." });');

fs.writeFileSync(filePath, content);
console.log('Fixed AssociateProfileModal TS errors');
