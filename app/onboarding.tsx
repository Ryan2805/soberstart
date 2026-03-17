import { useApp } from "@/store/store";
import { theme } from "@/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const slides = [
  {
    title: "Build your sober streak",
    body: "Track progress daily with check-ins and journal entries designed for real-life recovery.",
    icon: "leaf-outline" as const,
  },
  {
    title: "Understand your triggers",
    body: "Spot patterns in cravings, stress, and mood so you can plan smarter responses.",
    icon: "analytics-outline" as const,
  },
  {
    title: "Private by default",
    body: "Choose account mode or stay anonymous. Anonymous mode keeps data local on your device.",
    icon: "shield-checkmark-outline" as const,
  },
];

export default function OnboardingScreen() {
  const { state, actions } = useApp();
  const [index, setIndex] = useState(0);

  const current = useMemo(() => slides[index], [index]);
  const isLast = index === slides.length - 1;

  if (!state.authReady) return null;
  if (state.authUser || state.isAnonymous) return <Redirect href="/(tabs)" />;
  if (state.onboardingDone) return <Redirect href="/login" />;

  const continueToLogin = async () => {
    await actions.completeOnboarding();
    router.replace("/login");
  };

  const continueAnonymous = async () => {
    await actions.enterAnonymousMode();
    router.replace("/(tabs)");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      contentContainerStyle={{ padding: 22, paddingTop: 44, paddingBottom: 30, gap: 18 }}
    >
      <View
        style={{
          backgroundColor: theme.colors.primary,
          borderRadius: 28,
          padding: 18,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.2)",
          minHeight: 280,
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={current.icon} size={28} color="white" />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: "white", fontSize: 32, fontWeight: "900", lineHeight: 38 }}>{current.title}</Text>
          <Text style={{ color: "rgba(255,255,255,0.88)", fontSize: 16, lineHeight: 23 }}>{current.body}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 26 : 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: i === index ? "white" : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </View>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 22,
          padding: 14,
          gap: 10,
        }}
      >
        {!isLast ? (
          <Pressable
            onPress={() => setIndex((v) => Math.min(v + 1, slides.length - 1))}
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 13,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>Continue</Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={continueToLogin}
              style={{
                backgroundColor: theme.colors.primary,
                paddingVertical: 13,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>Create account or login</Text>
            </Pressable>

            <Pressable
              onPress={continueAnonymous}
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: "#F8FAFC",
                paddingVertical: 13,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
                Continue in anonymous mode
              </Text>
            </Pressable>
          </>
        )}

        {index > 0 && (
          <Pressable
            onPress={() => setIndex((v) => Math.max(v - 1, 0))}
            style={{ alignItems: "center", paddingVertical: 6 }}
          >
            <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>Back</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
