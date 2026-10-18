import type { AvatarId } from '@/domain/types';
import { cn } from './cn';

export const AVATARS: Record<AvatarId, { emoji: string; label: string; bg: string }> = {
  fox: { emoji: '🦊', label: 'Fox', bg: 'bg-honey-100' },
  owl: { emoji: '🦉', label: 'Owl', bg: 'bg-lilac-100' },
  bunny: { emoji: '🐰', label: 'Bunny', bg: 'bg-rose-100' },
  bear: { emoji: '🐻', label: 'Bear', bg: 'bg-cream-200' },
  whale: { emoji: '🐳', label: 'Whale', bg: 'bg-mint-100' },
  dragon: { emoji: '🐲', label: 'Dragon', bg: 'bg-mint-100' },
};

export function Avatar({ id, size = 'md', className }: { id: AvatarId; size?: 'md' | 'lg'; className?: string }) {
  const a = AVATARS[id];
  return (
    <span aria-hidden className={cn('inline-flex shrink-0 items-center justify-center rounded-full ring-4 ring-white', a.bg, size === 'md' ? 'size-12 text-2xl' : 'size-16 text-4xl', className)}>
      {a.emoji}
    </span>
  );
}
