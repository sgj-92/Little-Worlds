import { createClient } from '@supabase/supabase-js';
import type { AppServices } from './appServices';
import type { LiveConfig } from './config';
import { safeSessionStorage } from './createMockServices';
import { createParentGateSession } from './mock/mockRepositories';
import { createMockSpeechCapture } from './mock/mockSpeechCapture';
import { createMockStoryGenerator } from './mock/mockStoryGenerator';
import { browserStorage } from './store';
import { createSupabaseAuth } from './supabase/supabaseAuth';
import { createSupabaseSettingsRepository } from './supabase/supabaseSettingsRepository';
import { createSupabaseStoryRepository } from './supabase/supabaseStoryRepository';

/**
 * Live mode (Milestone 2): Supabase accounts and persistence. Story generation and voice
 * capture are still the clearly-labelled mocks until Milestones 3 and 4.
 */
export function createLiveServices(config: LiveConfig): AppServices {
  const client = createClient(config.supabaseUrl, config.supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
  });
  const storage = browserStorage();
  const now = () => new Date();
  const auth = createSupabaseAuth(client, config.providers);
  const stories = createSupabaseStoryRepository(client, auth.state);
  const settings = createSupabaseSettingsRepository(client, auth.state, storage);
  const generator = createMockStoryGenerator({ storage, repository: stories, getSettings: () => settings.settings.get(), now });

  // Local in-flight jobs belong to the account that started them; never carry them across.
  const OWNER_KEY = 'lw.jobs.owner';
  auth.state.subscribe(() => {
    const s = auth.state.get();
    if (s.status === 'loading') return;
    const user = s.status === 'signed-in' ? s.userId : '';
    if ((storage.getItem(OWNER_KEY) ?? '') !== user) {
      generator.reset();
      storage.setItem(OWNER_KEY, user);
    }
  });

  return {
    mode: 'live',
    auth,
    stories,
    settings,
    generator,
    speech: createMockSpeechCapture(),
    parentGate: createParentGateSession(safeSessionStorage(), now),
    now,
  };
}
