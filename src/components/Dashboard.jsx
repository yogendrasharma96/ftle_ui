import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchTradeStats } from "../slice/getTradeSlice"; // Ensure you have this action
import TradeTable from "./TradeTable";
import {
  Target,
  TrendingUp,
  Activity,
  Briefcase,
  BarChart2
} from "lucide-react";
import StatCard from "./StatCard";

function Dashboard() {
  const dispatch = useDispatch();
  const trade = useSelector((state) => state.trade);
  const auth = useSelector((state) => state.auth);
  const liveQuotes = useSelector((state) => state.market.quotes);
  const theme = useSelector((state) => state.utilities);
  const [statusFilterDefault, setStatusFilterDefault] = useState("ALL")
  const [selectedYear, setSelectedYear] = useState("ALL");
  // Get trades and the NEW stats object from Redux
  const { trades, stats } = trade;
  let arrowColor = "%2364748b";
  if (theme == 'light') {
    arrowColor = "%23ffffff"
  }

  // 1. Fetch Global Stats on mount
  useEffect(() => {
    dispatch(fetchTradeStats());
  }, [dispatch]);

  const displayStats = useMemo(() => {
    const priceMap = {};
    (liveQuotes || []).forEach(q => {
      priceMap[q.display_symbol] = Number(q.ltp);
      priceMap[`${q.exchange}|${q.exchange_token}`] = Number(q.ltp);
    });

    /**
     * UNREALIZED P/L (Hybrid Calculation)
     * We use the global 'totalOpen' and 'openPositionsEntryValue' from the backend,
     * but we apply the live prices from Redux.
     */
    const currentMarketValue = trades.reduce((acc, t) => {
      if (t.status === "Open") {
        const ltp = priceMap[t.symbol] || t.entryPrice; // Fallback to entry if no quote
        return acc + (ltp * t.quantity);
      }
      return acc;
    }, 0);

    // Live Unrealized = (Current Market Value of Open Trades) - (What you paid for them)
    // Note: This works best if 'trades' includes all open positions.
    const liveUnrealizedPnL = currentMarketValue - (stats?.openPositionsEntryValue || 0);

    return {
      realizedPnL: stats?.realizedPnL || 0,
      winRate: stats?.winRate || 0,
      totalClosed: stats?.totalClosed || 0,
      totalOpen: stats?.totalOpen || 0,
      unrealizedPnL: liveUnrealizedPnL
    };
  }, [trades, liveQuotes, stats]);

  return (
    <div className="p-6 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Overview</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Global account statistics from backend history</p>
        </div>
        <div className="flex flex-col gap-1 w-30">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
            Financial Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="appearance-none px-3 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm 
             focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none 
             transition-all dark:text-white cursor-pointer text-sm text-slate-900
             bg-no-repeat bg-position-[right_0.75rem_center] bg-size-[1.25em_1.25em]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2.5' stroke='${arrowColor}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`,
            }}
          >
            <option value="ALL">ALL</option>
            <option value="2024">2024-2025</option>
            <option value="2025">2025-2026</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Realized P/L - FROM BACKEND */}
        <StatCard
          label="Realized P/L"
          value={`₹${displayStats.realizedPnL.toLocaleString('en-IN')}`}
          icon={<Briefcase className="w-5 h-5" />}
          colorClass={displayStats.realizedPnL >= 0 ? "text-emerald-500" : "text-rose-500"}
          bgClass={displayStats.realizedPnL >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10"}
        />

        {/* 2. Unrealized P/L - HYBRID (Live) */}
        <StatCard
          label="Unrealized P/L"
          value={`₹${displayStats.unrealizedPnL.toLocaleString('en-IN')}`}
          icon={<BarChart2 className="w-5 h-5" />}
          colorClass={displayStats.unrealizedPnL >= 0 ? "text-blue-500" : "text-rose-500"}
          bgClass={displayStats.unrealizedPnL >= 0 ? "bg-blue-500/10" : "bg-rose-500/10"}
        />

        {/* 3. Win Rate - FROM BACKEND */}
        <StatCard
          label="Win Rate"
          value={`${displayStats.winRate}%`}
          icon={<Target className="w-5 h-5" />}
          colorClass="text-indigo-500"
          bgClass="bg-indigo-500/10"
        />

        {/* 4. Total Closed - FROM BACKEND */}
        <StatCard
          label="Closed Trades"
          value={displayStats.totalClosed}
          icon={<TrendingUp className="w-5 h-5" />}
          colorClass="text-slate-500"
          bgClass="bg-slate-500/10"
          func={() => setStatusFilterDefault("Closed")}
        />

        {/* 5. Total Open - FROM BACKEND */}
        <StatCard
          label="Open Trades"
          value={displayStats.totalOpen}
          icon={<Activity className="w-5 h-5" />}
          colorClass="text-amber-500"
          bgClass="bg-amber-500/10"
          func={() => setStatusFilterDefault("Open")}
        />
      </div>

      <div className="mt-8">
        <TradeTable tradeDetails={trade} authDetails={auth} statusFilterDefault={statusFilterDefault} />
      </div>
    </div>
  );
}

export default Dashboard;