import { theme } from "@/theme";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

type SobrietyTimerProps = {
  startDate: string;
};

type TimerParts = {
  totalDays: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const SECOND_MS = 1000;

function parseStartDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day, 0, 0, 0, 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getTimerParts(startDate: string): TimerParts | null {
  const parsed = parseStartDate(startDate);
  if (!parsed) return null;

  const elapsed = Math.max(Date.now() - parsed.getTime(), 0);
  const totalDays = Math.floor(elapsed / DAY_MS);
  const hours = Math.floor((elapsed % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((elapsed % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((elapsed % MINUTE_MS) / SECOND_MS);

  return { totalDays, hours, minutes, seconds };
}

function TimerBar({
  label,
  value,
  accentWidth,
}: {
  label: string;
  value: string;
  accentWidth: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 132,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
        overflow: "hidden",
      }}
    >
      <Text style={{ color: "rgba(255,255,255,0.78)", fontSize: 12, fontWeight: "800", textTransform: "uppercase" }}>
        {label}
      </Text>
      <Text style={{ color: "white", fontSize: 26, fontWeight: "900", marginTop: 6 }}>{value}</Text>
      <View
        style={{
          marginTop: 12,
          height: 7,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.14)",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: accentWidth,
            height: "100%",
            borderRadius: 999,
            backgroundColor: theme.colors.accent,
          }}
        />
      </View>
    </View>
  );
}

export function SobrietyTimer({ startDate }: SobrietyTimerProps) {
  const [parts, setParts] = useState<TimerParts | null>(() => getTimerParts(startDate));

  useEffect(() => {
    setParts(getTimerParts(startDate));

    const interval = setInterval(() => {
      setParts(getTimerParts(startDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  if (!parts) {
    return (
      <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 4, fontWeight: "700" }}>
        Add a sober start date to see your live timer.
      </Text>
    );
  }

  const dayProgress = `${Math.max(12, ((parts.totalDays % 30) / 30) * 100)}%`;
  const hourProgress = `${(parts.hours / 24) * 100}%`;
  const minuteProgress = `${(parts.minutes / 60) * 100}%`;
  const secondProgress = `${(parts.seconds / 60) * 100}%`;

  return (
    <View style={{ marginTop: 14, gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        <TimerBar label="Days" value={`${parts.totalDays}`} accentWidth={dayProgress} />
        <TimerBar label="Hours" value={`${parts.hours}`.padStart(2, "0")} accentWidth={hourProgress} />
      </View>
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        <TimerBar label="Minutes" value={`${parts.minutes}`.padStart(2, "0")} accentWidth={minuteProgress} />
        <TimerBar label="Seconds" value={`${parts.seconds}`.padStart(2, "0")} accentWidth={secondProgress} />
      </View>
    </View>
  );
}
