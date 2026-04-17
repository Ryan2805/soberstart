export type BadgeMilestone = {
  id: string;
  label: string;
  days: number;
  detail: string;
};

export type EarnedBadge = BadgeMilestone & {
  unlocked: boolean;
};

export const badgeMilestones: BadgeMilestone[] = [
  { id: "one-month", label: "1 month", days: 30, detail: "First month steady" },
  { id: "three-months", label: "3 months", days: 90, detail: "A full season" },
  { id: "six-months", label: "6 months", days: 183, detail: "Half a year" },
  { id: "one-year", label: "1 year", days: 365, detail: "One year clear" },
  { id: "two-years", label: "2 years", days: 730, detail: "Two years strong" },
  { id: "five-years", label: "5 years", days: 1825, detail: "Long-term momentum" },
];

export function getSoberDays(startDate: string, now = new Date()) {
  if (!startDate) return 0;

  const start = new Date(`${startDate}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) return 0;

  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const diff = today.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

export function getEarnedBadges(startDate: string, now = new Date()): EarnedBadge[] {
  const soberDays = getSoberDays(startDate, now);
  return badgeMilestones.map((badge) => ({
    ...badge,
    unlocked: soberDays >= badge.days,
  }));
}

export function getNextBadge(startDate: string, now = new Date()) {
  const soberDays = getSoberDays(startDate, now);
  const next = badgeMilestones.find((badge) => soberDays < badge.days);

  if (!next) {
    return null;
  }

  return {
    ...next,
    daysRemaining: next.days - soberDays,
  };
}
