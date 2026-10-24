"use client";

import { useMemo } from "react";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function SkeletonText({ className = "", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-white/5 rounded animate-pulse ${className}`}
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white/[0.02] border border-white/5 rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full space-y-2">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-white/5">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-white/5 rounded animate-pulse flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-3 bg-white/5 rounded animate-pulse flex-1"
              style={{ opacity: 1 - rowIndex * 0.15 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-white/5 animate-pulse" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="h-5 bg-white/5 rounded animate-pulse w-48" />
          <div className="h-3 bg-white/5 rounded animate-pulse w-32" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-20 bg-white/5 rounded-full animate-pulse" />
            <div className="h-6 w-24 bg-white/5 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/5 animate-pulse" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-24 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export function SkeletonArticle() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="space-y-4">
        <div className="h-8 bg-white/5 rounded animate-pulse w-3/4" />
        <div className="flex gap-3">
          <div className="h-5 w-20 bg-white/5 rounded-full animate-pulse" />
          <div className="h-5 w-24 bg-white/5 rounded-full animate-pulse" />
          <div className="h-5 w-32 bg-white/5 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-white/10 w-1/3 animate-pulse" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div className="h-4 bg-white/5 rounded animate-pulse" />
        <div className="h-4 bg-white/5 rounded animate-pulse w-5/6" />
        <div className="h-4 bg-white/5 rounded animate-pulse w-4/6" />
        <div className="h-32 bg-white/5 rounded-xl animate-pulse my-6" />
        <div className="h-4 bg-white/5 rounded animate-pulse" />
        <div className="h-4 bg-white/5 rounded animate-pulse w-5/6" />
      </div>

      {/* Sidebar elements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="h-4 bg-white/5 rounded animate-pulse" />
          <div className="h-4 bg-white/5 rounded animate-pulse w-4/5" />
        </div>
        <div className="space-y-4">
          <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonScanner() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-white/5 animate-pulse" />
        <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
      </div>
      <SkeletonTable rows={5} columns={5} />
      <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Composite loading states for pages
export function PageSkeleton({ type }: { type: "profile" | "article" | "scanner" | "table" }) {
  const skeletons = useMemo(() => ({
    profile: <SkeletonProfile />,
    article: <SkeletonArticle />,
    scanner: <SkeletonScanner />,
    table: <SkeletonTable rows={8} columns={6} />,
  }), []);

  return (
    <div className="animate-in fade-in duration-300">
      {skeletons[type]}
    </div>
  );
}
