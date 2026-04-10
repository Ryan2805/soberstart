// src/components/Screen.tsx
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme";

export function Screen({
  children,
  scroll = false,
  keyboard = false,
  contentContainerStyle,
  keyboardShouldPersistTaps = "handled",
}: {
  children: ReactNode;
  scroll?: boolean;
  keyboard?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: ScrollViewProps["keyboardShouldPersistTaps"];
}) {
  const content = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      contentContainerStyle={[
        { flexGrow: 1, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 28 },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, paddingHorizontal: 18, paddingTop: 12 }, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: 999,
          right: -70,
          top: -90,
          backgroundColor: "rgba(15,118,110,0.14)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 240,
          height: 240,
          borderRadius: 999,
          left: -90,
          top: 180,
          backgroundColor: "rgba(59,130,166,0.10)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 96,
          height: 220,
          borderRadius: 36,
          backgroundColor: theme.colors.bgSoft,
          opacity: 0.8,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 180,
          height: 180,
          borderRadius: 999,
          right: 40,
          bottom: 120,
          backgroundColor: "rgba(15,118,110,0.07)",
        }}
      />
      {keyboard ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
