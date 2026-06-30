import { ConversationalAnalyticsWidget } from '../components/Analytics/ConversationalAnalyticsWidget';

export default function TrendReportingPage() {
  return (
    <div className="flex-column mx-auto w-full pb-3xl max-w-[1200px]" data-testid="trend-reporting-page">
      <ConversationalAnalyticsWidget />
    </div>
  );
}
