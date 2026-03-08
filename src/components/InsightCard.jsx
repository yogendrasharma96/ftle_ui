const InsightCard = ({ label, val, icon }) => (
    <div className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl">
        <span className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1 mb-1">
            {icon} {label}
        </span>
        <span className="text-sm font-bold">{val}</span>
    </div>
);

export default InsightCard;