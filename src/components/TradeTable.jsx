import React from 'react'
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrades } from "../slice/getTradeSlice";
import Modal from "../components/Modal";
import AddTrade from "./AddTrade";
import {
    ChevronUpIcon,
    ChevronDownIcon,
    SearchIcon,
    RefreshCwIcon,
    ShieldIcon,
    TargetIcon,
    MessageSquareIcon,
    CalendarIcon,
    InfoIcon,
} from "lucide-react";
import TradeDashboardHeading from './TradeDashboardHeading';
import Tooltip from './Tooltip';
import InsightCard from './InsightCard';

const TradeTable = ({ tradeDetails, authDetails, statusFilterDefault }) => {
    const { trades, loading, totalPages } = tradeDetails;
    const { role } = authDetails;
    const dispatch = useDispatch();
    const [page, setPage] = useState(0);
    const [selectedTrade, setSelectedTrade] = useState(null);
    const [showAddTrade, setShowAddTrade] = useState(false);
    const liveQuotes = useSelector(state => state.market.quotes);
    const [symbolFilter, setSymbolFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState(statusFilterDefault || "ALL");
    const [plFilter, setPlFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("entryTradeDate");
    const [sortDir, setSortDir] = useState("desc");
    const [insightTrade, setInsightTrade] = useState(null);

    useEffect(() => {
        setStatusFilter(statusFilterDefault || "ALL");
        dispatch(fetchTrades({ page, size: 10 }));
    }, [page, dispatch, statusFilterDefault]);

    // Logic helpers (kept identical to your original code)
    const closeModal = () => {
        setSelectedTrade(null);
        setShowAddTrade(false);
        dispatch(fetchTrades({ page, size: 10 }));
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortDir("asc");
        }
    };

    const calculatePL = (trade, currentPrice) => {
        if (trade.status === "Closed" && trade.exitPrice) {
            return (trade.exitPrice - trade.entryPrice) * trade.quantity;
        }
        if (!currentPrice) return 0;
        return (currentPrice - trade.entryPrice) * trade.quantity;
    };

    const calculatePercentageChange = (trade, currentPrice) => {
        const base = trade.entryPrice;
        if (trade.status === "Closed" && trade.exitPrice) {
            return ((trade.exitPrice - base) / base) * 100;
        }
        if (!currentPrice) return 0;
        return ((currentPrice - base) / base) * 100;
    };

    const priceMap = useMemo(() => {
        const map = {};
        (liveQuotes || []).forEach(q => {
            map[`${q.exchange}|${q.exchange_token}`] = Number(q.ltp);
            map[q.display_symbol] = Number(q.ltp);
        });
        return map;
    }, [liveQuotes]);

    const getCurrentPrice = (trade) => priceMap[trade.symbol] || null;

    const filteredTrades = useMemo(() => {
        return (trades || [])
            .filter((t) => symbolFilter ? t.symbol.toLowerCase().includes(symbolFilter.toLowerCase()) : true)
            .filter((t) => (statusFilter === "ALL" ? true : t.status === statusFilter))
            .filter((t) => {
                if (plFilter === "ALL") return true;
                const pl = calculatePL(t, getCurrentPrice(t));
                if (plFilter === "PROFIT") return t.status === "Closed" && pl > 0;
                if (plFilter === "LOSS") return t.status === "Closed" && pl < 0;
                if (plFilter === "UNREALIZED") return t.status === "Open";
                return true;
            })
            .sort((a, b) => {
                let v1 = a[sortBy] ?? "";
                let v2 = b[sortBy] ?? "";
                if (sortBy.toLowerCase().includes("date")) {
                    v1 = new Date(v1);
                    v2 = new Date(v2);
                }
                if (v1 < v2) return sortDir === "asc" ? -1 : 1;
                if (v1 > v2) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
    }, [trades, symbolFilter, statusFilter, plFilter, sortBy, sortDir, priceMap]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <RefreshCwIcon className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <TradeDashboardHeading role={role} totalTrades={filteredTrades.length} setTrade={setShowAddTrade} />

            {/* Responsive Filter Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 md:p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search symbol..."
                            value={symbolFilter}
                            onChange={(e) => setSymbolFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                        />
                    </div>
                    <div className="flex flex-row gap-2 overflow-x-auto pb-1 md:pb-0">
                        <StatusSelect value={statusFilter} onChange={setStatusFilter} />
                        <PLSelect value={plFilter} onChange={setPlFilter} />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

                {/* Desktop View (Visible on Tablet/Laptop) */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <Th label="Asset" field="symbol" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                                <Th label="Qty" field="quantity" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                                <Th label="Entry (SL/Tgt)" field="entryPrice" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                                <Th label="Exit" field="exitPrice" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                                <Th label="Current" field="currentPrice" onClick={() => { }} />
                                <Th label="P/L & %" field="pl" onClick={() => { }} />
                                <Th label="Timeline" field="entryTradeDate" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredTrades.map((trade) => {
                                const currentPrice = getCurrentPrice(trade);
                                const pl = calculatePL(trade, currentPrice);
                                const pchange = calculatePercentageChange(trade, currentPrice);
                                const isProfit = pl >= 0;

                                return (
                                    <tr key={trade.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer" onClick={() => role === "ADMIN" && setSelectedTrade(trade)}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-blue-600 dark:text-blue-400">{trade.symbol}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{trade.exchange || 'NSE'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold">{trade.quantity}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-mono font-bold">₹{trade.entryPrice.toLocaleString('en-IN')}</span>
                                                <div className="flex gap-2">
                                                    {trade.stopLoss && (
                                                        <Tooltip text="Stop Loss: Minimum price to sell and limit loss">
                                                            <Badge color="rose" icon={<ShieldIcon size={10} />} text={trade.stopLoss} />
                                                        </Tooltip>
                                                    )}
                                                    {trade.targetPrice && (
                                                        <Tooltip text="Target: Goal price to sell and book profit">
                                                            <Badge color="emerald" icon={<TargetIcon size={10} />} text={trade.targetPrice} />
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono">
                                            {trade.exitPrice ? `₹${trade.exitPrice.toLocaleString('en-IN')}` : <span className="text-slate-300 dark:text-slate-600">—</span>}
                                        </td>
                                        <td className="px-6 py-4 font-mono">
                                            {trade.status === "Open" && currentPrice ? (
                                                <div className="flex flex-col">
                                                    <span className={`font-bold ${currentPrice >= trade.entryPrice ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        ₹{currentPrice.toLocaleString('en-IN')}
                                                    </span>
                                                    <LiveIndicator />
                                                </div>
                                            ) : <StatusBadge status={trade.status} />}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Tooltip text={`Total ${isProfit ? 'Profit' : 'Loss'} based on quantity`}>
                                                <div className="flex flex-col cursor-pointer">
                                                    <span className={`font-mono font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {isProfit ? '+' : ''}₹{Math.abs(pl).toLocaleString('en-IN')}
                                                    </span>
                                                    <span className={`text-xs font-black ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {isProfit ? '↑' : '↓'} {pchange.toFixed(2)}%
                                                    </span>
                                                </div>
                                            </Tooltip>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Timeline entry={trade.entryTradeDate} exit={trade.exitTradeDate} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={(e) => { e.stopPropagation(); setInsightTrade(trade); }} className="flex items-center gap-2 p-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                                                <MessageSquareIcon size={18} /> Insights
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet View (Visible on small screens) */}
                <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTrades.map((trade) => {
                        const currentPrice = getCurrentPrice(trade);
                        const pl = calculatePL(trade, currentPrice);
                        const pchange = calculatePercentageChange(trade, currentPrice);
                        const isProfit = pl >= 0;

                        return (
                            <div key={trade.id} className="p-4 space-y-3" onClick={() => role === "ADMIN" && setSelectedTrade(trade)}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-black text-blue-600 dark:text-blue-400">{trade.symbol}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{trade.exchange} • {trade.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-mono font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {isProfit ? '+' : ''}₹{Math.abs(pl).toLocaleString('en-IN')}
                                        </div>
                                        <div className={`text-[10px] font-black ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {pchange.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 border border-slate-100 dark:border-slate-800">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-400 font-black uppercase">Entry</span>
                                        <span className="text-xs font-bold font-mono">₹{trade.entryPrice}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[9px] text-slate-400 font-black uppercase">Qty</span>
                                        <span className="text-xs font-bold">{trade.quantity}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-400 font-black uppercase">LTP</span>
                                        <span className="text-xs font-bold font-mono">{currentPrice ? `₹${currentPrice}` : '—'}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[9px] text-slate-400 font-black uppercase">Status</span>
                                        <StatusBadge status={trade.status} />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-1">
                                    <Timeline entry={trade.entryTradeDate} exit={trade.exitTradeDate} isMobile={true} />
                                    <button onClick={(e) => { e.stopPropagation(); setInsightTrade(trade); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                        <MessageSquareIcon size={12} /> Insights
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            </div>

            {/* Modals remain the same (they are already responsive via their own components) */}
            {role === "ADMIN" && (selectedTrade || showAddTrade) && (
                <Modal isOpen={true} onClose={closeModal}><AddTrade trade={selectedTrade} onClose={closeModal} /></Modal>
            )}
            {insightTrade && (
                <Modal isOpen={true} onClose={() => setInsightTrade(null)}>
                    <div className="p-6 md:p-8 max-w-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-lg"><MessageSquareIcon size={20} /></div>
                            <h3 className="text-xl font-black">{insightTrade.symbol} Insights</h3>
                        </div>
                        <div className="space-y-4">
                            {/* Inside your Insight Modal */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Technical Notes</label>
                                <div
                                    className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300"
                                    dangerouslySetInnerHTML={{ __html: insightTrade.notes || "No comments." }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InsightCard label="Entry" val={formatDate(insightTrade.entryTradeDate)} icon={<CalendarIcon size={14} />} />
                                <InsightCard label="Segment" val={insightTrade.segment} icon={<InfoIcon size={14} />} />
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// UI Components
const Badge = ({ color, icon, text }) => (
    <span className={`flex items-center gap-0.5 text-[9px] md:text-[10px] font-bold text-${color}-500 bg-${color}-50 dark:bg-${color}-500/10 px-1.5 py-0.5 rounded`}>
        {icon} {text}
    </span>
);

const Timeline = ({ entry, exit, isMobile }) => (
    <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
        <div className="flex flex-col items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <div className="w-0.5 h-3 bg-slate-200 dark:bg-slate-700"></div>
            <div className={`w-1.5 h-1.5 rounded-full ${exit ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
        </div>
        <div className="flex flex-col text-[10px] font-bold leading-tight">
            <span className="text-slate-500">In: {formatDate(entry)}</span>
            <span className={exit ? "text-amber-600" : "text-slate-400"}>{exit ? `Out: ${formatDate(exit)}` : 'Active'}</span>
        </div>
    </div>
);

const Th = ({ label, field, sortBy, sortDir, onClick }) => {
    const active = sortBy === field;
    return (
        <th onClick={() => onClick(field)} className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-blue-600 group">
            <div className="flex items-center gap-1">
                {label}
                <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronUpIcon size={10} className={active && sortDir === 'asc' ? 'text-blue-600' : 'text-slate-300'} />
                    <ChevronDownIcon size={10} className={active && sortDir === 'desc' ? 'text-blue-600' : 'text-slate-300'} />
                </div>
            </div>
        </th>
    );
};

const StatusBadge = ({ status }) => (
    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${status === "Open" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10" : "bg-slate-100 text-slate-500"
        }`}>{status}</span>
);

const LiveIndicator = () => (
    <div className="flex items-center gap-1 mt-0.5">
        <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
        <span className="text-[8px] text-blue-500 font-black uppercase">Live</span>
    </div>
);

const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';

const Pagination = ({ page, totalPages, setPage }) => (
    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase">Page {page + 1} / {totalPages || 1}</span>
        <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-30"><ChevronUpIcon size={14} className="-rotate-90" /></button>
            <button disabled={page >= (totalPages || 1) - 1} onClick={() => setPage(p => p + 1)} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-30"><ChevronUpIcon size={14} className="rotate-90" /></button>
        </div>
    </div>
);

const StatusSelect = ({ value, onChange }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none px-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-bold outline-none cursor-pointer">
        <option value="ALL">All Status</option>
        <option value="Open">Open</option>
        <option value="Closed">Closed</option>
    </select>
);

const PLSelect = ({ value, onChange }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none px-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-bold outline-none cursor-pointer">
        <option value="ALL">All P/L</option>
        <option value="PROFIT">Profit</option>
        <option value="LOSS">Loss</option>
    </select>
);

export default TradeTable;