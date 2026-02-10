import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import { useApp } from "@/store/store";

const quickTags = ["craving", "trigger", "win", "gratitude", "plan"];

export default function EditJournalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions } = useApp();
  const entry = state.journal.find((j) => j.id === id);

  const [title, setTitle] = useState(entry?.title ?? "");
  const [content, setContent] = useState(entry?.content ?? "");
  const [tags, setTags] = useState<string[]>(entry?.tags ?? []);
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(
    () => title.trim().length > 0 && content.trim().length > 0 && !saving,
    [title, content, saving]
  );

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

  const toggleTag = (t: string) => {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Missing info", "Please add a title and some content.");
      return;
    }

    try {
      setSaving(true);

      // Backend doesn't store tags yet — keep them by appending to content.
      const tagLine = tags.length ? `Tags: ${tags.join(", ")}` : null;

      // If content already has a Tags line from earlier, strip it before re-adding.
      const stripped = content
        .replace(/\n---\nTags:.*$/s, "") // remove old block if present
        .replace(/\nTags:.*$/s, "");     // fallback remove if it was simple

      const finalContent =
        tagLine ? `${stripped.trim()}\n\n---\n${tagLine}` : stripped.trim();

      await actions.updateJournalApi(entry.id, {
        title: title.trim(),
        content: finalContent,
      });

      router.replace({ pathname: "//journal/[id]", params: { id: entry.id } });
    } catch (e: any) {
      Alert.alert("Save failed", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text }}>Edit entry</Text>
        <Pressable
          onPress={save}
          disabled={!canSave}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 14,
            backgroundColor: canSave ? theme.colors.primary : theme.colors.border,
            opacity: canSave ? 1 : 0.6,
          }}
        >
          <Text style={{ color: "white", fontWeight: "900" }}>{saving ? "Saving..." : "Save"}</Text>
        </Pressable>
      </View>

      <Card>
        <Text style={{ color: theme.colors.muted, fontWeight: "800", marginBottom: 6 }}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={theme.colors.muted}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontWeight: "700",
            color: theme.colors.text,
            backgroundColor: theme.colors.bg,
          }}
        />

        <View style={{ height: 12 }} />

        <Text style={{ color: theme.colors.muted, fontWeight: "800", marginBottom: 6 }}>Content</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Content"
          placeholderTextColor={theme.colors.muted}
          multiline
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 12,
            minHeight: 160,
            textAlignVertical: "top",
            color: theme.colors.text,
            backgroundColor: theme.colors.bg,
          }}
        />

        <View style={{ height: 12 }} />

        <Text style={{ color: theme.colors.muted, fontWeight: "800", marginBottom: 8 }}>Tags</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {quickTags.map((t) => {
            const active = tags.includes(t);
            return (
              <Pressable
                key={t}
                onPress={() => toggleTag(t)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                  backgroundColor: active ? theme.colors.primarySoft : theme.colors.card,
                }}
              >
                <Text style={{ fontWeight: "900", color: active ? theme.colors.primary : theme.colors.text }}>
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>
    </Screen>
  );
}
