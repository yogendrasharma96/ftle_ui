import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { GET_ALL_SCRIPS, SAVE_TRADE } from "../constants";
import { authFetch, getPublicData } from "../api/authFetch";
import { FiSave, FiX, FiInfo, FiTrendingUp, FiHash, FiCalendar } from "react-icons/fi";
import { styled,Autocomplete,TextField,Paper } from "@mui/material";

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    paddingLeft: '35px', // Space for the FiHash icon
    borderRadius: '1rem', // rounded-2xl
    backgroundColor: 'transparent',
    '& fieldset': { border: 'none' }, // We use the parent div for borders
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
  const dateInputRef = useRef(null); // Ref to trigger the date picker
  const location = useLocation();
  const isAddFormPage = location.pathname.includes("/addtrade");

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const [symbols, setSymbols] = useState([]);
  const [loadingSymbols, setLoadingSymbols] = useState(false);

  

  useEffect(() => {
    console.log("fetch");
    const fetchSymbols = async () => {
      setLoadingSymbols(true);
      try {
        // getPublicData already returns the response if 'ok'
        const res = await getPublicData(GET_ALL_SCRIPS);
        const data = await res.json();
        
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setSymbols(data);
        }
      } catch (err) {
        console.error("Failed to load symbols:", err);
        // Optional: Set an error state to show the user
      } finally {
        setLoadingSymbols(false);
      }
    };
  
    fetchSymbols();
  }, []);


  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/home");
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: trade || {
      symbol: "",
      type: "",
      entryPrice: "",
      exitPrice: "",
      quantity: "",
      tradeDate: new Date().toISOString().split('T')[0],
      status: "Open",
      notes: "",
    }
  });

  const status = watch("status");
  const currentSymbolValue = watch("symbol");

  const onSubmit = async (data) => {
    setSubmitting(true);
    setApiError("");

    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `${SAVE_TRADE}/${trade.id}` : SAVE_TRADE;

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to save trade");
      }

      handleClose();
    } catch (err) {
      setApiError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`${!onClose
        ? "min-h-screen bg-slate-50 dark:bg-slate-950 p-6"
        : "w-full"
        } transition-colors duration-300`}
    >
      {/* Container: Max-width handled by Modal, so we just manage internal flow */}
      <div
        className={`${!onClose
          ? "max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
          : "w-full bg-transparent"
          }`}
      >

        {/* Header: py-6 remains for vertical separation from the form */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">          <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
            <FiTrendingUp size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEdit ? "Modify Trade" : "Log New Trade"}
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transaction Registry</p>
          </div>
        </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form Body: Removed py-8 to let the header and footer margins do the work */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`${isAddFormPage
            ? "px-8 py-10"
            : "pt-8 pb-4"
            }`}
        >          {apiError && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <FiInfo className="shrink-0" />
            <p className="text-sm font-bold">{apiError}</p>
          </div>
        )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Symbol */}
            {/* Symbol Select Box */}
            <div className="space-y-1.5">
      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
        Symbol / Ticker
      </label>
      
      {/* Container div maintains your exact border and focus-ring style */}
      <div className="relative group w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
        
        <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10 pointer-events-none" />
        
        <StyledAutocomplete
          options={symbols}
          value={symbols.find((s) => s.pTrdSymbol === currentSymbolValue) || null}
          filterOptions={(options, state) =>
            options
              .filter(opt =>
                opt.pTrdSymbol
                  ?.toLowerCase()
                  .includes(state.inputValue.toLowerCase())
              )
              .slice(0, 50) // 👈 LIMIT results
          }
          loading={loadingSymbols}
          getOptionLabel={(option) => option.pTrdSymbol || ""}
          // Sync with React Hook Form
          onChange={(event, newValue) => {
            setValue("symbol", newValue ? newValue.pTrdSymbol : "",{shouldValidate:true});
          }}
          isOptionEqualToValue={(option, value) =>
            option.pTrdSymbol === value?.pTrdSymbol
          }
          slots={{
            paper: StyledPaper,
          }}
        
          slotProps={{
            input: {
              className: "dark:text-white font-bold",
            },
            paper: {
              sx: {
                borderRadius: "1rem",
                mt: 1,
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                border: "1px solid",
                borderColor: "divider",
              },
            },
          }}
          
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search scrip..."
            />
          )}
          renderOption={(props, option) => {
            const { key, ...optionProps } = props;
            return (<li key={key} {...optionProps} className="flex flex-col items-start px-4 py-2 border-b border-slate-50 dark:border-slate-800 last:border-none">
              <div className="flex justify-between w-full">
                <span className="font-bold text-slate-900 dark:text-slate-100">{option.pTrdSymbol}</span>
                <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">{option.pExchSeg}</span>
              </div>
              <span className="text-xs text-slate-500 truncate w-full">{option.pDesc}</span>
            </li>
  )}}
        />
      </div>
      {errors.symbol && <p className="text-rose-500 text-[10px] font-bold uppercase ml-1">{errors.symbol.message}</p>}
    </div>
            {/* Order Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Order Type</label>
              <select
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-bold cursor-pointer appearance-none"
                {...register("type", { required: "Required" })}
              >
                <option value="">Select Type</option>
                <option value="Buy">Buy (Long)</option>
                <option value="Sell">Sell (Short)</option>
              </select>
            </div>

            {/* Entry Price */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Entry Price (₹)</label>
              <input
                type="number" step="0.01"
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-bold"
                {...register("entryPrice", { required: true })}
              />
            </div>

            {/* Exit Price */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Exit Price (₹)</label>
              <input
                type="number" step="0.01"
                disabled={status === "Open"}
                className={`w-full px-5 py-3 border rounded-2xl outline-none transition-all dark:text-white font-bold ${status === "Open"
                  ? "bg-slate-100 dark:bg-slate-900 border-transparent text-slate-400 opacity-60"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                  }`}
                {...register("exitPrice")}
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Quantity</label>
              <input
                type="number"
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-bold"
                {...register("quantity", { required: true })}
              />
            </div>

            {/* Date Picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                Trade Date
              </label>
              <div
                onClick={() => dateInputRef.current?.showPicker()}
                className="relative group cursor-pointer w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                {/* This is our custom icon */}
                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors pointer-events-none" />

                <input
                  type="date"
                  {...register("tradeDate", { required: "Required" })}
                  ref={(e) => {
                    register("tradeDate").ref(e);
                    dateInputRef.current = e;
                  }}
                  className="w-full bg-transparent outline-none dark:text-white font-bold cursor-pointer scheme:light dark:scheme:dark pointer-events-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Status Toggle */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Trade Status</label>
              <div className="flex gap-4">
                {["Open", "Closed"].map((option) => (
                  <label key={option} className={`flex-1 flex items-center justify-center py-3.5 rounded-2xl border-2 cursor-pointer transition-all ${status === option
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500"
                    }`}>
                    <input type="radio" value={option} {...register("status")} className="hidden" />
                    <span className="font-black uppercase tracking-tight text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6 space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Journaling / Strategy Notes</label>
            <textarea
              rows={3}
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white resize-none font-medium"
              placeholder="Describe the trade setup..."
              {...register("notes")}
            />
          </div>

          {/* Footer Actions */}
          <div className="mt-10 flex items-center justify-end gap-4 border-t border-slate-100 dark:border-slate-800 pt-8 pb-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-sm font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              disabled={submitting}
            >
              Discard
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