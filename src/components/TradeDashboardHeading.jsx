import { DownloadIcon, PlusCircleIcon, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { authDownload } from '../api/authFetch'
import { EXPORT_EXCEL } from '../constants'
import { useSelector } from 'react-redux'

const TradeDashboardHeading = ({ role, totalTrades, setTrade }) => {

    const [exporting, setExporting] = useState(false)

    const fy=useSelector(state => state.utilities.financialYear)

    const handleExport = async () => {
      try {
        setExporting(true)
    
        const blob = await authDownload(EXPORT_EXCEL+`?financialYear=${fy}`)
    
        const url = window.URL.createObjectURL(blob)
    
        const link = document.createElement("a")
        link.href = url
        link.download = `trades_${Date.now()}.xlsx`
        link.click()
    
        window.URL.revokeObjectURL(url)
    
      } catch (e) {
        alert("Export failed")
      } finally {
        setExporting(false)
      }
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            {/* Title */}
            <div>
                <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                    Trade Dashboard
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {totalTrades} trades found
                </p>
            </div>

            {role === "ADMIN" && (
                <div className="flex gap-3">

                    {/* Add Trade */}
                    <button
                        onClick={() => setTrade(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.03] active:scale-95"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        <span className="font-semibold">Add Trade</span>
                    </button>

                    {/* Export */}
                    <button
                        disabled={exporting}
                        onClick={handleExport}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-95
                          ${exporting 
                            ? "bg-gray-400 cursor-not-allowed" 
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:scale-[1.03] text-white"}
                        `}
                    >
                        {exporting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <DownloadIcon className="w-5 h-5" />
                        )}

                        <span className="font-semibold">
                            {exporting ? "Exporting..." : "Export to Excel"}
                        </span>
                    </button>

                </div>
            )}
        </div>
    )
}

export default TradeDashboardHeading