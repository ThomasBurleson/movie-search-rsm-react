/* eslint-disable @typescript-eslint/no-explicit-any */
export type State = {
  [key: string]: any;
};

/**
 * Compare two (2) states to see if specific fields are different.
 * For example,
 *  This could be used to compare RSM state and Route QueryParams.
 *  Changes to QueryParams should trigger updates to the RSM state.
 * @return  null if SAME, or updated values if DIFFERENT
 */
export function compareState<T>(updated: State, current: State, keys: string[]): T | null {
  const hasChanged = keys.reduce<boolean>((result, key) => {
    return result || (!!updated[key] && updated[key] !== current[key]);
  }, false);

  return hasChanged ? ({ ...current, ...updated } as T) : null;
}
