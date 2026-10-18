export type DayPart = 'morning' | 'afternoon' | 'evening' | 'night';

export function dayPart(now: Date): DayPart {
  const h = now.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 20) return 'evening';
  return 'night';
}

export function greeting(name: string, now: Date): string {
  const who = name.trim() || 'friend';
  switch (dayPart(now)) {
    case 'morning':
      return `Good morning, ${who}`;
    case 'afternoon':
      return `Good afternoon, ${who}`;
    case 'evening':
      return `Good evening, ${who}`;
    case 'night':
      return `Sleepy time, ${who}`;
  }
}
