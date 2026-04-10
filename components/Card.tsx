import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { theme } from "../theme";

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.card,
          borderRadius: 24,
          padding: 18,
          borderWidth: 1,
          borderColor: theme.colors.borderSoft,
          shadowColor: theme.shadows.card.shadowColor,
          shadowOpacity: theme.shadows.card.shadowOpacity,
          shadowRadius: theme.shadows.card.shadowRadius,
          shadowOffset: theme.shadows.card.shadowOffset,
          elevation: theme.shadows.card.elevation,
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: theme.colors.cardMuted,
        }}
      />
      {children}
    </View>
  );
}
