"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_URL } from "@/lib/api";

/* ───────────────────────── Types ───────────────────────── */

export type Quadrant = "q1" | "q2" | "q3" | "q4";
export type ThemeMode = "light" | "dark";

export interface MatrixTask {
  id: string;
  title: string;
  quadrant: Quadrant;
  done: boolean;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  category: "study" | "health" | "personal" | "fitness";
  completedDates: string[];
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  label: string;
  duration: number;
  completedAt: string;
  type: "work" | "short-break" | "long-break";
}

export interface TimeBlock {
  id: string;
  date: string;
  hour: number;
  taskTitle: string;
  color: string;
  taskId?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InboxItem {
  id: string;
  content: string;
  createdAt: string;
  processed: boolean;
}

export interface Frog {
  taskId: string;
  taskTitle: string;
  date: string;
  completed: boolean;
}

export interface AppSettings {
  workDuration: number;
  shortBreak: number;
  longBreak: number;
  userName: string;
  userEmail: string;
  theme: ThemeMode;
}

export interface ToastState {
  id: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
}

export interface CognitiveContext {
  active_focus: string[];
  active_stressors: string[];
  current_pressure: "low" | "medium" | "high";
  recommended_mode: "tiny" | "focus" | "reflect";
  academic_career_phase: string;
}

/* ───────────────────────── Store ───────────────────────── */

interface AppState {
  // Toast / Undo State
  toast: ToastState | null;
  showToast: (message: string, action?: () => void, actionLabel?: string) => void;
  dismissToast: () => void;

  // Auth & Sync State
  token: string | null;
  isGuestMode: boolean;
  user: { email: string; name: string } | null;
  userMemory: { current_focus: string[]; stressors: string[]; academic_career_phase: string } | null;
  cognitiveContext: CognitiveContext | null;
  setToken: (token: string | null) => void;
  setGuestMode: (val: boolean) => void;
  setUser: (user: { email: string; name: string } | null) => void;
  setUserMemory: (mem: any) => void;
  setCognitiveContext: (context: CognitiveContext | null) => void;
  fetchCognitiveContext: () => Promise<void>;
  logout: () => void;
  loadSyncedState: (state: {
    habits: Habit[];
    matrixTasks: MatrixTask[];
    pomodoroSessions: PomodoroSession[];
    inboxItems: InboxItem[];
    userMemory?: any;
  }) => void;

  // Matrix
  matrixTasks: MatrixTask[];
  addMatrixTask: (title: string, quadrant: Quadrant, customId?: string, skipToast?: boolean) => void;
  toggleMatrixTask: (id: string, skipToast?: boolean) => void;
  deleteMatrixTask: (id: string, skipToast?: boolean) => void;
  moveMatrixTask: (id: string, quadrant: Quadrant) => void;

  // Habits
  habits: Habit[];
  addHabit: (name: string, category: Habit["category"], skipToast?: boolean) => void;
  deleteHabit: (id: string, skipToast?: boolean) => void;
  toggleHabitToday: (id: string) => void;

  // Pomodoro
  pomodoroSessions: PomodoroSession[];
  addPomodoroSession: (session: Omit<PomodoroSession, "id">) => void;

  // Time Blocking
  timeBlocks: TimeBlock[];
  addTimeBlock: (block: Omit<TimeBlock, "id">) => void;
  removeTimeBlock: (id: string) => void;
  clearDayBlocks: (date: string) => void;

  // Second Brain (Notes)
  notes: Note[];
  addNote: (title: string, content: string, tags: string[], customId?: string, skipToast?: boolean) => void;
  updateNote: (id: string, updates: Partial<Pick<Note, "title" | "content" | "tags">>) => void;
  deleteNote: (id: string, skipToast?: boolean) => void;

  // GTD Inbox
  inboxItems: InboxItem[];
  addInboxItem: (content: string, customId?: string, skipToast?: boolean) => string;
  deleteInboxItem: (id: string, skipToast?: boolean) => void;
  processInboxItem: (id: string) => void;

  // Eat the Frog
  frog: Frog | null;
  setFrog: (taskId: string, taskTitle: string) => void;
  completeFrog: (skipToast?: boolean) => void;
  clearFrog: (skipToast?: boolean) => void;

  // Tiny Mode
  tinyModeActive: boolean;
  tinyModeTaskId: string | null;
  setTinyMode: (active: boolean, taskId?: string | null) => void;

  // Daily Reflection
  dailyReflection: string | null;
  setDailyReflection: (reflection: string | null) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
  toggleTheme: () => void;
  clearAllData: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const getLocalDateStr = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const today = () => getLocalDateStr();
const now = () => new Date().toISOString();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      /* ── Toast / Undo Slice ── */
      toast: null,
      showToast: (message, action, actionLabel = "Undo") => {
        set({ toast: { id: Math.random().toString(), message, action, actionLabel } });
      },
      dismissToast: () => {
        setTimeout(() => {
          set({ toast: null });
        }, 0);
      },

      /* ── Auth State & Sync ── */
      token: null,
      isGuestMode: false,
      user: null,
      userMemory: null,
      cognitiveContext: null,
      setToken: (token) => set(() => ({ token })),
      setGuestMode: (val) => set(() => ({ isGuestMode: val })),
      setUser: (user) => set(() => ({ user })),
      setUserMemory: (userMemory) => {
        set(() => ({ userMemory }));
        get().fetchCognitiveContext();
      },
      setCognitiveContext: (cognitiveContext) => set(() => ({ cognitiveContext })),
      fetchCognitiveContext: async () => {
        const token = get().token;
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        try {
          const res = await fetch(`${API_URL}/api/cognitive-context`, { headers });
          if (res.ok) {
            const data = await res.json();
            set({ cognitiveContext: data });
          }
        } catch (e) {
          console.error("Failed to fetch cognitive context:", e);
        }
      },
      logout: () =>
        set(() => ({
          token: null,
          isGuestMode: false,
          user: null,
          userMemory: null,
          cognitiveContext: null,
          matrixTasks: [],
          habits: [],
          pomodoroSessions: [],
          timeBlocks: [],
          notes: [],
          inboxItems: [],
          frog: null,
          toast: null,
        })),
      loadSyncedState: (state) => {
        set((s) => ({
          habits: state.habits.length ? state.habits : s.habits,
          matrixTasks: state.matrixTasks.length ? state.matrixTasks : s.matrixTasks,
          pomodoroSessions: state.pomodoroSessions.length ? state.pomodoroSessions : s.pomodoroSessions,
          inboxItems: state.inboxItems.length ? state.inboxItems : s.inboxItems,
          userMemory: state.userMemory || s.userMemory
        }));
        get().fetchCognitiveContext();
      },

      /* ── Matrix ── */
      matrixTasks: [
        { id: "demo-1", title: "HCI Project Phase 2", quadrant: "q1", done: false, createdAt: today() },
        { id: "demo-2", title: "Math Quiz 3 Prep", quadrant: "q1", done: false, createdAt: today() },
        { id: "demo-3", title: "Plan semester schedule", quadrant: "q2", done: false, createdAt: today() },
        { id: "demo-4", title: "Read Chapter 7", quadrant: "q2", done: false, createdAt: today() },
        { id: "demo-5", title: "Reply to group chat", quadrant: "q3", done: false, createdAt: today() },
        { id: "demo-6", title: "Social media cleanup", quadrant: "q4", done: false, createdAt: today() },
      ],
      addMatrixTask: (title, quadrant, customId, skipToast) => {
        const id = customId || uid();
        set((s) => ({ matrixTasks: [...s.matrixTasks, { id, title, quadrant, done: false, createdAt: today() }] }));
        get().fetchCognitiveContext();

        if (!skipToast) {
          get().showToast(`Added task: "${title}"`, () => {
            get().deleteMatrixTask(id, true);
          });
        }
      },
      toggleMatrixTask: (id, skipToast) => {
        let taskTitle = "";
        let nextDone = false;
        const prevFrog = get().frog;

        set((s) => {
          const task = s.matrixTasks.find((t) => t.id === id);
          if (task) {
            taskTitle = task.title;
            nextDone = !task.done;
          }

          // Clear frog state if completed
          let newFrog = s.frog;
          if (nextDone && s.frog && s.frog.taskId === id) {
            newFrog = null;
          }

          return {
            matrixTasks: s.matrixTasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
            frog: newFrog
          };
        });
        get().fetchCognitiveContext();

        if (taskTitle && !skipToast) {
          get().showToast(
            nextDone ? `Completed "${taskTitle}" 🎉` : `Marked active: "${taskTitle}"`,
            () => {
              set((s) => ({
                matrixTasks: s.matrixTasks.map((t) => (t.id === id ? { ...t, done: !nextDone } : t)),
                frog: prevFrog
              }));
              get().fetchCognitiveContext();
              if (get().tinyModeActive) {
                get().setTinyMode(true, id);
              }
            }
          );
        }
      },
      deleteMatrixTask: (id, skipToast) => {
        let deletedTask: MatrixTask | undefined;
        set((s) => {
          deletedTask = s.matrixTasks.find((t) => t.id === id);
          return { matrixTasks: s.matrixTasks.filter((t) => t.id !== id) };
        });
        get().fetchCognitiveContext();

        if (deletedTask && !skipToast) {
          const taskObj = deletedTask;
          get().showToast(`Deleted task: "${taskObj.title}"`, () => {
            set((s) => ({ matrixTasks: [...s.matrixTasks, taskObj] }));
            get().fetchCognitiveContext();
          });
        }
      },
      moveMatrixTask: (id, quadrant) =>
        set((s) => ({ matrixTasks: s.matrixTasks.map((t) => (t.id === id ? { ...t, quadrant } : t)) })),

      /* ── Habits ── */
      habits: [
        { id: "h1", name: "Morning Study Session", category: "study", completedDates: [], createdAt: today() },
        { id: "h2", name: "Exercise 30 min", category: "fitness", completedDates: [], createdAt: today() },
        { id: "h3", name: "Drink 8 Glasses Water", category: "health", completedDates: [], createdAt: today() },
        { id: "h4", name: "Read 20 Pages", category: "personal", completedDates: [], createdAt: today() },
        { id: "h5", name: "Review Flashcards", category: "study", completedDates: [], createdAt: today() },
        { id: "h6", name: "Meditate 10 min", category: "health", completedDates: [], createdAt: today() },
      ],
      addHabit: (name, category, skipToast) => {
        const id = uid();
        set((s) => ({ habits: [...s.habits, { id, name, category, completedDates: [], createdAt: today() }] }));
        if (!skipToast) {
          get().showToast(`Added habit: "${name}"`, () => {
            get().deleteHabit(id, true);
          });
        }
      },
      deleteHabit: (id, skipToast) => {
        let deletedHabit: Habit | undefined;
        set((s) => {
          deletedHabit = s.habits.find((h) => h.id === id);
          return { habits: s.habits.filter((h) => h.id !== id) };
        });

        if (deletedHabit && !skipToast) {
          const habitObj = deletedHabit;
          get().showToast(`Deleted habit: "${habitObj.name}"`, () => {
            set((s) => ({ habits: [...s.habits, habitObj] }));
          });
        }
      },
      toggleHabitToday: (id) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h;
            const d = today();
            const done = h.completedDates.includes(d);
            return { ...h, completedDates: done ? h.completedDates.filter((x) => x !== d) : [...h.completedDates, d] };
          }),
        })),

      /* ── Pomodoro ── */
      pomodoroSessions: [],
      addPomodoroSession: (session) =>
        set((s) => ({ pomodoroSessions: [...s.pomodoroSessions, { ...session, id: uid() }] })),

      /* ── Time Blocks ── */
      timeBlocks: [],
      addTimeBlock: (block) =>
        set((s) => ({ timeBlocks: [...s.timeBlocks.filter((b) => !(b.date === block.date && b.hour === block.hour)), { ...block, id: uid() }] })),
      removeTimeBlock: (id) =>
        set((s) => ({ timeBlocks: s.timeBlocks.filter((b) => b.id !== id) })),
      clearDayBlocks: (date) =>
        set((s) => ({ timeBlocks: s.timeBlocks.filter((b) => b.date !== date) })),

      /* ── Notes (Second Brain) ── */
      notes: [
        { id: "n1", title: "HCI Design Principles", content: "Key principles:\n- Visibility\n- Feedback\n- Constraints\n- Consistency\n\nRelated to [[Usability Heuristics]]", tags: ["hci", "study"], createdAt: now(), updatedAt: now() },
        { id: "n2", title: "Usability Heuristics", content: "Nielsen's 10 Usability Heuristics:\n1. Visibility of system status\n2. Match between system and real world\n3. User control and freedom\n\nSee also [[HCI Design Principles]]", tags: ["hci", "reference"], createdAt: now(), updatedAt: now() },
      ],
      addNote: (title, content, tags, customId, skipToast) => {
        const id = customId || uid();
        set((s) => ({ notes: [...s.notes, { id, title, content, tags, createdAt: now(), updatedAt: now() }] }));
        if (!skipToast) {
          get().showToast(`Added note: "${title}"`, () => {
            get().deleteNote(id, true);
          });
        }
      },
      updateNote: (id, updates) =>
        set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: now() } : n)) })),
      deleteNote: (id, skipToast) => {
        let deletedNote: Note | undefined;
        set((s) => {
          deletedNote = s.notes.find((n) => n.id === id);
          return { notes: s.notes.filter((n) => n.id !== id) };
        });

        if (deletedNote && !skipToast) {
          const noteObj = deletedNote;
          get().showToast(`Deleted note: "${noteObj.title}"`, () => {
            set((s) => ({ notes: [...s.notes, noteObj] }));
            const token = get().token;
            if (token) {
              fetch(`${API_URL}/api/notes`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(noteObj)
              }).catch(console.error);
            }
          });
        }
      },

      /* ── GTD Inbox ── */
      inboxItems: [
        { id: "i1", content: "Research UX patterns for mobile forms", createdAt: now(), processed: false },
        { id: "i2", content: "Email professor about extension", createdAt: now(), processed: false },
        { id: "i3", content: "Download lecture slides week 8", createdAt: now(), processed: false },
      ],
      addInboxItem: (content, customId, skipToast) => {
        const id = customId || uid();
        set((s) => ({ inboxItems: [...s.inboxItems, { id, content, createdAt: now(), processed: false }] }));
        if (!skipToast) {
          get().showToast(`Added to Inbox: "${content}"`, () => {
            get().deleteInboxItem(id, true);
          });
        }
        return id;
      },
      deleteInboxItem: (id, skipToast) => {
        let deletedItem: InboxItem | undefined;
        set((s) => {
          deletedItem = s.inboxItems.find((i) => i.id === id);
          return { inboxItems: s.inboxItems.filter((i) => i.id !== id) };
        });

        if (deletedItem && !skipToast) {
          const itemObj = deletedItem;
          get().showToast(`Deleted inbox item: "${itemObj.content}"`, () => {
            set((s) => ({ inboxItems: [...s.inboxItems, itemObj] }));
          });
        }
      },
      processInboxItem: (id) =>
        set((s) => ({ inboxItems: s.inboxItems.map((i) => (i.id === id ? { ...i, processed: true } : i)) })),

      /* ── Eat the Frog ── */
      frog: null,
      setFrog: (taskId, taskTitle) =>
        set(() => ({ frog: { taskId, taskTitle, date: today(), completed: false } })),
      completeFrog: (skipToast) => {
        const currentFrog = get().frog;
        if (!currentFrog) return;
        const { taskId, taskTitle } = currentFrog;

        // Complete the task in the matrix
        get().toggleMatrixTask(taskId, true);

        if (!skipToast) {
          get().showToast(`Eaten the Frog: "${taskTitle}" 🐸`, () => {
            get().toggleMatrixTask(taskId, true);
            set({ frog: currentFrog });
          });
        }
      },
      clearFrog: (skipToast) => {
        const prevFrog = get().frog;
        set(() => ({ frog: null }));
        if (prevFrog && !skipToast) {
          get().showToast("Frog cleared", () => {
            set({ frog: prevFrog });
          });
        }
      },

      /* ── Tiny Mode ── */
      tinyModeActive: false,
      tinyModeTaskId: null,
      setTinyMode: (active, taskId = null) =>
        set(() => ({ tinyModeActive: active, tinyModeTaskId: taskId })),

      /* ── Daily Reflection ── */
      dailyReflection: null,
      setDailyReflection: (reflection) =>
        set(() => ({ dailyReflection: reflection })),

      /* ── Settings ── */
      settings: {
        workDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        userName: "John Student",
        userEmail: "john@university.edu",
        theme: "light",
      },
      updateSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),
      toggleTheme: () =>
        set((s) => {
          const next = s.settings.theme === "light" ? "dark" : "light";
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", next === "dark");
          }
          return { settings: { ...s.settings, theme: next } };
        }),
      clearAllData: () =>
        set(() => ({
          matrixTasks: [],
          habits: [],
          pomodoroSessions: [],
          timeBlocks: [],
          notes: [],
          inboxItems: [],
          frog: null,
          cognitiveContext: null,
          userMemory: null,
        })),
    }),
    { name: "habitflow-store" }
  )
);
