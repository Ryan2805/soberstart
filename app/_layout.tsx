// app/_layout.tsx
import { AppProvider, useApp } from "@/store/store";
import { syncDailyCheckInReminder } from "@/lib/notifications";
import * as Notifications from "expo-notifications";
import { Stack, router } from "expo-router";
import { useEffect } from "react";

function AppBootstrap() {
  const { state, actions } = useApp();

  useEffect(() => {
    actions.hydrateAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.authReady || !state.onboardingDone) return;

    syncDailyCheckInReminder(state.profile.reminders).catch(() => undefined);
  }, [state.authReady, state.onboardingDone, state.profile.reminders]);

  useEffect(() => {
    const openNotificationTarget = (response: Notifications.NotificationResponse | null) => {
      const href = response?.notification.request.content.data?.href;
      if (href === "/checkin") {
        router.push("/checkin" as any);
      }
    };

    Notifications.getLastNotificationResponseAsync().then(openNotificationTarget).catch(() => undefined);
    const subscription = Notifications.addNotificationResponseReceivedListener(openNotificationTarget);

    return () => subscription.remove();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AppBootstrap />
    </AppProvider>
  );
}
