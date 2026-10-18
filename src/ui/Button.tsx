import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg' | 'xl';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-honey-400 text-navy-950 shadow-[0_4px_0_0_var(--color-honey-700)] hover:bg-honey-300 active:shadow-[0_2px_0_0_var(--color-honey-700)]',
  secondary:
    'bg-lilac-600 text-white shadow-[0_4px_0_0_var(--color-lilac-700)] hover:bg-lilac-500 active:shadow-[0_2px_0_0_var(--color-lilac-700)]',
  soft: 'bg-white/80 text-navy-900 ring-1 ring-navy-900/8 shadow-soft hover:bg-white',
  ghost: 'text-navy-700 hover:bg-navy-900/5',
  danger: 'bg-rose-100 text-rose-700 hover:bg-rose-100/70 ring-1 ring-rose-500/30',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'min-h-12 px-5 text-base gap-2 rounded-2xl',
  lg: 'min-h-14 px-6 text-lg gap-2.5 rounded-3xl',
  xl: 'min-h-18 px-8 text-xl gap-3 rounded-4xl',
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

function classes({ variant = 'primary', size = 'md', fullWidth }: CommonProps, extra?: string) {
  return cn(
    'pressable inline-flex select-none items-center justify-center font-extrabold tracking-tight',
    'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    extra,
  );
}

export function Button({ variant, size, icon, trailingIcon, fullWidth, className, children, type = 'button', ...rest }: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes({ variant, size, fullWidth } as CommonProps, className)} {...rest}>
      {icon}
      {children}
      {trailingIcon}
    </button>
  );
}

export function ButtonLink({ variant, size, icon, trailingIcon, fullWidth, className, children, ...rest }: CommonProps & LinkProps) {
  return (
    <Link className={classes({ variant, size, fullWidth } as CommonProps, className)} {...rest}>
      {icon}
      {children}
      {trailingIcon}
    </Link>
  );
}
