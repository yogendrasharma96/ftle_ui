const InsightCard = ({ label, val, icon, isImage, onClick }) => {
    // Force Cloudinary to provide the original quality (q_100) and original scaling
    const highResUrl = isImage && typeof val === 'string' 
        ? val.replace('/upload/', '/upload/q_100,f_png,dn_72/') 
        : val;

    return (
        <div className={`p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-400 transition-all' : ''}`}
             onClick={onClick}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                    {icon} {label}
                </span>
            </div>
            
            {isImage ? (
                <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 group">
                    <img 
                        src={highResUrl} 
                        alt={label} 
                        // Key Changes: 
                        // 1. h-auto (don't force a height)
                        // 2. image-rendering: high-quality (prevents blur)
                        // 3. object-contain (shows the whole chart)
                        className="w-full h-auto min-h-30 object-contain transition-transform duration-300 group-hover:scale-105" 
                        style={{ imageRendering: 'auto' }} 
                    />
                </div>
            ) : (
                <span className="text-base font-black block truncate text-slate-900 dark:text-white">
                    {val}
                </span>
            )}
        </div>
    );
};

export default InsightCard;