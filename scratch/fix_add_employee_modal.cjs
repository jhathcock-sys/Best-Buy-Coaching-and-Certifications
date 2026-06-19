const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/AddEmployeeModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('// @ts-nocheck\n', '');

const interfaceStr = `
export interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (emp: any) => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onAddEmployee }: AddEmployeeModalProps) {
`;

content = content.replace(/export default function AddEmployeeModal\(\{ isOpen, onClose, onAddEmployee \}\) \{/, interfaceStr);

fs.writeFileSync(filePath, content);
console.log('Removed ts-nocheck and added props to AddEmployeeModal');
