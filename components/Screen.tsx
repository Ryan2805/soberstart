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
