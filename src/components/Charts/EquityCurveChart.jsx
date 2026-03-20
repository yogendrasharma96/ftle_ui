import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const EquityCurveChart = ({ statsDetails }) => {
  const equityCurve = statsDetails?.equityCurve || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-semibold text-blue-600 dark:text-blue-400">
          Equity: ₹{payload[0].value}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800">

      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
        Equity Curve
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={equityCurve}>

          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2}/>
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(148,163,184,0.2)"
          />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#94a3b8" }}
          />

          <YAxis
            tick={{ fontSize: 12, fill: "#94a3b8" }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Line
            type="monotone"
            dataKey="equity"
            stroke="url(#equityGradient)"
            strokeWidth={3}
            dot={false}
            animationDuration={1200}
          />

        </LineChart>
      </ResponsiveContainer>

    </div>
  );
};

export default EquityCurveChart;