import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from './cn';

type Tone = 'plain' | 'soft' | 'primary' | 'dark';
type Size = 'md' | 'lg' | 'xl';

const TONES: Record<Tone, string> = {
  plain: 'text-navy-700 hover:bg-navy-900/6',
  soft: 'bg-white/85 text-navy-900 ring-1 ring-navy-900/8 shadow-soft hover:bg-white',
  primary: 'bg-honey-400 text-navy-950 shadow-[0_4px_0_0_var(--color-honey-700)] hover:bg-honey-300',
  dark: 'bg-navy-900 text-cream-50 shadow-[0_4px_0_0_var(--color-navy-950)] hover:bg-navy-700',
};
const SIZES: Record<Size, string> = { md: 'size-12', lg: 'size-14', xl: 'size-20' };

interface Props {
  label: string;
  tone?: Tone;
  size?: Size;
  children: ReactNode;
}

export function IconButton({ label, tone = 'plain', size = 'md', className, children, type = 'button', ...rest }: Props & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn('pressable inline-flex shrink-0 items-center justify-center rounded-full disabled:opacity-40', TONES[tone], SIZES[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function IconLink({ label, tone = 'plain', size = 'md', className, children, ...rest }: Props & Omit<LinkProps, 'children'>) {
  return (
    <Link aria-label={label} title={label} className={cn('pressable inline-flex shrink-0 items-center justify-center rounded-full', TONES[tone], SIZES[size], className)} {...rest}>
      {children}
    </Link>
  );
}
