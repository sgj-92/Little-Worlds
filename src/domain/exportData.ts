import type { ParentSettings, Story } from './types';

/** A portable copy of a family's data (data-portability right). Audio and images are not included. */
export function buildExport(input: { email: string | null; settings: ParentSettings; stories: readonly Story[]; now: Date }) {
  const { prototype: _prototype, ...settings } = input.settings;
  return {
    format: 'little-worlds-export',
    version: 1,
    exportedAt: input.now.toISOString(),
    account: { email: input.email },
    settings,
    stories: input.stories.map((s) => ({
      title: s.title,
      createdAt: s.createdAt,
      idea: s.prompt,
      durationMinutes: s.durationMinutes,
      illustrated: s.illustrated,
      text: s.scenes.map((scene) => scene.text),
      listening: s.listening,
    })),
  };
}

export function exportFileName(now: Date): string {
  return `little-worlds-export-${now.toISOString().slice(0, 10)}.json`;
}
