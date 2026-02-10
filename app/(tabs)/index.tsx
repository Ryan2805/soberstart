import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
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
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: theme.colors.card,
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primarySoft,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Ionicons name={icon} size={18} color={theme.colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "900", color: theme.colors.text }}>
            {title}
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 2 }} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { state } = useApp();

  const lastCheckIn = state.checkIns[0];
  const hasCheckedInToday = lastCheckIn?.date === todayISO();

  const riskColor =
    state.riskLevel === "Low"
      ? theme.colors.success
      : state.riskLevel === "Medium"
      ? theme.colors.warning
      : theme.colors.danger;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
       
        <View style={{ marginBottom: 14 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "900",
              color: theme.colors.text,
            }}
          >
            Today
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
            {formatShortDate(new Date())} • one day at a time
          </Text>
        </View>

        {/* Hero - simplified */}
        <View
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 26,
            padding: 18,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.18)",
            marginBottom: 14,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontWeight: "800" }}>
                Current streak
              </Text>

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
                <Text style={{ color: "rgba(255,255,255,0.85)", fontWeight: "800", marginBottom: 10 }}>
                  days
                </Text>
              </View>

              <View style={{ marginTop: 12, flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                <Pill
                  label={`Risk: ${state.riskLevel}`}
                  icon="warning-outline"
                  tint={riskColor}
                  soft
                />
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
                width: 46,
                height: 46,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.14)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="leaf-outline" size={22} color="white" />
            </View>
          </View>

          {/* Primary action */}
          <Pressable
            onPress={() => router.push("/checkin" as any)}
            style={{
              marginTop: 14,
              backgroundColor: "rgba(255,255,255,0.18)",
              borderRadius: 16,
              paddingVertical: 12,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Ionicons name="pulse-outline" size={18} color="white" />
            <Text style={{ color: "white", fontWeight: "900" }}>
              {hasCheckedInToday ? "View check-in" : "Do today’s check-in"}
            </Text>
          </Pressable>
        </View>

        {/* Quick actions */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
          <QuickAction
            title="Journal"
            subtitle="Write or review entries"
            icon="book-outline"
            onPress={() => router.push("/journal")}
          />
          <QuickAction
            title="Tools"
            subtitle="Cravings, breathing, more"
            icon="sparkles-outline"
            onPress={() => router.push("/tools" as any)}
          />
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
          <StatCard
            title="Journal entries"
            value={`${state.journal.length}`}
            icon="reader-outline"
          />
          <StatCard
            title="Check-ins"
            value={`${state.checkIns.length}`}
            icon="analytics-outline"
          />
        </View>

        {/* Recent activity */}
        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 16 }}>
              Recent activity
            </Text>

            <Pressable onPress={() => router.push("/journal")}>
              <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>
                View all
              </Text>
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
                borderTopColor: theme.colors.border,
              }}
            >
              <Text style={{ fontWeight: "900", color: theme.colors.text }} numberOfLines={1}>
                {j.title}
              </Text>
              <Text style={{ color: theme.colors.muted, marginTop: 3 }} numberOfLines={1}>
                {j.date} • {j.tags.slice(0, 2).join(", ") || "general"}
              </Text>
            </Pressable>
          ))}

          {state.journal.length === 0 && (
            <View style={{ paddingVertical: 14 }}>
              <Text style={{ color: theme.colors.muted }}>
                No entries yet. Add one from the Journal tab.
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}
