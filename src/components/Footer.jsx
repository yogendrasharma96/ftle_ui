import React from "react";
import { FiHeart, FiShield, FiExternalLink, FiMail, FiMapPin, FiGlobe } from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      {/* Subtle Background Glow for Dark Mode */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />
      
      {/* SEBI Mandatory Risk Warning Section */}
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="group relative overflow-hidden p-0.5 rounded-[2rem] bg-linear-to-br from-amber-200 to-orange-200 dark:from-amber-500/20 dark:to-orange-500/20">
            <div className="relative p-6 md:p-8 rounded-[1.9rem] bg-amber-50/50 dark:bg-slate-900/90 backdrop-blur-xl flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="shrink-0 p-4 bg-white dark:bg-amber-500/10 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-500/20 text-amber-600 animate-pulse">
                <FiShield size={28} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  SEBI Risk Disclosure on Derivatives
                </h4>
                <p className="text-[13px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed max-w-5xl">
                  9 out of 10 individual traders in equity Cash and F&O segments incurred net losses. 
                  On average, loss-makers registered net loss on an average of <span className="text-slate-900 dark:text-white font-bold">₹50,000</span>. 
                  Beyond net losses, loss-makers expended an additional <span className="text-slate-900 dark:text-white font-bold">28%</span> in transaction costs. 
                  Trading in securities involves market risks.
                </p>
              </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Column 1: Identity */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl shadow-xl shadow-blue-600/20 flex items-center justify-center text-white font-black text-xl">
              F
            </div>
            <span className="text-2xl font-black tracking-tighter dark:text-white">
              FTLE<span className="text-blue-600">.</span>
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Professional trade journaling for the modern Indian ecosystem. 
            Precision analytics, real-time insights, and disciplined growth.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
            Made with <FiHeart className="text-rose-500 fill-rose-500 animate-bounce" /> in <span className="bg-linear-to-r from-orange-500 via-white to-green-500 bg-clip-text text-transparent">India</span>
          </div>
        </div>

        {/* Column 2: Resources */}
        <div className="space-y-6">
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Exchanges</h4>
          <ul className="space-y-4">
            {[
              { name: "NSE India", url: "#" },
              { name: "BSE India", url: "#" },
              { name: "SEBI Score", url: "#" },
              { name: "Gift Nifty", url: "#" }
            ].map((link) => (
              <li key={link.name}>
                <a href={link.url} className="group flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all underline-offset-4 hover:underline">
                  {link.name} 
                  <FiExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Compliance/Legal */}
        <div className="space-y-6">
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Legal</h4>
          <ul className="space-y-4 text-sm font-bold text-slate-600 dark:text-slate-400">
            <li className="hover:text-blue-500 cursor-pointer transition-colors">Privacy Policy</li>
            <li className="hover:text-blue-500 cursor-pointer transition-colors">Terms of Usage</li>
            <li className="hover:text-blue-500 cursor-pointer transition-colors">Refund Policy</li>
            <li className="hover:text-blue-500 cursor-pointer transition-colors">Disclosure</li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div className="space-y-6">
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Contact</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3 group">
              <FiMapPin className="mt-1 text-blue-600" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                Jhotwara, Jaipur,<br />Rajasthan - 302012
              </p>
            </div>
            <div className="flex items-center gap-3 group">
              <FiMail className="text-blue-600" />
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 transition-all border-b-2 border-transparent group-hover:border-blue-600">
                support@ftle.in
              </p>
            </div>
            <div className="flex items-center gap-3 group">
              <FiGlobe className="text-blue-600" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                English (IN)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="relative border-t border-slate-100 dark:border-slate-800/50 py-10 px-6 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center md:text-left">
            © {currentYear} FTLE Analytics. All Rights Reserved. 
            <span className="mx-3 hidden md:inline">|</span> 
            <br className="md:hidden" />
            Designed for professional traders.
          </div>
          
          <div className="flex gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">System Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">All Systems Operational</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;