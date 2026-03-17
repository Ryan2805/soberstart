import AsyncStorage from "@react-native-async-storage/async-storage";
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
  id: string;
  date: string;
  mood: number;
  craving: number;
  stress: number;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ToolUse = {
  id: string;
  name: string;
  date: string;
  time: string;
  notes?: string;
  createdAt?: string;
};

export type UrgeLog = {
  id: string;
  intensity: number;
  trigger: string;
  notes?: string;
  toolUsed?: string;
  occurredAt: string;
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
  onboardingDone: boolean;
  isAnonymous: boolean;
  streakDays: number;
  riskLevel: RiskLevel;
  journal: JournalEntry[];
  checkIns: CheckIn[];
  toolUses: ToolUse[];
  urgeLogs: UrgeLog[];
  profile: Profile;
};

type Actions = {
  hydrateAuth: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  enterAnonymousMode: () => Promise<void>;
  exitAnonymousMode: () => Promise<void>;
  logout: () => Promise<void>;
  loadJournal: () => Promise<void>;
  addJournalApi: (title: string, content: string) => Promise<void>;
  updateJournalApi: (id: string, patch: { title?: string; content?: string }) => Promise<void>;
  deleteJournalApi: (id: string) => Promise<void>;
  addCheckIn: (c: Omit<CheckIn, "id">) => Promise<void>;
  addToolUse: (name: string, notes?: string) => Promise<void>;
  addUrgeLog: (entry: Omit<UrgeLog, "id" | "occurredAt"> & { occurredAt?: string }) => Promise<void>;
  setProfile: (patch: Partial<Profile>) => void;
  resetDemo: () => Promise<void>;
};

type Store = { state: State; actions: Actions };

type ApiJournal = {
  id: string;
  title: string;
  content: string;
  entryDate: string;
};

type ApiCheckIn = {
  id: string;
  date: string;
  mood: number;
  craving: number;
  stress: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiToolUse = {
  id: string;
  name: string;
  notes: string | null;
  createdAt: string;
};

type ApiUrgeLog = {
  id: string;
  intensity: number;
  trigger: string;
  notes: string | null;
  toolUsed: string | null;
  occurredAt: string;
};

const AppCtx = createContext<Store | null>(null);

const STORAGE_KEYS = {
  onboarding: "soberstart:onboarding_done",
  anonymous: "soberstart:anonymous_mode",
  anonymousJournal: "soberstart:anonymous_journal",
  anonymousCheckIns: "soberstart:anonymous_checkins",
  anonymousToolUses: "soberstart:anonymous_tool_uses",
  anonymousUrges: "soberstart:anonymous_urge_logs",
};

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

function computeStreak(checkIns: CheckIn[]) {
  if (checkIns.length === 0) return 0;

  const uniqueDays = Array.from(new Set(checkIns.map((item) => item.date))).sort().reverse();
  let streak = 0;
  let cursor = new Date(`${todayISO()}T00:00:00.000Z`);

  for (const day of uniqueDays) {
    const iso = cursor.toISOString().slice(0, 10);
    if (day === iso) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      continue;
    }

    if (streak === 0) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      const yesterday = cursor.toISOString().slice(0, 10);
      if (day !== yesterday) {
        return 0;
      }

      streak = 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      continue;
    }

    break;
  }

  return streak;
}

function timeHHMM(d = new Date()) {
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function toYYYYMMDD(iso: string) {
  return iso.slice(0, 10);
}

function applyRecoveryState<T extends State>(state: T, patch: Pick<State, "checkIns" | "toolUses" | "urgeLogs">): T {
  return {
    ...state,
    ...patch,
    streakDays: computeStreak(patch.checkIns),
    riskLevel: computeRisk(patch.checkIns),
  };
}

function mapApiJournal(j: ApiJournal): JournalEntry {
  const tagBlock = j.content.match(/\n---\nTags:\s*(.+)\s*$/s);
  const tags = tagBlock
    ? tagBlock[1]
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const content = tagBlock ? j.content.slice(0, tagBlock.index).trimEnd() : j.content;

  return {
    id: j.id,
    title: j.title,
    content,
    date: toYYYYMMDD(j.entryDate),
    tags,
  };
}

function mapApiCheckIn(item: ApiCheckIn): CheckIn {
  return {
    id: item.id,
    date: toYYYYMMDD(item.date),
    mood: item.mood,
    craving: item.craving,
    stress: item.stress,
    note: item.note ?? undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function mapApiToolUse(item: ApiToolUse): ToolUse {
  const created = new Date(item.createdAt);
  return {
    id: item.id,
    name: item.name,
    notes: item.notes ?? undefined,
    date: created.toISOString().slice(0, 10),
    time: timeHHMM(created),
    createdAt: item.createdAt,
  };
}

function mapApiUrgeLog(item: ApiUrgeLog): UrgeLog {
  return {
    id: item.id,
    intensity: item.intensity,
    trigger: item.trigger,
    notes: item.notes ?? undefined,
    toolUsed: item.toolUsed ?? undefined,
    occurredAt: item.occurredAt,
  };
}

function createAnonymousEntry(title: string, content: string): JournalEntry {
  return {
    id: `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    content,
    date: todayISO(),
    tags: [],
  };
}

function createAnonymousCheckIn(checkIn: Omit<CheckIn, "id">): CheckIn {
  return {
    ...checkIn,
    id: `checkin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

function createAnonymousToolUse(name: string, notes?: string): ToolUse {
  const now = new Date();
  return {
    id: `tool-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    notes,
    date: todayISO(),
    time: timeHHMM(now),
    createdAt: now.toISOString(),
  };
}

function createAnonymousUrgeLog(entry: Omit<UrgeLog, "id" | "occurredAt"> & { occurredAt?: string }): UrgeLog {
  return {
    id: `urge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    intensity: entry.intensity,
    trigger: entry.trigger,
    notes: entry.notes,
    toolUsed: entry.toolUsed,
    occurredAt: entry.occurredAt ?? new Date().toISOString(),
  };
}

async function loadRemoteData() {
  const [journal, checkIns, toolUses, urgeLogs] = await Promise.all([
    api<ApiJournal[]>("/journal", { auth: true }),
    api<ApiCheckIn[]>("/check-ins", { auth: true }),
    api<ApiToolUse[]>("/tool-uses", { auth: true }),
    api<ApiUrgeLog[]>("/urge-logs", { auth: true }),
  ]);

  return {
    journal: journal.map(mapApiJournal),
    checkIns: checkIns.map(mapApiCheckIn),
    toolUses: toolUses.map(mapApiToolUse),
    urgeLogs: urgeLogs.map(mapApiUrgeLog),
  };
}

const initialState: State = {
  authUser: null,
  authReady: false,
  onboardingDone: false,
  isAnonymous: false,
  streakDays: 0,
  riskLevel: "Low",
  journal: [],
  checkIns: [],
  toolUses: [],
  urgeLogs: [],
  profile: {
    name: "Ryan Daly",
    email: "ryan@example.com",
    reminders: true,
    darkMode: false,
  },
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initialState);

  const actions = useMemo<Actions>(
    () => ({
      hydrateAuth: async () => {
        try {
          const [[, onboarding], [, anonymous], [, anonymousJournalRaw], [, anonymousCheckInsRaw], [, anonymousToolUsesRaw], [, anonymousUrgesRaw]] =
            await AsyncStorage.multiGet([
              STORAGE_KEYS.onboarding,
              STORAGE_KEYS.anonymous,
              STORAGE_KEYS.anonymousJournal,
              STORAGE_KEYS.anonymousCheckIns,
              STORAGE_KEYS.anonymousToolUses,
              STORAGE_KEYS.anonymousUrges,
            ]);

          const onboardingDone = onboarding === "1";
          const isAnonymous = anonymous === "1";

          if (isAnonymous) {
            const journal = anonymousJournalRaw ? JSON.parse(anonymousJournalRaw) : [];
            const checkIns = anonymousCheckInsRaw ? JSON.parse(anonymousCheckInsRaw) : [];
            const toolUses = anonymousToolUsesRaw ? JSON.parse(anonymousToolUsesRaw) : [];
            const urgeLogs = anonymousUrgesRaw ? JSON.parse(anonymousUrgesRaw) : [];

            setState((prev) =>
              applyRecoveryState(
                {
                  ...prev,
                  authUser: null,
                  authReady: true,
                  onboardingDone: true,
                  isAnonymous: true,
                  journal,
                  profile: { ...prev.profile, name: "Anonymous", email: "anonymous@local" },
                },
                { checkIns, toolUses, urgeLogs }
              )
            );
            return;
          }

          const token = await tokenStore.getToken();
          if (!token) {
            setState((prev) => ({
              ...prev,
              authUser: null,
              authReady: true,
              onboardingDone,
              isAnonymous: false,
              journal: [],
              checkIns: [],
              toolUses: [],
              urgeLogs: [],
              streakDays: 0,
              riskLevel: "Low",
            }));
            return;
          }

          const [me, data] = await Promise.all([
            api<{ user: { id: string; email: string } }>("/me", { auth: true }),
            loadRemoteData(),
          ]);

          if (!onboardingDone) {
            await AsyncStorage.setItem(STORAGE_KEYS.onboarding, "1");
          }

          setState((prev) =>
            applyRecoveryState(
              {
                ...prev,
                authUser: me.user,
                authReady: true,
                onboardingDone: true,
                isAnonymous: false,
                journal: data.journal,
                profile: { ...prev.profile, email: me.user.email },
              },
              {
                checkIns: data.checkIns,
                toolUses: data.toolUses,
                urgeLogs: data.urgeLogs,
              }
            )
          );
        } catch {
          await tokenStore.clearToken();
          setState((prev) => ({
            ...prev,
            authUser: null,
            authReady: true,
            journal: [],
            checkIns: [],
            toolUses: [],
            urgeLogs: [],
            streakDays: 0,
            riskLevel: "Low",
          }));
        }
      },

      completeOnboarding: async () => {
        await AsyncStorage.setItem(STORAGE_KEYS.onboarding, "1");
        setState((prev) => ({ ...prev, onboardingDone: true }));
      },

      register: async (email, password) => {
        const res = await api<{ user: { id: string; email: string }; token: string }>("/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        await tokenStore.setToken(res.token);
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.onboarding, "1"],
          [STORAGE_KEYS.anonymous, "0"],
        ]);
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.anonymousJournal,
          STORAGE_KEYS.anonymousCheckIns,
          STORAGE_KEYS.anonymousToolUses,
          STORAGE_KEYS.anonymousUrges,
        ]);

        const data = await loadRemoteData();
        setState((prev) =>
          applyRecoveryState(
            {
              ...prev,
              authUser: res.user,
              onboardingDone: true,
              isAnonymous: false,
              journal: data.journal,
              profile: { ...prev.profile, email: res.user.email },
            },
            {
              checkIns: data.checkIns,
              toolUses: data.toolUses,
              urgeLogs: data.urgeLogs,
            }
          )
        );
      },

      login: async (email, password) => {
        const res = await api<{ user: { id: string; email: string }; token: string }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        await tokenStore.setToken(res.token);
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.onboarding, "1"],
          [STORAGE_KEYS.anonymous, "0"],
        ]);
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.anonymousJournal,
          STORAGE_KEYS.anonymousCheckIns,
          STORAGE_KEYS.anonymousToolUses,
          STORAGE_KEYS.anonymousUrges,
        ]);

        const data = await loadRemoteData();
        setState((prev) =>
          applyRecoveryState(
            {
              ...prev,
              authUser: res.user,
              onboardingDone: true,
              isAnonymous: false,
              journal: data.journal,
              profile: { ...prev.profile, email: res.user.email },
            },
            {
              checkIns: data.checkIns,
              toolUses: data.toolUses,
              urgeLogs: data.urgeLogs,
            }
          )
        );
      },

      enterAnonymousMode: async () => {
        await tokenStore.clearToken();
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.onboarding, "1"],
          [STORAGE_KEYS.anonymous, "1"],
        ]);

        setState((prev) => ({
          ...prev,
          authUser: null,
          onboardingDone: true,
          isAnonymous: true,
          profile: { ...prev.profile, name: "Anonymous", email: "anonymous@local" },
        }));
      },

      exitAnonymousMode: async () => {
        await AsyncStorage.setItem(STORAGE_KEYS.anonymous, "0");
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.anonymousJournal,
          STORAGE_KEYS.anonymousCheckIns,
          STORAGE_KEYS.anonymousToolUses,
          STORAGE_KEYS.anonymousUrges,
        ]);
        setState((prev) => ({
          ...prev,
          isAnonymous: false,
          journal: [],
          checkIns: [],
          toolUses: [],
          urgeLogs: [],
          streakDays: 0,
          riskLevel: "Low",
        }));
      },

      logout: async () => {
        await tokenStore.clearToken();
        await AsyncStorage.setItem(STORAGE_KEYS.anonymous, "0");
        setState((prev) => ({
          ...prev,
          authUser: null,
          isAnonymous: false,
          journal: [],
          checkIns: [],
          toolUses: [],
          urgeLogs: [],
          streakDays: 0,
          riskLevel: "Low",
        }));
      },

      loadJournal: async () => {
        if (state.isAnonymous) {
          return;
        }

        const list = await api<ApiJournal[]>("/journal", { auth: true });
        setState((prev) => ({ ...prev, journal: list.map(mapApiJournal) }));
      },

      addJournalApi: async (title, content) => {
        if (state.isAnonymous) {
          setState((prev) => {
            const created = createAnonymousEntry(title, content);
            const nextJournal = [created, ...prev.journal];
            void AsyncStorage.setItem(STORAGE_KEYS.anonymousJournal, JSON.stringify(nextJournal));
            return { ...prev, journal: nextJournal };
          });
          return;
        }

        const created = await api<ApiJournal>("/journal", {
          method: "POST",
          auth: true,
          body: JSON.stringify({ title, content }),
        });

        setState((prev) => ({
          ...prev,
          journal: [mapApiJournal(created), ...prev.journal],
        }));
      },

      updateJournalApi: async (id, patch) => {
        if (state.isAnonymous) {
          setState((prev) => {
            const nextJournal = prev.journal.map((j) =>
              j.id === id
                ? {
                    ...j,
                    ...(patch.title !== undefined ? { title: patch.title } : {}),
                    ...(patch.content !== undefined ? { content: patch.content } : {}),
                  }
                : j
            );
            void AsyncStorage.setItem(STORAGE_KEYS.anonymousJournal, JSON.stringify(nextJournal));
            return { ...prev, journal: nextJournal };
          });
          return;
        }

        const updated = await api<ApiJournal>(`/journal/${id}`, {
          method: "PUT",
          auth: true,
          body: JSON.stringify(patch),
        });

        setState((prev) => ({
          ...prev,
          journal: prev.journal.map((j) => (j.id === id ? { ...j, ...mapApiJournal(updated) } : j)),
        }));
      },

      deleteJournalApi: async (id) => {
        if (state.isAnonymous) {
          setState((prev) => {
            const nextJournal = prev.journal.filter((j) => j.id !== id);
            void AsyncStorage.setItem(STORAGE_KEYS.anonymousJournal, JSON.stringify(nextJournal));
            return { ...prev, journal: nextJournal };
          });
          return;
        }

        try {
          await api<void>(`/journal/${id}`, { method: "DELETE", auth: true });
        } catch (e: any) {
          const msg = String(e?.message ?? "");
          if (!msg.toLowerCase().includes("not found")) {
            throw e;
          }
        }

        setState((prev) => ({ ...prev, journal: prev.journal.filter((j) => j.id !== id) }));
      },

      addCheckIn: async (checkIn) => {
        if (state.isAnonymous) {
          setState((prev) => {
            const nextCheckIn = createAnonymousCheckIn(checkIn);
            const nextCheckIns = [nextCheckIn, ...prev.checkIns.filter((item) => item.date !== checkIn.date)];
            void AsyncStorage.setItem(STORAGE_KEYS.anonymousCheckIns, JSON.stringify(nextCheckIns));
            return applyRecoveryState(prev, {
              checkIns: nextCheckIns,
              toolUses: prev.toolUses,
              urgeLogs: prev.urgeLogs,
            });
          });
          return;
        }

        const saved = await api<ApiCheckIn>("/check-ins", {
          method: "POST",
          auth: true,
          body: JSON.stringify(checkIn),
        });

        setState((prev) => {
          const mapped = mapApiCheckIn(saved);
          const nextCheckIns = [mapped, ...prev.checkIns.filter((item) => item.date !== mapped.date)];
          return applyRecoveryState(prev, {
            checkIns: nextCheckIns,
            toolUses: prev.toolUses,
            urgeLogs: prev.urgeLogs,
          });
        });
      },

      addToolUse: async (name, notes) => {
        if (state.isAnonymous) {
          setState((prev) => {
            const tool = createAnonymousToolUse(name, notes);
            const nextToolUses = [tool, ...prev.toolUses].slice(0, 50);
            void AsyncStorage.setItem(STORAGE_KEYS.anonymousToolUses, JSON.stringify(nextToolUses));
            return applyRecoveryState(prev, {
              checkIns: prev.checkIns,
              toolUses: nextToolUses,
              urgeLogs: prev.urgeLogs,
            });
          });
          return;
        }

        const saved = await api<ApiToolUse>("/tool-uses", {
          method: "POST",
          auth: true,
          body: JSON.stringify({ name, notes }),
        });

        setState((prev) => {
          const nextToolUses = [mapApiToolUse(saved), ...prev.toolUses].slice(0, 50);
          return applyRecoveryState(prev, {
            checkIns: prev.checkIns,
            toolUses: nextToolUses,
            urgeLogs: prev.urgeLogs,
          });
        });
      },

      addUrgeLog: async (entry) => {
        if (state.isAnonymous) {
          setState((prev) => {
            const urge = createAnonymousUrgeLog(entry);
            const nextUrges = [urge, ...prev.urgeLogs].slice(0, 50);
            void AsyncStorage.setItem(STORAGE_KEYS.anonymousUrges, JSON.stringify(nextUrges));
            return applyRecoveryState(prev, {
              checkIns: prev.checkIns,
              toolUses: prev.toolUses,
              urgeLogs: nextUrges,
            });
          });
          return;
        }

        const saved = await api<ApiUrgeLog>("/urge-logs", {
          method: "POST",
          auth: true,
          body: JSON.stringify(entry),
        });

        setState((prev) => {
          const nextUrges = [mapApiUrgeLog(saved), ...prev.urgeLogs].slice(0, 50);
          return applyRecoveryState(prev, {
            checkIns: prev.checkIns,
            toolUses: prev.toolUses,
            urgeLogs: nextUrges,
          });
        });
      },

      setProfile: (patch) => {
        setState((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
      },

      resetDemo: async () => {
        if (state.isAnonymous) {
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.anonymousCheckIns,
            STORAGE_KEYS.anonymousToolUses,
            STORAGE_KEYS.anonymousUrges,
          ]);
        }

        setState((prev) =>
          applyRecoveryState(
            {
              ...prev,
              checkIns: [],
              toolUses: [],
              urgeLogs: [],
            },
            { checkIns: [], toolUses: [], urgeLogs: [] }
          )
        );
      },
    }),
    [state.isAnonymous]
  );

  return <AppCtx.Provider value={{ state, actions }}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider />");
  return ctx;
}
