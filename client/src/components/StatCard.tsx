interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  testId?: string;
}

export function StatCard({ label, value, change, icon, testId }: StatCardProps) {
  return (
    <div className="bg-charcoal rounded-2xl p-6 border border-white/10 shadow-lg" data-testid={testId}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-silver text-sm font-medium">{label}</p>
        {icon && <div className="text-silver">{icon}</div>}
      </div>
      <p className="text-2xl font-semibold tabular-nums mb-1" data-testid={`${testId}-value`}>
        {value}
      </p>
      {change !== undefined && (
        <p
          className={`text-sm font-medium ${
            change >= 0 ? 'text-green-500' : 'text-red-500'
          }`}
          data-testid={`${testId}-change`}
        >
          {change >= 0 ? '+' : ''}
          {change.toFixed(2)}%
        </p>
      )}
    </div>
  );
}
