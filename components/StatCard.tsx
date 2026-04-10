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
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
        ...theme.shadows.card,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>
          {title}
        </Text>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primarySoft,
            borderWidth: 1,
            borderColor: theme.colors.borderSoft,
          }}
        >
          <Ionicons name={icon} size={18} color={theme.colors.primary} />
        </View>
      </View>

      <Text
        style={{
          marginTop: 18,
          fontSize: 30,
          fontWeight: "900",
          color: theme.colors.text,
        }}
      >
        {value}
      </Text>

      <View
        style={{
          marginTop: 12,
          height: 6,
          borderRadius: 999,
          backgroundColor: theme.colors.bgSoft,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: "58%",
            height: "100%",
            borderRadius: 999,
            backgroundColor: theme.colors.primary,
          }}
        />
      </View>
    </View>
  );
}
