// src/components/Pill.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import { theme } from "../theme";

export function Pill({
  label,
  icon,
  tint,
  soft,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tint?: string;
  soft?: boolean;
}) {
  const c = tint ?? theme.colors.text;
  const bg = soft ? `${c}18` : theme.colors.bg;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.radius.pill,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: soft ? `${c}24` : theme.colors.border,
      }}
    >
      {icon && <Ionicons name={icon} size={14} color={c} />}
      <Text style={{ color: c, fontWeight: "900" }}>{label}</Text>
    </View>
  );
}
