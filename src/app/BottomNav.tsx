import { BookHeart, House, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router';
import { cn } from '@/ui/cn';

const side = 'pressable flex min-h-14 min-w-20 flex-col items-center justify-center gap-0.5 rounded-3xl px-3 text-xs font-extrabold';

export function BottomNav() {
  return (
    <nav aria-label="Main" className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex items-end gap-2 rounded-[2rem] bg-white/90 p-2 shadow-lift ring-1 ring-navy-900/6 backdrop-blur-md">
        <NavLink to="/" end className={({ isActive }) => cn(side, isActive ? 'bg-lilac-100 text-lilac-700' : 'text-navy-500 hover:text-navy-900')}>
          <House aria-hidden className="size-6" strokeWidth={2.4} />
          Home
        </NavLink>
        <NavLink
          to="/create"
          aria-label="Make a story"
          className="pressable -mt-6 flex size-18 items-center justify-center rounded-full bg-honey-400 text-navy-950 shadow-[0_5px_0_0_var(--color-honey-700)] ring-6 ring-white"
        >
          <Sparkles aria-hidden className="size-8" strokeWidth={2.4} />
        </NavLink>
        <NavLink to="/library" className={({ isActive }) => cn(side, isActive ? 'bg-lilac-100 text-lilac-700' : 'text-navy-500 hover:text-navy-900')}>
          <BookHeart aria-hidden className="size-6" strokeWidth={2.4} />
          Stories
        </NavLink>
      </div>
    </nav>
  );
}
