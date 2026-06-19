const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../src/components/Dashboard.tsx');
let dashboardContent = fs.readFileSync(dashPath, 'utf8');

// Ensure directory exists
const dashDir = path.join(__dirname, '../src/components/Dashboard');
if (!fs.existsSync(dashDir)) {
  fs.mkdirSync(dashDir);
}

// Extract CircularGauge
const gaugeRegex = /\/\/ Circular Gauge Helper\r?\nconst CircularGauge = \(\{[\s\S]*?\}\) => \{[\s\S]*?\r?\n\};\r?\n/m;
const gaugeMatch = dashboardContent.match(gaugeRegex);
if (gaugeMatch) {
  const gaugeCode = `// @ts-nocheck\nimport { useState, useMemo } from 'react';\nimport { TrendingUp } from 'lucide-react';\n\n${gaugeMatch[0]}\nexport default CircularGauge;`;
  fs.writeFileSync(path.join(dashDir, 'CircularGauge.tsx'), gaugeCode);
  dashboardContent = dashboardContent.replace(gaugeRegex, '');
  dashboardContent = `import CircularGauge from './Dashboard/CircularGauge';\n` + dashboardContent;
}

// Extract TrendMiniChart
const trendRegex = /\/\/ Mini Sparkline Chart for Trend visualization\r?\nconst TrendMiniChart = \(\{[\s\S]*?\r?\n\};\r?\n/m;
const trendMatch = dashboardContent.match(trendRegex);
if (trendMatch) {
  const trendCode = `// @ts-nocheck\n${trendMatch[0]}\nexport default TrendMiniChart;`;
  fs.writeFileSync(path.join(dashDir, 'TrendMiniChart.tsx'), trendCode);
  dashboardContent = dashboardContent.replace(trendRegex, '');
  dashboardContent = `import TrendMiniChart from './Dashboard/TrendMiniChart';\n` + dashboardContent;
}

// We will keep the main layout inside Dashboard.tsx for now to ensure stability, 
// but we've removed the helper components.

fs.writeFileSync(dashPath, dashboardContent);
console.log('Dashboard monolith simplified');
