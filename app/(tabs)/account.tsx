import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert, Pressable, Switch, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { theme } from  "@/theme";
import { useApp } from "@/store/store";
import { router } from "expo-router";

export default function AccountScreen() {
  const { state, actions } = useApp();
  const displayName = state.authUser?.email?.split("@")[0] ?? state.profile.name;
  const displayEmail = state.authUser?.email ?? state.profile.email;

  const reset = () => {
    Alert.alert("Reset demo data?", "This will restore the seeded dummy data.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: () => actions.resetDemo() },
    ]);
  };

  return (
    <Screen>
      <Text style={{ fontSize: 26, fontWeight: "900", color: theme.colors.text, marginBottom: 14 }}>
        Account
      </Text>

      <Card style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 20,
              backgroundColor: theme.colors.primarySoft,
              borderWidth: 1,
              borderColor: theme.colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 16 }}>
              {displayName}
            </Text>
            <Text style={{ color: theme.colors.muted }}>{displayEmail}</Text>
            {state.isAnonymous && (
              <Text style={{ color: theme.colors.primary, marginTop: 3, fontWeight: "800" }}>
                Anonymous mode active (local-only data)
              </Text>
            )}
          </View>
        </View>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Row
          icon="notifications-outline"
          title="Daily reminders"
          right={
            <Switch
              value={state.profile.reminders}
              onValueChange={(v) => actions.setProfile({ reminders: v })}
            />
          }
        />
        <Divider />
        <Row
          icon="moon-outline"
          title="Dark mode (demo)"
          right={
            <Switch
              value={state.profile.darkMode}
              onValueChange={(v) => actions.setProfile({ darkMode: v })}
            />
          }
        />
      </Card>

      <Card>
        <Row
          icon="refresh-outline"
          title="Reset demo data"
          subtitle="Restores the seed journal + check-ins"
          right={
            <Pressable onPress={reset}>
              <Text style={{ color: theme.colors.danger, fontWeight: "900" }}>Reset</Text>
            </Pressable>
          }
        />
        <Divider />
        {!state.isAnonymous ? (
          <Row
            icon="log-out-outline"
            title="Sign out"
            subtitle="Clear auth token on this device"
            right={
              <Pressable onPress={() => actions.logout()}>
                <Text style={{ color: theme.colors.danger, fontWeight: "900" }}>Logout</Text>
              </Pressable>
            }
          />
        ) : (
          <>
            <Row
              icon="person-add-outline"
              title="Create account"
              subtitle="Upgrade from anonymous mode"
              right={
                <Pressable onPress={() => router.push("/login")}>
                  <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>Open</Text>
                </Pressable>
              }
            />
            <Divider />
            <Row
              icon="exit-outline"
              title="Exit anonymous mode"
              subtitle="Clear local anonymous journal"
              right={
                <Pressable
                  onPress={() =>
                    Alert.alert("Exit anonymous mode?", "This clears anonymous journal data from this device.", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Exit",
                        style: "destructive",
                        onPress: async () => {
                          await actions.exitAnonymousMode();
                          router.replace("/login");
                        },
                      },
                    ])
                  }
                >
                  <Text style={{ color: theme.colors.danger, fontWeight: "900" }}>Exit</Text>
                </Pressable>
              }
            />
          </>
        )}
      </Card>
    </Screen>
  );
}

function Row({
  icon,
  title,
  subtitle,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  right: React.ReactNode;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center", flex: 1 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 16,
            backgroundColor: theme.colors.bg,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={18} color={theme.colors.text} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "900", color: theme.colors.text }}>{title}</Text>
          {!!subtitle && <Text style={{ color: theme.colors.muted, marginTop: 2 }}>{subtitle}</Text>}
        </View>
      </View>

      {right}
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: 12 }} />;
}
