import { useLocation, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { GET_ALL_SCRIPS, GET_CLOUDINARY_SIGNATURE, SAVE_TRADE } from "../constants";
import { authFetch, getPublicData } from "../api/authFetch";
import { FiSave, FiX, FiInfo, FiTrendingUp, FiHash, FiCalendar, FiActivity, FiLayers, FiShield, FiTarget } from "react-icons/fi";
import { TextField } from "@mui/material";
import RichTextEditor from "./RichTextEditor";
import { StyledAutocomplete, StyledPaper, calculateFY, sectors } from "@/lib/utils";
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';

function AddTrade({ trade, onClose }) {
  const isEdit = Boolean(trade);
  const navigate = useNavigate();
  const entryDateRef = useRef(null);
  const exitDateRef = useRef(null);
  const location = useLocation();
  const isAddFormPage = location.pathname === "/trade/new";
  const [submitting, setSubmitting] = useState(false);
  const [symbols, setSymbols] = useState([]);
  const [loadingSymbols, setLoadingSymbols] = useState(false);
  const [images, setImages] = useState(trade?.images || []);

  const handleClose = () => {
    onClose ? onClose() : navigate("/dashboard");
  };

  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm({
    defaultValues: trade || {
      symbol: "",
      exchange: "NSE",
      segment: "EQUITY",
      sector: "Banking",
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
      images: []
    }
  });

  const status = watch("status");
  const currentSymbolValue = watch("symbol");
  const entryDate = watch("entryTradeDate");

  useEffect(() => {
    if (entryDate) setValue("financialYear", calculateFY(entryDate));
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
    if (symbols.length === 0) {
      fetchSymbols();
    }
  }, [entryDate, setValue]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 2) {
      toast.error("Maximum 2 images allowed per trade."); 
    return;
    }

    const compressionToast = toast.loading("Processing images...");

    const compressionOptions = {
      maxSizeMB: 2,           // Increase this to 2MB for sharp charts
      maxWidthOrHeight: 2560, // Support 2K resolution
      useWebWorker: true,
      initialQuality: 0.95
    };

    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          // COMPRESSION LOGIC
          const compressedBlob = await imageCompression(file, compressionOptions);
          // Create a File object from Blob so 'instanceof File' check passes later
          return {
            imageUrl: new File([compressedBlob], file.name, { type: file.type })
          };
        })
      );

      setImages(prev => [...prev, ...compressedFiles]);
      toast.success("Images ready!", { id: compressionToast }); // Resolve loading toast
    } catch (error) {
      console.error("Compression failed:", error);
    toast.error("Failed to process images.", { id: compressionToast });
    }
  };

  const fileInputRef = useRef(null);

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      // If no images left, manually clear the input value to remove the filename
      if (newImages.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return newImages;
    });
  };

  const uploadImagesToCloudinary = async (files) => {
    const uploadedUrls = [];

    const folderPath = `trades/${currentSymbolValue || 'general'}/${entryDate || 'no-date'}`;

    const sigRes = await authFetch(`${GET_CLOUDINARY_SIGNATURE}?folder=${folderPath}`, {
      method: "GET"
    });

    const sigData = await sigRes.json();

    for (const file of files) {
      console.log("Processing file:", file.name, "Size (MB):", (file.size / (1024 * 1024)).toFixed(2));
      if (file.size > 4 * 1024 * 1024) {
        console.error(`File ${file.name} is too large (>4MB)`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file.imageUrl);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", sigData.timestamp);
      formData.append("signature", sigData.signature);

      formData.append("folder", folderPath);

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
          { method: "POST", body: formData }
        );

        const data = await res.json();

        if (res.ok && data.secure_url) {
          uploadedUrls.push(data.secure_url);
        } else {
          console.error("Cloudinary Upload Error:", data.error?.message || "Unknown error");
        }
      } catch (err) {
        console.error("Network error during Cloudinary upload:", err);
      }
    }
    return uploadedUrls;
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    const saveTradePromise = (async () => {
      const existingImages = images.filter(img => typeof img.imageUrl === 'string');
      const newFiles = images.filter(img => img.imageUrl instanceof File);
  
      let uploadedUrls = [];
      if (newFiles.length > 0) {
        uploadedUrls = await uploadImagesToCloudinary(newFiles);
      }
  
      const finalImages = [
        ...existingImages,
        ...uploadedUrls.map(url => ({ imageUrl: url }))
      ];
  
      const payload = {
        ...data,
        images: finalImages.slice(0, 2)
      };
  
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `${SAVE_TRADE}/${trade.id}` : SAVE_TRADE;
  
      const res = await authFetch(url, { method, body: JSON.stringify(payload) });
  
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Server error occurred");
      }
  
      return res;
    })();
    toast.promise(saveTradePromise, {
      loading: isEdit ? 'Updating trade records...' : 'Committing trade to ledger...',
      success: () => {
        handleClose();
        return isEdit ? 'Trade updated successfully! 📝' : 'Trade logged successfully! 🚀';
      },
      error: (err) => `Failed: ${err.message}`,
    });
  
    try {
      await saveTradePromise;
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };
  //   try {
  //     const existingImages = images.filter(img => typeof img.imageUrl === 'string');
  //     const newFiles = images.filter(img => img.imageUrl instanceof File);

  //     let uploadedUrls = [];
  //     if (newFiles.length > 0) {
  //       uploadedUrls = await uploadImagesToCloudinary(newFiles);
  //     }

  //     const finalImages = [
  //       ...existingImages,
  //       ...uploadedUrls.map(url => ({ imageUrl: url }))
  //     ];

  //     const payload = {
  //       ...data,
  //       images: finalImages.slice(0, 2) // Backend expects List<TradeImageDto>
  //     };

  //     const method = isEdit ? "PUT" : "POST";
  //     const url = isEdit ? `${SAVE_TRADE}/${trade.id}` : SAVE_TRADE;

  //     // IMPORTANT: Send payload, not data
  //     const res = await authFetch(url, { method, body: JSON.stringify(payload) });

  //     if (!res.ok) throw new Error(await res.text() || "Failed to save trade");
  //     handleClose();
  //   } catch (err) {
  //     setApiError(err.message || "Something went wrong");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

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

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                Sector
              </label>

              <select
                {...register("sector")}
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none dark:text-white font-bold"
              >
                <option value="">Select Sector</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
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

          <div className="mt-6 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
              Upload Trade Images (Max 2)
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-700 dark:file:text-white hover:file:bg-blue-100"
            />

            {images.length > 0 && (
              <div className="flex gap-3 mt-3">
                {images.map((img, i) => {
                  const isNewFile = img.imageUrl instanceof File;
                  let displayUrl = img.imageUrl;
                  if (isNewFile) {
                    displayUrl = URL.createObjectURL(img.imageUrl);
                  } else if (typeof img.imageUrl === 'string') {
                    displayUrl = img.imageUrl.replace('/upload/', '/upload/q_auto,f_auto/');
                  }
                  return (<div key={i} className="relative group">
                    <img
                      src={displayUrl}
                      alt="preview"
                      className="h-24 w-24 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800 shadow-md transition-transform duration-300 group-hover:scale-110" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute -top-2 -right-2 h-7 w-7 flex items-center justify-center bg-white dark:bg-slate-800 text-rose-500 dark:text-rose-400 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-all duration-200 z-10"
                    >
                      <FiX size={14} strokeWidth={3} />
                    </button>
                  </div>)
                })}
              </div>
            )}
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