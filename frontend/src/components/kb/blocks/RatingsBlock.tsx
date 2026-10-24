"use client";

import { useEffect, useState } from "react";
import { runAnalyticsScript, type AnalyticsOutput } from "@/services/kb-analytics-api";

interface RatingsProps {
  exchange?: string;
  limit?: number;
  className?: string;
}

export function RatingsBlock({ exchange = "gateio", limit = 20, className }: RatingsProps) {
  const [data, setData] = useState<AnalyticsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runAnalyticsScript("strategy-ratings-table", { exchange, limit })
      .then((result) => setData(result as AnalyticsOutput))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [exchange, limit]);

  if (loading) {
    return (
      <div className={`p-6 rounded-lg bg-slate-900/50 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-700 rounded w-1/3"></div>
          <div className="h-48 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`p-4 rounded-lg bg-red-900/20 border border-red-800/50 ${className}`}>
        <p className="text-red-400 text-sm">Ratings error: {error || "No data"}</p>
      </div>
    );
  }

  const rows = (data.data_table?.rows || []) as Array<Array<string | number>>;
  const headers = data.data_table?.headers || [];
  const keyMetrics = data.key_metrics || [];
  const insights = data.insights || [];

  const getBadgeColor = (value: number, type: string) => {
    if (type === "score") {
      return value >= 700 ? "bg-green-500/20 text-green-400" :
             value >= 500 ? "bg-amber-500/20 text-amber-400" :
             "bg-red-500/20 text-red-400";
    }
    if (type === "profit") {
      return value > 0 ? "bg-green-500/20 text-green-400" :
             value < 0 ? "bg-red-500/20 text-red-400" :
             "bg-slate-500/20 text-slate-400";
    }
    return "bg-slate-500/20 text-slate-400";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-200">
        Strategy Rankings ({exchange.toUpperCase()})
      </h3>

      {keyMetrics.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {keyMetrics.map((m, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg px-4 py-2">
              <p className="text-xs text-slate-400">{m.label}</p>
              <p className="text-lg font-semibold text-slate-200">
                {m.value}{m.unit || ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="text-left py-3 px-3 text-slate-300 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                  {row.map((cell, j) => {
                    const numCell = typeof cell === "number" ? cell : Number(cell);
                    return (
                      <td key={j} className="py-2 px-3 text-slate-300">
                      {j === 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-700 text-xs font-semibold">
                          {cell}
                        </span>
                      ) : j === 2 ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor(numCell, "score")}`}>
                          {numCell}
                        </span>
                      ) : j === 5 ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor(numCell, "profit")}`}>
                          {numCell > 0 ? "+" : ""}{numCell}%
                        </span>
                      ) : (
                        typeof cell === "number" ? (cell % 1 !== 0 ? cell.toFixed(2) : cell) : String(cell)
                      )}
                    </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {insights.length > 0 && (
        <p className="text-sm text-slate-400 italic">{insights[0]}</p>
      )}
    </div>
  );
}
