import re
import os

with open('src/components/RentsDueAuditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('handleTextSubmit={handleTextSubmit}', 'handleManualTextParse={handleManualTextParse}\n              handleProcessFile={handleProcessFile}\n              loadDemoData={loadDemoData}')
content = content.replace('<RentsDueLedger ', '<RentsDueLedger \n              gaps={gaps}')

with open('src/components/RentsDueAuditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/components/RentsDueAuditor/RentsDueUploader.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('handleTextSubmit,', 'handleManualTextParse,\n    handleProcessFile,\n    loadDemoData,')

with open('src/components/RentsDueAuditor/RentsDueUploader.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/components/RentsDueAuditor/RentsDueLedger.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('handleTextSubmit,', 'gaps,')

with open('src/components/RentsDueAuditor/RentsDueLedger.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
