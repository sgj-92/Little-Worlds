import type { MockStoryGenerator } from './mock/mockStoryGenerator';
import type { Services } from './types';

/** What the app runs on. Generation stays mocked in every mode until Milestone 3. */
export interface AppServices extends Services {
  generator: MockStoryGenerator;
  /** Demo mode only: restore the sample library and default settings. */
  resetDemo?: () => void;
}
