import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { createStore } from '../store';
import type { AuthProvider, AuthService, AuthState } from '../types';
import { authErrorMessage } from './authMessages';

function toState(session: Session | null): AuthState {
  return session ? { status: 'signed-in', userId: session.user.id, email: session.user.email ?? null } : { status: 'signed-out' };
}

function sameState(a: AuthState, b: AuthState): boolean {
  if (a.status !== b.status) return false;
  return a.status !== 'signed-in' || (b.status === 'signed-in' && a.userId === b.userId && a.email === b.email);
}

export function createSupabaseAuth(client: SupabaseClient, providers: readonly AuthProvider[]): AuthService {
  const state = createStore<AuthState>({ status: 'loading' });
  const origin = () => window.location.origin;
  const apply = (session: Session | null) => {
    const next = toState(session);
    if (!sameState(state.get(), next)) state.set(next);
  };

  client.auth.getSession().then(
    ({ data }) => apply(data.session),
    () => state.set({ status: 'signed-out' }),
  );
  // Defer: repositories query the database when auth changes, and supabase-js must not be
  // called from inside this callback (it holds the auth lock and would deadlock).
  client.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => apply(session), 0);
  });

  return {
    isMock: false,
    state,
    providers,
    async signUp(email, password) {
      const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: `${origin()}/` } });
      if (error) return { ok: false, message: authErrorMessage(error.message) };
      // Supabase returns a user with no identities when the email is already registered.
      if (data.user && data.user.identities?.length === 0) return { ok: false, message: authErrorMessage('already registered') };
      return { ok: true, needsConfirmation: !data.session };
    },
    async signIn(email, password) {
      const { error } = await client.auth.signInWithPassword({ email, password });
      return error ? { ok: false, message: authErrorMessage(error.message) } : { ok: true };
    },
    async signInWithProvider(provider) {
      const { error } = await client.auth.signInWithOAuth({ provider, options: { redirectTo: `${origin()}/` } });
      return error ? { ok: false, message: authErrorMessage(error.message) } : { ok: true };
    },
    async sendPasswordReset(email) {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${origin()}/reset-password` });
      return error ? { ok: false, message: authErrorMessage(error.message) } : { ok: true };
    },
    async updatePassword(password) {
      const { error } = await client.auth.updateUser({ password });
      return error ? { ok: false, message: authErrorMessage(error.message) } : { ok: true };
    },
    async signOut() {
      await client.auth.signOut();
      state.set({ status: 'signed-out' });
    },
  };
}
