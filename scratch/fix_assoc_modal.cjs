const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/AssociateProfileModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('// @ts-nocheck\n', '');

const interfaceStr = `export interface AssociateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  rosterHistory?: any;
  coachingLogs?: any[];
  followUpTasks?: any[];
  deptGoals?: any;
  activePeriod?: string;
}

export default function AssociateProfileModal({
  isOpen,
  onClose,
  employee,
  rosterHistory = {},
  coachingLogs = [],
  followUpTasks = [],
  deptGoals = {},
  activePeriod
}: AssociateProfileModalProps) {`;

content = content.replace(/export default function AssociateProfileModal\(\{[\s\S]*?\}\) \{/, interfaceStr);

content = content.replace(/\(e\) =>/g, '(e: any) =>');
content = content.replace(/\(log\) =>/g, '(log: any) =>');
content = content.replace(/\(task\) =>/g, '(task: any) =>');
content = content.replace(/\(h\) =>/g, '(h: any) =>');
content = content.replace(/\(p\) =>/g, '(p: any) =>');

fs.writeFileSync(filePath, content);
console.log('Fixed AssociateProfileModal');
