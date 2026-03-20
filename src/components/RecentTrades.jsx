import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiActivity, FiTag, FiMaximize2 } from "react-icons/fi";

const RecentTrades = ({ recentTrade }) => {
  const displayedTrades = recentTrade?.slice(0, 3) || [];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
      
      {/* Header */}
      <div className="px-8 py-6 flex justify-between items-center border-b border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-blue-600 rounded-full" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Latest Executions
          </h3>
        </div>
        <Link
          to="/trades"
          className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"
          title="View All Trades"
        >
          <FiMaximize2 size={18} />
        </Link>
      </div>

      {/* Trades List */}
      <div className="p-2 md:p-4 space-y-2">
        {displayedTrades.length > 0 ? (
          displayedTrades.map((t, index) => (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={t.id}
              className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[1.5rem] bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
            >
              {/* Left: Identity */}
              <div className="flex items-center gap-6">
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-blue-600 transition-colors">
                  {t.symbol}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase">
                    <FiTag size={10} /> {t.segment || "Equity"}
                  </span>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-md border ${
                      t.status === 'COMPLETED' 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                      {t.status || 'OPEN'}
                  </span>
                </div>
              </div>

              {/* Right: The Numbers */}
              <div className="flex items-center gap-10 mt-4 md:mt-0">
                {/* Quantity Block */}
                <div className="text-right border-r border-slate-100 dark:border-slate-800 pr-10">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Units</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white leading-none">
                        {t.quantity || 0}
                    </p>
                </div>

                {/* Pricing Spread */}
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase mb-1">Entry</p>
                        <p className="text-md font-black text-slate-700 dark:text-slate-300">
                           ₹{t.entryPrice?.toLocaleString('en-IN') || '0.00'}
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
                        <FiArrowRight className="text-blue-500" size={14} />
                        <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
                    </div>

                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase mb-1">Exit</p>
                        <p className="text-md font-black text-blue-600 dark:text-blue-400">
                           ₹{t.exitPrice?.toLocaleString('en-IN') || '—'}
                        </p>
                    </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-16 text-center border-2 border-dashed border-slate-50 dark:border-slate-800 rounded-[2rem] m-4">
            <FiActivity className="mx-auto mb-3 text-slate-200 dark:text-slate-700" size={30} />
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Awaiting Execution...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTrades;