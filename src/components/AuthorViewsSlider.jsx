import React, { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrendingUp, FiTrendingDown, FiMinus, FiClock, FiX, FiMaximize2 } from "react-icons/fi";
import { GET_LATEST_MARKET_VIEWS } from "../constants";
import { getPublicData } from "../api/authFetch";

const AuthorViewsSlider = () => {
  const [views, setViews] = useState([]);
  const [selectedView, setSelectedView] = useState(null);

  const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);

  useEffect(() => {
    fetchViews();
  }, []);

  const fetchViews = async () => {
    try {
      const res = await getPublicData(GET_LATEST_MARKET_VIEWS);
      const data = await res.json();
      setViews(data || []);
    } catch (err) {
      console.error("Failed to load market views");
    }
  };

  const getSentimentStyles = (sentiment) => {
    switch (sentiment) {
      case "Bullish": return { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", icon: <FiTrendingUp />, border: "border-emerald-500/20" };
      case "Bearish": return { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", icon: <FiTrendingDown />, border: "border-rose-500/20" };
      default: return { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", icon: <FiMinus />, border: "border-slate-500/20" };
    }
  };

  return (
    <section className="w-full bg-slate-50 dark:bg-[#020617] py-24 transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            className="px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-[0.3em] mb-6 border border-blue-600/20"
          >
            Institutional Intelligence
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
            Market <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-400">Analysis</span>
          </h2>
          <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-transparent rounded-full" />
        </div>

        {/* Carousel Viewport */}
        <div className="overflow-visible cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex gap-8">
            {views.map((view) => {
              const styles = getSentimentStyles(view.sentiment);
              return (
                <div key={view.id} className="flex-[0_0_90%] md:flex-[0_0_45%] lg:flex-[0_0_31%] min-w-0">
                  <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 h-[480px] flex flex-col transition-all duration-500 hover:border-blue-500/40 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.1)]">
                    
                    <div className="flex justify-between items-center mb-8">
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${styles.bg} ${styles.text} ${styles.border}`}>
                        {styles.icon} {view.sentiment}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <FiClock className="text-blue-500" /> {new Date(view.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-6 line-clamp-2 leading-[1.1] group-hover:text-blue-600 transition-colors">
                      {view.title}
                    </h3>
                    
                    <div className="prose prose-sm dark:prose-invert prose-slate line-clamp-5 text-slate-600 dark:text-slate-400 mb-8 flex-1 overflow-hidden">
                      <div dangerouslySetInnerHTML={{ __html: view.content }} />
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <button 
                        onClick={() => setSelectedView(view)}
                        className="group/btn flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white"
                      >
                        Explore View
                        <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 group-hover/btn:bg-blue-600 group-hover/btn:text-white group-hover/btn:scale-110 transition-all duration-300">
                          <FiMaximize2 />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- FULL VIEW MODAL --- */}
      <AnimatePresence>
        {selectedView && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedView(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-[12px]"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedView(null)}
                className="absolute top-8 right-8 z-50 p-4 rounded-full bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-900 dark:text-white hover:bg-rose-500 hover:text-white transition-all shadow-lg"
              >
                <FiX size={24} />
              </button>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-4 mb-10">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getSentimentStyles(selectedView.sentiment).bg} ${getSentimentStyles(selectedView.sentiment).text} ${getSentimentStyles(selectedView.sentiment).border}`}>
                            {selectedView.sentiment}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(selectedView.createdAt).toDateString()}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-12 tracking-tighter leading-tight">
                        {selectedView.title}
                    </h1>

                    <div 
                        className="prose prose-lg md:prose-xl dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-blue-600"
                        dangerouslySetInnerHTML={{ __html: selectedView.content }} 
                    />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AuthorViewsSlider;