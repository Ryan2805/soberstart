// app/(tabs)/_layout.tsx
import { useApp } from "@/store/store";
import { theme } from "@/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Tabs, router } from "expo-router";
import { createElement, useEffect, useMemo, useState } from "react";
import { Image, Platform, Pressable, Text, View } from "react-native";

function getInitials(nameOrEmail?: string) {
  if (!nameOrEmail) return "U";
  const clean = nameOrEmail.trim();
  if (!clean) return "U";


  const base = clean.includes("@") ? clean.split("@")[0] : clean;

  const parts = base.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function ProfileButton() {
  const { state } = useApp();
  const [imageFailed, setImageFailed] = useState(false);
  const profile = state.profile;

  const photoUrl = profile.profileImageUri.trim();
  const displayName =
    (profile.useDisplayName ? profile.displayName : profile.realName) ||
    profile.name ||
    state.authUser?.email ||
    "";

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  const initials = useMemo(() => getInitials(displayName), [displayName]);

  return (
    <Pressable
      onPress={() => router.push("/account")}
      hitSlop={12}
      style={{ marginRight: 12 }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: theme.colors.primary,
          borderWidth: 1,
          borderColor: "rgba(15,118,110,0.4)",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {photoUrl && !imageFailed && Platform.OS === "web" ? (
          createElement("img", {
            src: photoUrl,
            alt: "Profile",
            onError: () => setImageFailed(true),
            style: {
              width: 34,
              height: 34,
              objectFit: "cover",
              display: "block",
            },
          })
        ) : photoUrl && !imageFailed ? (
          <Image
            source={{ uri: photoUrl }}
            style={{ width: 34, height: 34 }}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Text style={{ color: "white", fontWeight: "800", fontSize: 12 }}>
            {initials}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export default function TabLayout() {
  const { state } = useApp();

  if (!state.authReady) return null;
  if (!state.onboardingDone && !state.authUser && !state.isAnonymous) {
    return <Redirect href={"/onboarding" as any} />;
  }
  if (!state.authUser && !state.isAnonymous) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        // Header 
        headerShown: true,
        headerTitleStyle: {
          color: theme.colors.text,
          fontWeight: "800",
        },
        headerStyle: {
          backgroundColor: theme.colors.bg,
        },
        headerShadowVisible: false,
        headerRight: () => <ProfileButton />,
        headerTitleAlign: "left",
        headerTintColor: theme.colors.text,

        // Bottom tab bar
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted2,
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          borderTopColor: "transparent",
          backgroundColor: "rgba(255,255,255,0.96)",
          height: 74,
          paddingTop: 10,
          paddingBottom: 12,
          borderRadius: 26,
          ...theme.shadows.floating,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        sceneStyle: {
          backgroundColor: theme.colors.bg,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={focused ? 24 : size ?? 22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              color={color}
              size={focused ? 24 : size ?? 22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tools"
        options={{
          title: "Tools",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "sparkles" : "sparkles-outline"}
              color={color}
              size={focused ? 24 : size ?? 22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={focused ? 24 : size ?? 22}
            />
          ),
        }}
      />
    </Tabs>
  );
}
