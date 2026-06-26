import { ConversationalAnalyticsWidget } from '../components/Analytics/ConversationalAnalyticsWidget';

export default function TrendReportingPage() {
  return (
    <div className="flex-column mx-auto w-full pb-3xl" style={{ maxWidth: '1200px' }}>
      <ConversationalAnalyticsWidget />
    </div>
  );
}
