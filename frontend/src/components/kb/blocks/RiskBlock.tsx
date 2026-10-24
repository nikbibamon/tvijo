"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { PlotParams } from "react-plotly.js";
import { runAnalyticsScript, type AnalyticsOutput } from "@/services/kb-analytics-api";

const Plot = dynamic<PlotParams>(() => import("react-plotly.js"), { ssr: false });

interface RiskProps {
  strategy?: string;
  exchange?: string;
  className?: string;
}

export function RiskBlock({ exchange = "gateio", className }: RiskProps) {
  const [data, setData] = useState<AnalyticsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runAnalyticsScript("risk-overview", { exchange })
      .then((result) => setData(result as AnalyticsOutput))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [exchange]);

  if (loading) {
    return (
      <div className={`p-6 rounded-lg bg-slate-900/50 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-700 rounded w-1/3"></div>
          <div className="h-64 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`p-4 rounded-lg bg-red-900/20 border border-red-800/50 ${className}`}>
        <p className="text-red-400 text-sm">Risk analysis error: {error || "No data"}</p>
      </div>
    );
  }

  const keyMetrics = data.key_metrics || [];
  const plotData = (data.plotly_spec?.data || []) as PlotParams["data"];
  const plotLayout = (data.plotly_spec?.layout || {}) as PlotParams["layout"];
  const rows = (data.data_table?.rows || []) as Array<Array<string | number>>;
  const headers = data.data_table?.headers || [];
  const insights = data.insights || [];

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-200">
        Risk Analysis Overview ({exchange.toUpperCase()})
      </h3>

      {keyMetrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {keyMetrics.map((m, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-400">{m.label}</p>
              <p className={`text-lg font-semibold ${
                m.trend === "up" ? "text-green-400" :
                m.trend === "down" ? "text-red-400" : "text-slate-200"
              }`}>
                {m.value}{m.unit || ""}
                {m.benchmark && (
                  <span className="text-xs text-slate-500 ml-1">/ {m.benchmark}</span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {plotData.length > 0 && (
        <div className="h-80 -mx-2">
          <Plot
            data={plotData}
            layout={{ ...plotLayout, autosize: true, height: 320 }}
            style={{ width: "100%", height: "100%" }}
            config={{ displayModeBar: false }}
          />
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
                      {j === 1 ? (
                        <span className={`${
                          numCell > 20 ? "text-red-400" :
                          numCell > 10 ? "text-amber-400" :
                          "text-green-400"
                        }`}>
                          {numCell}%
                        </span>
                      ) : j === 2 ? (
                        <span className={`${
                          numCell >= 1.5 ? "text-green-400" :
                          numCell >= 1.0 ? "text-amber-400" :
                          "text-red-400"
                        }`}>
                          {numCell}
                        </span>
                      ) : j === 3 ? (
                        <span className={`${
                          numCell >= 2.0 ? "text-green-400" :
                          numCell >= 1.0 ? "text-amber-400" :
                          "text-red-400"
                        }`}>
                          {numCell}
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
        <div className="space-y-1">
          {insights.map((insight, i) => (
            <p key={i} className="text-sm text-slate-400 italic">{insight}</p>
          ))}
        </div>
      )}
    </div>
  );
}
