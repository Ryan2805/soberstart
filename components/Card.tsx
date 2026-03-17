import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { theme } from "../theme";

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.card,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          shadowColor: theme.shadows.card.shadowColor,
          shadowOpacity: theme.shadows.card.shadowOpacity,
          shadowRadius: theme.shadows.card.shadowRadius,
          shadowOffset: theme.shadows.card.shadowOffset,
          elevation: theme.shadows.card.elevation,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
