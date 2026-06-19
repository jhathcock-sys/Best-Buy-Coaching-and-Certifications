const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/ImportScheduleModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('// @ts-nocheck\n', '');

const interfaceStr = `export interface ImportScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (shifts: any[]) => void;
}

export default function ImportScheduleModal({ isOpen, onClose, onImport }: ImportScheduleModalProps) {`;

content = content.replace(/export default function ImportScheduleModal\(\{ isOpen, onClose, onImport \}\) \{/, interfaceStr);

content = content.replace(/\(e\)/g, '(e: any)');
content = content.replace(/\(emp\)/g, '(emp: any)');
content = content.replace(/\(shift\)/g, '(shift: any)');
content = content.replace(/\(s\)/g, '(s: any)');
content = content.replace(/\(item\)/g, '(item: any)');

fs.writeFileSync(filePath, content);
console.log('Fixed ImportScheduleModal');
