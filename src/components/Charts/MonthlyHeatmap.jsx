import React from "react";

const monthNames = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

const MonthlyHeatmap = ({ statsDetails }) => {

  const heatmap = statsDetails?.monthlyHeatmap || [];

  const getColor = (pnl) => {

    if (pnl > 0)
      return "bg-green-500/80 dark:bg-green-600";

    if (pnl < 0)
      return "bg-red-500/80 dark:bg-red-600";

    return "bg-slate-300 dark:bg-slate-700";
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800">

      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
        Monthly Performance
      </h3>

      <div className="grid grid-cols-6 gap-4">

        {monthNames.map((m, i) => {

          const monthData =
            heatmap.find((h) => h.month === i + 1) || { pnl: 0 };

          return (
            <div
              key={m}
              className={`h-20 rounded-lg flex flex-col justify-center items-center
              text-white transition-transform hover:scale-105 shadow-md
              ${getColor(monthData.pnl)}`}
            >

              <span className="text-sm font-semibold">{m}</span>

              <span className="text-xs opacity-90">
                ₹{monthData.pnl}
              </span>

            </div>
          );
        })}

      </div>

    </div>
  );
};

export default MonthlyHeatmap;