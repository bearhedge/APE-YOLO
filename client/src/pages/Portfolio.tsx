import { useQuery } from '@tanstack/react-query';
import { getPositions } from '@/lib/api';
import { DataTable } from '@/components/DataTable';
import { LeftNav } from '@/components/LeftNav';
import type { Position } from '@shared/types';

export function Portfolio() {
  const { data: positions } = useQuery<Position[]>({
    queryKey: ['/api/positions'],
    queryFn: getPositions,
  });

  const columns = [
    { header: 'Symbol', accessor: 'symbol' as keyof Position, sortable: true },
    { header: 'Strategy', accessor: (row: Position) => row.side === 'SELL' ? 'Credit Spread' : 'Long', className: 'text-silver' },
    { header: 'Qty', accessor: 'qty' as keyof Position, sortable: true, className: 'tabular-nums' },
    { header: 'Entry', accessor: (row: Position) => `$${row.avg.toFixed(2)}`, className: 'tabular-nums' },
    { header: 'Mark', accessor: (row: Position) => `$${row.mark.toFixed(2)}`, className: 'tabular-nums' },
    { 
      header: 'P/L$', 
      accessor: (row: Position) => {
        const isProfit = row.upl >= 0;
        return (
          <span className={isProfit ? 'font-medium' : 'font-medium'}>
            {isProfit ? '+' : ''}${row.upl.toFixed(2)}
          </span>
        );
      },
      className: 'tabular-nums'
    },
    { header: 'Delta', accessor: (row: Position) => row.delta?.toFixed(2) || '-', className: 'tabular-nums text-silver' },
    { header: 'Margin', accessor: (row: Position) => `$${row.margin?.toLocaleString() || '0'}`, className: 'tabular-nums text-silver' },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <LeftNav />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-wide">Portfolio</h1>
          <p className="text-silver text-sm mt-1">All open positions and exposure</p>
        </div>

        <div className="bg-charcoal rounded-2xl p-6 border border-white/10 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Open Positions</h3>
          {positions && positions.length > 0 ? (
            <DataTable
              data={positions}
              columns={columns}
              testId="table-portfolio-positions"
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-silver">No open positions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
