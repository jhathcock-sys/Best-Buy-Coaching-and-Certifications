const fs = require('fs');

let content = fs.readFileSync('src/components/RentsDueAuditor.tsx', 'utf-8');
content = content.replace(/handleTextSubmit=\{handleTextSubmit\}/g, 'handleManualTextParse={handleManualTextParse}\n              handleProcessFile={handleProcessFile}\n              loadDemoData={loadDemoData}');
content = content.replace(/<RentsDueLedger /g, '<RentsDueLedger \n              gaps={gaps}');
fs.writeFileSync('src/components/RentsDueAuditor.tsx', content, 'utf-8');

content = fs.readFileSync('src/components/RentsDueAuditor/RentsDueUploader.tsx', 'utf-8');
content = content.replace(/handleTextSubmit,/g, 'handleManualTextParse,\n    handleProcessFile,\n    loadDemoData,');
fs.writeFileSync('src/components/RentsDueAuditor/RentsDueUploader.tsx', content, 'utf-8');

content = fs.readFileSync('src/components/RentsDueAuditor/RentsDueLedger.tsx', 'utf-8');
content = content.replace(/handleTextSubmit,/g, 'gaps,');
fs.writeFileSync('src/components/RentsDueAuditor/RentsDueLedger.tsx', content, 'utf-8');

console.log("Done");
