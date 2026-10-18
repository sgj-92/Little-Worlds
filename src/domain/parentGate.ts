/** A simple grown-up check: young children can't easily answer it; adults can instantly. */
export interface GateChallenge {
  a: number;
  b: number;
  answer: number;
}

export function createChallenge(random: () => number = Math.random): GateChallenge {
  const a = 3 + Math.floor(random() * 7); // 3..9
  const b = 4 + Math.floor(random() * 6); // 4..9
  return { a, b, answer: a * b };
}

export function checkAnswer(challenge: GateChallenge, input: string): boolean {
  return input.trim() !== '' && Number(input) === challenge.answer;
}

export const GATE_UNLOCK_MS = 10 * 60 * 1000;
