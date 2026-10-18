import type { AvoidTopic, ContentPreferences } from './types';

/**
 * Client-side checks give children instant, friendly feedback. They are NOT the safety
 * boundary: the server re-validates every request and moderates generated output
 * (see docs/ARCHITECTURE.md → Child safety).
 */

export const PROMPT_MIN_CHARS = 8;
export const PROMPT_MAX_CHARS = 400;

export const AVOID_TOPIC_LABELS: Record<AvoidTopic, string> = {
  monsters: 'Monsters',
  darkness: 'The dark',
  storms: 'Storms',
  'getting-lost': 'Getting lost',
  villains: 'Villains',
  'loud-noises': 'Loud noises',
};

const TOPIC_KEYWORDS: Record<AvoidTopic, string[]> = {
  monsters: ['monster', 'monsters', 'zombie', 'ghost', 'ghosts', 'troll'],
  darkness: ['dark', 'darkness', 'shadow', 'shadows'],
  storms: ['storm', 'storms', 'thunder', 'lightning', 'hurricane', 'tornado'],
  'getting-lost': ['lost', 'missing'],
  villains: ['villain', 'villains', 'baddie', 'evil', 'witch'],
  'loud-noises': ['bang', 'explosion', 'explode', 'scream'],
};

/** A small always-on list. Real moderation happens server-side. */
const ALWAYS_BLOCKED = ['kill', 'blood', 'gun', 'guns', 'knife', 'weapon', 'die', 'dead'];

export type PromptIssue =
  | { kind: 'too-short' }
  | { kind: 'too-long' }
  | { kind: 'blocked'; reason: 'always' | 'topic' | 'custom'; word: string };

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z']+/g) ?? [];
}

export function normalisePrompt(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function checkPrompt(text: string, prefs: ContentPreferences): PromptIssue | null {
  const clean = normalisePrompt(text);
  if (clean.length < PROMPT_MIN_CHARS) return { kind: 'too-short' };
  if (clean.length > PROMPT_MAX_CHARS) return { kind: 'too-long' };

  const tokens = new Set(words(clean));
  for (const w of ALWAYS_BLOCKED) if (tokens.has(w)) return { kind: 'blocked', reason: 'always', word: w };
  for (const topic of prefs.avoidTopics) {
    for (const w of TOPIC_KEYWORDS[topic]) if (tokens.has(w)) return { kind: 'blocked', reason: 'topic', word: w };
  }
  const lower = clean.toLowerCase();
  for (const raw of prefs.customBlockedWords) {
    const w = raw.trim().toLowerCase();
    if (w && lower.includes(w)) return { kind: 'blocked', reason: 'custom', word: w };
  }
  return null;
}

/** Child-facing copy: never shames, always offers a way forward. */
export function promptIssueMessage(issue: PromptIssue): string {
  switch (issue.kind) {
    case 'too-short':
      return 'Tell me a little more about your story!';
    case 'too-long':
      return 'That’s a big idea! Can you make it a little shorter?';
    case 'blocked':
      return 'Let’s pick a different idea for this story. How about a friendly animal or a magical place?';
  }
}
