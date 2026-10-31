import { cn } from '../cn';

/** Animated open storybook with drifting sparkles, shown while a story is being made. */
export function MagicBook({ className, still }: { className?: string; still?: boolean }) {
  return (
    <svg viewBox="0 0 240 200" aria-hidden className={cn('block', className)}>
      <defs>
        <radialGradient id="mb-glow">
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="96" rx="110" ry="80" fill="url(#mb-glow)" className={still ? undefined : 'animate-breathe'} style={{ transformOrigin: '120px 96px' }} />
      <g className={still ? undefined : 'animate-float'}>
        <path d="M120 150 C 92 136 56 134 26 142 L 26 62 C 56 54 92 56 120 72 Z" fill="#fffcf6" />
        <path d="M120 150 C 148 136 184 134 214 142 L 214 62 C 184 54 148 56 120 72 Z" fill="#fdf6e9" />
        <path d="M120 72 L 120 150" stroke="#eedcbc" strokeWidth="3" />
        <path d="M26 142 C 56 134 92 136 120 150 C 148 136 184 134 214 142 L 214 150 C 184 142 148 144 120 158 C 92 144 56 142 26 150 Z" fill="#8064cf" />
        {[78, 92, 106].map((y, i) => (
          <path key={y} d={`M44 ${y} C 66 ${y - 6} 88 ${y - 4} 106 ${y + 4}`} stroke="#c6b2f1" strokeWidth="4" strokeLinecap="round" fill="none" opacity={1 - i * 0.2} />
        ))}
        <circle cx="178" cy="86" r="11" fill="#ffd27a" />
        <path d="M134 132 C 150 112 168 108 200 120 L 200 134 C 176 130 154 132 134 140 Z" fill="#9fdfc2" />
        <path d="M150 124 L 158 104 L 166 124 Z" fill="#4fbf93" />
      </g>
      {[
        [60, 40, 0],
        [176, 30, 0.6],
        [120, 18, 1.2],
        [206, 70, 1.8],
        [34, 92, 2.2],
      ].map(([x, y, d]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y! - 8} L${x! + 2.5} ${y! - 2.5} L${x! + 8} ${y} L${x! + 2.5} ${y! + 2.5} L${x} ${y! + 8} L${x! - 2.5} ${y! + 2.5} L${x! - 8} ${y} L${x! - 2.5} ${y! - 2.5} Z`}
          fill="#ffd27a"
          className={still ? undefined : 'animate-twinkle'}
          style={{ animationDelay: `${d}s`, transformOrigin: `${x}px ${y}px` }}
        />
      ))}
    </svg>
  );
}
