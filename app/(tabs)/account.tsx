import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import type React from "react";
import { useMemo, useState } from "react";
import { Alert, Pressable, Switch, Text, TextInput, View } from "react-native";
import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/store";
import { theme } from "@/theme";

export default function AccountScreen() {
  const { state, actions } = useApp();
  const profile = state.profile;
  const [editing, setEditing] = useState(false);
  const [realName, setRealName] = useState(profile.realName || profile.name);
  const [displayName, setDisplayName] = useState(profile.displayName || profile.name);
  const [profileImageUri, setProfileImageUri] = useState(profile.profileImageUri);
  const [useDisplayName, setUseDisplayName] = useState(profile.useDisplayName);

  const accountEmail = state.authUser?.email ?? profile.email;
  const shownName =
    (profile.useDisplayName ? profile.displayName : profile.realName) ||
    profile.name ||
    state.authUser?.email?.split("@")[0] ||
    "Your account";
  const initials = useMemo(() => getInitials(shownName), [shownName]);
  const isSignedIn = !!state.authUser;

  const saveProfile = () => {
    const cleanRealName = realName.trim();
    const cleanDisplayName = displayName.trim();
    const nextName = (useDisplayName ? cleanDisplayName : cleanRealName) || cleanDisplayName || cleanRealName;

    actions.setProfile({
      realName: cleanRealName,
      displayName: cleanDisplayName,
      profileImageUri: profileImageUri.trim(),
      useDisplayName,
      name: nextName,
    });
    setEditing(false);
  };

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Photo access needed", "Allow photo access to choose a profile picture from your library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setProfileImageUri(result.assets[0].uri);
    }
  };

  const resetEditor = () => {
    setRealName(profile.realName || profile.name);
    setDisplayName(profile.displayName || profile.name);
    setProfileImageUri(profile.profileImageUri);
    setUseDisplayName(profile.useDisplayName);
    setEditing(false);
  };

  const signOut = () => {
    Alert.alert("Sign out?", "You can sign back in any time with your email and password.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await actions.logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const switchToAnonymous = (enabled: boolean) => {
    if (!enabled) {
      if (state.isAnonymous) {
        router.push({ pathname: "/login", params: { mode: "register", upgrade: "1" } });
      }
      return;
    }

    if (state.isAnonymous) return;

    Alert.alert(
      "Switch to anonymous mode?",
      "This signs out of your account on this device and starts a local-only anonymous profile.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          style: "destructive",
          onPress: async () => {
            await actions.enterAnonymousMode();
            router.replace("/(tabs)");
          },
        },
      ],
    );
  };

  const resetActivity = () => {
    Alert.alert("Reset local activity?", "This clears local check-ins, tool uses, and urge logs for this mode.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: () => actions.resetDemo() },
    ]);
  };

  return (
    <Screen scroll>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: theme.colors.primary, fontWeight: "900", letterSpacing: 0.6, textTransform: "uppercase" }}>
          Account
        </Text>
        <Text style={{ fontSize: 28, fontWeight: "900", color: theme.colors.text, marginTop: 6 }}>
          Your profile
        </Text>
        <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 20 }}>
          Manage how SoberStart addresses you, stores your session, and handles privacy on this device.
        </Text>
      </View>

      <Card style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <Avatar uri={profile.profileImageUri} initials={initials} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 20 }}>{shownName}</Text>
            <Text style={{ color: theme.colors.muted, marginTop: 3 }}>{accountEmail || "No email added"}</Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <Pill
                label={state.isAnonymous ? "Anonymous" : isSignedIn ? "Signed in" : "Signed out"}
                icon={state.isAnonymous ? "shield-outline" : isSignedIn ? "checkmark-circle-outline" : "person-outline"}
                tint={state.isAnonymous ? theme.colors.warning : isSignedIn ? theme.colors.success : theme.colors.muted}
                soft
              />
              <Pill
                label={profile.useDisplayName ? "Display name" : "Real name"}
                icon="id-card-outline"
                tint={theme.colors.primary}
                soft
              />
            </View>
          </View>
        </View>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <SectionHeader
          title="Edit profile"
          subtitle="Choose your name, public label, and profile image."
          action={
            editing ? (
              <Pressable onPress={resetEditor}>
                <Text style={{ color: theme.colors.muted, fontWeight: "900" }}>Cancel</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => setEditing(true)}>
                <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>Edit</Text>
              </Pressable>
            )
          }
        />

        {editing ? (
          <View style={{ gap: 12, marginTop: 14 }}>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <Avatar uri={profileImageUri} initials={initials} />
              <View style={{ flex: 1, gap: 8 }}>
                <Pressable onPress={pickProfileImage} style={secondaryButton}>
                  <Ionicons name="image-outline" size={17} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>Choose photo</Text>
                </Pressable>
                {!!profileImageUri && (
                  <Pressable onPress={() => setProfileImageUri("")} style={clearButton}>
                    <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                    <Text style={{ color: theme.colors.danger, fontWeight: "900" }}>Remove photo</Text>
                  </Pressable>
                )}
              </View>
            </View>
            <Field label="Real name" value={realName} onChangeText={setRealName} placeholder="Ryan Murphy" />
            <Field label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Ryan" />
            <Field
              label="Profile picture URL"
              value={profileImageUri}
              onChangeText={setProfileImageUri}
              placeholder="Choose a photo or paste an image URL"
              autoCapitalize="none"
            />
            <SettingRow
              icon="eye-outline"
              title="Use display name in the app"
              subtitle="Keeps your real name saved, but shows the display name around SoberStart."
              right={<Switch value={useDisplayName} onValueChange={setUseDisplayName} />}
            />
            <Pressable onPress={saveProfile} style={primaryButton}>
              <Ionicons name="save-outline" size={18} color="white" />
              <Text style={{ color: "white", fontWeight: "900" }}>Save profile</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ marginTop: 14, gap: 10 }}>
            <ReadOnlyRow label="Real name" value={profile.realName || "Not set"} />
            <ReadOnlyRow label="Display name" value={profile.displayName || profile.name || "Not set"} />
            <ReadOnlyRow label="Profile picture" value={profile.profileImageUri ? "Custom image URL saved" : "Initials avatar"} />
          </View>
        )}
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <SectionHeader title="Access" subtitle="Sign in, sign out, or switch privacy mode." />

        <View style={{ marginTop: 14, gap: 12 }}>
          <SettingRow
            icon="shield-outline"
            title="Anonymous mode"
            subtitle={state.isAnonymous ? "Local-only data is active on this device." : "Switch to local-only use without your account session."}
            right={<Switch value={state.isAnonymous} onValueChange={switchToAnonymous} />}
          />

          <Divider />

          {isSignedIn ? (
            <SettingRow
              icon="log-out-outline"
              title="Sign out"
              subtitle="End this account session on this device."
              right={
                <Pressable onPress={signOut}>
                  <Text style={{ color: theme.colors.danger, fontWeight: "900" }}>Sign out</Text>
                </Pressable>
              }
            />
          ) : (
            <SettingRow
              icon="log-in-outline"
              title={state.isAnonymous ? "Create or sign in" : "Sign in"}
              subtitle={state.isAnonymous ? "Move from anonymous mode to a saved account." : "Use your email and password to restore your account."}
              right={
                <Pressable
                  onPress={() =>
                    state.isAnonymous
                      ? router.push({ pathname: "/login", params: { upgrade: "1" } })
                      : router.push("/login")
                  }
                >
                  <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>Open</Text>
                </Pressable>
              }
            />
          )}
        </View>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <SectionHeader title="Recovery profile" subtitle="The details that shape your dashboard." />

        <View style={{ marginTop: 14, gap: 10 }}>
          <ReadOnlyRow label="Sober start" value={profile.soberStartDate || "Not set"} />
          <ReadOnlyRow label="Focus" value={profile.soberFrom.length > 0 ? profile.soberFrom.join(", ") : "Not set"} />
          <ReadOnlyRow label="Goals" value={profile.goals.length > 0 ? profile.goals.join(" | ") : "Not set"} />
          {!!profile.motivation && (
            <View style={{ paddingTop: 8 }}>
              <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>Why this matters</Text>
              <Text style={{ color: theme.colors.text, marginTop: 5, lineHeight: 20 }}>{profile.motivation}</Text>
            </View>
          )}
        </View>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <SectionHeader title="Preferences" subtitle="Small controls for the current device." />
        <View style={{ marginTop: 14, gap: 12 }}>
          <SettingRow
            icon="notifications-outline"
            title="Daily reminders"
            subtitle="Keep the reminder preference saved with your profile."
            right={<Switch value={profile.reminders} onValueChange={(reminders) => actions.setProfile({ reminders })} />}
          />
          <Divider />
          <SettingRow
            icon="moon-outline"
            title="Dark mode"
            subtitle="Saved preference for a future theme pass."
            right={<Switch value={profile.darkMode} onValueChange={(darkMode) => actions.setProfile({ darkMode })} />}
          />
        </View>
      </Card>

      <Card>
        <SectionHeader title="Maintenance" subtitle="Local cleanup tools for testing." />
        <View style={{ marginTop: 14 }}>
          <SettingRow
            icon="refresh-outline"
            title="Reset activity"
            subtitle="Clear local check-ins, tool use, and urge logs in this mode."
            right={
              <Pressable onPress={resetActivity}>
                <Text style={{ color: theme.colors.danger, fontWeight: "900" }}>Reset</Text>
              </Pressable>
            }
          />
        </View>
      </Card>
    </Screen>
  );
}

function Avatar({ uri, initials }: { uri: string; initials: string }) {
  return (
    <View
      style={{
        width: 76,
        height: 76,
        borderRadius: 24,
        backgroundColor: theme.colors.primarySoft,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
      ) : (
        <Text style={{ color: theme.colors.primary, fontWeight: "900", fontSize: 24 }}>{initials}</Text>
      )}
    </View>
  );
}

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 18 }}>{title}</Text>
        <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 20 }}>{subtitle}</Text>
      </View>
      {action}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted2}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCapitalize !== "none"}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 12,
          color: theme.colors.text,
          backgroundColor: theme.colors.bg,
        }}
      />
    </View>
  );
}

function SettingRow({
  icon,
  title,
  subtitle,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  right: React.ReactNode;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
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
          <Text style={{ color: theme.colors.muted, marginTop: 2, lineHeight: 19 }}>{subtitle}</Text>
        </View>
      </View>

      {right}
    </View>
  );
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        padding: 12,
        borderRadius: 16,
        backgroundColor: theme.colors.bgSoft,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
      }}
    >
      <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontWeight: "900", marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: theme.colors.borderSoft }} />;
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "SS"
  );
}

const primaryButton = {
  backgroundColor: theme.colors.primary,
  borderRadius: 14,
  paddingVertical: 14,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  flexDirection: "row" as const,
  gap: 8,
};

const secondaryButton = {
  borderWidth: 1,
  borderColor: theme.colors.borderSoft,
  backgroundColor: theme.colors.primarySoft,
  borderRadius: 14,
  paddingVertical: 12,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  flexDirection: "row" as const,
  gap: 8,
};

const clearButton = {
  borderWidth: 1,
  borderColor: theme.colors.borderSoft,
  backgroundColor: theme.colors.card,
  borderRadius: 14,
  paddingVertical: 12,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  flexDirection: "row" as const,
  gap: 8,
};
