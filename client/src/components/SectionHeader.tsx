interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  testId?: string;
}

export function SectionHeader({ title, subtitle, action, testId }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6" data-testid={testId}>
      <div>
        <h2 className="text-2xl font-semibold" data-testid={`${testId}-title`}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-silver text-sm mt-1" data-testid={`${testId}-subtitle`}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div data-testid={`${testId}-action`}>{action}</div>}
    </div>
  );
}
