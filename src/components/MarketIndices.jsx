import React from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const MarketIndices = ({ indices }) => {
  const validIndices = indices?.filter((p) => p.per_change !== undefined) || [];

  return (
    <div className="w-full border-b border-slate-200 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md sticky top-0 z-30">
      
      <div className="max-w-350 mx-auto px-4 py-2">
        
        {/* ✅ Single line, no wrap, no scroll */}
        <div className="flex items-center w-full">
          
          {validIndices.map((index, i) => {
            const isUp = parseFloat(index.per_change) >= 0;

            return (
              <div
                key={i}
                className="flex-1 min-w-0 flex items-center justify-center gap-2 px-2 py-1.5 transition-all hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
              >
                <div className="flex flex-col items-center truncate">
                  
                  {/* Symbol */}
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate">
                      {index.exchange_token}
                    </span>
                    <div className={`h-1 w-1 rounded-full ${isUp ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                  </div>

                  {/* Price + Change */}
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="font-black text-slate-900 dark:text-slate-100 tabular-nums truncate">
                      {parseFloat(index.ltp).toLocaleString('en-IN', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1
                      })}
                    </span>

                    <span className={`flex items-center font-black ${isUp ? 'text-emerald-500' : 'text-rose-400'}`}>
                      {isUp ? <FiTrendingUp size={10} /> : <FiTrendingDown size={10} />}
                      {Math.abs(parseFloat(index.per_change))}%
                    </span>
                  </div>

                </div>

                {/* Divider */}
                {i !== validIndices.length - 1 && (
                  <div className="h-5 w-px bg-slate-200 dark:bg-slate-800/80" />
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default MarketIndices;