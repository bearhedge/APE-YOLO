import { LeftNav } from '@/components/LeftNav';

export function Jobs() {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      <LeftNav />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-wide">Jobs</h1>
          <p className="text-silver text-sm mt-1">Background tasks and execution pipeline</p>
        </div>

        <div className="bg-charcoal rounded-2xl p-6 border border-white/10 shadow-lg">
          <div className="text-center py-12">
            <p className="text-silver">No active jobs</p>
            <p className="text-silver text-sm mt-2">All scheduled actions will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
