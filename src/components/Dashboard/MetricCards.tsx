import { Users, CreditCard, Shield, Star, TrendingUp, ClipboardList } from 'lucide-react';
import CircularGauge from './CircularGauge';
import { CalculatedMetrics } from '../../hooks/useCalculatedMetrics';
import { CoachingLog } from '../../types';

interface MetricCardsProps {
    calculatedMetrics?: Partial<CalculatedMetrics>;
    recentSessions?: CoachingLog[];
}

export default function MetricCards({ calculatedMetrics, recentSessions }: MetricCardsProps) {
    return (
        <div className="metrics-grid" data-testid="metric-cards-grid">
            <CircularGauge 
                value={calculatedMetrics?.memberships || 0} 
                label="Total Memberships" icon={Users} 
                prefix=""
                suffix=""
                colorName="bby-blue"
                description="Plus & Total Memberships"
            />
            <CircularGauge 
                value={calculatedMetrics?.creditCards || 0} 
                max={Math.max(10, (calculatedMetrics?.creditCards || 0) + 5)}
                label="BBY Credit Cards" icon={CreditCard} 
                prefix=""
                suffix=""
                colorName="bby-yellow"
                description="Submitted Applications"
            />
            <CircularGauge 
                value={calculatedMetrics?.warranty || 0} 
                label="Protection Attach" icon={Shield} 
                prefix=""
                suffix="%"
                colorName="bby-blue"
                description="Geek Squad Protection"
            />
            <CircularGauge 
                value={calculatedMetrics?.surveys || 0} 
                max={Math.max(10, (calculatedMetrics?.surveys || 0) + 5)}
                label="5-Star Surveys" icon={Star} 
                prefix=""
                suffix=""
                colorName="success"
                description="Total 5-Star Surveys"
            />
            <CircularGauge 
                value={calculatedMetrics?.rph || 0} 
                max={1200}
                label="Store RPH" icon={TrendingUp} 
                prefix="$"
                suffix=""
                colorName="info"
                description="Store Average Revenue Per Hour"
            />
            <CircularGauge 
                value={recentSessions ? recentSessions.length : 0} 
                max={15}
                label="Coaching Sessions" icon={ClipboardList} 
                prefix=""
                suffix=""
                colorName="warning"
                description="Recorded Leadership Engagements"
            />
        </div>
    );
}
