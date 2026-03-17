import { useApp } from "@/store/store";
import { theme } from "@/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, router } from "expo-router";
import { useState } from "react";
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

export default function LoginScreen() {
  const { state, actions } = useApp();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("ryan@test.com");
  const [password, setPassword] = useState("Password123");
  const [loading, setLoading] = useState(false);

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
      if (mode === "login") {
        await actions.login(cleanEmail, password);
      } else {
        await actions.register(cleanEmail, password);
      }
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
  if (!state.onboardingDone && !state.authUser && !state.isAnonymous) {
    return <Redirect href={"/onboarding" as any} />;
  }
  if (state.authUser || state.isAnonymous) return <Redirect href="/(tabs)" />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 22, paddingTop: 36, gap: 16 }}
      >
        <View
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 26,
            padding: 18,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.25)",
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 30, fontWeight: "900", color: "white" }}>
              {mode === "login" ? "Welcome back" : "Create account"}
            </Text>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.18)",
              }}
            >
              <Ionicons name="shield-checkmark-outline" size={22} color="white" />
            </View>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: "700" }}>
            {mode === "login"
              ? "Log in to continue your streak and journal."
              : "Sign up and start tracking your recovery journey."}
          </Text>
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 22,
            padding: 16,
            gap: 12,
            backgroundColor: theme.colors.card,
            shadowColor: "#000",
            shadowOpacity: 0.07,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
          }}
        >
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "800", color: theme.colors.muted }}>Email</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.muted2}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderRadius: 14,
                color: theme.colors.text,
                backgroundColor: "#F8FAFC",
              }}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "800", color: theme.colors.muted }}>Password</Text>
            <TextInput
              placeholder={mode === "register" ? "Min 8 characters" : "Your password"}
              placeholderTextColor={theme.colors.muted2}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderRadius: 14,
                color: theme.colors.text,
                backgroundColor: "#F8FAFC",
              }}
            />
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={loading}
            style={{
              marginTop: 6,
              borderRadius: 14,
              paddingVertical: 13,
              alignItems: "center",
              backgroundColor: theme.colors.primary,
            }}
          >
            {loading ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <ActivityIndicator color="white" />
                <Text style={{ fontWeight: "900", color: "white" }}>Please wait...</Text>
              </View>
            ) : (
              <Text style={{ fontWeight: "900", fontSize: 16, color: "white" }}>
                {mode === "login" ? "Login" : "Create account"}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => setMode((m) => (m === "login" ? "register" : "login"))}
            disabled={loading}
            style={{
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ textAlign: "center", fontWeight: "800", color: theme.colors.primary }}>
              {mode === "login"
                ? "No account? Tap to register"
                : "Already have an account? Tap to login"}
            </Text>
          </Pressable>

          <Pressable
            onPress={async () => {
              await actions.enterAnonymousMode();
              router.replace("/(tabs)");
            }}
            disabled={loading}
            style={{
              paddingVertical: 10,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "800", color: theme.colors.muted }}>
              Continue in anonymous mode
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
