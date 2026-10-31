import { createStore } from '../store';
import type { AuthProvider, AuthService, AuthState } from '../types';

export interface MockAuthOptions {
  signedIn?: boolean;
  /** Simulate Supabase's "confirm your email" step after sign-up. */
  requireConfirmation?: boolean;
  providers?: AuthProvider[];
}

const DEMO_USER = { userId: 'demo-parent', email: 'demo@littleworlds.local' };

/**
 * PROTOTYPE ONLY. In-memory accounts for demo mode and tests. Any email and password of
 * the right shape is accepted, except the password "wrong-password" (to exercise errors).
 */
export function createMockAuth(opts: MockAuthOptions = {}): AuthService {
  const state = createStore<AuthState>(opts.signedIn === false ? { status: 'signed-out' } : { status: 'signed-in', ...DEMO_USER });
  const signInAs = (email: string) => state.set({ status: 'signed-in', userId: `demo-${email}`, email });

  return {
    isMock: true,
    state,
    providers: opts.providers ?? [],
    async signUp(email) {
      if (opts.requireConfirmation) return { ok: true, needsConfirmation: true };
      signInAs(email);
      return { ok: true, needsConfirmation: false };
    },
    async signIn(email, password) {
      if (password === 'wrong-password') return { ok: false, message: 'That email and password don’t match.' };
      signInAs(email);
      return { ok: true };
    },
    async signInWithProvider(provider) {
      signInAs(`${provider}-parent@littleworlds.local`);
      return { ok: true };
    },
    async sendPasswordReset() {
      return { ok: true };
    },
    async updatePassword() {
      return { ok: true };
    },
    async signOut() {
      state.set({ status: 'signed-out' });
    },
  };
}
