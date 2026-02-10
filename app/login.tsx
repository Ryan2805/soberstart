import { useApp } from "@/store/store";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { API_BASE_URL } from "@/config";
import { setToken } from "../api/Client";

export default function LoginScreen() {
  const { state, actions } = useApp();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("ryan@test.com");
  const [password, setPassword] = useState("Password123");
  const [loading, setLoading] = useState(false);

  const endpoint = useMemo(
    () => (mode === "login" ? "/auth/login" : "/auth/register"),
    [mode]
  );

  useEffect(() => {
    if (state.authReady && state.authUser) {
      router.replace("/(tabs)");
    }
  }, [state.authReady, state.authUser]);

  async function onSubmit() {
    const cleanEmail = email.trim();

    if (!cleanEmail.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (!password || (mode === "register" && password.length < 8)) {
      Alert.alert(
        "Invalid password",
        mode === "register"
          ? "Password must be at least 8 characters."
          : "Please enter your password."
      );
      return;
    }

    try {
      setLoading(true);

      const url = `${API_BASE_URL}${endpoint}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);

      const data = JSON.parse(text);
      if (!data?.token) throw new Error("No token returned from server.");

      
      await setToken(data.token);

      
      await actions.hydrateAuth();

      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert(
        mode === "login" ? "Login failed" : "Register failed",
        e?.message ?? "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!state.authReady) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 24, paddingTop: 32, gap: 14 }}
      >
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 30, fontWeight: "900" }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </Text>
          <Text style={{ opacity: 0.7 }}>
            {mode === "login"
              ? "Log in to continue."
              : "Sign up to start tracking your progress."}
          </Text>
        </View>

        <View
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderRadius: 18,
            padding: 16,
            gap: 12,
          }}
        >
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "800", opacity: 0.8 }}>Email</Text>
            <TextInput
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              style={{
                borderWidth: 1,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "800", opacity: 0.8 }}>Password</Text>
            <TextInput
              placeholder={mode === "register" ? "Min 8 characters" : "Your password"}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              style={{
                borderWidth: 1,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            />
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={loading}
            style={{
              marginTop: 6,
              borderRadius: 14,
              paddingVertical: 12,
              alignItems: "center",
              borderWidth: 1,
            }}
          >
            {loading ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <ActivityIndicator />
                <Text style={{ fontWeight: "900" }}>Please wait…</Text>
              </View>
            ) : (
              <Text style={{ fontWeight: "900", fontSize: 16 }}>
                {mode === "login" ? "Login" : "Create account"}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => setMode((m) => (m === "login" ? "register" : "login"))}
            disabled={loading}
            style={{ paddingVertical: 8 }}
          >
            <Text style={{ textAlign: "center", fontWeight: "800", opacity: 0.85 }}>
              {mode === "login"
                ? "No account? Tap to register"
                : "Already have an account? Tap to login"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
