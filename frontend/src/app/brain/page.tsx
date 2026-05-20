"use client";

import { useState, useEffect } from "react";
import { Brain, Plus, Search, Tag, Trash2, Link as LinkIcon, X, Loader2 } from "lucide-react";
import { useAppStore } from "../store";
import { API_URL } from "@/lib/api";

function parseBacklinks(content: string): string[] {
  const matches = content.match(/\[\[([^\]]+)\]\]/g) || [];
  return matches.map(m => m.slice(2, -2));
}

export default function BrainPage() {
  const { notes, addNote, updateNote, deleteNote, token } = useAppStore();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");

  // AI Semantic Search and Sync States
  const [searchMode, setSearchMode] = useState<"keyword" | "semantic">("keyword");
  const [semanticResults, setSemanticResults] = useState<any[] | null>(null);
  const [loadingSemantic, setLoadingSemantic] = useState(false);

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));
  
  // Standard filtering logic
  const filtered = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchTag = activeTag === "all" || n.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  const selected = notes.find(n => n.id === selectedId);
  const backlinks = selectedId ? notes.filter(n => n.id !== selectedId && n.content.includes(`[[${selected?.title}]]`)) : [];

  // 1. Sync notes to SQLite backend on mount
  useEffect(() => {
    const syncAllNotes = async () => {
      for (const note of notes) {
        try {
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (token) headers["Authorization"] = `Bearer ${token}`;

          const updateRes = await fetch(`${API_URL}/api/notes/${note.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({
              title: note.title,
              content: note.content,
              tags: note.tags
            })
          });
          if (updateRes.status === 404) {
            await fetch(`${API_URL}/api/notes`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                id: note.id,
                title: note.title,
                content: note.content,
                tags: note.tags
              })
            });
          }
        } catch (e) {
          console.error("Offline or backend sync failed:", e);
        }
      }
    };
    syncAllNotes();
  }, [token]);

  // 2. Debounced active note content auto-sync
  useEffect(() => {
    if (!selected) return;
    const delayDebounceFn = setTimeout(async () => {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        await fetch(`${API_URL}/api/notes/${selected.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            title: selected.title,
            content: selected.content,
            tags: selected.tags
          })
        });
      } catch (e) {
        console.error("Auto-sync failed:", e);
      }
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [selected?.title, selected?.content, selected?.tags, token]);

  // 3. Debounced Semantic Search fetch
  useEffect(() => {
    if (searchMode === "semantic" && search.trim()) {
      setLoadingSemantic(true);
      const delayDebounceFn = setTimeout(async () => {
        try {
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (token) headers["Authorization"] = `Bearer ${token}`;

          const res = await fetch(`${API_URL}/api/notes/search`, {
            method: "POST",
            headers,
            body: JSON.stringify({ query: search }),
          });
          if (res.ok) {
            const data = await res.json();
            // Filter by tag if selected
            const results = activeTag === "all"
              ? data
              : data.filter((n: any) => n.tags.includes(activeTag));
            setSemanticResults(results);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingSemantic(false);
        }
      }, 600);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSemanticResults(null);
    }
  }, [search, searchMode, activeTag, token]);

  const displayedNotes = searchMode === "semantic" && semanticResults !== null ? semanticResults : filtered;

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const customId = "n-" + Math.random().toString(36).slice(2, 10);
    const parsedTags = newTags.split(",").map(t => t.trim()).filter(Boolean);

    addNote(newTitle.trim(), newContent.trim(), parsedTags, customId);
    setNewTitle(""); setNewContent(""); setNewTags(""); setShowModal(false);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${API_URL}/api/notes`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id: customId,
          title: newTitle.trim(),
          content: newContent.trim(),
          tags: parsedTags
        })
      });
    } catch (e) {
      console.error("Backend note creation failed:", e);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full animate-fade-in">
      {/* Sidebar panel */}
      <div className={`lg:w-[300px] xl:w-[340px] shrink-0 border-b lg:border-b-0 lg:border-r border-border dark:border-white/[0.06] flex flex-col bg-surface dark:bg-[#0E0E18] transition-all ${selectedId ? "hidden lg:flex" : "flex"}`}>
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-border dark:border-white/[0.06] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Brain size={18} className="text-primary shrink-0"/>
            <h1 className="text-sm font-bold text-text-dark dark:text-dark-text truncate">Second Brain</h1>
          </div>
          <button onClick={() => setShowModal(true)} className="w-8 h-8 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors shrink-0"><Plus size={16}/></button>
        </div>
        
        {/* Search & AI Toggle */}
        <div className="px-3 sm:px-4 py-2.5 border-b border-border dark:border-white/[0.06] space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted"/>
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder={searchMode === "semantic" ? "AI Semantic Search..." : "Search notes..."}
              className="w-full bg-white dark:bg-dark-bg border border-border dark:border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-text-dark dark:text-dark-text focus:outline-none focus:border-primary transition-colors placeholder:text-text-light dark:placeholder:text-dark-text-light"
            />
          </div>

          <div className="flex bg-surface-hover dark:bg-dark-surface-hover p-1 rounded-lg">
            <button
              onClick={() => setSearchMode("keyword")}
              className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${
                searchMode === "keyword"
                  ? "bg-white dark:bg-white/[0.08] text-primary dark:text-indigo-400 shadow-sm"
                  : "text-text-muted hover:text-text-dark"
              }`}
            >
              Keyword Search
            </button>
            <button
              onClick={() => setSearchMode("semantic")}
              className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${
                searchMode === "semantic"
                  ? "bg-white dark:bg-white/[0.08] text-primary dark:text-indigo-400 shadow-sm"
                  : "text-text-muted hover:text-text-dark"
              }`}
            >
              AI Semantic Search ⚡
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="px-3 sm:px-4 py-2.5 border-b border-border dark:border-white/[0.06] flex gap-1.5 flex-wrap">
          {["all", ...allTags].map(t => <button key={t} onClick={() => setActiveTag(t)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${activeTag===t?"bg-primary text-white":"bg-surface dark:bg-dark-bg text-text-muted dark:text-dark-text-muted hover:bg-surface-hover dark:hover:bg-dark-surface-hover"}`}>{t==="all"?"All":`#${t}`}</button>)}
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto divide-y divide-border dark:divide-white/[0.05]">
          {loadingSemantic ? (
            <div className="p-6 text-center">
              <Loader2 size={24} className="mx-auto text-indigo-500 animate-spin mb-2" />
              <p className="text-xs text-text-muted dark:text-dark-text-muted">Searching semantically...</p>
            </div>
          ) : displayedNotes.length === 0 ? (
            <div className="p-6 text-center"><Brain size={28} className="mx-auto text-text-light dark:text-dark-text-light mb-2"/><p className="text-xs text-text-muted dark:text-dark-text-muted">No notes found</p></div>
          ) : displayedNotes.map(note => (
            <button key={note.id} onClick={() => setSelectedId(note.id)} className={`w-full text-left p-3 sm:p-4 hover:bg-surface dark:hover:bg-white/[0.03] transition-colors ${selectedId===note.id?"bg-surface dark:bg-white/[0.05] border-l-2 border-primary":""}`}>
              <h3 className="text-xs sm:text-sm font-semibold text-text-dark dark:text-dark-text mb-1 truncate">{note.title}</h3>
              <p className="text-[10px] sm:text-xs text-text-muted dark:text-dark-text-muted line-clamp-2">{note.content}</p>
              <div className="flex gap-1 mt-1.5 flex-wrap">{note.tags.map((t: string)=><span key={t} className="text-[9px] sm:text-[10px] font-bold text-primary bg-primary-light dark:bg-dark-primary-light px-1.5 py-0.5 rounded">#{t}</span>)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor panel */}
      <div className={`flex-1 flex flex-col min-h-0 ${!selectedId ? "hidden lg:flex" : "flex"}`}>
        {selected ? (
          <>
            <div className="p-3 sm:p-5 border-b border-border dark:border-white/[0.06] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* Back button on mobile */}
                <button onClick={() => setSelectedId(null)} className="lg:hidden w-8 h-8 rounded-lg hover:bg-surface dark:hover:bg-white/[0.06] flex items-center justify-center text-text-muted shrink-0"><X size={16}/></button>
                <h2 className="text-base sm:text-xl font-bold text-text-dark dark:text-dark-text truncate">{selected.title}</h2>
              </div>
              <button
                onClick={async () => {
                  const idToDelete = selected.id;
                  deleteNote(idToDelete);
                  setSelectedId(null);
                  try {
                    const headers: Record<string, string> = {};
                    if (token) headers["Authorization"] = `Bearer ${token}`;

                    await fetch(`${API_URL}/api/notes/${idToDelete}`, {
                      method: "DELETE",
                      headers
                    });
                  } catch (e) {
                    console.error("Backend note deletion failed:", e);
                  }
                }}
                className="w-8 h-8 rounded-lg hover:bg-danger-light dark:hover:bg-dark-danger-light text-text-light hover:text-danger flex items-center justify-center transition-all shrink-0"
              >
                <Trash2 size={15}/>
              </button>
            </div>
            <div className="flex gap-1.5 px-3 sm:px-5 py-2.5 flex-wrap border-b border-border dark:border-white/[0.06]">
              {selected.tags.map(t=><span key={t} className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary-light dark:bg-dark-primary-light px-2 py-0.5 rounded-full"><Tag size={10}/>#{t}</span>)}
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-5">
              <textarea value={selected.content} onChange={e => updateNote(selected.id, { content: e.target.value })} className="w-full min-h-[200px] bg-transparent text-xs sm:text-sm text-text-dark dark:text-dark-text focus:outline-none resize-none leading-relaxed" placeholder="Start writing... Use [[Note Title]] to link notes." />
            </div>
            {(backlinks.length > 0 || parseBacklinks(selected.content).length > 0) && (
              <div className="p-3 sm:p-5 border-t border-border dark:border-white/[0.06]">
                <h3 className="text-xs font-bold text-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><LinkIcon size={11}/> Backlinks</h3>
                <div className="flex flex-wrap gap-1.5">{backlinks.map(n=><button key={n.id} onClick={() => setSelectedId(n.id)} className="text-[10px] sm:text-xs font-semibold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors">{n.title}</button>)}</div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Brain size={40} className="text-text-light dark:text-dark-text-light mb-3"/>
            <h2 className="text-base font-bold text-text-dark dark:text-dark-text mb-1">Your Digital Brain</h2>
            <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted">Select a note or create a new one.<br/>Use <code className="bg-surface dark:bg-dark-surface px-1 rounded text-primary">[[Note Title]]</code> to link notes.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-[#1A1A26] border border-border dark:border-white/[0.08] rounded-2xl shadow-xl p-5 sm:p-8 w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-text-dark dark:text-dark-text">New Note</h3><button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-surface dark:hover:bg-white/[0.06] flex items-center justify-center text-text-muted"><X size={16}/></button></div>
            <div className="space-y-3">
              <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Title" autoFocus className="w-full bg-surface dark:bg-dark-bg border border-border dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-text-dark dark:text-dark-text focus:outline-none focus:border-primary transition-colors"/>
              <textarea value={newContent} onChange={e=>setNewContent(e.target.value)} placeholder="Content... Use [[Link]] to backlink." rows={4} className="w-full bg-surface dark:bg-dark-bg border border-border dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-text-dark dark:text-dark-text focus:outline-none focus:border-primary transition-colors resize-none"/>
              <input value={newTags} onChange={e=>setNewTags(e.target.value)} placeholder="Tags: hci, study, project" className="w-full bg-surface dark:bg-dark-bg border border-border dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-text-dark dark:text-dark-text focus:outline-none focus:border-primary transition-colors"/>
            </div>
            <div className="flex gap-2 mt-5"><button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-border dark:border-white/[0.08] text-xs font-semibold text-text-muted hover:bg-surface transition-colors">Cancel</button><button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all">Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
