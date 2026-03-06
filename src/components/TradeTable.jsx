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
    FilterIcon,
    RefreshCwIcon,
    XIcon,
    PlusCircleIcon,
    TrendingUpIcon
} from "lucide-react";
import TradeDashboardHeading from './TradeDashboardHeading';

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
    const [plFilter, setPlFilter] = useState("ALL"); // New P/L Filter State
    const [sortBy, setSortBy] = useState("tradeDate");
    const [sortDir, setSortDir] = useState("desc");
    useEffect(() => {
        setStatusFilter(statusFilterDefault || "ALL");
        dispatch(fetchTrades({ page, size: 10 }));
    }, [page, dispatch,statusFilterDefault]);

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

    const calculatePL = (trade,currentPrice) => {
        if (trade.status === "Closed" && trade.exitPrice) {
            return (trade.exitPrice - trade.entryPrice) * trade.quantity;
        }

        if (!currentPrice) return 0;

        return (currentPrice - trade.entryPrice) * trade.quantity;
    };

    const calculatePercentageChange = (trade, currentPrice) => {
        if (trade.status === "Closed" && trade.exitPrice) {
          return ((trade.exitPrice - trade.entryPrice) / trade.entryPrice)*100;
        }
      
        if (!currentPrice) return 0;
      
        return ((currentPrice - trade.entryPrice) / trade.entryPrice)*100;
      };

    const priceMap = useMemo(() => {
        const map = {};
        (liveQuotes || []).forEach(q => {
            // adjust key based on what you store in trade.symbol
            map[`${q.exchange}|${q.exchange_token}`] = Number(q.ltp);
            map[q.display_symbol] = Number(q.ltp); // fallback if you use symbol names
        });
        return map;
    }, [liveQuotes]);

    const getCurrentPrice = (trade) => {
        return priceMap[trade.symbol] || null;
    };

    const filteredTrades = useMemo(() => {
        return (trades || [])
            .filter((t) =>
                symbolFilter ? t.symbol.toLowerCase().includes(symbolFilter.toLowerCase()) : true
            )
            .filter((t) => (statusFilter === "ALL" ? true : t.status === statusFilter))
            .filter((t) => {
                if (plFilter === "ALL") return true;
                const currentPrice = getCurrentPrice(t);
                const pl = calculatePL(t,currentPrice);
                if (plFilter === "PROFIT") return t.status === "Closed" && pl > 0;
                if (plFilter === "LOSS") return t.status === "Closed" && pl < 0;
                if (plFilter === "UNREALIZED") return t.status === "Open";
                return true;
            })
            .sort((a, b) => {
                let v1 = a[sortBy];
                let v2 = b[sortBy];
                if (sortBy === "tradeDate") {
                    v1 = new Date(v1);
                    v2 = new Date(v2);
                } else if (typeof v1 === "string") {
                    v1 = v1.toLowerCase();
                    v2 = v2.toLowerCase();
                }
                if (v1 < v2) return sortDir === "asc" ? -1 : 1;
                if (v1 > v2) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
    }, [trades, symbolFilter, statusFilter, plFilter, sortBy, sortDir]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <RefreshCwIcon className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Header */}
            <TradeDashboardHeading role={role} totalTrades={filteredTrades.length} setTrade={setShowAddTrade}/>

            {/* Filters Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search symbol..."
                            value={symbolFilter}
                            onChange={(e) => setSymbolFilter(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                        {symbolFilter && (
                            <button onClick={() => setSymbolFilter("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                                <XIcon className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
                            >
                                <option value="ALL">All Status</option>
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                            </select>
                            <FilterIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        {/* P/L Filter Dropdown */}
                        <div className="relative">
                            <select
                                value={plFilter}
                                onChange={(e) => setPlFilter(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
                            >
                                <option value="ALL">All P/L</option>
                                <option value="PROFIT">Profit</option>
                                <option value="LOSS">Loss</option>
                                <option value="UNREALIZED">Unrealized</option>
                            </select>
                            <TrendingUpIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        {(symbolFilter || statusFilter !== "ALL" || plFilter !== "ALL") && (
                            <button onClick={() => { setSymbolFilter(""); setStatusFilter("ALL"); setPlFilter("ALL"); }} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <Th label="Symbol" field="symbol" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                                <Th label="Qty" field="quantity" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                                <Th label="Entry" field="entryPrice" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                                <Th label="Exit" field="exitPrice" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                                <Th label="Current" field="currentPrice" onClick={() => { }} />
                                <Th label="P/L" field="pl" sortBy={sortBy} sortDir={sortDir} onClick={() => { }} />
                                <Th label="% Change" field="pchange" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                                <Th label="Status" field="status" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                                <Th label="Date" field="tradeDate" sortBy={sortBy} sortDir={sortDir} onClick={handleSort} />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredTrades.map((trade) => {
                                const currentPrice = getCurrentPrice(trade);
                                const pl = calculatePL(trade,currentPrice);
                                const pchange = calculatePercentageChange(trade,currentPrice);
                                const isProfit = pl >= 0;
                                const isCurrentlyAboveEntry = currentPrice >= trade.entryPrice;

                                return (
                                    <tr
                                        key={trade.id}
                                        onClick={() => role === "ADMIN" && setSelectedTrade(trade)}
                                        className={`group transition-colors ${role === "ADMIN"
                                            ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                            : "cursor-default"
                                            }`}
                                    >
                                        <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{trade.symbol}</td>
                                        <td className="px-6 py-4 font-medium">{trade.quantity}</td>
                                        <td className="px-6 py-4 font-mono">₹{trade.entryPrice.toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 font-mono">
                                            {trade.exitPrice ? `₹${trade.exitPrice.toLocaleString('en-IN')}` : <span className="text-slate-300 dark:text-slate-600">—</span>}
                                        </td>

                                        {/* Current Price Column */}
                                        <td className="px-6 py-4 font-mono">
                                            {trade.status === "Open" ? (
                                                currentPrice ? (
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold ${isCurrentlyAboveEntry ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            ₹{currentPrice.toLocaleString('en-IN')}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="relative flex h-1.5 w-1.5">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                                                            </span>
                                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Live</span>
                                                        </div>
                                                    </div>
                                                ) : "—"
                                            ) : (
                                                <span className="text-slate-300 dark:text-slate-600">—</span>
                                            )}
                                        </td>

                                        {/* P/L Column with Tags */}
                                        <td className="px-6 py-4 font-mono">
                                            <div className="flex flex-col gap-1">
                                                <span className={`font-bold text-lg ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    {isProfit ? '+' : ''}₹{pl.toLocaleString('en-IN')}
                                                </span>

                                                {trade.status === "Open" ? (
                                                    <span className="w-fit text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                                                        Unrealized
                                                    </span>
                                                ) : (
                                                    <span className="w-fit text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                        Realized
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 font-mono">
                                            <div className="flex flex-col gap-1">
                                                <span className={`font-bold text-lg ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    {isProfit ? '+' : ''}{pchange.toLocaleString('en-IN')}%
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trade.status === "Open"
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                : "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                                                }`}>
                                                {trade.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(trade.tradeDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Page {page + 1} of {totalPages || 1}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page >= (totalPages || 1) - 1}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {role === "ADMIN" && (selectedTrade || showAddTrade) && (
                <Modal isOpen={true} onClose={closeModal}>
                    <AddTrade trade={selectedTrade} onClose={closeModal} />
                </Modal>
            )}
        </div>
    );
}

function Th({ label, field, sortBy, sortDir, onClick }) {
    const active = sortBy === field;
    return (
        <th onClick={() => onClick(field)} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 cursor-pointer hover:text-blue-600 transition-colors">
            <div className="flex items-center gap-1">
                {label}
                <div className="flex flex-col">
                    <ChevronUpIcon className={`w-3 h-3 -mb-1 ${active && sortDir === 'asc' ? 'text-blue-600' : 'text-slate-300 dark:text-slate-600'}`} />
                    <ChevronDownIcon className={`w-3 h-3 ${active && sortDir === 'desc' ? 'text-blue-600' : 'text-slate-300 dark:text-slate-600'}`} />
                </div>
            </div>
        </th>
    );
}

export default TradeTable;