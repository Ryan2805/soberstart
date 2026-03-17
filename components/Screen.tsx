// src/components/Screen.tsx
import { ReactNode } from "react";
import { SafeAreaView, View } from "react-native";
import { theme } from "../theme";

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: 999,
          right: -80,
          top: -70,
          backgroundColor: "rgba(15,118,110,0.12)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 180,
          height: 180,
          borderRadius: 999,
          left: -70,
          top: 140,
          backgroundColor: "rgba(249,115,22,0.08)",
        }}
      />
      <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 12 }}>
        {children}
      </View>
    </SafeAreaView>
  );
}
