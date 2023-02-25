import { elfHooks, deepFreeze } from '@ngneat/elf';

/**
 * Inject middleware to freeze publish/emitted Elf store state
 */
export function freezeStores() {
  /**
   * AutoFreeze store state
   */
  elfHooks.registerPreStoreUpdate((_, nextState) => {
    return deepFreeze(nextState);
  });
}
