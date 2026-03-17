import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/store";
import { theme } from "@/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

const quickTools = [
  { name: "Drink water", icon: "water-outline" as const },
  { name: "10 min walk", icon: "walk-outline" as const },
  { name: "Text someone", icon: "chatbubble-ellipses-outline" as const },
  { name: "Box breathing", icon: "heart-outline" as const },
];

const tools = [
  {
    title: "Urge surfing",
    icon: "water-outline" as const,
    duration: "2-3 min",
    summary: "Notice the urge, breathe, and let it crest without acting on it.",
    steps: [
      "Name the urge instead of fighting it.",
      "Track where you feel it in your body.",
      "Breathe slowly until the intensity starts dropping.",
    ],
  },
  {
    title: "Box breathing",
    icon: "heart-outline" as const,
    duration: "1-2 min",
    summary: "Use a steady 4-4-4-4 breathing pattern to lower stress quickly.",
    steps: [
      "Inhale for 4 seconds.",
      "Hold for 4 seconds.",
      "Exhale for 4 seconds, then hold for 4.",
    ],
  },
  {
    title: "5-4-3-2-1 grounding",
    icon: "navigate-outline" as const,
    duration: "3 min",
    summary: "Pull attention back into the room when thoughts are spiraling.",
    steps: [
      "List 5 things you can see.",
      "List 4 you can feel and 3 you can hear.",
      "Finish with 2 you can smell and 1 you can taste.",
    ],
  },
  {
    title: "Reach out",
    icon: "call-outline" as const,
    duration: "5 min",
    summary: "Break isolation fast by texting or calling one safe person.",
    steps: [
      "Send a simple message: I need support right now.",
      "Tell them what you need for the next 10 minutes.",
      "Stay connected until the urge drops.",
    ],
  },
];

export default function ToolsScreen() {
  const { state, actions } = useApp();
  const [openTool, setOpenTool] = useState<string | null>(tools[0].title);
  const [intensity, setIntensity] = useState("5");
  const [trigger, setTrigger] = useState("");
  const [notes, setNotes] = useState("");
  const [toolUsed, setToolUsed] = useState("");

  const saveToolUse = async (name: string) => {
    try {
      await actions.addToolUse(name);
      Alert.alert("Saved", `${name} was logged.`);
    } catch (error: any) {
      Alert.alert("Couldn't save tool use", String(error?.message ?? error));
    }
  };

  const saveUrge = async () => {
    const level = Number(intensity);
    if (Number.isNaN(level) || level < 0 || level > 10) {
      Alert.alert("Intensity required", "Use a number from 0 to 10.");
      return;
    }

    if (!trigger.trim()) {
      Alert.alert("Trigger required", "Add a short trigger so the urge log is useful later.");
      return;
    }

    try {
      await actions.addUrgeLog({
        intensity: level,
        trigger: trigger.trim(),
        notes: notes.trim(),
        toolUsed: toolUsed.trim(),
      });
      setIntensity("5");
      setTrigger("");
      setNotes("");
      setToolUsed("");
      Alert.alert("Urge logged", "Your urge log was saved.");
    } catch (error: any) {
      Alert.alert("Couldn't save urge log", String(error?.message ?? error));
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={{ fontSize: 26, fontWeight: "900", color: theme.colors.text }}>Tools</Text>
        <Text style={{ color: theme.colors.muted, marginTop: 4, marginBottom: 14 }}>
          Short interventions, saved activity, and urge tracking in one place.
        </Text>

        <Card style={{ marginBottom: 12, backgroundColor: theme.colors.primary }}>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "800" }}>Today</Text>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <Metric label="Tools used" value={`${state.toolUses.filter((item) => item.date === new Date().toISOString().slice(0, 10)).length}`} />
            <Metric label="Urges logged" value={`${state.urgeLogs.filter((item) => item.occurredAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length}`} />
          </View>
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 16 }}>Quick actions</Text>
          <Text style={{ color: theme.colors.muted, marginTop: 4, marginBottom: 12 }}>
            Log the small actions that help break momentum.
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {quickTools.map((tool) => (
              <Pressable key={tool.name} onPress={() => saveToolUse(tool.name)} style={quickBtnStyle}>
                <Ionicons name={tool.icon} size={18} color={theme.colors.primary} />
                <Text style={quickBtnText}>{tool.name}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 16, marginBottom: 10 }}>
          Recovery tools
        </Text>

        {tools.map((tool) => {
          const expanded = openTool === tool.title;

          return (
            <Pressable
              key={tool.title}
              onPress={() => setOpenTool(expanded ? null : tool.title)}
              style={{ marginBottom: 12 }}
            >
              <Card>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
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
                    <Ionicons name={tool.icon} size={20} color={theme.colors.primary} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "900", color: theme.colors.text }}>{tool.title}</Text>
                    <Text style={{ color: theme.colors.muted, marginTop: 3 }}>{tool.summary}</Text>
                  </View>

                  <View style={{ alignItems: "flex-end", gap: 6 }}>
                    <Text style={{ color: theme.colors.primary, fontWeight: "800" }}>{tool.duration}</Text>
                    <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.muted} />
                  </View>
                </View>

                {expanded && (
                  <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                    {tool.steps.map((step, index) => (
                      <View key={step} style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: theme.colors.primarySoft,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>{index + 1}</Text>
                        </View>
                        <Text style={{ color: theme.colors.text, flex: 1 }}>{step}</Text>
                      </View>
                    ))}

                    <Pressable onPress={() => saveToolUse(tool.title)} style={primaryButton}>
                      <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                      <Text style={{ color: "white", fontWeight: "900" }}>Log this tool</Text>
                    </Pressable>
                  </View>
                )}
              </Card>
            </Pressable>
          );
        })}

        <Card style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 16 }}>Log an urge</Text>
          <Text style={{ color: theme.colors.muted, marginTop: 4, marginBottom: 12 }}>
            Save what happened so patterns are easier to spot.
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Field label="Intensity (0-10)" value={intensity} onChangeText={setIntensity} keyboardType="numeric" />
            <Field label="Tool used" value={toolUsed} onChangeText={setToolUsed} placeholder="Optional" />
          </View>

          <View style={{ height: 10 }} />
          <Field label="Trigger" value={trigger} onChangeText={setTrigger} placeholder="What set it off?" />
          <View style={{ height: 10 }} />
          <Field
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="What helped? What were you thinking?"
            multiline
          />

          <Pressable onPress={saveUrge} style={[primaryButton, { marginTop: 14 }]}>
            <Ionicons name="save-outline" size={18} color="white" />
            <Text style={{ color: "white", fontWeight: "900" }}>Save urge log</Text>
          </Pressable>
        </Card>

        <Card>
          <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 16 }}>Recent urge logs</Text>
          <Text style={{ color: theme.colors.muted, marginTop: 4, marginBottom: 8 }}>
            Your latest saved urges from the database.
          </Text>

          {state.urgeLogs.slice(0, 5).map((entry) => (
            <View
              key={entry.id}
              style={{
                paddingVertical: 12,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                <Text style={{ color: theme.colors.text, fontWeight: "900", flex: 1 }}>{entry.trigger}</Text>
                <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>{entry.intensity}/10</Text>
              </View>
              <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
                {new Date(entry.occurredAt).toLocaleString()}
              </Text>
              {!!entry.toolUsed && (
                <Text style={{ color: theme.colors.text, marginTop: 4 }}>Tool used: {entry.toolUsed}</Text>
              )}
              {!!entry.notes && <Text style={{ color: theme.colors.muted, marginTop: 4 }}>{entry.notes}</Text>}
            </View>
          ))}

          {state.urgeLogs.length === 0 && (
            <Text style={{ color: theme.colors.muted, paddingVertical: 12 }}>
              No urge logs yet. Add one above to start tracking patterns.
            </Text>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.14)",
        borderRadius: 16,
        padding: 12,
      }}
    >
      <Text style={{ color: "rgba(255,255,255,0.78)", fontWeight: "700" }}>{label}</Text>
      <Text style={{ color: "white", fontWeight: "900", fontSize: 24, marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: theme.colors.muted, fontWeight: "800", marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        keyboardType={keyboardType}
        multiline={multiline}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 12,
          minHeight: multiline ? 110 : undefined,
          textAlignVertical: multiline ? "top" : "center",
          color: theme.colors.text,
          backgroundColor: theme.colors.bg,
        }}
      />
    </View>
  );
}

const quickBtnStyle = {
  minWidth: "47%" as const,
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

const primaryButton = {
  backgroundColor: theme.colors.primary,
  borderRadius: 14,
  paddingVertical: 12,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  flexDirection: "row" as const,
  gap: 8,
};
