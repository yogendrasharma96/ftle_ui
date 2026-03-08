const Tooltip = ({ children, text }) => (
    <div className="relative group/tooltip flex items-center">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block z-50">
            <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap shadow-xl border border-slate-700">
                {text}
            </div>
            <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 mx-auto border-r border-b border-slate-700"></div>
        </div>
    </div>
);

export default Tooltip;