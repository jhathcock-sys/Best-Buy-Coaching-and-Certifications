const fs = require('fs');
const path = require('path');

const mcPath = path.join(__dirname, '../src/components/Dashboard/MetricCards.tsx');
let content = fs.readFileSync(mcPath, 'utf8');

// Add icon props to CircularGauge
content = content.replace(/label="Total Memberships"/g, 'label="Total Memberships" icon={<Users size={20}/>}');
content = content.replace(/label="BBY Credit Cards"/g, 'label="BBY Credit Cards" icon={<CreditCard size={20}/>}');
content = content.replace(/label="Protection Attach"/g, 'label="Protection Attach" icon={<Shield size={20}/>}');
content = content.replace(/label="Customer Surveys"/g, 'label="Customer Surveys" icon={<Star size={20}/>}');
content = content.replace(/label="Store RPH"/g, 'label="Store RPH" icon={<TrendingUp size={20}/>}');
content = content.replace(/label="Coaching Sessions"/g, 'label="Coaching Sessions" icon={<ClipboardList size={20}/>}');

// Add imports
content = `import { Users, CreditCard, Shield, Star, TrendingUp, ClipboardList } from 'lucide-react';\n` + content;

fs.writeFileSync(mcPath, content);
console.log('Fixed MetricCards.tsx');
