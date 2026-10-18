import { useId, type ReactNode } from 'react';
import type { ArtTheme } from '@/domain/types';
import { cn } from '../cn';

/**
 * Hand-built vector storybook scenes. These stand in for AI illustrations during the
 * prototype and remain the graceful fallback when a story is generated without pictures
 * or an illustration fails to load.
 */

interface Palette {
  skyTop: string;
  skyBottom: string;
  far: string;
  mid: string;
  near: string;
  glow: string;
  celestial: string;
  night: boolean;
}

export const THEME_PALETTES: Record<ArtTheme, Palette> = {
  'moonlit-forest': { skyTop: '#2a2e66', skyBottom: '#8a74c4', far: '#4b4a8f', mid: '#33406f', near: '#232c57', glow: '#ffe7a6', celestial: '#fff3cf', night: true },
  ocean: { skyTop: '#c6b2f1', skyBottom: '#ffd7b0', far: '#7fc0de', mid: '#4f93c7', near: '#2f68a6', glow: '#ffcf8a', celestial: '#ffb871', night: false },
  'sky-castle': { skyTop: '#bfdcfb', skyBottom: '#fbe0ef', far: '#ffffff', mid: '#f4eefe', near: '#e7ddfb', glow: '#fff4c4', celestial: '#ffe08a', night: false },
  space: { skyTop: '#11163a', skyBottom: '#43307a', far: '#2c2a66', mid: '#3b3580', near: '#1c1d4a', glow: '#ffd27a', celestial: '#fbc04f', night: true },
  garden: { skyTop: '#ffeec2', skyBottom: '#fff8e6', far: '#c4e9c9', mid: '#8fd3ad', near: '#4fbf93', glow: '#ffe7a6', celestial: '#fbc04f', night: false },
  snow: { skyTop: '#1f3765', skyBottom: '#6a62b0', far: '#c9d3f2', mid: '#e3e8fa', near: '#f7f8ff', glow: '#9fdfc2', celestial: '#fff3cf', night: true },
};

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** A soft rolling hill across the 400×400 canvas. */
function hill(base: number, amp: number, phase: number, waves = 1.5): string {
  const pts: string[] = [];
  for (let x = 0; x <= 400; x += 20) {
    const y = base - amp * Math.sin((x / 400) * Math.PI * waves + phase);
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M0,400 L${pts.join(' L')} L400,400 Z`;
}

function Stars({ seed, count, color = '#fff6dc', maxY = 220, animated }: { seed: number; count: number; color?: string; maxY?: number; animated?: boolean }) {
  const r = rng(seed);
  return (
    <g fill={color}>
      {Array.from({ length: count }, (_, i) => {
        const x = r() * 400;
        const y = r() * maxY;
        const s = 0.8 + r() * 1.8;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={s}
            opacity={0.55 + r() * 0.45}
            className={animated && i % 3 === 0 ? 'animate-twinkle' : undefined}
            style={animated ? { animationDelay: `${(i % 7) * 0.35}s`, transformOrigin: `${x}px ${y}px` } : undefined}
          />
        );
      })}
    </g>
  );
}

function Cloud({ x, y, s = 1, fill = '#fff', opacity = 1 }: { x: number; y: number; s?: number; fill?: string; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill} opacity={opacity}>
      <ellipse cx="0" cy="0" rx="34" ry="16" />
      <circle cx="-14" cy="-10" r="14" />
      <circle cx="10" cy="-16" r="18" />
      <circle cx="30" cy="-4" r="12" />
    </g>
  );
}

function Pine({ x, y, h, fill }: { x: number; y: number; h: number; fill: string }) {
  const w = h * 0.42;
  return (
    <g transform={`translate(${x} ${y})`} fill={fill}>
      <path d={`M0 ${-h} L${w * 0.55} ${-h * 0.62} L${w * 0.3} ${-h * 0.62} L${w * 0.8} ${-h * 0.28} L${w * 0.45} ${-h * 0.28} L${w} 0 L${-w} 0 L${-w * 0.45} ${-h * 0.28} L${-w * 0.8} ${-h * 0.28} L${-w * 0.3} ${-h * 0.62} L${-w * 0.55} ${-h * 0.62} Z`} />
    </g>
  );
}

function Flower({ x, y, h, petal }: { x: number; y: number; h: number; petal: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M0 0 Q 3 ${-h / 2} 0 ${-h}`} stroke="#2f8f68" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="6" cy={-h * 0.45} rx="6" ry="3" fill="#4fbf93" transform={`rotate(-30 6 ${-h * 0.45})`} />
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 6} cy={-h + Math.sin((a * Math.PI) / 180) * 6} r="5" fill={petal} />
      ))}
      <circle cx="0" cy={-h} r="3.5" fill="#fbc04f" />
    </g>
  );
}

const NAVY = '#1f2650';

/* ——— Heroes: drawn around (0,0) standing on the ground ——— */

function Fox() {
  return (
    <g>
      <path d="M-14 -10 C -52 -6 -66 -44 -44 -60 C -44 -40 -32 -26 -10 -24 Z" fill="#f08f3e" />
      <path d="M-44 -60 C -56 -54 -60 -44 -57 -36 C -52 -44 -47 -52 -44 -60 Z" fill="#fff8ec" />
      <ellipse cx="0" cy="-24" rx="22" ry="25" fill="#f39b4b" />
      <ellipse cx="8" cy="-20" rx="10" ry="16" fill="#fff4e4" />
      <path d="M-8 -62 L-6 -84 L8 -68 Z" fill="#e57f2e" />
      <path d="M12 -68 L22 -84 L26 -62 Z" fill="#e57f2e" />
      <circle cx="8" cy="-56" r="17" fill="#f39b4b" />
      <path d="M12 -54 Q 34 -52 30 -45 Q 18 -40 8 -46 Z" fill="#fff4e4" />
      <circle cx="30" cy="-47.5" r="2.6" fill={NAVY} />
      <path d="M9 -60 q4 3.5 8 0" stroke={NAVY} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="4" cy="-50" r="3.2" fill="#ff9e8c" opacity="0.6" />
    </g>
  );
}

function Whale() {
  return (
    <g>
      <path d="M-70 -10 C -70 -58 20 -66 52 -30 C 62 -20 74 -36 86 -46 C 90 -28 84 -10 64 -4 C 30 12 -70 22 -70 -10 Z" fill="#3c5f99" />
      <path d="M-64 -4 C -36 12 24 8 52 -6 C 24 2 -34 4 -64 -4 Z" fill="#a8c6ea" />
      <circle cx="-38" cy="-26" r="3.2" fill={NAVY} />
      <circle cx="-46" cy="-18" r="4" fill="#ff9e8c" opacity="0.55" />
      <path d="M-20 -60 C -24 -76 -34 -80 -40 -78 M-20 -60 C -18 -78 -6 -84 0 -80 M-20 -60 L -20 -84" stroke="#e8f4ff" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Dragon() {
  return (
    <g>
      <path d="M-26 -20 C -54 -16 -60 -2 -48 4 C -40 -6 -30 -8 -20 -10 Z" fill="#4fbf93" />
      <ellipse cx="0" cy="-22" rx="26" ry="20" fill="#5fcaa0" />
      <ellipse cx="6" cy="-17" rx="14" ry="11" fill="#d9f3e7" />
      <path d="M-6 -36 C -20 -70 -46 -64 -40 -44 C -30 -52 -20 -46 -10 -34 Z" fill="#c6b2f1" />
      <circle cx="22" cy="-44" r="16" fill="#5fcaa0" />
      <path d="M14 -58 L12 -70 L22 -60 Z M24 -60 L28 -72 L32 -58 Z" fill="#fbc04f" />
      <ellipse cx="32" cy="-40" rx="9" ry="7" fill="#7fd6b2" />
      <circle cx="22" cy="-48" r="2.6" fill={NAVY} />
      <circle cx="36" cy="-42" r="1.4" fill={NAVY} />
      <circle cx="50" cy="-46" r="5" fill="#fff" opacity="0.8" stroke="#c6b2f1" />
      <circle cx="62" cy="-54" r="3.5" fill="#fff" opacity="0.8" stroke="#c6b2f1" />
    </g>
  );
}

function Rocket() {
  return (
    <g transform="rotate(18)">
      <path d="M-10 6 Q 0 34 10 6 Z" fill="#fbc04f" className="animate-breathe" style={{ transformOrigin: '0 6px' }} />
      <path d="M-6 6 Q 0 22 6 6 Z" fill="#fff3cf" />
      <path d="M0 -70 C 22 -50 22 -14 14 6 L -14 6 C -22 -14 -22 -50 0 -70 Z" fill="#fffcf6" />
      <path d="M0 -70 C 10 -61 15 -52 17 -44 L -17 -44 C -15 -52 -10 -61 0 -70 Z" fill="#e57b6a" />
      <path d="M-14 -10 L -28 8 L -12 4 Z M14 -10 L 28 8 L 12 4 Z" fill="#e57b6a" />
      <circle cx="0" cy="-26" r="8" fill="#9fdfc2" stroke="#9a7fe0" strokeWidth="3" />
    </g>
  );
}

function Bunny() {
  return (
    <g>
      <circle cx="-22" cy="-16" r="8" fill="#fff" />
      <ellipse cx="0" cy="-22" rx="22" ry="22" fill="#fff8f0" />
      <ellipse cx="-4" cy="-72" rx="6" ry="20" fill="#fff8f0" transform="rotate(-10 -4 -72)" />
      <ellipse cx="12" cy="-72" rx="6" ry="20" fill="#fff8f0" transform="rotate(12 12 -72)" />
      <ellipse cx="-4" cy="-72" rx="3" ry="14" fill="#f6b8ad" transform="rotate(-10 -4 -72)" />
      <ellipse cx="12" cy="-72" rx="3" ry="14" fill="#f6b8ad" transform="rotate(12 12 -72)" />
      <circle cx="6" cy="-48" r="16" fill="#fff8f0" />
      <circle cx="1" cy="-50" r="2.4" fill={NAVY} />
      <circle cx="13" cy="-50" r="2.4" fill={NAVY} />
      <path d="M5 -43 l2 2 l2 -2" stroke="#e57b6a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="-3" cy="-44" r="3" fill="#ffb3a5" opacity="0.6" />
      <circle cx="17" cy="-44" r="3" fill="#ffb3a5" opacity="0.6" />
    </g>
  );
}

function Penguin() {
  return (
    <g>
      <ellipse cx="-8" cy="0" rx="9" ry="4" fill="#fbc04f" />
      <ellipse cx="10" cy="0" rx="9" ry="4" fill="#fbc04f" />
      <ellipse cx="0" cy="-34" rx="25" ry="34" fill="#28325f" />
      <ellipse cx="0" cy="-28" rx="17" ry="26" fill="#fffcf6" />
      <circle cx="-7" cy="-48" r="2.6" fill={NAVY} />
      <circle cx="7" cy="-48" r="2.6" fill={NAVY} />
      <path d="M-5 -42 L 5 -42 L 0 -35 Z" fill="#f1a92d" />
      <path d="M-24 -40 C -36 -30 -34 -16 -28 -10" stroke="#28325f" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M-25 -62 C -10 -74 12 -74 25 -62" stroke="#e57b6a" strokeWidth="7" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Castle() {
  return (
    <g>
      <Cloud x={-30} y={4} s={1.6} />
      <Cloud x={30} y={8} s={1.4} />
      <rect x="-46" y="-56" width="92" height="56" rx="4" fill="#dccff8" />
      <rect x="-64" y="-86" width="28" height="86" rx="3" fill="#c6b2f1" />
      <rect x="36" y="-86" width="28" height="86" rx="3" fill="#c6b2f1" />
      <rect x="-14" y="-104" width="28" height="104" rx="3" fill="#cdbdf2" />
      <path d="M-68 -86 L -50 -118 L -32 -86 Z M32 -86 L 50 -118 L 68 -86 Z M-18 -104 L 0 -142 L 18 -104 Z" fill="#8064cf" />
      <path d="M0 -142 L0 -156 L 14 -151 L 0 -146" stroke="#8064cf" strokeWidth="2" fill="#fbc04f" />
      <path d="M-12 0 L -12 -20 A 12 12 0 0 1 12 -20 L 12 0 Z" fill="#8064cf" />
      <circle cx="-50" cy="-62" r="5" fill="#fff4c4" />
      <circle cx="50" cy="-62" r="5" fill="#fff4c4" />
      <circle cx="0" cy="-76" r="6" fill="#fff4c4" />
    </g>
  );
}

const HEROES: Record<ArtTheme, () => ReactNode> = {
  'moonlit-forest': Fox,
  ocean: Whale,
  'sky-castle': Dragon,
  space: Rocket,
  garden: Bunny,
  snow: Penguin,
};

interface StoryArtProps {
  theme: ArtTheme;
  variant?: number;
  className?: string;
  animated?: boolean;
  /** Accessible description; omit for decorative use. */
  label?: string;
}

export function StoryArt({ theme, variant = 0, className, animated = false, label }: StoryArtProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const p = THEME_PALETTES[theme];
  const v = ((variant % 4) + 4) % 4;
  const heroX = [250, 128, 200, 284][v]!;
  const celestialX = [300, 92, 210, 110][v]!;
  const celestialY = [92, 104, 78, 120][v]!;
  const flip = v % 2 === 1;
  const Hero = HEROES[theme];
  const seed = theme.length * 97 + v * 13;

  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      className={cn('block size-full', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.skyTop} />
          <stop offset="1" stopColor={p.skyBottom} />
        </linearGradient>
        <radialGradient id={`glow${uid}`}>
          <stop offset="0" stopColor={p.glow} stopOpacity="0.85" />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#sky${uid})`} />
      {p.night && <Stars seed={seed} count={theme === 'space' ? 70 : 38} animated={animated} maxY={theme === 'space' ? 400 : 230} />}
      <circle cx={celestialX} cy={celestialY} r="90" fill={`url(#glow${uid})`} />

      {theme === 'snow' && (
        <g opacity="0.75" className={animated ? 'animate-float' : undefined}>
          <path d="M-20 140 C 80 60 180 170 260 90 S 380 60 430 110 L 430 150 C 360 110 300 190 230 150 S 80 140 -20 190 Z" fill="#9fdfc2" opacity="0.55" />
          <path d="M-20 170 C 100 120 160 200 260 140 S 380 110 430 150 L 430 175 C 340 150 300 210 220 180 S 70 180 -20 210 Z" fill="#c6b2f1" opacity="0.5" />
        </g>
      )}

      {theme === 'space' ? (
        <g>
          <circle cx={celestialX} cy={celestialY} r="40" fill={p.celestial} />
          <circle cx={celestialX - 12} cy={celestialY - 10} r="9" fill="#f1a92d" opacity="0.5" />
          <ellipse cx={celestialX} cy={celestialY} rx="66" ry="14" fill="none" stroke="#c6b2f1" strokeWidth="6" transform={`rotate(-18 ${celestialX} ${celestialY})`} />
          <circle cx={400 - celestialX + 30} cy={300} r="22" fill="#9fdfc2" />
          <circle cx={400 - celestialX + 22} cy={294} r="5" fill="#4fbf93" opacity="0.6" />
          <circle cx="60" cy="330" r="10" fill="#e57b6a" opacity="0.85" />
        </g>
      ) : (
        <circle cx={celestialX} cy={celestialY} r={p.night ? 34 : 38} fill={p.celestial} />
      )}

      {(theme === 'sky-castle' || theme === 'garden' || theme === 'ocean') && (
        <g className={animated ? 'animate-float' : undefined}>
          <Cloud x={flip ? 300 : 80} y={70} s={0.9} opacity={0.9} />
          <Cloud x={flip ? 90 : 320} y={150} s={0.6} opacity={0.75} />
        </g>
      )}

      <g transform={flip ? 'translate(400 0) scale(-1 1)' : undefined}>
        {theme === 'ocean' ? (
          <>
            <path d={hill(250, 6, 0, 6)} fill={p.far} />
            <path d={hill(282, 8, 1, 5)} fill={p.mid} />
            <path d={hill(330, 8, 2, 4)} fill={p.near} />
          </>
        ) : theme === 'space' ? (
          <path d={hill(372, 14, 0.4, 1.2)} fill={p.near} />
        ) : theme === 'sky-castle' ? (
          <>
            <Cloud x={60} y={360} s={2.6} fill={p.near} />
            <Cloud x={340} y={372} s={2.4} fill={p.near} />
            <Cloud x={200} y={392} s={3} fill={p.mid} />
          </>
        ) : (
          <>
            <path d={hill(262, 26, 0.3, 1.6)} fill={p.far} />
            <path d={hill(300, 22, 1.8, 1.4)} fill={p.mid} />
          </>
        )}

        {theme === 'moonlit-forest' && (
          <>
            {[30, 78, 340, 372].map((x, i) => (
              <Pine key={x} x={x} y={308 + (i % 2) * 6} h={120 + (i % 3) * 22} fill="#273461" />
            ))}
            <path d={hill(338, 12, 0.8, 1.2)} fill={p.near} />
          </>
        )}
        {theme === 'garden' && (
          <>
            <path d={hill(340, 14, 0.8, 1.2)} fill={p.near} />
            {[40, 72, 104, 310, 342, 372].map((x, i) => (
              <Flower key={x} x={x} y={350 + (i % 2) * 8} h={34 + (i % 3) * 10} petal={['#e57b6a', '#c6b2f1', '#ffd27a'][i % 3]!} />
            ))}
          </>
        )}
        {theme === 'snow' && <path d={hill(340, 10, 0.8, 1.2)} fill={p.near} />}
        {theme === 'sky-castle' && (
          <g transform={`translate(${400 - heroX} 330) scale(0.95)`}>
            <Castle />
          </g>
        )}
      </g>

      <g
        transform={
          theme === 'sky-castle'
            ? `translate(${heroX} ${200 + v * 10}) scale(1.05)`
            : theme === 'space'
              ? `translate(${heroX} ${250 - v * 12}) scale(1.25)`
              : theme === 'ocean'
                ? `translate(${heroX} 318) scale(1.05)`
                : `translate(${heroX} 346) scale(1.15)`
        }
      >
        <g className={animated ? 'animate-float' : undefined}>
          <g transform={v === 1 ? 'scale(-1 1)' : undefined}>
            <Hero />
          </g>
        </g>
      </g>

      {theme === 'moonlit-forest' && (
        <g fill={p.glow}>
          {[
            [60, 250],
            [140, 214],
            [320, 236],
            [210, 268],
            [370, 200],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" className={animated ? 'animate-twinkle' : undefined} style={{ animationDelay: `${i * 0.5}s`, transformOrigin: `${x}px ${y}px` }} />
          ))}
        </g>
      )}
      {theme === 'ocean' && (
        <g fill="none" stroke="#e8f4ff" strokeWidth="2.5" opacity="0.8">
          <circle cx={heroX - 70} cy={350} r="5" />
          <circle cx={heroX - 84} cy={334} r="3.5" />
          <circle cx={heroX + 60} cy={364} r="4" />
        </g>
      )}
      {theme === 'snow' && <Stars seed={seed + 5} count={26} color="#ffffff" maxY={400} animated={animated} />}
    </svg>
  );
}

/** Cover for stories made without illustrations: calm colour field with a listening motif. */
export function PlainCover({ theme, className }: { theme: ArtTheme; className?: string }) {
  const p = THEME_PALETTES[theme];
  const light = !p.night && theme !== 'ocean';
  const base = light ? p.near : p.skyTop;
  const top = light ? p.mid : p.skyBottom;
  return (
    <div aria-hidden className={cn('relative size-full overflow-hidden', className)} style={{ background: `linear-gradient(160deg, ${top}, ${base})` }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
        <circle cx="50" cy="50" r="30" fill="#fff" opacity="0.12" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#fff" strokeOpacity="0.15" strokeWidth="1.5" />
        <circle cx="82" cy="18" r="6" fill={p.celestial} opacity="0.9" />
        <circle cx="16" cy="26" r="1.2" fill="#fff" />
        <circle cx="26" cy="80" r="1" fill="#fff" />
        <circle cx="74" cy="70" r="1.4" fill="#fff" opacity="0.8" />
        <g transform="translate(50 50)" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-14 6 v-4 a14 14 0 0 1 28 0 v4" />
        </g>
        <rect x="32" y="52" width="9" height="13" rx="3.5" fill="#fff" />
        <rect x="59" y="52" width="9" height="13" rx="3.5" fill="#fff" />
      </svg>
    </div>
  );
}
