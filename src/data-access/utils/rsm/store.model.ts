/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { StatusState } from './utils/elf-requests';
import { EntitiesState } from '@ngneat/elf-entities';

export interface Entity {
  id: string;
}

/**
 * Selector to quickly determine isLoading state
 */
export type StoreState = {
  requestStatus?: StatusState;
  isLoading?: boolean;
  showSkeleton?: boolean;
} & EntitiesState<Entity>;

export type StoreSelector<T> = (s: any) => T;

export function initStoreState(): StoreState {
  return {
    requestStatus: { value: 'initializing' },
    isLoading: false,
    showSkeleton: true,
  };
}
