'use client';

/**
 * Loading Skeleton Components for NewsAdmin pages.
 * Generation: GEN-NEWS-010
 *
 * Reusable dark-themed skeleton placeholders for tables, charts, cards, etc.
 */

function Pulse({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse bg-white/5 rounded ${className}`} style={style} />;
}

// ---------------------------------------------------------------------------
// Card skeleton (e.g., KPI cards)
// ---------------------------------------------------------------------------

export function SkeletonCard() {
  return (
    <div className="bg-[#12121A] border border-white/5 rounded-xl p-5">
      <Pulse className="h-3 w-20 mb-3" />
      <Pulse className="h-8 w-24 mb-2" />
      <Pulse className="h-3 w-16" />
    </div>
  );
}

export function SkeletonCardRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chart skeleton
// ---------------------------------------------------------------------------

export function SkeletonChart({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`bg-[#12121A] border border-white/5 rounded-xl p-5 ${height}`}>
      <Pulse className="h-4 w-32 mb-4" />
      <div className="flex items-end gap-2 h-[calc(100%-40px)]">
        {[40, 65, 50, 80, 55, 70, 45, 75, 60, 85, 50, 65].map((h, i) => (
          <Pulse key={i} className="flex-1" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table skeleton
// ---------------------------------------------------------------------------

export function SkeletonTableRow() {
  return (
    <tr>
      <td className="px-4 py-3"><Pulse className="h-4 w-24" /></td>
      <td className="px-4 py-3"><Pulse className="h-4 w-32" /></td>
      <td className="px-4 py-3"><Pulse className="h-4 w-16" /></td>
      <td className="px-4 py-3"><Pulse className="h-4 w-20" /></td>
    </tr>
  );
}

export function SkeletonTable({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-[#12121A] border border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-white/5">
        {Array.from({ length: cols }).map((_, i) => (
          <Pulse key={i} className="h-3 w-20" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3.5 border-b border-white/[0.02]">
          {Array.from({ length: cols }).map((_, j) => (
            <Pulse key={j} className={`h-4 ${j === 0 ? 'w-24' : j === 1 ? 'w-40' : 'w-16'}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full page loading skeleton (dashboard-like)
// ---------------------------------------------------------------------------

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <Pulse className="h-7 w-48" />
        <Pulse className="h-9 w-28 rounded-lg" />
      </div>

      {/* KPI cards */}
      <SkeletonCardRow count={4} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      {/* Table */}
      <SkeletonTable rows={5} cols={5} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic list skeleton
// ---------------------------------------------------------------------------

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#12121A] border border-white/5 rounded-xl p-4 flex items-center gap-4">
          <Pulse className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Pulse className="h-4 w-3/4" />
            <Pulse className="h-3 w-1/2" />
          </div>
          <Pulse className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
