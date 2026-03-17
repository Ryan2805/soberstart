import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/store";
import { theme } from "@/theme";

export default function NewJournalScreen() {
  const { actions } = useApp();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(
    () => title.trim().length > 0 && content.trim().length > 0 && !saving,
    [title, content, saving]
  );

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Missing info", "Please add a title and some content.");
      return;
    }

    try {
      setSaving(true);
      await actions.addJournalApi(title.trim(), content.trim());
      router.replace("/(tabs)/journal");
    } catch (e: any) {
      Alert.alert("Create failed", e.message ?? "Unable to create entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll keyboard>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text }}>New entry</Text>
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
          placeholder="What happened today?"
          placeholderTextColor={theme.colors.muted}
          returnKeyType="done"
          blurOnSubmit
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
          placeholder="Describe your triggers, cravings, wins, and plan."
          placeholderTextColor={theme.colors.muted}
          multiline
          scrollEnabled={false}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 12,
            minHeight: 220,
            textAlignVertical: "top",
            color: theme.colors.text,
            backgroundColor: theme.colors.bg,
          }}
        />
      </Card>
    </Screen>
  );
}
