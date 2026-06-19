const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/MetricSparkline.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('// @ts-nocheck\n', '');

const interfaceStr = `export interface MetricSparklineProps {
  dataPoints: any[];
  color?: string;
}

export default function MetricSparkline({ dataPoints = [], color = 'var(--bby-blue)' }: MetricSparklineProps) {`;

content = content.replace(/export default function MetricSparkline\(\{ dataPoints = \[\], color = 'var\(--bby-blue\)' \}\) \{/, interfaceStr);

fs.writeFileSync(filePath, content);
console.log('Fixed MetricSparkline');
