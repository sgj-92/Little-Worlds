import type { AppServices } from './appServices';
import { readLiveConfig } from './config';
import { createMockServices } from './createMockServices';

/**
 * Composition root: live Supabase services when configured, otherwise local demo mode.
 * The Supabase SDK is loaded as its own chunk so demo builds never download it.
 */
export async function createAppServices(): Promise<AppServices> {
  const config = readLiveConfig(import.meta.env);
  if (!config) return createMockServices();
  const { createLiveServices } = await import('./createLiveServices');
  return createLiveServices(config);
}
