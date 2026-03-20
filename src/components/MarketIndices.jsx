import React from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const MarketIndices = ({ indices }) => {
  const validIndices = indices?.filter((p) => p.per_change !== undefined) || [];

  return (
    <div className="w-full border-b border-slate-200 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-400 mx-auto px-4 py-2">

        {/* Mobile: overflow-x-auto + no-scrollbar (Scrolling)
            MD/LG: flex-nowrap + justify-between (Spaced out, no scroll)
        */}
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto md:overflow-x-visible no-scrollbar md:flex-nowrap justify-start md:justify-between">

          {validIndices.map((index, i) => {
            const isUp = parseFloat(index.per_change) >= 0;

            return (
              <div
                key={i}
                // shrink-0 on mobile keeps width, md:shrink on large allows it to fit the bar
                className="shrink-0 md:shrink flex-1 min-w-[110px] md:min-w-0 flex flex-col items-center justify-center px-2 py-1.5 rounded-xl transition-all hover:bg-slate-200/30 dark:hover:bg-slate-800/30 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/30"
              >
                {/* Symbol Line */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {index.exchange_token.replace("-IN", "")}
                  </span>
                  <div className={`h-1 w-1 rounded-full ${isUp ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                </div>

                {/* Data Line */}
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums">
                    {parseFloat(index.ltp).toLocaleString('en-IN', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1
                    })}
                  </span>
                  <span className={`flex items-center text-[10px] md:text-[11px] font-black ${isUp ? 'text-emerald-500' : 'text-rose-400'}`}>
                    {Math.abs(parseFloat(index.per_change))}%
                    {isUp ? <FiTrendingUp size={10} className="ml-0.5" /> : <FiTrendingDown size={10} className="ml-0.5" />}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default MarketIndices;