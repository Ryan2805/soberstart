import { Card } from "@/components/Card";
import { useApp } from "@/store/store";
import { theme } from "@/theme";
import { todayISO } from "@/utils/date";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const recoveryOptions = ["Alcohol", "Weed", "Nicotine", "Vaping", "Cocaine", "Porn", "Social media", "Other"];
const goalOptions = [
  "Build consistency",
  "Reduce cravings",
  "Sleep better",
  "Save money",
  "Repair relationships",
  "Feel healthier",
  "Journal more",
  "Stay accountable",
];

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export default function OnboardingScreen() {
  const { state, actions } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(state.profile.name);
  const [startDate, setStartDate] = useState(state.profile.soberStartDate || todayISO());
  const [soberFrom, setSoberFrom] = useState<string[]>(state.profile.soberFrom);
  const [goals, setGoals] = useState<string[]>(state.profile.goals);
  const [motivation, setMotivation] = useState(state.profile.motivation);
  const [accountMode, setAccountMode] = useState<"account" | "anonymous">("account");
  const [email, setEmail] = useState(state.profile.email === "anonymous@local" ? "" : state.profile.email);
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = 5;
  const isLastStep = step === totalSteps - 1;

  const canContinue = useMemo(() => {
    if (step === 0) return true;
    if (step === 1) return name.trim().length > 0 && isValidIsoDate(startDate) && soberFrom.length > 0;
    if (step === 2) return goals.length > 0;
    if (step === 3) return motivation.trim().length >= 8;
    if (step === 4) return accountMode === "anonymous" || email.trim().length === 0 || email.includes("@");
    return false;
  }, [accountMode, email, goals.length, motivation, name, soberFrom.length, startDate, step]);

  if (!state.authReady) return null;
  if (state.authUser || state.isAnonymous) return <Redirect href="/(tabs)" />;
  if (state.onboardingDone) return <Redirect href="/login" />;

  const toggleItem = (value: string, current: string[], setter: (next: string[]) => void, max = 3) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current.slice(-(max - 1)), value]);
  };

  const next = () => {
    if (step === 1 && !isValidIsoDate(startDate)) {
      Alert.alert("Check the date", "Use the format YYYY-MM-DD for your sober start date.");
      return;
    }
    if (!canContinue) return;
    setStep((current) => Math.min(current + 1, totalSteps - 1));
  };

  const finish = async () => {
    if (!canContinue || submitting) return;

    const cleanProfile = {
      ...state.profile,
      name: name.trim(),
      realName: name.trim(),
      displayName: name.trim(),
      useDisplayName: true,
      email: email.trim(),
      soberStartDate: startDate,
      soberFrom,
      goals,
      motivation: motivation.trim(),
    };

    try {
      setSubmitting(true);
      actions.setProfile(cleanProfile);
      await actions.completeOnboarding();

      if (accountMode === "anonymous") {
        await actions.enterAnonymousMode();
        router.replace("/(tabs)");
        return;
      }

      router.replace({
        pathname: "/login",
        params: { mode: "register", ready: "1", email: cleanProfile.email.trim() },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 22, paddingTop: 34, paddingBottom: 30, gap: 16 }}
      >
        <View
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 30,
            padding: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.18)",
            overflow: "hidden",
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              right: -32,
              top: -20,
              width: 150,
              height: 150,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: "rgba(255,255,255,0.76)", fontWeight: "800" }}>
                Step {step + 1} of {totalSteps}
              </Text>
              <Text style={{ color: "white", fontSize: 30, fontWeight: "900", marginTop: 8, lineHeight: 35 }}>
                {step === 0 && "Let's set up your reset"}
                {step === 1 && "Make your streak personal"}
                {step === 2 && "Choose a few goals"}
                {step === 3 && "Add your reason to keep going"}
                {step === 4 && "Pick how you want to continue"}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.84)", marginTop: 8, lineHeight: 21 }}>
                {step === 0 && "A quick setup now makes the home screen, streaks, and reminders feel like your journey, not a template."}
                {step === 1 && "We will use these details to tailor your recovery snapshot and keep your progress grounded in your real start date."}
                {step === 2 && "Pick the wins you want this app to keep in view while you check in, journal, and build momentum."}
                {step === 3 && "On harder days, a short reason can be more useful than another stat. Keep it honest and simple."}
                {step === 4 && "Create an account to sync later, or stay anonymous and keep everything on this device."}
              </Text>
            </View>

            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.16)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={
                  step === 0
                    ? "sparkles-outline"
                    : step === 1
                    ? "leaf-outline"
                    : step === 2
                    ? "flag-outline"
                    : step === 3
                    ? "heart-outline"
                    : "shield-checkmark-outline"
                }
                size={24}
                color="white"
              />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 18 }}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View
                key={index}
                style={{
                  flex: 1,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: index <= step ? "white" : "rgba(255,255,255,0.26)",
                }}
              />
            ))}
          </View>
        </View>

        {step === 0 && (
          <Card>
            <View style={{ gap: 14 }}>
              <FeatureRow
                icon="calendar-outline"
                title="Start from your sober date"
                body="Your dashboard can anchor to the day you decided to begin, even before you build a check-in streak."
              />
              <FeatureRow
                icon="list-outline"
                title="Keep your goals visible"
                body="We will surface what matters most so the app stays focused on your reasons, not just raw numbers."
              />
              <FeatureRow
                icon="lock-closed-outline"
                title="Choose privacy on your terms"
                body="Account mode and anonymous mode both stay available, so you do not have to decide everything up front."
              />
            </View>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <View style={{ gap: 14 }}>
              <FieldLabel label="What should we call you?" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your first name"
                placeholderTextColor={theme.colors.muted2}
                style={inputStyle}
              />

              <FieldLabel label="Sober start date" />
              <TextInput
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.muted2}
                autoCapitalize="none"
                style={inputStyle}
              />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <MiniChip label="Today" active={startDate === todayISO()} onPress={() => setStartDate(todayISO())} />
                <MiniChip label="7 days ago" active={startDate === daysAgo(7)} onPress={() => setStartDate(daysAgo(7))} />
                <MiniChip label="30 days ago" active={startDate === daysAgo(30)} onPress={() => setStartDate(daysAgo(30))} />
                <MiniChip label="90 days ago" active={startDate === daysAgo(90)} onPress={() => setStartDate(daysAgo(90))} />
              </View>

              <FieldLabel label="What are you getting sober from?" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {recoveryOptions.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    active={soberFrom.includes(option)}
                    onPress={() => toggleItem(option, soberFrom, setSoberFrom, 3)}
                  />
                ))}
              </View>
            </View>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <View style={{ gap: 14 }}>
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "900" }}>Choose up to three focus areas</Text>
              <Text style={{ color: theme.colors.muted, lineHeight: 21 }}>
                These will show up around your dashboard and account summary to keep your recovery pointed somewhere tangible.
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {goalOptions.map((goal) => (
                  <ChoiceChip
                    key={goal}
                    label={goal}
                    active={goals.includes(goal)}
                    onPress={() => toggleItem(goal, goals, setGoals, 3)}
                  />
                ))}
              </View>
            </View>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <View style={{ gap: 14 }}>
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "900" }}>Why does this matter to you?</Text>
              <Text style={{ color: theme.colors.muted, lineHeight: 21 }}>
                A sentence or two is enough. Think of something you would want to read again on a rough evening.
              </Text>
              <TextInput
                value={motivation}
                onChangeText={setMotivation}
                placeholder="I want to be more present, sleep better, and trust myself again."
                placeholderTextColor={theme.colors.muted2}
                multiline
                textAlignVertical="top"
                style={[inputStyle, { minHeight: 150, paddingTop: 14 }]}
              />
            </View>
          </Card>
        )}

        {step === 4 && (
          <View style={{ gap: 12 }}>
            <Pressable onPress={() => setAccountMode("account")}>
              <Card
                style={{
                  borderColor: accountMode === "account" ? theme.colors.primary : theme.colors.border,
                  backgroundColor: accountMode === "account" ? "#F0FDFA" : theme.colors.card,
                }}
              >
                <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                  <ModeIcon active={accountMode === "account"} icon="person-circle-outline" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>Create account</Text>
                    <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 20 }}>
                      Best if you want your setup saved and you may want sync or login later.
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>

            <Pressable onPress={() => setAccountMode("anonymous")}>
              <Card
                style={{
                  borderColor: accountMode === "anonymous" ? theme.colors.primary : theme.colors.border,
                  backgroundColor: accountMode === "anonymous" ? "#F0FDFA" : theme.colors.card,
                }}
              >
                <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                  <ModeIcon active={accountMode === "anonymous"} icon="shield-outline" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>Stay anonymous</Text>
                    <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 20 }}>
                      Keep data on this device for now. You can still switch to an account later from the Account tab.
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>

            {accountMode === "account" && (
              <Card>
                <View style={{ gap: 10 }}>
                  <FieldLabel label="Email for account setup" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={theme.colors.muted2}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    style={inputStyle}
                  />
                  <Text style={{ color: theme.colors.muted }}>
                    Password comes next on the login screen. We will carry this email over for you.
                  </Text>
                </View>
              </Card>
            )}
          </View>
        )}

        <View
          style={{
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 22,
            padding: 14,
            gap: 10,
          }}
        >
          {isLastStep ? (
            <Pressable
              onPress={finish}
              disabled={!canContinue || submitting}
              style={{
                backgroundColor: canContinue ? theme.colors.primary : theme.colors.border,
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
                opacity: submitting ? 0.8 : 1,
              }}
            >
              <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>
                {submitting ? "Saving setup..." : accountMode === "anonymous" ? "Start in anonymous mode" : "Continue to account"}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={next}
              disabled={!canContinue}
              style={{
                backgroundColor: canContinue ? theme.colors.primary : theme.colors.border,
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>Continue</Text>
            </Pressable>
          )}

          {step > 0 && (
            <Pressable onPress={() => setStep((current) => Math.max(current - 1, 0))} style={{ alignItems: "center", paddingVertical: 6 }}>
              <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>Back</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FeatureRow({ icon, title, body }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 16,
          backgroundColor: theme.colors.primarySoft,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{title}</Text>
        <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 20 }}>{body}</Text>
      </View>
    </View>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>{label}</Text>;
}

function ChoiceChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? theme.colors.primary : theme.colors.border,
        backgroundColor: active ? theme.colors.primarySoft : theme.colors.bg,
      }}
    >
      <Text style={{ color: active ? theme.colors.primary : theme.colors.text, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

function MiniChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: active ? theme.colors.primary : theme.colors.border,
        backgroundColor: active ? theme.colors.primarySoft : "white",
      }}
    >
      <Text style={{ color: active ? theme.colors.primary : theme.colors.text, fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );
}

function ModeIcon({ active, icon }: { active: boolean; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: active ? "rgba(15,118,110,0.24)" : theme.colors.border,
        backgroundColor: active ? theme.colors.primarySoft : theme.colors.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={icon} size={20} color={active ? theme.colors.primary : theme.colors.text} />
    </View>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: theme.colors.border,
  borderRadius: 14,
  paddingHorizontal: 12,
  paddingVertical: 12,
  color: theme.colors.text,
  backgroundColor: theme.colors.bg,
} as const;
