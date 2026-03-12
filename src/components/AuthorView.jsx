import React, { useEffect, useState } from "react";
import { FiSave, FiEye, FiEdit3, FiPlus, FiList, FiClock, FiTrash2, FiCheckCircle } from "react-icons/fi";
import { authFetch } from "../api/authFetch";
import { SAVE_MARKET_VIEW, GET_LATEST_MARKET_VIEWS } from "../constants";
import RichTextEditor from "./RichTextEditor"; // Assuming this is your component path

const AuthorView = () => {
  // --- State Management ---
  const [views, setViews] = useState([]);
  const [activeTab, setActiveTab] = useState("list"); // "list" or "editor"
  const [editingId, setEditingId] = useState(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [sentiment, setSentiment] = useState("Neutral");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    fetchAllViews();
  }, []);

  const fetchAllViews = async () => {
    try {
      const res = await authFetch(GET_LATEST_MARKET_VIEWS);
      const data = await res.json();
      console.log("Fetched views:", data);
      setViews(data || []);
    } catch (err) {
      console.error("Failed to load views");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setTags("");
    setSentiment("Neutral");
    setActiveTab("editor");
  };

  const handleEditClick = (view) => {
    setEditingId(view.id);
    setTitle(view.title);
    setContent(view.content);
    setTags(view.tags || "");
    setSentiment(view.sentiment);
    setActiveTab("editor");
  };

  const handleAction = async (isDraft) => {
    setSaving(true);
    const payload = { title, content, tags, sentiment, draft: isDraft };
    
    // Determine if we are updating (PUT) or creating (POST)
    const url = editingId ? `${SAVE_MARKET_VIEW}/${editingId}` : (isDraft ? `${SAVE_MARKET_VIEW}/draft` : SAVE_MARKET_VIEW);
    const method = editingId ? "PUT" : "POST";

    try {
      await authFetch(url, {
        method,
        body: JSON.stringify(payload)
      });
      setLastSaved(new Date());
      fetchAllViews();
      alert(editingId ? "Update successful!" : "Published successfully!");
      if (!isDraft) setActiveTab("list");
    } catch (err) {
      alert("Action failed. Please check backend logs.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-500">
      
      {/* --- Sidebar Navigation --- */}
      <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-600" /> Analyst Dashboard
          </h2>
        </div>

        <div className="p-4">
          <button 
            onClick={resetForm}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <FiPlus /> New Perspective
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Your Recent Views</p>
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => handleEditClick(view)}
              className={`w-full text-left p-4 rounded-2xl transition-all border ${
                editingId === view.id 
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
                : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                  view.draft ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {view.draft ? "Draft" : "Published"}
                </span>
                <span className="text-[9px] text-slate-400 font-bold">{new Date(view.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{view.title}</h4>
            </button>
          ))}
        </div>
      </aside>

      {/* --- Main Stage --- */}
      <main className="flex-1 flex flex-col">
        
        {/* Top Header Bar */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {lastSaved && (
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 animate-pulse">
                <FiCheckCircle className="text-emerald-500" /> Autosaved at {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleAction(true)}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <FiSave /> {editingId ? "Update Draft" : "Save Draft"}
            </button>
            <button 
              onClick={() => handleAction(false)}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-sm font-bold shadow-xl shadow-blue-600/10 hover:scale-105 transition-all flex items-center gap-2"
            >
              <FiCheckCircle /> {editingId ? "Update & Publish" : "Publish View"}
            </button>
          </div>
        </header>

        {/* Editor Content */}
        <div className="p-10 max-w-5xl mx-auto w-full">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none">
            
            {/* Sentiment & Tags Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Market Sentiment</label>
                <select
                  value={sentiment}
                  onChange={(e) => setSentiment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option>Bullish</option>
                  <option>Bearish</option>
                  <option>Neutral</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Asset Tags</label>
                <input
                  placeholder="e.g. Nifty50, Crypto, Gold"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Title Input */}
            <input
              type="text"
              placeholder="Enter your market outlook title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-4xl font-black text-slate-900 dark:text-white placeholder-slate-200 dark:placeholder-slate-700 outline-none mb-8 tracking-tighter"
            />

            {/* RichTextEditor Integration */}
            <div className="min-h-125 prose prose-slate dark:prose-invert max-w-none">
              <RichTextEditor 
                value={content} 
                onChange={setContent}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthorView;