const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../src/components/Dashboard.tsx');
let content = fs.readFileSync(dashPath, 'utf8');

// Add types to imports
content = content.replace(/import \{ useStore \} from '\.\.\/store\/useStore';/, `import { useStore } from '../store/useStore';\nimport { Employee, ShiftEvent, CoachingLog, FollowUpTask, DeptGoal } from '../types';`);

// Fix leaderCounts implicitly any
content = content.replace(/const counts = \{\};/g, 'const counts: Record<string, any> = {};');
content = content.replace(/const leaderCountsMap = \{\};/g, 'const leaderCountsMap: Record<string, any> = {};');

// Fix implicitly any parameters in array methods
content = content.replace(/\.map\(\(emp\) =>/g, '.map((emp: any) =>');
content = content.replace(/\.filter\(\(emp\) =>/g, '.filter((emp: any) =>');
content = content.replace(/\.forEach\(\(emp\) =>/g, '.forEach((emp: any) =>');
content = content.replace(/\.find\(\(e\) =>/g, '.find((e: any) =>');
content = content.replace(/\.find\(\(pastEmp\) =>/g, '.find((pastEmp: any) =>');
content = content.replace(/\.some\(\(log\) =>/g, '.some((log: any) =>');
content = content.replace(/\.filter\(\(log\) =>/g, '.filter((log: any) =>');
content = content.replace(/\.forEach\(\(log\) =>/g, '.forEach((log: any) =>');
content = content.replace(/\.forEach\(\(shift\) =>/g, '.forEach((shift: any) =>');
content = content.replace(/\.map\(\(p, idx\) =>/g, '.map((p: any, idx: number) =>');
content = content.replace(/\.map\(\(val, idx\) =>/g, '.map((val: number, idx: number) =>');
content = content.replace(/\.sort\(\(a, b\) =>/g, '.sort((a: any, b: any) =>');
content = content.replace(/\.filter\(\(t\) =>/g, '.filter((t: any) =>');
content = content.replace(/\.map\(\(t\) =>/g, '.map((t: any) =>');

// Fix leaderboard valA / valB issues
content = content.replace(/const valA = rankMetric === 'surveys' && a\.surveys === 0\.2 \? 0 : parseFloat\(a\[rankMetric\]\) \|\| 0;/g, "const valA = rankMetric === 'surveys' && a.surveys === 0.2 ? 0 : parseFloat(a[rankMetric as keyof typeof a]) || 0;");
content = content.replace(/const valB = rankMetric === 'surveys' && b\.surveys === 0\.2 \? 0 : parseFloat\(b\[rankMetric\]\) \|\| 0;/g, "const valB = rankMetric === 'surveys' && b.surveys === 0.2 ? 0 : parseFloat(b[rankMetric as keyof typeof b]) || 0;");

// Fix shadowing heatmap
content = content.replace(/const shadowingHeatmapData = useMemo\(\(\) => \{/g, 'const shadowingHeatmapData = useMemo((): Record<string, number> => {');

// Fix object entries
content = content.replace(/Object\.entries\(leaderCountsMap\)\.forEach\(\(\[leader, data\]\) =>/g, 'Object.entries(leaderCountsMap).forEach(([leader, data]: [string, any]) =>');

// Fix Object.entries(countData)
content = content.replace(/Object\.entries\(countData\)/g, 'Object.entries(countData as Record<string, number>)');

// Extract MetricCards
const metricsGridRegex = /<div className="metrics-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/m;
const metricsGridCode = content.match(metricsGridRegex);

if (metricsGridCode) {
    const componentCode = `import CircularGauge from './CircularGauge';

interface MetricCardsProps {
    calculatedMetrics: any;
    recentSessions: any[];
}

export default function MetricCards({ calculatedMetrics, recentSessions }: MetricCardsProps) {
    return (
        <div className="metrics-grid">
            <CircularGauge 
                value={calculatedMetrics?.memberships || 0} 
                label="Total Memberships" 
                prefix=""
                suffix=""
                color="#0046be"
                description="Plus & Total Memberships"
            />
            <CircularGauge 
                value={calculatedMetrics?.creditCards || 0} 
                max={Math.max(10, (calculatedMetrics?.creditCards || 0) + 5)}
                label="BBY Credit Cards" 
                prefix=""
                suffix=""
                color="#fdd835"
                description="Submitted Applications"
            />
            <CircularGauge 
                value={calculatedMetrics?.warranty || 0} 
                label="Protection Attach" 
                prefix=""
                suffix="%"
                color="#0046be"
                description="Geek Squad Protection"
            />
            <CircularGauge 
                value={calculatedMetrics?.surveys || 0} 
                max={100}
                label="Customer Surveys" 
                prefix=""
                suffix="%"
                color="#10b981"
                description="Customer Survey Index"
            />
            <CircularGauge 
                value={calculatedMetrics?.rph || 0} 
                max={1200}
                label="Store RPH" 
                prefix="$"
                suffix=""
                color="#8b5cf6"
                description="Store Average Revenue Per Hour"
            />
            <CircularGauge 
                value={recentSessions ? recentSessions.length : 0} 
                max={15}
                label="Coaching Sessions" 
                prefix=""
                suffix=""
                color="#ec4899"
                description="Recorded Leadership Engagements"
            />
        </div>
    );
}`;
    const targetDir = path.join(__dirname, '../src/components/Dashboard');
    fs.writeFileSync(path.join(targetDir, 'MetricCards.tsx'), componentCode);
    
    // Replace the giant chunk in Dashboard.tsx
    content = content.replace(/<div className="metrics-grid">[\s\S]*?<\/div>/, '<MetricCards calculatedMetrics={calculatedMetrics} recentSessions={recentSessions} />');
    content = `import MetricCards from './Dashboard/MetricCards';\n` + content;
}

fs.writeFileSync(dashPath, content);
console.log('Fixed TS typing in Dashboard.tsx and extracted MetricCards');
