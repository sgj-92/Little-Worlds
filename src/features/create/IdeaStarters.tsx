export const IDEA_STARTERS = [
  { emoji: '🐉', label: 'Dragon', idea: 'A small, friendly dragon who lives in a castle in the clouds' },
  { emoji: '🐳', label: 'Ocean', idea: 'A gentle whale who sings to the fish under the sea' },
  { emoji: '🚀', label: 'Space', idea: 'A little robot who flies a rocket to count the stars' },
  { emoji: '🦊', label: 'Forest', idea: 'A little fox who helps the moon in the forest' },
  { emoji: '🌷', label: 'Garden', idea: 'A fluffy bunny who plants magic seeds in the garden' },
  { emoji: '🐧', label: 'Snow', idea: 'A penguin who wants to see the northern lights in the snow' },
] as const;

/** Picture-first story starters so pre-readers can create without typing. */
export function IdeaStarters({ onPick }: { onPick: (idea: string) => void }) {
  return (
    <div>
      <p className="mb-3 text-center font-bold text-navy-500">or pick a world</p>
      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
        {IDEA_STARTERS.map((s) => (
          <li key={s.label}>
            <button
              type="button"
              onClick={() => onPick(s.idea)}
              className="pressable flex min-h-20 w-full flex-col items-center justify-center gap-1 rounded-3xl bg-white/80 p-2 text-sm font-extrabold ring-1 ring-navy-900/8 hover:bg-white"
            >
              <span aria-hidden className="text-3xl leading-none">
                {s.emoji}
              </span>
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
