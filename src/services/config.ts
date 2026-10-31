import type { AuthProvider } from './types';

export interface LiveConfig {
  supabaseUrl: string;
  supabaseKey: string;
  providers: AuthProvider[];
}

type Env = Partial<Record<'VITE_SUPABASE_URL' | 'VITE_SUPABASE_PUBLISHABLE_KEY' | 'VITE_SUPABASE_ANON_KEY' | 'VITE_AUTH_PROVIDERS', string>>;

const KNOWN_PROVIDERS: readonly AuthProvider[] = ['google', 'apple'];

/**
 * Live mode needs only public values. Without them the app runs in local demo mode,
 * which keeps previews, tests and local development credential-free.
 */
export function readLiveConfig(env: Env): LiveConfig | null {
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
  const supabaseKey = (env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY)?.trim();
  if (!supabaseUrl || !supabaseKey) return null;
  if (/^sb_secret_/.test(supabaseKey) || /service_role/.test(supabaseKey)) {
    throw new Error('A secret Supabase key was provided to the browser. Use the publishable key.');
  }
  const providers = (env.VITE_AUTH_PROVIDERS ?? '')
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter((p): p is AuthProvider => (KNOWN_PROVIDERS as readonly string[]).includes(p));
  return { supabaseUrl, supabaseKey, providers: [...new Set(providers)] };
}
