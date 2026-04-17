import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const CHECK_IN_REMINDER_ID_KEY = "soberstart:daily_checkin_notification_id";
const DAILY_REMINDER_HOUR = 20;
const DAILY_REMINDER_MINUTE = 0;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function syncDailyCheckInReminder(enabled: boolean) {
  if (Platform.OS === "web") {
    return { scheduled: false, reason: "web" as const };
  }

  if (!enabled) {
    await cancelDailyCheckInReminder();
    return { scheduled: false, reason: "disabled" as const };
  }

  const permission = await Notifications.getPermissionsAsync();
  let status = permission.status;

  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== "granted") {
    await cancelDailyCheckInReminder();
    return { scheduled: false, reason: "permission-denied" as const };
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-checkin", {
      name: "Daily check-in",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await cancelDailyCheckInReminder();

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily check-in",
      body: "Take a minute to log how you are doing today.",
      data: { href: "/checkin" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: DAILY_REMINDER_HOUR,
      minute: DAILY_REMINDER_MINUTE,
      channelId: "daily-checkin",
    },
  });

  await AsyncStorage.setItem(CHECK_IN_REMINDER_ID_KEY, identifier);
  return { scheduled: true, reason: "scheduled" as const };
}

export async function cancelDailyCheckInReminder() {
  const identifier = await AsyncStorage.getItem(CHECK_IN_REMINDER_ID_KEY);

  if (identifier) {
    await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined);
    await AsyncStorage.removeItem(CHECK_IN_REMINDER_ID_KEY);
  }
}
