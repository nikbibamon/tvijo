"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { PlotParams } from "react-plotly.js";
import { runAnalyticsScript, type AnalyticsOutput } from "@/services/kb-analytics-api";

const Plot = dynamic<PlotParams>(() => import("react-plotly.js"), { ssr: false });

interface ScannerProps {
  pairs?: string;
  className?: string;
}

export function ScannerBlock({ pairs, className }: ScannerProps) {
  const [data, setData] = useState<AnalyticsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runAnalyticsScript("scanner-signals", { pairs })
      .then((result) => setData(result as AnalyticsOutput))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [pairs]);

  if (loading) {
    return (
      <div className={`p-6 rounded-lg bg-slate-900/50 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-700 rounded w-1/3"></div>
          <div className="h-32 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`p-4 rounded-lg bg-red-900/20 border border-red-800/50 ${className}`}>
        <p className="text-red-400 text-sm">Scanner error: {error || "No data"}</p>
      </div>
    );
  }

  const rows = (data.data_table?.rows || []) as Array<Array<string | number>>;
  const headers = data.data_table?.headers || ["Pair", "Signal", "Strength", "Price", "24h Change %"];
  const plotData = (data.plotly_spec?.data || []) as PlotParams["data"];
  const plotLayout = (data.plotly_spec?.layout || {}) as PlotParams["layout"];
  const keyMetrics = data.key_metrics || [];

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        Live Market Scanner
      </h3>

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {headers.map((h, i) => (
                  <th key={i} className="text-left py-2 px-3 text-slate-400 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                  {row.map((cell, j) => {
                    const cellStr = String(cell);
                    return (
                      <td key={j} className="py-2 px-3 text-slate-300">
                        {j === 1 ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            cellStr === "strong_buy" || cellStr === "buy" ? "bg-green-500/20 text-green-400" :
                            cellStr === "neutral" ? "bg-amber-500/20 text-amber-400" :
                            "bg-red-500/20 text-red-400"
                          }`}>
                            {cellStr.replace(/_/g, " ").toUpperCase()}
                          </span>
                        ) : (
                          typeof cell === "number" ? cell.toFixed(2) : cellStr
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

      {plotData.length > 0 && (
        <div className="h-64 -mx-2">
          <Plot
            data={plotData}
            layout={{ ...plotLayout, autosize: true }}
            style={{ width: "100%", height: "100%" }}
            config={{ displayModeBar: false }}
          />
        </div>
      )}

      {keyMetrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {keyMetrics.map((m, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-400">{m.label}</p>
              <p className="text-lg font-semibold text-slate-200">{m.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
