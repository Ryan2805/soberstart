import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/store";
import { theme } from "@/theme";
import { todayISO } from "@/utils/date";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function CheckInModal() {
  const { state, actions } = useApp();
  const [mood, setMood] = useState("7");
  const [craving, setCraving] = useState("3");
  const [stress, setStress] = useState("4");
  const [note, setNote] = useState("");

  const valid = useMemo(() => {
    const nums = [mood, craving, stress].map((x) => Number(x));
    return nums.every((n) => !Number.isNaN(n) && n >= 0 && n <= 10);
  }, [mood, craving, stress]);

  const save = async () => {
    if (!valid) {
      Alert.alert("Numbers only", "Mood, craving, and stress should be between 0 and 10.");
      return;
    }

    try {
      await actions.addCheckIn({
        date: todayISO(),
        mood: Number(mood),
        craving: Number(craving),
        stress: Number(stress),
        note: note.trim(),
      });
      router.back();
    } catch (error: any) {
      Alert.alert("Couldn't save check-in", String(error?.message ?? error));
    }
  };

  return (
    <Screen>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
          <Ionicons name="close" size={22} color={theme.colors.text} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text }}>Daily check-in</Text>
        <Pressable
          onPress={save}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 14,
            backgroundColor: valid ? theme.colors.primary : theme.colors.border,
          }}
        >
          <Text style={{ color: "white", fontWeight: "900" }}>Save</Text>
        </Pressable>
      </View>

      <Card style={{ marginBottom: 12 }}>
        <Text style={{ fontWeight: "900", color: theme.colors.text, marginBottom: 10 }}>Rate today (0-10)</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Mini label="Mood" icon="happy-outline" value={mood} setValue={setMood} />
          <Mini label="Craving" icon="flame-outline" value={craving} setValue={setCraving} />
          <Mini label="Stress" icon="thunderstorm-outline" value={stress} setValue={setStress} />
        </View>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Text style={{ color: theme.colors.muted, fontWeight: "800", marginBottom: 6 }}>Current streak</Text>
        <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: "900" }}>
          {state.streakDays} day{state.streakDays === 1 ? "" : "s"}
        </Text>
        <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
          Consecutive daily check-ins are counted automatically.
        </Text>
      </Card>

      <Card>
        <Text style={{ color: theme.colors.muted, fontWeight: "800", marginBottom: 6 }}>Note (optional)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="What's going on today?"
          placeholderTextColor={theme.colors.muted}
          multiline
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 12,
            minHeight: 120,
            textAlignVertical: "top",
            color: theme.colors.text,
            backgroundColor: theme.colors.bg,
          }}
        />
      </Card>

      <Text style={{ color: theme.colors.muted, marginTop: 10 }}>
        Saving a check-in updates today&apos;s status, risk level, and your streak.
      </Text>
    </Screen>
  );
}

function Mini({
  label,
  icon,
  value,
  setValue,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  setValue: (v: string) => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: theme.colors.muted, fontWeight: "800", marginBottom: 6 }}>
        <Ionicons name={icon} size={14} /> {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor={theme.colors.muted}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 12,
          fontWeight: "900",
          color: theme.colors.text,
          backgroundColor: theme.colors.bg,
        }}
      />
    </View>
  );
}
