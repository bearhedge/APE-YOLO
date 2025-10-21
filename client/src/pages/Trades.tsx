import { useQuery } from '@tanstack/react-query';
import { getPNL } from '@/lib/api';
import { DataTable } from '@/components/DataTable';
import { LeftNav } from '@/components/LeftNav';
import type { PnlRow } from '@shared/types';

export function Trades() {
  const { data: trades } = useQuery<PnlRow[]>({
    queryKey: ['/api/pnl'],
    queryFn: getPNL,
  });

  const columns = [
    { header: 'Trade ID', accessor: 'tradeId' as keyof PnlRow, sortable: true, className: 'font-mono text-sm' },
    { header: 'Time', accessor: (row: PnlRow) => new Date(row.ts).toLocaleString(), sortable: true, className: 'text-silver text-sm' },
    { header: 'Symbol', accessor: 'symbol' as keyof PnlRow, sortable: true },
    { header: 'Strategy', accessor: 'strategy' as keyof PnlRow, className: 'text-silver' },
    { header: 'Qty', accessor: 'qty' as keyof PnlRow, className: 'tabular-nums' },
    { header: 'Entry', accessor: (row: PnlRow) => `$${row.entry.toFixed(2)}`, className: 'tabular-nums' },
    { header: 'Exit', accessor: (row: PnlRow) => row.exit ? `$${row.exit.toFixed(2)}` : '-', className: 'tabular-nums text-silver' },
    { 
      header: 'Realized', 
      accessor: (row: PnlRow) => {
        const isProfit = row.realized >= 0;
        return (
          <span className={isProfit ? 'font-medium' : 'font-medium'}>
            {isProfit ? '+' : ''}${row.realized.toFixed(2)}
          </span>
        );
      },
      className: 'tabular-nums'
    },
    { header: 'Notes', accessor: (row: PnlRow) => row.notes || '-', className: 'text-silver text-sm' },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <LeftNav />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-wide">Trades</h1>
          <p className="text-silver text-sm mt-1">Complete execution history with audit trail</p>
        </div>

        <div className="bg-charcoal rounded-2xl p-6 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Execution Log</h3>
            <span className="text-sm text-silver tabular-nums">{trades?.length || 0} trades</span>
          </div>
          {trades && trades.length > 0 ? (
            <DataTable
              data={trades}
              columns={columns}
              testId="table-trades"
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-silver">No trades yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
