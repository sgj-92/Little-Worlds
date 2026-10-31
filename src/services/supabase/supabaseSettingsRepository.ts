import type { SupabaseClient } from '@supabase/supabase-js';
import type { ParentSettings, PrototypeOptions } from '@/domain/types';
import { defaultSettings } from '../defaults';
import { createPersistentStore, createStore, type KeyValueStorage, type Store } from '../store';
import type { AuthState, ProfileStatus, Result, SaveStatus, SettingsRepository } from '../types';
import { childToRow, familyPatch, settingsFromRows, type ChildRow, type FamilyRow } from './mappers';

const SAVE_DEBOUNCE_MS = 600;
const RETRY_MS = 5000;

/**
 * Family limits live in `families`, the child profile and content preferences in
 * `child_profiles`. Prototype-only options stay on this device.
 */
export function createSupabaseSettingsRepository(client: SupabaseClient, auth: Store<AuthState>, storage: KeyValueStorage): SettingsRepository {
  const prototype = createPersistentStore<PrototypeOptions>(storage, 'lw.prototype.v1', () => defaultSettings().prototype);
  const settings = createStore<ParentSettings>(defaultSettings());
  const profile = createStore<ProfileStatus>('loading');
  const saveStatus = createStore<SaveStatus>('saved');
  let userId: string | null = null;
  let loadToken = 0;
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  async function load() {
    const uid = userId;
    if (!uid) return;
    const token = ++loadToken;
    profile.set('loading');
    const [fam, kids] = await Promise.all([
      client.from('families').select('*').eq('id', uid).maybeSingle(),
      client.from('child_profiles').select('*').eq('family_id', uid).limit(1),
    ]);
    if (token !== loadToken) return;
    if (fam.error || kids.error) {
      profile.set('error');
      return;
    }
    let family = fam.data as FamilyRow | null;
    if (!family) {
      // The sign-up trigger normally creates this row; recover if it is missing.
      const created = await client.from('families').upsert({ id: uid }).select('*').single();
      if (token !== loadToken) return;
      if (created.error) {
        profile.set('error');
        return;
      }
      family = created.data as FamilyRow;
    }
    const child = ((kids.data ?? []) as ChildRow[])[0] ?? null;
    settings.set(settingsFromRows(family, child, prototype.get()));
    profile.set(child ? 'ready' : 'needs-onboarding');
  }

  async function persist() {
    const uid = userId;
    if (!uid || profile.get() !== 'ready') return;
    const s = settings.get();
    saveStatus.set('saving');
    const [a, b] = await Promise.all([
      client.from('families').update(familyPatch(s)).eq('id', uid),
      client.from('child_profiles').upsert(childToRow(s, uid), { onConflict: 'family_id' }),
    ]);
    if (uid !== userId) return;
    if (a.error || b.error) {
      saveStatus.set('error');
      schedule(RETRY_MS);
    } else if (saveTimer === undefined) {
      saveStatus.set('saved');
    }
  }

  function schedule(ms: number) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = undefined;
      void persist();
    }, ms);
  }

  function onAuth(state: AuthState) {
    const next = state.status === 'signed-in' ? state.userId : null;
    if (next === userId) return;
    clearTimeout(saveTimer);
    saveTimer = undefined;
    userId = next;
    loadToken++;
    settings.set(defaultSettings());
    saveStatus.set('saved');
    profile.set('loading');
    if (next) void load();
  }
  auth.subscribe(() => onAuth(auth.get()));
  onAuth(auth.get());

  return {
    settings,
    profile,
    saveStatus,
    update(patch) {
      const next = patch(settings.get());
      settings.set(next);
      if (next.prototype !== prototype.get()) prototype.set(next.prototype);
      saveStatus.set('saving');
      schedule(SAVE_DEBOUNCE_MS);
    },
    async completeOnboarding(child): Promise<Result> {
      const uid = userId;
      if (!uid) return { ok: false, message: 'Please sign in again.' };
      const next = { ...settings.get(), child };
      const { error } = await client.from('child_profiles').upsert(childToRow(next, uid), { onConflict: 'family_id' });
      if (error) return { ok: false, message: 'We couldn’t save that just now. Please try again.' };
      settings.set(next);
      profile.set('ready');
      return { ok: true };
    },
    reload: () => void load(),
  };
}
