const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../src/components/Dashboard.tsx');
let content = fs.readFileSync(dashPath, 'utf8');

// Remove double imports
content = content.replace(/import MetricCards from '\.\/Dashboard\/MetricCards';\nimport MetricCards from '\.\/Dashboard\/MetricCards';/, "import MetricCards from './Dashboard/MetricCards';");
content = content.replace(/import CircularGauge from '\.\/Dashboard\/CircularGauge';\nimport CircularGauge from '\.\/Dashboard\/CircularGauge';/, "import CircularGauge from './Dashboard/CircularGauge';");

fs.writeFileSync(dashPath, content);
console.log('Fixed double imports');
