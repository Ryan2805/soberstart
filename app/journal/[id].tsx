import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/store";
import { theme } from "@/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";

export default function JournalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions } = useApp();

  const entry = state.journal.find((j) => j.id === id);

  if (!entry) {
    return (
      <Screen>
        <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text }}>Entry not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>Go back</Text>
        </Pressable>
      </Screen>
    );
  }

  const onDelete = () => {
  Alert.alert("Delete entry?", "This will delete it from your database.", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          await actions.deleteJournalApi(entry.id);
          router.replace("/(tabs)/journal");
        } catch (e: any) {
          Alert.alert("Delete failed", e.message);
        }
      },
    },
  ]);
};


  return (
    <Screen>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </Pressable>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => Alert.alert("Coming soon", "Edit screen not built yet.")}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="create-outline" size={18} color={theme.colors.text} />
            <Text style={{ fontWeight: "900", color: theme.colors.text }}>Edit</Text>
          </Pressable>

          <Pressable
            onPress={onDelete}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 14,
              backgroundColor: "rgba(220,38,38,0.12)",
              borderWidth: 1,
              borderColor: "rgba(220,38,38,0.25)",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
            <Text style={{ fontWeight: "900", color: theme.colors.danger }}>Delete</Text>
          </Pressable>
        </View>
      </View>

      <Text style={{ color: theme.colors.muted, fontWeight: "700" }}>{entry.date}</Text>
      <Text style={{ fontSize: 26, fontWeight: "900", color: theme.colors.text, marginTop: 6 }}>
        {entry.title}
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {entry.tags.map((t) => (
          <Pill key={t} label={t} icon="pricetag-outline" />
        ))}
        {entry.tags.length === 0 && <Pill label="general" icon="pricetag-outline" />}
      </View>

      <View style={{ height: 12 }} />

      <Card>
        <Text style={{ color: theme.colors.text, lineHeight: 22, fontSize: 15 }}>
          {entry.content}
        </Text>

        {!!entry.mood && (
          <View style={{ marginTop: 14, flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            <Pill label={`Mood: ${entry.mood}/10`} icon="happy-outline" />
            <Pill label={`Craving: ${entry.craving}/10`} icon="flame-outline" />
            <Pill label={`Stress: ${entry.stress}/10`} icon="thunderstorm-outline" />
          </View>
        )}
      </Card>
    </Screen>
  );
}
