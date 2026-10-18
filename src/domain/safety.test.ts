import { describe, expect, it } from 'vitest';
import { checkPrompt, promptIssueMessage } from './safety';
import type { ContentPreferences } from './types';

const prefs: ContentPreferences = { tone: 'gentle', bedtimeEndings: true, avoidTopics: ['monsters'], customBlockedWords: ['spiders'] };

describe('checkPrompt', () => {
  it('accepts a friendly idea', () => {
    expect(checkPrompt('A whale who sings to the fish', prefs)).toBeNull();
  });
  it('asks for more detail on very short ideas', () => {
    expect(checkPrompt('cat', prefs)).toEqual({ kind: 'too-short' });
  });
  it('blocks parent-avoided topics and custom words', () => {
    expect(checkPrompt('A monster under the bed', prefs)).toMatchObject({ kind: 'blocked', reason: 'topic' });
    expect(checkPrompt('A house full of spiders', prefs)).toMatchObject({ kind: 'blocked', reason: 'custom' });
  });
  it('always blocks violent words', () => {
    expect(checkPrompt('A knight with a knife', { ...prefs, avoidTopics: [] })).toMatchObject({ kind: 'blocked', reason: 'always' });
  });
  it('matches whole words only for topics', () => {
    expect(checkPrompt('A darling little duck in the park', { ...prefs, avoidTopics: ['darkness'] })).toBeNull();
  });
  it('never repeats the blocked word back to the child', () => {
    const issue = checkPrompt('A monster party', prefs)!;
    expect(promptIssueMessage(issue)).not.toMatch(/monster/i);
  });
});
