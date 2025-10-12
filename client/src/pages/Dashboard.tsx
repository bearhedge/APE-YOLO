import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { MiniChart } from '@/components/MiniChart';
import { DataTable } from '@/components/DataTable';
import { SectionHeader } from '@/components/SectionHeader';
import { Button } from '@/components/ui/button';
import type { DashboardData, Position, Withdrawal } from '@shared/types';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Dashboard() {
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="skeleton h-32" />
          <div className="skeleton h-32" />
          <div className="skeleton h-32" />
        </div>
      </div>
    );
  }

  const positionColumns = [
    { header: 'Symbol', accessor: 'symbol' as keyof Position, sortable: true },
    { header: 'Side', accessor: 'side' as keyof Position, sortable: true },
    { header: 'Qty', accessor: 'qty' as keyof Position, sortable: true, className: 'tabular-nums' },
    { header: 'Avg Price', accessor: (row: Position) => `$${row.avg.toFixed(2)}`, className: 'tabular-nums' },
    { header: 'Mark', accessor: (row: Position) => `$${row.mark.toFixed(2)}`, className: 'tabular-nums' },
    { 
      header: 'Unrealized P/L', 
      accessor: (row: Position) => (
        <span className={row.upl >= 0 ? 'text-green-500' : 'text-red-500'}>
          ${row.upl.toFixed(2)}
        </span>
      ),
      className: 'tabular-nums'
    },
    { header: 'IV', accessor: (row: Position) => `${(row.iv * 100).toFixed(1)}%`, className: 'tabular-nums' },
    { header: 'Delta', accessor: (row: Position) => row.delta.toFixed(3), className: 'tabular-nums' },
    { header: 'Theta', accessor: (row: Position) => row.theta.toFixed(2), className: 'tabular-nums' },
    { header: 'Margin', accessor: (row: Position) => `$${row.margin.toFixed(2)}`, className: 'tabular-nums' },
    { header: 'Opened', accessor: (row: Position) => new Date(row.openedAt).toLocaleDateString(), className: 'text-sm' },
  ];

  const historyColumns = [
    { header: 'Symbol', accessor: 'symbol' as keyof Position },
    { header: 'Status', accessor: (row: Position) => (
      <span className={`badge-monochrome ${
        row.status === 'CLOSED' ? 'badge-success' :
        row.status === 'EXPIRED' ? 'badge-warning' :
        'badge-info'
      }`}>
        {row.status}
      </span>
    )},
    { 
      header: 'Realized P/L', 
      accessor: (row: Position) => (
        <span className={row.upl >= 0 ? 'text-green-500' : 'text-red-500'}>
          ${row.upl.toFixed(2)}
        </span>
      ),
      className: 'tabular-nums'
    },
    { header: 'Holding Period', accessor: (row: Position) => {
      const days = Math.floor((Date.now() - new Date(row.openedAt).getTime()) / (1000 * 60 * 60 * 24));
      return `${days}d`;
    }},
  ];

  const withdrawalColumns = [
    { header: 'Date', accessor: (row: Withdrawal) => new Date(row.date).toLocaleDateString() },
    { header: 'Amount', accessor: (row: Withdrawal) => `$${row.amount.toFixed(2)}`, className: 'tabular-nums' },
    { header: 'Status', accessor: (row: Withdrawal) => (
      <span className={`badge-monochrome ${
        row.status === 'COMPLETED' ? 'badge-success' :
        row.status === 'PENDING' ? 'badge-warning' :
        'badge-error'
      }`}>
        {row.status}
      </span>
    )},
  ];

  const leveragePercentage = data?.lev ? (data.lev * 100).toFixed(1) : '0.0';

  return (
    <div className="p-6 space-y-6">
      <SectionHeader
        title="Dashboard"
        subtitle="Real-time portfolio overview and positions"
        action={
          <Button
            onClick={() => setTradeModalOpen(true)}
            className="btn-primary"
            data-testid="button-execute-trade"
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Execute Trade
          </Button>
        }
        testId="header-dashboard"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Net Asset Value (NAV)"
          value={`$${data?.nav.toLocaleString() || '0'}`}
          icon={<DollarSign className="w-5 h-5" />}
          testId="stat-nav"
        />
        <StatCard
          label="Cash Available"
          value={`$${data?.cash.toLocaleString() || '0'}`}
          icon={<DollarSign className="w-5 h-5" />}
          testId="stat-cash"
        />
        <StatCard
          label="Margin Available"
          value={`$${data?.marginAvailable.toLocaleString() || '0'}`}
          icon={<DollarSign className="w-5 h-5" />}
          testId="stat-margin"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-charcoal rounded-2xl p-6 border border-white/10 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Open Positions</h3>
            <DataTable
              data={data?.positions || []}
              columns={positionColumns}
              testId="table-open-positions"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-charcoal rounded-2xl p-6 border border-white/10 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Leverage & NAV</h3>
            <div className="space-y-4">
              <div>
                <p className="text-silver text-sm mb-1">Current Leverage</p>
                <p className="text-4xl font-bold tabular-nums" data-testid="text-current-leverage">
                  {leveragePercentage}%
                </p>
              </div>
              <div>
                <p className="text-silver text-sm mb-2">NAV (Last 30 Days)</p>
                <MiniChart
                  data={data?.navHistory || []}
                  width={250}
                  height={60}
                  color="#10B981"
                  testId="chart-nav-history"
                />
              </div>
            </div>
          </div>

          <div className="bg-charcoal rounded-2xl p-6 border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Withdrawals</h3>
              <a href="#" className="text-sm text-blue-500 hover:text-blue-400" data-testid="link-full-history">
                Full History →
              </a>
            </div>
            <DataTable
              data={data?.withdrawals || []}
              columns={withdrawalColumns}
              testId="table-withdrawals"
            />
          </div>
        </div>
      </div>

      <div className="bg-charcoal rounded-2xl p-6 border border-white/10 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Historical Positions</h3>
        <DataTable
          data={data?.history || []}
          columns={historyColumns}
          testId="table-historical-positions"
        />
      </div>

      <Dialog open={tradeModalOpen} onOpenChange={setTradeModalOpen}>
        <DialogContent className="bg-charcoal border-white/10">
          <DialogHeader>
            <DialogTitle>Execute Trade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="ticker">Ticker</Label>
              <Input
                id="ticker"
                placeholder="SPY"
                className="input-monochrome mt-1"
                data-testid="input-ticker"
              />
            </div>
            <div>
              <Label htmlFor="strategy">Strategy</Label>
              <Input
                id="strategy"
                placeholder="Put Credit Spread"
                className="input-monochrome mt-1"
                data-testid="input-strategy"
              />
            </div>
            <div>
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                placeholder="1"
                className="input-monochrome mt-1"
                data-testid="input-quantity"
              />
            </div>
            <div className="flex gap-3">
              <Button className="btn-secondary flex-1" onClick={() => setTradeModalOpen(false)} data-testid="button-cancel-trade">
                Cancel
              </Button>
              <Button className="btn-primary flex-1" data-testid="button-submit-trade">
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
