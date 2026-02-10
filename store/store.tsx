import React, { createContext, useContext, useMemo, useState } from "react";
import { api, tokenStore } from "../api/Client";
import { todayISO } from "../utils/date";


export type RiskLevel = "Low" | "Medium" | "High";

export type JournalEntry = {
  id: string;
  title: string;
  content: string;
  date: string; 
  tags: string[];

  mood?: number;
  craving?: number;
  stress?: number;
};

export type CheckIn = {
  date: string;
  mood: number;
  craving: number;
  stress: number;
  note?: string;
};

export type ToolUse = {
  id: string;
  name: string;
  date: string;
  time: string;
};

export type Profile = {
  name: string;
  email: string;
  reminders: boolean;
  darkMode: boolean;
};

export type AuthUser = { id: string; email: string } | null;

type State = {
  authUser: AuthUser;
  authReady: boolean;

  streakDays: number;
  riskLevel: RiskLevel;
  journal: JournalEntry[];
  checkIns: CheckIn[];
  toolUses: ToolUse[];
  profile: Profile;
};

type Actions = {
  hydrateAuth: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  loadJournal: () => Promise<void>;
  addJournalApi: (title: string, content: string) => Promise<void>;
  updateJournalApi: (id: string, patch: { title?: string; content?: string }) => Promise<void>;
  deleteJournalApi: (id: string) => Promise<void>;

  addCheckIn: (c: CheckIn) => void;
  addToolUse: (name: string) => void;
  setProfile: (patch: Partial<Profile>) => void;
  resetDemo: () => void;
};

type Store = { state: State; actions: Actions };

const AppCtx = createContext<Store | null>(null);


function computeRisk(checkIns: CheckIn[]): RiskLevel {
  const recent = checkIns.slice(0, 3);
  if (recent.length === 0) return "Low";

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const cravings = avg(recent.map((c) => c.craving));
  const stress = avg(recent.map((c) => c.stress));
  const score = cravings * 0.6 + stress * 0.4;

  if (score >= 7) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

function timeHHMM(d = new Date()) {
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function toYYYYMMDD(iso: string) {
  return iso.slice(0, 10);
}

function mapApiJournal(j: {
  id: string;
  title: string;
  content: string;
  entryDate: string;
}): JournalEntry {
  return {
    id: j.id,
    title: j.title,
    content: j.content,
    date: toYYYYMMDD(j.entryDate),
    tags: [],
  };
}

/* =======================
   Initial State
======================= */

const seedState: State = {
  authUser: null,
  authReady: false,

  streakDays: 12,
  riskLevel: "Low",

  journal: [],
  checkIns: [
    {
      date: todayISO(),
      mood: 7,
      craving: 3,
      stress: 4,
      note: "Pretty steady day.",
    },
  ],
  toolUses: [{ id: "t1", name: "Box Breathing", date: todayISO(), time: timeHHMM() }],
  profile: {
    name: "Ryan Daly",
    email: "ryan@example.com",
    reminders: true,
    darkMode: false,
  },
};

function makeSeeded(): State {
  const risk = computeRisk(seedState.checkIns);
  return { ...seedState, riskLevel: risk };
}



export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(() => makeSeeded());

  const actions = useMemo<Actions>(
    () => ({
      /* ---------- AUTH ---------- */

      hydrateAuth: async () => {
        try {
          const token = await tokenStore.getToken();
          if (!token) {
            setState((p) => ({ ...p, authReady: true }));
            return;
          }

          const res = await api<{ user: { id: string; email: string } }>("/me", { auth: true });
          setState((p) => ({ ...p, authUser: res.user, authReady: true }));
        } catch {
          await tokenStore.clearToken();
          setState((p) => ({ ...p, authUser: null, authReady: true }));
        }
      },

      register: async (email, password) => {
        const res = await api<{ user: { id: string; email: string }; token: string }>(
          "/auth/register",
          {
            method: "POST",
            body: JSON.stringify({ email, password }),
          }
        );
        await tokenStore.setToken(res.token);
        setState((p) => ({ ...p, authUser: res.user }));
      },

      login: async (email, password) => {
        const res = await api<{ user: { id: string; email: string }; token: string }>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({ email, password }),
          }
        );
        await tokenStore.setToken(res.token);
        setState((p) => ({ ...p, authUser: res.user }));
      },

      logout: async () => {
        await tokenStore.clearToken();
        setState((p) => ({ ...p, authUser: null, journal: [] }));
      },

    

      loadJournal: async () => {
        const list = await api<
          Array<{ id: string; title: string; content: string; entryDate: string }>
        >("/journal", { auth: true });

        setState((p) => ({ ...p, journal: list.map(mapApiJournal) }));
      },

      addJournalApi: async (title, content) => {
        const created = await api<{
          id: string;
          title: string;
          content: string;
          entryDate: string;
        }>("/journal", {
          method: "POST",
          auth: true,
          body: JSON.stringify({ title, content }),
        });

        setState((p) => ({
          ...p,
          journal: [mapApiJournal(created), ...p.journal],
        }));
      },

      updateJournalApi: async (id, patch) => {
        const updated = await api<{
          id: string;
          title: string;
          content: string;
          entryDate: string;
        }>(`/journal/${id}`, {
          method: "PUT",
          auth: true,
          body: JSON.stringify(patch),
        });

        setState((p) => ({
          ...p,
          journal: p.journal.map((j) =>
            j.id === id ? { ...j, ...mapApiJournal(updated) } : j
          ),
        }));
      },

      deleteJournalApi: async (id) => {
        await api<void>(`/journal/${id}`, { method: "DELETE", auth: true });
        setState((p) => ({ ...p, journal: p.journal.filter((j) => j.id !== id) }));
      },

      

      addCheckIn: (c) => {
        setState((prev) => {
          const nextCheckIns = [c, ...prev.checkIns.filter((x) => x.date !== c.date)];
          const nextRisk = computeRisk(nextCheckIns);
          return { ...prev, checkIns: nextCheckIns, riskLevel: nextRisk };
        });
      },

      addToolUse: (name) => {
        setState((prev) => {
          const now = new Date();
          const tool: ToolUse = {
            id: String(now.getTime()),
            name,
            date: todayISO(),
            time: timeHHMM(now),
          };
          return { ...prev, toolUses: [tool, ...prev.toolUses].slice(0, 50) };
        });
      },

      setProfile: (patch) => {
        setState((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
      },

      resetDemo: () => {
        setState(() => makeSeeded());
      },
    }),
    []
  );

  return <AppCtx.Provider value={{ state, actions }}>{children}</AppCtx.Provider>;
}



export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider />");
  return ctx;
}
