import React from "react";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const MonthlyHeatmap = ({ statsDetails }) => {
  const heatmap = statsDetails?.monthlyHeatmap || [];

  const getColor = (pnl) => {
    if (pnl > 0) return "bg-emerald-500 text-white dark:bg-emerald-600 shadow-emerald-500/20";
    if (pnl < 0) return "bg-rose-500 text-white dark:bg-rose-600 shadow-rose-500/20";
    return "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 shadow-none";
  };

  // Helper to format currency for small boxes (e.g., 1.2k instead of 1200)
  const formatCompact = (val) => {
    return Math.abs(val) >= 1000 
      ? (val / 1000).toFixed(1) + "k" 
      : val;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl p-5 md:p-8 border border-slate-100 dark:border-slate-800 transition-all">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Monthly Heatmap
        </h3>
        <div className="flex gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <div className="h-2 w-2 rounded-full bg-rose-500" />
        </div>
      </div>

      {/* Mobile: grid-cols-3 (4 rows) 
         Tablet: grid-cols-4 (3 rows)
         Desktop: grid-cols-6 (2 rows) 
      */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {monthNames.map((m, i) => {
          const monthData = heatmap.find((h) => h.month === i + 1) || { pnl: 0 };
          const isNeutral = monthData.pnl === 0;

          return (
            <div
              key={m}
              className={`
                aspect-square sm:aspect-auto sm:h-20 rounded-2xl flex flex-col justify-center items-center
                transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm
                ${getColor(monthData.pnl)}
              `}
            >
              <span className={`text-[10px] font-black uppercase tracking-widest ${isNeutral ? 'text-slate-400' : 'opacity-80'}`}>
                {m}
              </span>

              <span className="text-xs sm:text-sm font-black mt-0.5">
                {monthData.pnl !== 0 ? `₹${formatCompact(monthData.pnl)}` : "—"}
              </span>
            </div>
          );
        })}
      </div>
      
      <p className="mt-6 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest text-center">
        Performance relative to capital allocation
      </p>
    </div>
  );
};

export default MonthlyHeatmap;