/** Turn Supabase auth errors into short, calm copy for parents. */
export function authErrorMessage(raw: string | undefined | null): string {
  const m = (raw ?? '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'That email and password don’t match. Please try again.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first — check your inbox for our link.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'There’s already an account with that email. Try signing in instead.';
  if (m.includes('password should be') || m.includes('weak password')) return 'Please choose a longer password (at least 8 characters).';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many tries just now. Please wait a minute and try again.';
  if (m.includes('provider is not enabled') || m.includes('unsupported provider')) return 'That sign-in option isn’t switched on yet.';
  if (m.includes('same password') || m.includes('different from the old')) return 'Please choose a password you haven’t used before.';
  if (m.includes('fetch') || m.includes('network')) return 'We couldn’t reach Little Worlds. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
}
