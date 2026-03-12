import { useLocation, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { GET_ALL_SCRIPS, SAVE_TRADE } from "../constants";
import { authFetch, getPublicData } from "../api/authFetch";
import { FiSave, FiX, FiInfo, FiTrendingUp, FiHash, FiCalendar, FiActivity, FiLayers, FiShield, FiTarget } from "react-icons/fi";
import { styled, Autocomplete, TextField, Paper } from "@mui/material";
import RichTextEditor from "./RichTextEditor";

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    paddingLeft: '35px',
    borderRadius: '1rem',
    backgroundColor: 'transparent',
    '& fieldset': { border: 'none' },
  },
  '& .MuiInputBase-input': {
    fontWeight: 700,
    fontSize: '0.875rem',
    color: 'inherit',
    fontFamily: 'inherit',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "1rem",
  marginTop: 8,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
}));

function AddTrade({ trade, onClose }) {
  const isEdit = Boolean(trade);
  const navigate = useNavigate();
  const entryDateRef = useRef(null);
  const exitDateRef = useRef(null);
  const location = useLocation();
  const isAddFormPage = location.pathname==="/trades/new";
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [symbols, setSymbols] = useState([]);
  const [loadingSymbols, setLoadingSymbols] = useState(false);

  // Helper to calculate Indian Financial Year (e.g., "2024-25")
  const calculateFY = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return month >= 4 ? `${year}-${(year + 1).toString().slice(-2)}` : `${year - 1}-${year.toString().slice(-2)}`;
  };

  useEffect(() => {
    const fetchSymbols = async () => {
      setLoadingSymbols(true);
      try {
        const res = await getPublicData(GET_ALL_SCRIPS);
        const data = await res.json();
        if (Array.isArray(data)) setSymbols(data);
      } catch (err) {
        console.error("Failed to load symbols:", err);
      } finally {
        setLoadingSymbols(false);
      }
    };
    fetchSymbols();
  }, []);

  const handleClose = () => {
    onClose ? onClose() : navigate("/dashboard");
  };

  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm({
    defaultValues: trade || {
      symbol: "",
      exchange: "NSE",
      segment: "EQUITY",
      type: "Buy",
      entryPrice: "",
      exitPrice: "",
      stopLoss: "",
      targetPrice: "",
      quantity: "",
      entryTradeDate: new Date().toISOString().split('T')[0],
      exitTradeDate: "",
      status: "Open",
      financialYear: calculateFY(new Date()),
      notes: "",
    }
  });

  const status = watch("status");
  const currentSymbolValue = watch("symbol");
  const entryDate = watch("entryTradeDate");

  // Update FY whenever entry date changes
  useEffect(() => {
    if (entryDate) setValue("financialYear", calculateFY(entryDate));
  }, [entryDate, setValue]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setApiError("");
    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `${SAVE_TRADE}/${trade.id}` : SAVE_TRADE;
      const res = await authFetch(url, { method, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(await res.text() || "Failed to save trade");
      handleClose();
    } catch (err) {
      setApiError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`${isAddFormPage 
      ? "min-h-screen bg-slate-50 dark:bg-slate-950"
      : "w-full"
    } transition-colors duration-300`}>
    
      <div className={`${isAddFormPage
        ? "w-full bg-white dark:bg-slate-900"
        : "w-full bg-transparent"
      } overflow-hidden`}>
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
              <FiTrendingUp size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{isEdit ? "Modify Trade" : "Log New Trade"}</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transaction Registry • {watch("financialYear")}</p>
            </div>
          </div>
          {!isAddFormPage && <button type="button" onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
            <FiX size={24} />
          </button>}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={`${isAddFormPage ? "px-6 py-10 md:px-12" : "pt-8 pb-4"}`}>
          {apiError && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <FiInfo className="shrink-0" />
              <p className="text-sm font-bold">{apiError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">

            {/* Symbol Selection */}
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Symbol / Ticker</label>
              <div className="relative group w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
                <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 z-10 pointer-events-none" />
                <StyledAutocomplete
                  options={symbols}
                  value={symbols.find((s) => s.pTrdSymbol === currentSymbolValue) || null}
                  filterOptions={(options, state) => options.filter(opt => opt.pTrdSymbol?.toLowerCase().includes(state.inputValue.toLowerCase())).slice(0, 50)}
                  loading={loadingSymbols}
                  getOptionLabel={(option) => option.pTrdSymbol || ""}
                  onChange={(event, newValue) => {
                    setValue("symbol", newValue ? newValue.pTrdSymbol : "", { shouldValidate: true });
                    // Auto-detect segment and exchange if provided by scrip master
                    if (newValue?.pExchSeg) {
                      const seg = newValue.pExchSeg.toLowerCase();
                      setValue("exchange", seg.includes("nse") ? "NSE" : "BSE");
                      setValue("segment", seg.includes("fo") ? "FNO" : "EQUITY");
                    }
                  }}
                  renderInput={(params) => <TextField {...params} placeholder="Search scrip..." />}
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps} className="flex flex-col items-start px-4 py-2 border-b border-slate-50 dark:border-slate-800 last:border-none">
                        <div className="flex justify-between w-full">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{option.pTrdSymbol}</span>
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold">{option.pExchSeg}</span>
                        </div>
                        <span className="text-xs text-slate-500 truncate w-full">{option.pDesc}</span>
                      </li>
                    );
                  }}
                  slots={{ paper: StyledPaper }}
                />
              </div>
            </div>

            {/* Exchange */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Exchange</label>
              <div className="relative">
                <FiActivity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select {...register("exchange")} className="w-full pl-12 pr-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-bold cursor-pointer appearance-none">
                  <option value="NSE">NSE</option>
                  <option value="BSE">BSE</option>
                </select>
              </div>
            </div>

            {/* Segment */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Segment</label>
              <div className="relative">
                <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select {...register("segment")} className="w-full pl-12 pr-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-bold cursor-pointer appearance-none">
                  <option value="EQUITY">EQUITY (Cash)</option>
                  <option value="FNO">FNO (Options/Fut)</option>
                  <option value="COMMODITY">COMMODITY</option>
                </select>
              </div>
            </div>

            {/* Order Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Order Type</label>
              <select {...register("type", { required: true })} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-bold appearance-none cursor-pointer">
                <option value="Buy">Buy (Long)</option>
                <option value="Sell">Sell (Short)</option>
              </select>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Quantity</label>
              <input type="number" {...register("quantity", { required: true })} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-bold" />
            </div>

            {/* Pricing Section */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Entry Price (₹)</label>
              <input type="number" step="0.01" {...register("entryPrice", { required: true })} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-bold" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Stop Loss (₹)</label>
              <div className="relative">
                <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none" />
                <input type="number" step="0.01" {...register("stopLoss")} className="w-full pl-12 pr-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-bold" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Target Price (₹)</label>
              <div className="relative">
                <FiTarget className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
                <input type="number" step="0.01" {...register("targetPrice")} className="w-full pl-12 pr-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-bold" />
              </div>
            </div>

            {/* Dates Section */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Entry Date</label>
              <div onClick={() => entryDateRef.current?.showPicker()} className="relative group cursor-pointer w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all hover:border-slate-300">
                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <input type="date" {...register("entryTradeDate", { required: true })} ref={(e) => { register("entryTradeDate").ref(e); entryDateRef.current = e; }} className="w-full bg-transparent outline-none dark:text-white font-bold cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:hidden" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Exit Date</label>
              <div onClick={() => status === "Closed" && exitDateRef.current?.showPicker()} className={`relative group w-full pl-12 pr-4 py-3 rounded-2xl transition-all ${status === "Open" ? "bg-slate-100 dark:bg-slate-900 opacity-50 cursor-not-allowed" : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-slate-300"}`}>
                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="date" disabled={status === "Open"} {...register("exitTradeDate")} ref={(e) => { register("exitTradeDate").ref(e); exitDateRef.current = e; }} className="w-full bg-transparent outline-none dark:text-white font-bold cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:hidden" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Exit Price (₹)</label>
              <input type="number" step="0.01" disabled={status === "Open"} className={`w-full px-5 py-3 border rounded-2xl outline-none transition-all dark:text-white font-bold ${status === "Open" ? "bg-slate-100 dark:bg-slate-900 border-transparent opacity-60" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10"}`} {...register("exitPrice")} />
            </div>

            {/* Status Toggle */}
            <div className="lg:col-span-3 space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Trade Status</label>
              <div className="flex gap-4">
                {["Open", "Closed"].map((option) => (
                  <label key={option} className={`flex-1 flex items-center justify-center py-3.5 rounded-2xl border-2 cursor-pointer transition-all ${status === option ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500"}`}>
                    <input type="radio" value={option} {...register("status")} className="hidden" />
                    <span className="font-black uppercase tracking-tight text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
              Journaling / Strategy Notes
            </label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <RichTextEditor value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="mt-10 flex items-center justify-end gap-4 border-t border-slate-100 dark:border-slate-800 pt-8 pb-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-sm font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              disabled={submitting}
            >
              {isAddFormPage ? "Back to Dashboard" : "Discard"}
            </button>
            <button
              type="submit"
              className="flex items-center gap-3 px-10 py-3 text-sm font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
              disabled={submitting}
            >
              <FiSave size={18} />
              {submitting ? "Processing..." : "Commit Trade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTrade;