import type { AvatarId } from '@/domain/types';
import { AVATARS } from './Avatar';
import { cn } from './cn';

export function AvatarPicker({ value, onChange, legend = 'Picture', large }: { value: AvatarId; onChange: (id: AvatarId) => void; legend?: string; large?: boolean }) {
  return (
    <fieldset>
      <legend className="mb-2 font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(AVATARS) as AvatarId[]).map((id) => (
          <label
            key={id}
            className={cn(
              'pressable flex cursor-pointer items-center justify-center rounded-full ring-2 has-focus-visible:outline-3 has-focus-visible:outline-lilac-500',
              large ? 'size-16 text-4xl' : 'size-14 text-3xl',
              AVATARS[id].bg,
              value === id ? 'ring-lilac-500' : 'ring-transparent',
            )}
          >
            <input type="radio" name="avatar" className="sr-only" checked={value === id} onChange={() => onChange(id)} aria-label={AVATARS[id].label} />
            <span aria-hidden>{AVATARS[id].emoji}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
