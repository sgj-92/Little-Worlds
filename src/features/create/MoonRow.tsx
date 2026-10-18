import { Moon } from 'lucide-react';

export function MoonRow({ count }: { count: number }) {
  return (
    <span aria-hidden className="flex gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <Moon key={i} className="size-6" fill="currentColor" strokeWidth={1.5} />
      ))}
    </span>
  );
}
