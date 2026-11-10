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
        <div className="metrics-grid metrics-bento" data-testid="metric-cards-grid">
            {/* Primary Focus Pillar 1: Total Memberships */}
            <div className="bento-hero-cell bento-hero-pms">
                <CircularGauge 
                    value={calculatedMetrics?.memberships || 0} 
                    label="Total Memberships" icon={Users} 
                    prefix=""
                    suffix=""
                    colorName="bby-blue"
                    description="Plus & Total Memberships"
                />
            </div>

            {/* Primary Focus Pillar 2: BBY Credit Cards */}
            <div className="bento-hero-cell bento-hero-apps">
                <CircularGauge 
                    value={calculatedMetrics?.creditCards || 0} 
                    max={Math.max(10, (calculatedMetrics?.creditCards || 0) + 5)}
                    label="BBY Credit Cards" icon={CreditCard} 
                    prefix=""
                    suffix=""
                    colorName="bby-yellow"
                    description="Submitted Applications"
                />
            </div>

            {/* Secondary Supporting Telemetry: Protection Attach */}
            <div className="bento-sub-cell">
                <CircularGauge 
                    value={calculatedMetrics?.warranty || 0} 
                    label="Protection Attach" icon={Shield} 
                    prefix=""
                    suffix="%"
                    colorName="bby-blue"
                    description="Geek Squad Protection"
                />
            </div>

            {/* Secondary Supporting Telemetry: 5-Star Surveys */}
            <div className="bento-sub-cell">
                <CircularGauge 
                    value={calculatedMetrics?.surveys || 0} 
                    max={Math.max(10, (calculatedMetrics?.surveys || 0) + 5)}
                    label="5-Star Surveys" icon={Star} 
                    prefix=""
                    suffix=""
                    colorName="success"
                    description="Total 5-Star Surveys"
                />
            </div>

            {/* Secondary Supporting Telemetry: Store RPH */}
            <div className="bento-sub-cell">
                <CircularGauge 
                    value={calculatedMetrics?.rph || 0} 
                    max={1200}
                    label="Store RPH" icon={TrendingUp} 
                    prefix="$"
                    suffix=""
                    colorName="info"
                    description="Store Average Revenue Per Hour"
                />
            </div>

            {/* Secondary Supporting Telemetry: Coaching Sessions */}
            <div className="bento-sub-cell">
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
        </div>
    );
}
