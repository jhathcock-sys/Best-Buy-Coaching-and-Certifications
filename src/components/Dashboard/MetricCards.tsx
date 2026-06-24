import { Users, CreditCard, Shield, Star, TrendingUp, ClipboardList } from 'lucide-react';
import CircularGauge from './CircularGauge';
import { useDashboardContext } from '../../pages/DashboardContext';

export default function MetricCards() {
    const { calculatedMetrics, recentSessions } = useDashboardContext();
    return (
        <div className="metrics-grid">
            <CircularGauge 
                value={calculatedMetrics?.memberships || 0} 
                label="Total Memberships" icon={Users} 
                prefix=""
                suffix=""
                color="var(--bby-blue)"
                description="Plus & Total Memberships"
            />
            <CircularGauge 
                value={calculatedMetrics?.creditCards || 0} 
                max={Math.max(10, (calculatedMetrics?.creditCards || 0) + 5)}
                label="BBY Credit Cards" icon={CreditCard} 
                prefix=""
                suffix=""
                color="var(--bby-yellow)"
                description="Submitted Applications"
            />
            <CircularGauge 
                value={calculatedMetrics?.warranty || 0} 
                label="Protection Attach" icon={Shield} 
                prefix=""
                suffix="%"
                color="var(--bby-blue)"
                description="Geek Squad Protection"
            />
            <CircularGauge 
                value={calculatedMetrics?.surveys || 0} 
                max={Math.max(10, (calculatedMetrics?.surveys || 0) + 5)}
                label="5-Star Surveys" icon={Star} 
                prefix=""
                suffix=""
                color="var(--success)"
                description="Total 5-Star Surveys"
            />
            <CircularGauge 
                value={calculatedMetrics?.rph || 0} 
                max={1200}
                label="Store RPH" icon={TrendingUp} 
                prefix="$"
                suffix=""
                color="var(--info)"
                description="Store Average Revenue Per Hour"
            />
            <CircularGauge 
                value={recentSessions ? recentSessions.length : 0} 
                max={15}
                label="Coaching Sessions" icon={ClipboardList} 
                prefix=""
                suffix=""
                color="var(--warning)"
                description="Recorded Leadership Engagements"
            />
        </div>
    );
}