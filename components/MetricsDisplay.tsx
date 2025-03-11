import { ProcessingMetrics, AnswerMetrics } from '@/types/metrics';

interface MetricsDisplayProps {
  metrics: ProcessingMetrics | AnswerMetrics;
  type: 'processing' | 'answer';
}

export default function MetricsDisplay({ metrics, type }: MetricsDisplayProps) {
  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-sm font-medium text-gray-900 mb-2">
        {type === 'processing' ? 'Processing Metrics' : 'Answer Metrics'}
      </h3>
      <div className="space-y-1 text-xs text-gray-600">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span>{key.replace(/_/g, ' ')}:</span>
            <span className="font-mono">
              {typeof value === 'number' ? value.toFixed(3) : value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
