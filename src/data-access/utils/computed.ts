import { StoreApi } from 'zustand';

type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean
) => void;
type ComputedState<T> = (state: Partial<T>) => Partial<T>;

/**
 * This is not middleware, but a utility function to create a store
 * with computed properties.
 */
export function computeWith<T extends object>(
  buildComputed: ComputedState<T>,
  store: StoreApi<T>
): SetState<T> {
  const originalSet = store.setState;

  // Set state updates & updated computed fields
  const setWithComputed = (update, replace) => {
    originalSet((state: T) => {
      const updated = typeof update === 'object' ? update : update(state);
      const computedState = buildComputed({ ...state, ...updated });
      return { ...updated, ...computedState };
    }, replace);
  };

  /**
   * create the store with the `set()` method tail-hooked to compute properties
   */
  store.setState = setWithComputed; // for external-to-store use

  return store.setState;
}
