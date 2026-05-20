"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home, CheckSquare, Timer, Target, Settings, Sparkles,
  CalendarClock, Brain, Inbox, Sun, Moon, Plus, X, Menu, ChevronLeft, MessageSquare, LogIn
} from "lucide-react";
import { useAppStore } from "./store";

const inter = Inter({ subsets: ["latin"] });

const NAV_ITEMS = [
  { href: "/",          label: "Dashboard",    icon: Home,          section: "Hub" },
  { href: "/pomodoro",  label: "Pomodoro",      icon: Timer,         section: "Productivity" },
  { href: "/matrix",   label: "Matrix",        icon: Target,        section: "Productivity" },
  { href: "/habits",   label: "Habits",        icon: CheckSquare,   section: "Productivity" },
  { href: "/timeblock",label: "Time Blocking", icon: CalendarClock, section: "Productivity" },
  { href: "/brain",    label: "Second Brain",  icon: Brain,         section: "Knowledge" },
  { href: "/brain-dump",label:"Brain Dump AI", icon: MessageSquare, section: "Knowledge" },
  { href: "/inbox",    label: "Inbox",         icon: Inbox,         section: "Knowledge" },
  { href: "/settings", label: "Settings",      icon: Settings,      section: "System" },
];

/* ──────────────── Quick Capture ──────────────── */
function QuickCapture() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const addNote = useAppStore((s) => s.addNote);

  const handleSave = () => {
    if (!title.trim()) return;
    addNote(title.trim(), content.trim(), ["quick-capture"]);
    setTitle(""); setContent(""); setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-500 to-primary hover:from-indigo-400 hover:to-primary-hover text-white shadow-lg dark:shadow-indigo-900/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-40 dark:ring-1 dark:ring-indigo-500/30"
        title="Quick Capture"
      >
        <Plus size={22} />
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fade-in" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-[#1A1A26] border border-border dark:border-white/[0.08] rounded-2xl shadow-xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-5 sm:p-6 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-text-dark dark:text-dark-text flex items-center gap-2">
                <Brain size={18} className="text-primary dark:text-indigo-400" /> Quick Capture
              </h3>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg hover:bg-surface dark:hover:bg-white/[0.06] flex items-center justify-center text-text-muted transition-colors">
                <X size={16} />
              </button>
            </div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" autoFocus className="w-full bg-surface dark:bg-dark-bg border border-border dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm font-medium text-text-dark dark:text-dark-text mb-3 focus:outline-none focus:border-primary dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary dark:focus:ring-indigo-500/30 transition-colors placeholder:text-text-light dark:placeholder:text-dark-text-light" />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's on your mind?" rows={3} className="w-full bg-surface dark:bg-dark-bg border border-border dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm font-medium text-text-dark dark:text-dark-text mb-4 focus:outline-none focus:border-primary dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary dark:focus:ring-indigo-500/30 transition-colors resize-none placeholder:text-text-light dark:placeholder:text-dark-text-light" />
            <button onClick={handleSave} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-primary hover:from-indigo-400 hover:to-primary-hover text-white text-sm font-bold transition-all shadow-md">Save to Brain</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ──────────────── Sidebar Nav Content ──────────────── */
function SidebarContent({ onNavigate, collapsed = false }: { onNavigate?: () => void, collapsed?: boolean }) {
  const pathname = usePathname();
  const { settings, toggleTheme, inboxItems, user, logout } = useAppStore();
  const unprocessed = inboxItems.filter((i) => !i.processed).length;

  const sections = NAV_ITEMS.reduce<Record<string, typeof NAV_ITEMS>>((acc, item) => {
    (acc[item.section] = acc[item.section] || []).push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Logo */}
      <div className={`px-5 mb-7 flex items-center ${collapsed ? "justify-center px-0" : "gap-3"}`}>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white shadow-md shrink-0">
          <Sparkles size={18} />
        </div>
        {!collapsed && (
          <div>
            <h2 className="font-bold text-sm text-text-dark dark:text-dark-text tracking-tight">HabitFlow</h2>
            <span className="text-[10px] font-semibold text-text-muted dark:text-[#6B6B8A] uppercase tracking-widest">Student OS</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 overflow-y-auto space-y-0.5 ${collapsed ? "px-2" : "px-3"}`}>
        {Object.entries(sections).map(([section, items]) => (
          <div key={section}>
            {!collapsed && <div className="text-[10px] font-bold text-text-light dark:text-[#3A3A5A] uppercase tracking-widest mb-1.5 px-3 mt-5">{section}</div>}
            {collapsed && <div className="mt-4"></div>}
            {items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center rounded-xl text-sm font-medium transition-all relative ${
                    active
                      ? "bg-white dark:bg-white/[0.07] dark:ring-1 dark:ring-white/[0.1] text-primary dark:text-indigo-300 shadow-sm font-semibold"
                      : "text-text-muted dark:text-[#6B6B8A] hover:bg-white dark:hover:bg-white/[0.04] hover:text-text-dark dark:hover:text-dark-text"
                  } ${collapsed ? "justify-center p-3 mb-1" : "gap-3 px-3 py-2.5"}`}
                >
                  <Icon size={17} className={active ? "text-primary dark:text-indigo-400 shrink-0" : "shrink-0"} />
                  {!collapsed && item.label}
                  {!collapsed && item.href === "/inbox" && unprocessed > 0 && (
                    <span className="ml-auto bg-danger text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{unprocessed}</span>
                  )}
                  {collapsed && item.href === "/inbox" && unprocessed > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger"></span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Cloud Sync & Session Status */}
      <div className={`pt-3 border-t border-border dark:border-white/[0.06] ${collapsed ? "px-2" : "px-3"}`}>
        {user ? (
          <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-white/50 dark:bg-white/[0.04] border border-border dark:border-white/[0.06] backdrop-blur-md">
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-text-dark dark:text-dark-text truncate leading-tight">{user.name}</span>
                <span className="text-[9px] text-text-muted dark:text-[#6B6B8A] truncate mt-0.5 leading-none">{user.email}</span>
              </div>
            )}
            <button
              onClick={() => logout()}
              className="w-full py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-bold transition-all"
            >
              {collapsed ? "Out" : "Logout / Disconnect"}
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className={`flex items-center rounded-xl text-xs font-bold text-primary dark:text-indigo-400 bg-primary/10 dark:bg-indigo-500/10 hover:bg-primary/20 dark:hover:bg-indigo-500/20 transition-all ${collapsed ? "justify-center p-3" : "px-3 py-2.5 gap-2"}`}
          >
            <LogIn size={15} className="shrink-0" />
            {!collapsed && "Cloud Sync"}
          </Link>
        )}
      </div>

      {/* Footer */}
      <div className={`pt-2 mt-2 ${collapsed ? "px-2" : "px-3 space-y-1"}`}>
        <button onClick={toggleTheme} title={collapsed ? (settings.theme === "light" ? "Dark Mode" : "Light Mode") : undefined} className={`w-full flex items-center rounded-xl text-sm font-medium text-text-muted dark:text-[#6B6B8A] hover:bg-white dark:hover:bg-white/[0.04] hover:text-text-dark dark:hover:text-dark-text transition-all ${collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"}`}>
          {settings.theme === "light" ? <Moon size={17} className="shrink-0" /> : <Sun size={17} className="text-amber-400 shrink-0" />}
          {!collapsed && (settings.theme === "light" ? "Dark Mode" : "Light Mode")}
        </button>
        {!collapsed && <p className="text-[10px] text-text-light dark:text-[#3A3A5A] text-center py-1">HabitFlow v2.0 · HCI Project</p>}
      </div>
    </>
  );
}

/* ──────────────── Desktop Sidebar ──────────────── */
function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`hidden lg:flex bg-surface dark:bg-[#10101A] border-r border-border dark:border-white/[0.06] h-full flex-col py-5 shrink-0 transition-all duration-300 relative ${collapsed ? "w-[80px]" : "w-[240px] xl:w-[250px]"}`}>
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-8 w-7 h-7 bg-white dark:bg-[#1A1A26] border border-border dark:border-white/[0.08] rounded-full flex items-center justify-center text-text-muted hover:text-text-dark dark:hover:text-dark-text z-10 shadow-sm"
      >
        <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
      </button>
      <SidebarContent collapsed={collapsed} />
    </aside>
  );
}

/* ──────────────── Mobile Drawer ──────────────── */
function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}
      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-[260px] bg-surface dark:bg-[#10101A] border-r border-border dark:border-white/[0.06] z-50 flex flex-col py-5 transition-transform duration-300 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent onNavigate={onClose} />
      </div>
    </>
  );
}

/* ──────────────── Mobile Top Bar ──────────────── */
function MobileTopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { settings, toggleTheme } = useAppStore();
  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-surface dark:bg-[#10101A] border-b border-border dark:border-white/[0.06] shrink-0">
      <button onClick={onOpenMenu} className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted dark:text-[#6B6B8A] hover:bg-white dark:hover:bg-white/[0.06] transition-colors">
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white">
          <Sparkles size={14} />
        </div>
        <span className="font-bold text-sm text-text-dark dark:text-dark-text">HabitFlow</span>
      </div>
      <button onClick={toggleTheme} className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted dark:text-[#6B6B8A] hover:bg-white dark:hover:bg-white/[0.06] transition-colors">
        {settings.theme === "light" ? <Moon size={18} /> : <Sun size={18} className="text-amber-400" />}
      </button>
    </header>
  );
}

/* ──────────────── Root Layout ──────────────── */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = useAppStore((s) => s.settings.theme);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/onboarding";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>HabitFlow Student OS</title>
        <meta name="description" content="Your university productivity hub — Pomodoro, Habits, Matrix, Second Brain and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} flex flex-col lg:flex-row h-screen overflow-hidden bg-surface dark:bg-[#08080F] transition-colors`}>
        {isAuthPage ? (
          <main className="flex-1 h-full overflow-y-auto bg-background transition-colors">
            {children}
          </main>
        ) : (
          <>
            {/* Mobile top bar */}
            <MobileTopBar onOpenMenu={() => setDrawerOpen(true)} />
            {/* Mobile drawer */}
            <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
            {/* Desktop sidebar */}
            <DesktopSidebar />
            {/* Main content */}
            <main className="flex-1 h-full overflow-y-auto bg-background dark:bg-[#08080F] transition-colors">
              {children}
            </main>
            <QuickCapture />
            <ToastNotification />
          </>
        )}
      </body>
    </html>
  );
}

/* ──────────────── Toast Notification ──────────────── */
function ToastNotification() {
  const { toast, dismissToast } = useAppStore();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;

    setProgress(100);
    const intervalTime = 50;
    const totalDuration = 5000;
    const steps = totalDuration / intervalTime;
    const decrement = 100 / steps;

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - decrement));
    }, intervalTime);

    const dismissTimer = setTimeout(() => {
      dismissToast();
    }, totalDuration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(dismissTimer);
    };
  }, [toast?.id, dismissToast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 animate-slide-up w-full max-w-sm px-4 sm:px-0">
      <div className="bg-white/80 dark:bg-[#1A1A26]/90 border border-border dark:border-white/[0.08] backdrop-blur-md rounded-xl shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-4 flex items-center justify-between gap-4 overflow-hidden relative">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-text-dark dark:text-dark-text truncate">
            {toast.message}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.();
                dismissToast();
              }}
              className="text-xs font-bold text-primary dark:text-indigo-400 hover:text-primary-hover transition-colors px-2 py-1 rounded hover:bg-primary/10 dark:hover:bg-indigo-500/10"
            >
              {toast.actionLabel || "Undo"}
            </button>
          )}
          <button
            onClick={dismissToast}
            className="text-text-muted hover:text-text-dark p-1 rounded-lg hover:bg-surface dark:hover:bg-white/[0.06] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        {/* Progress indicator */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-indigo-500 dark:bg-indigo-400 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
