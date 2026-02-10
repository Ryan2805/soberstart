// src/components/StatCard.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import { theme } from "../theme";

export function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.card,
        padding: 14,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.card,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>
          {title}
        </Text>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>

      <Text
        style={{
          marginTop: 10,
          fontSize: 26,
          fontWeight: "900",
          color: theme.colors.text,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
