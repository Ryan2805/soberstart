import { API_BASE_URL } from "@/config";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "token";



export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export const tokenStore = { getToken, setToken, clearToken };



export async function api<T>(
  path: string,
  opts: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(opts.headers);

  if (!headers.has("Content-Type") && opts.body) {
    headers.set("Content-Type", "application/json");
  }

  if (opts.auth) {
    const token = await getToken();
    if (!token) throw new Error("Not logged in");
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...opts, headers });

  const text = await res.text();

  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON (${res.status}): ${text.slice(0, 120)}`);
    }
  }

  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }

  return data as T;
}
