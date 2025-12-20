/**
 * Validates and normalizes time input from 12h format to 24h format.
 * @param timeString - Time in "HH:MM" format (12-hour)
 * @param amPm - "AM" or "PM"
 * @returns Normalized time in "HH:MM:00" format (24-hour) or null if invalid
 */
export function normalizeTime(
  timeString: string,
  amPm: "AM" | "PM"
): string | null {
  const parts = timeString.split(":");
  const hourStr = parts[0]?.trim() || "";
  const minuteStr = parts[1]?.trim() || "";

  if (!hourStr || !minuteStr) {
    return null;
  }

  let hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (Number.isNaN(hour) || hour < 1 || hour > 12) {
    return null;
  }

  if (Number.isNaN(minute) || minute < 0 || minute > 59) {
    return null;
  }

  // Convert to 24h
  if (amPm === "PM" && hour !== 12) hour += 12;
  if (amPm === "AM" && hour === 12) hour = 0;

  const hour24 = String(hour).padStart(2, "0");
  const minute24 = String(minute).padStart(2, "0");
  return `${hour24}:${minute24}:00`;
}

/**
 * Validates mood score.
 * @param moodScore - Mood score as string
 * @returns Validated mood score (1-10) or null if invalid
 */
export function validateMoodScore(moodScore: string): number | null {
  const trimmed = moodScore.trim();
  if (!trimmed) return null;

  const numeric = Number(trimmed);
  if (Number.isNaN(numeric) || numeric < 1 || numeric > 10) {
    return null;
  }

  return numeric;
}
