import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/store";
import { theme } from "@/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

const numericKeyboardType = Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric";

const quickTools = [
  { name: "Drink water", icon: "water-outline" as const, tint: theme.colors.primarySoft },
  { name: "10 min walk", icon: "walk-outline" as const, tint: theme.colors.bgSoft },
  { name: "Text someone", icon: "chatbubble-ellipses-outline" as const, tint: theme.colors.accentSoft },
  { name: "Box breathing", icon: "heart-outline" as const, tint: theme.colors.primarySoft },
];

const tools = [
  {
    title: "Urge surfing",
    icon: "water-outline" as const,
    duration: "2-3 min",
    summary: "Notice the urge, breathe, and let it crest without acting on it.",
    cue: "Best when an urge spikes fast",
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
    cue: "Best when your body feels activated",
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
    cue: "Best when your mind is racing",
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
    cue: "Best when you feel alone with it",
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

  const today = new Date().toISOString().slice(0, 10);
  const toolsUsedToday = state.toolUses.filter((item) => item.date === today).length;
  const urgesLoggedToday = state.urgeLogs.filter((item) => item.occurredAt.slice(0, 10) === today).length;
  const latestUrge = state.urgeLogs[0];

  const saveToolUse = async (name: string) => {
    try {
      await actions.addToolUse(name);
      Alert.alert("Saved", `${name} was logged.`);
    } catch (error: any) {
      Alert.alert("Could not save tool use", String(error?.message ?? error));
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
      Alert.alert("Could not save urge log", String(error?.message ?? error));
    }
  };

  return (
    <Screen keyboard>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: "900", letterSpacing: 0.6, textTransform: "uppercase" }}>
            Support hub
          </Text>
          <Text style={{ fontSize: 28, fontWeight: "900", color: theme.colors.text, marginTop: 6 }}>
            Tools for the hard moments
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 20 }}>
            Quick relief, structured exercises, and urge tracking in one calmer workflow.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.primaryDeep,
            borderRadius: 30,
            padding: 20,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.10)",
            marginBottom: 16,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.08)",
              right: -80,
              top: -80,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: 160,
              height: 160,
              borderRadius: 999,
              backgroundColor: "rgba(59,130,166,0.18)",
              left: -60,
              bottom: -40,
            }}
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "rgba(255,255,255,0.78)", fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" }}>
                Right now
              </Text>
              <Text style={{ color: "white", fontSize: 26, fontWeight: "900", marginTop: 8 }}>
                Reset your next 10 minutes
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.80)", marginTop: 6, lineHeight: 20 }}>
                Pick one small action, lower the intensity, and make the next choice easier.
              </Text>
            </View>

            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.12)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.14)",
              }}
            >
              <Ionicons name="sparkles-outline" size={22} color="white" />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            <HeroMetric label="Tools used" value={`${toolsUsedToday}`} />
            <HeroMetric label="Urges logged" value={`${urgesLoggedToday}`} />
          </View>

          <View
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.10)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.72)", fontWeight: "800", letterSpacing: 0.4, textTransform: "uppercase" }}>
              Suggested next move
            </Text>
            <Text style={{ color: "white", fontWeight: "900", fontSize: 18, marginTop: 6 }}>
              {latestUrge ? "Ground first, then log what helped" : "Start with a quick relief action"}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 4, lineHeight: 20 }}>
              {latestUrge
                ? `Your latest logged trigger was "${latestUrge.trigger}". Choose one tool below to interrupt that loop.`
                : "If things feel loud, do the smallest action available. Relief first, analysis second."}
            </Text>
          </View>
        </View>

        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>Quick relief</Text>
              <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 20 }}>
                Log the simple actions that help you interrupt momentum.
              </Text>
            </View>
            <Pill label="Low effort" icon="flash-outline" tint={theme.colors.primary} soft />
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
            {quickTools.map((tool) => (
              <Pressable key={tool.name} onPress={() => saveToolUse(tool.name)} style={[quickActionStyle, { backgroundColor: tool.tint }]}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.72)",
                    borderWidth: 1,
                    borderColor: "rgba(15,23,42,0.08)",
                  }}
                >
                  <Ionicons name={tool.icon} size={18} color={theme.colors.primary} />
                </View>
                <Text style={{ color: theme.colors.text, fontWeight: "900", marginTop: 10 }}>{tool.name}</Text>
                <Text style={{ color: theme.colors.primary, fontWeight: "800", marginTop: 8 }}>Log action</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>Recovery tools</Text>
          <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
            Open one tool at a time and follow the steps without overthinking it.
          </Text>
        </View>

        {tools.map((tool) => {
          const expanded = openTool === tool.title;

          return (
            <Pressable
              key={tool.title}
              onPress={() => setOpenTool(expanded ? null : tool.title)}
              style={{ marginBottom: 12 }}
            >
              <Card>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 18,
                      backgroundColor: expanded ? theme.colors.primarySoft : theme.colors.bgSoft,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: theme.colors.borderSoft,
                    }}
                  >
                    <Ionicons name={tool.icon} size={20} color={theme.colors.primary} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 16 }}>{tool.title}</Text>
                        <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 19 }}>{tool.summary}</Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>{tool.duration}</Text>
                        <Ionicons
                          name={expanded ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={theme.colors.muted}
                          style={{ marginTop: 8 }}
                        />
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      <Pill label={tool.cue} icon="compass-outline" tint={theme.colors.primary} soft />
                    </View>
                  </View>
                </View>

                {expanded && (
                  <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.borderSoft }}>
                    {tool.steps.map((step, index) => (
                      <View key={step} style={{ flexDirection: "row", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                        <View
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            backgroundColor: theme.colors.primarySoft,
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: theme.colors.borderSoft,
                          }}
                        >
                          <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>{index + 1}</Text>
                        </View>
                        <Text style={{ color: theme.colors.text, flex: 1, lineHeight: 21 }}>{step}</Text>
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

        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>Log an urge</Text>
              <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 20 }}>
                Capture the trigger, intensity, and what helped while it is still fresh.
              </Text>
            </View>
            <Pill label="Pattern tracking" icon="pulse-outline" tint={theme.colors.accent} soft />
          </View>

          <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
            <Field label="Intensity (0-10)" value={intensity} onChangeText={setIntensity} keyboardType={numericKeyboardType} />
            <Field label="Tool used" value={toolUsed} onChangeText={setToolUsed} placeholder="Optional" />
          </View>

          <View style={{ height: 12 }} />
          <Field label="Trigger" value={trigger} onChangeText={setTrigger} placeholder="What set it off?" />
          <View style={{ height: 12 }} />
          <Field
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="What helped? What were you thinking?"
            multiline
          />

          <Pressable onPress={saveUrge} style={[primaryButton, { marginTop: 16 }]}>
            <Ionicons name="save-outline" size={18} color="white" />
            <Text style={{ color: "white", fontWeight: "900" }}>Save urge log</Text>
          </Pressable>
        </Card>

        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>Recent urge logs</Text>
              <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
                Your latest saved urges and the tools you paired with them.
              </Text>
            </View>
            <Pill label={`${state.urgeLogs.length} saved`} tint={theme.colors.primary} soft />
          </View>

          {state.urgeLogs.slice(0, 5).map((entry) => (
            <View
              key={entry.id}
              style={{
                marginTop: 14,
                paddingTop: 14,
                borderTopWidth: 1,
                borderTopColor: theme.colors.borderSoft,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16, flex: 1 }}>{entry.trigger}</Text>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: `${theme.colors.primary}16`,
                    borderWidth: 1,
                    borderColor: `${theme.colors.primary}22`,
                  }}
                >
                  <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>{entry.intensity}/10</Text>
                </View>
              </View>

              <Text style={{ color: theme.colors.muted, marginTop: 6 }}>{new Date(entry.occurredAt).toLocaleString()}</Text>

              {!!entry.toolUsed && (
                <Text style={{ color: theme.colors.text, marginTop: 8, lineHeight: 20 }}>
                  Tool used: <Text style={{ fontWeight: "900" }}>{entry.toolUsed}</Text>
                </Text>
              )}
              {!!entry.notes && <Text style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 20 }}>{entry.notes}</Text>}
            </View>
          ))}

          {state.urgeLogs.length === 0 && (
            <View
              style={{
                marginTop: 14,
                padding: 16,
                borderRadius: 18,
                backgroundColor: theme.colors.bgSoft,
                borderWidth: 1,
                borderColor: theme.colors.borderSoft,
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "900" }}>No urge logs yet</Text>
              <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 20 }}>
                Add one above to start spotting patterns and which tools actually help.
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.14)",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <Text style={{ color: "rgba(255,255,255,0.76)", fontWeight: "700" }}>{label}</Text>
      <Text style={{ color: "white", fontWeight: "900", fontSize: 28, marginTop: 6 }}>{value}</Text>
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
  keyboardType?: "default" | "numeric" | "numbers-and-punctuation";
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: theme.colors.muted, fontWeight: "800", marginBottom: 8 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        keyboardType={keyboardType}
        multiline={multiline}
        returnKeyType={multiline ? "default" : "done"}
        blurOnSubmit={!multiline}
        scrollEnabled={!multiline ? undefined : false}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.borderSoft,
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 13,
          minHeight: multiline ? 118 : undefined,
          textAlignVertical: multiline ? "top" : "center",
          color: theme.colors.text,
          backgroundColor: theme.colors.bgElevated,
        }}
      />
    </View>
  );
}

const quickActionStyle = {
  minWidth: "47%" as const,
  flex: 1,
  borderRadius: 20,
  paddingVertical: 14,
  paddingHorizontal: 14,
  borderWidth: 1,
  borderColor: "rgba(15,23,42,0.06)",
};

const primaryButton = {
  backgroundColor: theme.colors.primary,
  borderRadius: 16,
  paddingVertical: 14,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  flexDirection: "row" as const,
  gap: 8,
};
