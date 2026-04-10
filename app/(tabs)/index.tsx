import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SobrietyTimer } from "@/components/SobrietyTimer";
import { StatCard } from "@/components/StatCard";
import { useApp } from "@/store/store";
import { theme } from "@/theme";
import { formatShortDate, todayISO } from "@/utils/date";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

function QuickAction({
  title,
  subtitle,
  icon,
  tint,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 116,
        backgroundColor: theme.colors.card,
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: tint,
            borderWidth: 1,
            borderColor: theme.colors.borderSoft,
          }}
        >
          <Ionicons name={icon} size={18} color={theme.colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "900", color: theme.colors.text }}>{title}</Text>
          <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 19 }} numberOfLines={3}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 14, flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>Open</Text>
        <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
      </View>
    </Pressable>
  );
}

function InsightChip({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 140,
        padding: 14,
        borderRadius: 20,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            backgroundColor: theme.colors.bgSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={15} color={theme.colors.primary} />
        </View>
        <Text style={{ color: theme.colors.muted, fontWeight: "800", flex: 1 }}>{label}</Text>
      </View>

      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "900", marginTop: 12 }}>{value}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { state } = useApp();

  const lastCheckIn = state.checkIns[0];
  const hasCheckedInToday = lastCheckIn?.date === todayISO();
  const hasSoberDate = !!state.profile.soberStartDate;
  const headlineLabel = hasSoberDate ? "Sobriety timer" : "Current streak";
  const headlineSubtext = hasSoberDate ? `Started ${state.profile.soberStartDate}` : "Based on daily check-ins";
  const firstName = state.profile.name?.trim().split(/\s+/)[0] || "friend";
  const soberFocus =
    state.profile.soberFrom.length > 0 ? state.profile.soberFrom.join(", ") : "your recovery goals";

  const riskColor =
    state.riskLevel === "Low"
      ? theme.colors.success
      : state.riskLevel === "Medium"
        ? theme.colors.warning
        : theme.colors.danger;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: "900", letterSpacing: 0.6, textTransform: "uppercase" }}>
            Daily reset
          </Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "900",
              color: theme.colors.text,
              marginTop: 6,
            }}
          >
            {`Welcome back, ${firstName}`}
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 20 }}>
            {formatShortDate(new Date())} | building momentum one grounded choice at a time
          </Text>
        </View>

        {state.isAnonymous && (
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.borderSoft,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderRadius: 18,
              marginBottom: 14,
              flexDirection: "row",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.primarySoft,
              }}
            >
              <Ionicons name="shield-outline" size={16} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontWeight: "900" }}>Anonymous mode is active</Text>
              <Text style={{ color: theme.colors.muted, marginTop: 3 }}>
                Your recovery data is currently stored only on this device.
              </Text>
            </View>
          </View>
        )}

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
              width: 150,
              height: 150,
              borderRadius: 999,
              backgroundColor: "rgba(59,130,166,0.18)",
              left: -50,
              bottom: -40,
            }}
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "rgba(255,255,255,0.78)", fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 }}>
                {headlineLabel}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 6, fontWeight: "700" }}>{headlineSubtext}</Text>

              {hasSoberDate ? (
                <SobrietyTimer startDate={state.profile.soberStartDate} />
              ) : (
                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, marginTop: 8 }}>
                  <Text
                    style={{
                      fontSize: 54,
                      fontWeight: "900",
                      color: "white",
                      lineHeight: 56,
                    }}
                  >
                    {state.streakDays}
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.85)", fontWeight: "800", marginBottom: 10 }}>days</Text>
                </View>
              )}

              <View style={{ marginTop: 12, flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                <Pill label={`Risk: ${state.riskLevel}`} icon="warning-outline" tint={riskColor} soft />
                <Pill
                  label={hasCheckedInToday ? "Checked in today" : "No check-in yet"}
                  icon={hasCheckedInToday ? "checkmark-circle-outline" : "time-outline"}
                  tint={hasCheckedInToday ? theme.colors.success : theme.colors.warning}
                  soft
                />
              </View>
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
              <Ionicons name="leaf-outline" size={22} color="white" />
            </View>
          </View>

          <View
            style={{
              marginTop: 16,
              marginBottom: 4,
              padding: 14,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.10)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.72)", fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4 }}>
              Today&apos;s focus
            </Text>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "900", marginTop: 6 }}>
              {hasCheckedInToday ? "Keep the streak steady" : "Take a quick check-in pulse"}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 4, lineHeight: 20 }}>
              {hasCheckedInToday
                ? "You have already logged today. A journal note or grounding tool can help reinforce what is working."
                : "A 60-second check-in will capture how you are feeling before the day gets away from you."}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/checkin" as any)}
            style={{
              marginTop: 14,
              backgroundColor: theme.colors.accent,
              borderRadius: 18,
              paddingVertical: 14,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Ionicons name="pulse-outline" size={18} color={theme.colors.white} />
            <Text style={{ color: "white", fontWeight: "900" }}>
              {hasCheckedInToday ? "View check-in" : "Do today's check-in"}
            </Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <InsightChip
            label="Focus"
            value={state.profile.goals[0] || "Protect your energy"}
            icon="flag-outline"
          />
          <InsightChip
            label="Latest entry"
            value={state.journal[0]?.title || "No journal yet"}
            icon="document-text-outline"
          />
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <QuickAction
            title="Journal"
            subtitle={
              state.journal.length > 0
                ? `Capture today or revisit ${state.journal.length} saved entries`
                : "Start your first reflection entry"
            }
            icon="book-outline"
            tint={theme.colors.primarySoft}
            onPress={() => router.push("/journal")}
          />
          <QuickAction
            title="Tools"
            subtitle="Grounding exercises, urge support, and relief tools"
            icon="sparkles-outline"
            tint={theme.colors.accentSoft}
            onPress={() => router.push("/tools" as any)}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <StatCard title="Journal entries" value={`${state.journal.length}`} icon="reader-outline" />
          <StatCard title="Check-ins" value={`${state.checkIns.length}`} icon="analytics-outline" />
        </View>

        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>Recovery profile</Text>
              <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "900", marginTop: 6 }}>
                {state.profile.name ? `${state.profile.name}'s focus` : "Your focus"}
              </Text>
              <Text style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 20 }}>
                {state.profile.soberFrom.length > 0
                  ? `Staying clear of ${soberFocus}`
                  : "Add your sober focus in onboarding or account setup."}
              </Text>
            </View>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 18,
                backgroundColor: theme.colors.primarySoft,
                borderWidth: 1,
                borderColor: theme.colors.borderSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="compass-outline" size={20} color={theme.colors.primary} />
            </View>
          </View>

          {state.profile.goals.length > 0 && (
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              {state.profile.goals.map((goal) => (
                <Pill key={goal} label={goal} tint={theme.colors.primary} soft />
              ))}
            </View>
          )}

          {!!state.profile.motivation && (
            <View
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 18,
                backgroundColor: theme.colors.bgSoft,
                borderWidth: 1,
                borderColor: theme.colors.borderSoft,
              }}
            >
              <Text style={{ color: theme.colors.muted, fontWeight: "800", marginBottom: 6 }}>Why this matters</Text>
              <Text style={{ color: theme.colors.text, lineHeight: 21 }}>{state.profile.motivation}</Text>
            </View>
          )}
        </Card>

        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 16 }}>Recent activity</Text>
              <Text style={{ color: theme.colors.muted, marginTop: 3 }}>Your latest notes and reflections</Text>
            </View>

            <Pressable onPress={() => router.push("/journal")}>
              <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>View all</Text>
            </Pressable>
          </View>

          <View style={{ height: 12 }} />

          {state.journal.slice(0, 3).map((j) => (
            <Pressable
              key={j.id}
              onPress={() => router.push({ pathname: "/journal/[id]", params: { id: j.id } })}
              style={{
                paddingVertical: 12,
                borderTopWidth: 1,
                borderTopColor: theme.colors.borderSoft,
              }}
            >
              <Text style={{ fontWeight: "900", color: theme.colors.text }} numberOfLines={1}>
                {j.title}
              </Text>
              <Text style={{ color: theme.colors.muted, marginTop: 3 }} numberOfLines={1}>
                {j.date} | {j.tags.slice(0, 2).join(", ") || "general"}
              </Text>
            </Pressable>
          ))}

          {state.journal.length === 0 && (
            <View style={{ paddingVertical: 14 }}>
              <Text style={{ color: theme.colors.muted }}>No entries yet. Add one from the Journal tab.</Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}
