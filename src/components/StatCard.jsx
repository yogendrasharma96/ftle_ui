function StatCard({ label, value, icon, colorClass, bgClass , func}) {
    return (
      <div onClick={func} className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border 
      border-slate-200 dark:border-slate-800 shadow-sm 
      transition-all hover:shadow-md 
      ${func ? "cursor-pointer hover:scale-[1.02]" : ""}`}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {label}
            </p>
            <h3 className={`text-2xl font-bold tracking-tight ${colorClass}`}>
              {value}
            </h3>
          </div>
          <div className={`p-2.5 rounded-xl ${bgClass} ${colorClass}`}>
            {icon}
          </div>
        </div>
      </div>
    );
  }
export default StatCard;  