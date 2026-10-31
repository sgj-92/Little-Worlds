/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL. Public. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase publishable (anon) key. Public by design — row-level security protects data. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Legacy name for the publishable key. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Comma-separated social sign-in providers switched on in Supabase, e.g. "google,apple". */
  readonly VITE_AUTH_PROVIDERS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
