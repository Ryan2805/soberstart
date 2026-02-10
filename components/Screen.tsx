// src/components/Screen.tsx
import { ReactNode } from "react";
import { SafeAreaView, View } from "react-native";
import { theme } from "../theme";

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 10 }}>
        {children}
      </View>
    </SafeAreaView>
  );
}
