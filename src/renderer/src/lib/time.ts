export const parseHumanToMinutes = (input: string): number => {
  if (!input) return 0;

  const text = input.toLowerCase().replace(/\s+/g, "");

  // Return 0 if decimals (dot or comma) are present
  if (/[.,]/.test(text)) {
    return 0;
  }

  if (/^\d+$/.test(text)) {
    return parseInt(text, 10);
  }

  let totalMinutes = 0;
  let matchFound = false;

  const hMatch = text.match(/(\d+)h/);
  if (hMatch) {
    matchFound = true;
    totalMinutes += parseInt(hMatch[1], 10) * 60;
  }

  const mMatch = text.match(/(\d+)m/) || text.match(/h(\d+)$/);
  if (mMatch) {
    matchFound = true;
    totalMinutes += parseInt(mMatch[1], 10);
  }

  return matchFound ? totalMinutes : 0;
};

export const parseHumanToSeconds = (input: string): number => {
  const minutes = parseHumanToMinutes(input);
  return minutes * 60;
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
