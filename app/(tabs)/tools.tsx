import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert, Pressable, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import { useApp } from "@/store/store";

const tools = [
  { title: "Urge Surfing (2 min)", desc: "Ride the craving wave without acting on it.", icon: "water-outline" as const },
  { title: "Box Breathing", desc: "4–4–4–4 breathing to calm the nervous system.", icon: "heart-outline" as const },
  { title: "Grounding 5-4-3-2-1", desc: "Shift attention back to the present moment.", icon: "navigate-outline" as const },
  { title: "Call a friend", desc: "Quick reach out to someone supportive.", icon: "call-outline" as const },
];

export default function ToolsScreen() {
  const { actions } = useApp();

  const logTool = (name: string) => {
    actions.addToolUse(name);
    Alert.alert("Nice.", `Logged: ${name}`);
  };

  return (
    <Screen>
      <Text style={{ fontSize: 26, fontWeight: "900", color: theme.colors.text, marginBottom: 14 }}>
        Tools
      </Text>

      <Card style={{ marginBottom: 12 }}>
        <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 16 }}>Quick actions</Text>
        <View style={{ height: 10 }} />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => logTool("Drink water")}
            style={quickBtnStyle}
          >
            <Ionicons name="water-outline" size={18} color={theme.colors.primary} />
            <Text style={quickBtnText}>Drink water</Text>
          </Pressable>

          <Pressable
            onPress={() => logTool("10 min walk")}
            style={quickBtnStyle}
          >
            <Ionicons name="walk-outline" size={18} color={theme.colors.primary} />
            <Text style={quickBtnText}>10 min walk</Text>
          </Pressable>
        </View>

        <View style={{ height: 10 }} />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => logTool("Text someone")}
            style={quickBtnStyle}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.primary} />
            <Text style={quickBtnText}>Text someone</Text>
          </Pressable>

          <Pressable
            onPress={() => logTool("Breathing")}
            style={quickBtnStyle}
          >
            <Ionicons name="heart-outline" size={18} color={theme.colors.primary} />
            <Text style={quickBtnText}>Breathing</Text>
          </Pressable>
        </View>
      </Card>

      {tools.map((t) => (
        <Pressable key={t.title} onPress={() => logTool(t.title)} style={{ marginBottom: 12 }}>
          <Card>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  backgroundColor: theme.colors.primarySoft,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Ionicons name={t.icon} size={20} color={theme.colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "900", color: theme.colors.text }}>{t.title}</Text>
                <Text style={{ color: theme.colors.muted, marginTop: 3 }}>{t.desc}</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
            </View>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const quickBtnStyle = {
  flex: 1,
  backgroundColor: theme.colors.bg,
  borderWidth: 1,
  borderColor: theme.colors.border,
  borderRadius: 16,
  paddingVertical: 12,
  paddingHorizontal: 12,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 8,
  justifyContent: "center" as const,
};

const quickBtnText = { fontWeight: "900" as const, color: theme.colors.text };
