// app/(tabs)/_layout.tsx
import { useApp } from "@/store/store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs, router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Image, Pressable, Text, View } from "react-native";

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


  const photoUrl =
    (state.authUser as any)?.photoURL ||
    (state.authUser as any)?.photoUrl ||
    (state.authUser as any)?.avatarUrl ||
    "";

  const displayName =
    (state.authUser as any)?.displayName ||
    (state.authUser as any)?.name ||
    (state.authUser as any)?.email ||
    "";

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
          backgroundColor: "#111827",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.18)",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={{ width: 34, height: 34 }}
            resizeMode="cover"
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

  useEffect(() => {
    if (state.authReady && !state.authUser) {
      router.replace("../login");
    }
  }, [state.authReady, state.authUser]);


  if (!state.authReady) return null;

  return (
    <Tabs
      screenOptions={{
        // Header 
        headerShown: true,
        headerTitleStyle: {
          color: "white",
          fontWeight: "800",
        },
        headerStyle: {
          backgroundColor: "#000000",
        },
        headerShadowVisible: false,
        headerRight: () => <ProfileButton />,

        // Bottom tab bar
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          borderTopColor: "rgba(255,255,255,0.10)",
          backgroundColor: "#000000",
          height: 66,
          paddingTop: 8,
          paddingBottom: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
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
