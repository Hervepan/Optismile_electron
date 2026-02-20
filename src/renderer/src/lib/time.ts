export const parseHumanToSeconds = (input: string): number => {
  if (!input) return 0;

  const text = input.toLowerCase().replace(/\s+/g, "");

  // Handle colon format (e.g., 1:30 -> 90s, 1:30:00 -> 5400s)
  if (text.includes(":")) {
    const parts = text.split(":").map(p => parseInt(p, 10) || 0);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // mm:ss
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // hh:mm:ss
    }
  }

  // Return 0 if decimals (dot or comma) are present
  if (/[.,]/.test(text)) {
    return 0;
  }

  // If it's just digits, default to minutes (Backward compatibility)
  if (/^\d+$/.test(text)) {
    return parseInt(text, 10) * 60;
  }

  let totalSeconds = 0;
  let matchFound = false;

  // Hours
  const hMatch = text.match(/(\d+)h/);
  if (hMatch) {
    matchFound = true;
    totalSeconds += parseInt(hMatch[1], 10) * 3600;
  }

  // Minutes
  // 1. Explicit: "10m"
  // 2. Inferred from Hour: "1h30" (where 30 is minutes)
  const mMatch = text.match(/(\d+)m/) || text.match(/h(\d+)(?!s|m)/);
  if (mMatch) {
    matchFound = true;
    totalSeconds += parseInt(mMatch[1], 10) * 60;
  }

  // Seconds
  // 1. Explicit: "30s"
  // 2. Inferred from Minute: "10m30" (where 30 is seconds)
  const sMatch = text.match(/(\d+)s/) || text.match(/m(\d+)$/);
  if (sMatch) {
    matchFound = true;
    totalSeconds += parseInt(sMatch[1], 10);
  }

  return matchFound ? totalSeconds : 0;
};

export const parseHumanToMinutes = (input: string): number => {
  return Math.floor(parseHumanToSeconds(input) / 60);
};

export const formatMinutesToHuman = (minutes: number): string => {
  if (!minutes || minutes <= 0) return "0m";

  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);

  if (h > 0) {
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${m}m`;
};

export const formatSecondsToHuman = (totalSeconds: number): string => {
  if (!totalSeconds || totalSeconds <= 0) return "0s";

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);

  return parts.join(" ");
};
