import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/store";
import { theme } from "@/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { useState } from "react";

export default function JournalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const { state, actions } = useApp();
  const [deleting, setDeleting] = useState(false);
  const entryId = Array.isArray(id) ? id[0] : id;

  const entry = state.journal.find((j) => j.id === entryId);

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
    if (deleting) return;

    Alert.alert("Delete entry?", "This will permanently delete this journal entry.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);
            await actions.deleteJournalApi(entry.id);
            router.replace("/(tabs)/journal");
          } catch (e: any) {
            Alert.alert("Delete failed", e.message ?? "Could not delete this entry.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </Pressable>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => router.push({ pathname: "/journal/edit/[id]", params: { id: entry.id } })}
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
            disabled={deleting}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 14,
              backgroundColor: deleting ? "rgba(220,38,38,0.2)" : "rgba(220,38,38,0.12)",
              borderWidth: 1,
              borderColor: "rgba(220,38,38,0.25)",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
            <Text style={{ fontWeight: "900", color: theme.colors.danger }}>
              {deleting ? "Deleting..." : "Delete"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.primarySoft,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 8,
          alignSelf: "flex-start",
          marginBottom: 10,
        }}
      >
        <Text style={{ color: theme.colors.primary, fontWeight: "800" }}>{entry.date}</Text>
      </View>

      <Text style={{ fontSize: 30, fontWeight: "900", color: theme.colors.text, marginTop: 2 }}>
        {entry.title}
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {entry.tags.map((t) => (
          <Pill key={t} label={t} icon="pricetag-outline" />
        ))}
        {entry.tags.length === 0 && <Pill label="general" icon="pricetag-outline" />}
      </View>

      <View style={{ height: 14 }} />

      <Card>
        <Text style={{ color: theme.colors.text, lineHeight: 24, fontSize: 16 }}>{entry.content}</Text>

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
