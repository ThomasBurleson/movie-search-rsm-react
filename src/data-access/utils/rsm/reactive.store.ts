/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint prefer-spread: "off" */
import { Observable, MonoTypeOperatorFunction, EMPTY } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { produce, freeze } from 'immer';

import { emitOnce, Store, createStore, withProps } from '@ngneat/elf';
import {
  withEntities,
  withActiveIds,
  upsertEntities,
  resetActiveIds,
  deleteAllEntities,
  getActiveIds,
  setActiveIds,
  getEntity,
  getAllEntities,
  selectAllEntities,
} from '@ngneat/elf-entities';

import {
  getRequestStatus,
  StatusState,
  trackRequestStatus,
  updateRequestStatus,
  selectLoadingStatus,
  selectInitializingStatus,
  selectReadyStatus,
} from './utils/elf-requests';
import {
  initStoreState,
  StoreSelector,
  StoreState,
  Entity,
} from './store.model';

/**
 *
 * Reactive Store without pagination
 * Supports single entity collection, selections, and status tracking
 */
export class ReactiveStore<T extends StoreState, K extends Entity> {
  protected _store: Store = {} as Store;

  readonly state$: Observable<T> = EMPTY;
  readonly entities$: Observable<K[]> = EMPTY;
  readonly status$: Observable<StatusState> = EMPTY;
  readonly isLoading$: Observable<boolean> = EMPTY; // pending activity
  readonly isReady$: Observable<boolean> = EMPTY; // initial loads and full refreshes
  readonly showSkeleton$: Observable<boolean> = EMPTY; // store never 'loaded', show idle!

  get selectedIDs(): string[] {
    return this._store.query(getActiveIds);
  }

  get selectedItems(): K[] {
    return this._store
      .query(getActiveIds)
      .map((id) => this._store.query(getEntity(id)));
  }

  get snapshot(): T {
    return this._store.getValue();
  }

  /**
   * Store constructor
   * @param storeName
   * @param initState
   */
  constructor(protected storeName: string, protected initState: () => T) {
    /**
     * Create store and streams for  status$ and state$
     * Note: state$ includes computed properties and pagination
     */
    this._store = createStore(
      { name: storeName }, // store name
      withProps<T>({ ...initState(), ...initStoreState() }), // Store State
      withEntities<K>(), // entity collection for Items
      withActiveIds() // support selections of 0...n entity items
    );

    this.state$ = this._store;
    this.entities$ = this._store.pipe(selectAllEntities());
    this.status$ = this._store.pipe(map(getRequestStatus));
    this.isReady$ = this._store.pipe(
      selectReadyStatus(storeName),
      startWith(false)
    );
    this.isLoading$ = this._store.pipe(
      selectLoadingStatus(storeName),
      startWith(false)
    );
    this.showSkeleton$ = this._store.pipe(
      selectInitializingStatus(storeName),
      startWith(true)
    );
  }

  /**********************************************
   * Store Methods
   **********************************************/

  /**
   * Update state and auto-freeze properties
   */
  public update(fn: (state: T) => void, items?: K[], reset = false) {
    emitOnce(() => {
      if (reset === true) this.reset();

      if (items) this.upsertItems(items);
      this._store.update(immutable(fn));

      this._store.update(updateRequestStatus(this.storeName, 'success'));
    });
  }

  /**
   * Add page of items WITHOUT changing active page or pagination information
   */
  public upsertItems(items: K[], reset = false) {
    emitOnce(() => {
      if (reset === true) this.reset();
      // prettier-ignore
      this._store.update(
        upsertEntities(freeze(items)), 
        updateRequestStatus(this.storeName, 'success')
      );
    });
  }

  /**
   * Query support for snapshots of current internal store state...
   * synchronously extract state value using selector
   */
  public useQuery<T>(selector: StoreSelector<T>): T {
    return this._store.query<T>(selector);
  }

  /**
   * Is the specified item in memory (regardless of page location)
   * NOTE: 'id' may be the full ID or a partial GUID (from URL)
   */
  public findItemByID<T extends Entity>(id: string): T | undefined {
    const findByPartialID = () => {
      const allEntities = this.useQuery<Entity[]>(getAllEntities());
      const usePartialIDMatch = ((it: T): boolean =>
        it.id.startsWith(id)) as any;

      return allEntities.find(usePartialIDMatch);
    };
    return this.useQuery(getEntity(id)) || findByPartialID();
  }

  public reset() {
    this._store.update(
      resetActiveIds(),
      deleteAllEntities(),
      (s: T) => ({ ...s, ...this.initState(), ...initStoreState() }),
      updateRequestStatus(this.storeName, 'initializing')
    );
  }

  public showSkeleton(visible = true) {
    this.updateStatus(visible ? 'initializing' : 'success');
  }

  /**********************************************
   * Selection Methods
   **********************************************/

  public clearAllSelections(): void {
    this._store.update(resetActiveIds());
  }

  /**
   * Select an item as 'active'
   * Remove any other selections if clearAll === true
   */
  public selectItem(id: string, clearAll = true) {
    if (!id) return;

    const clearActives = clearAll ? resetActiveIds : () => (s: T) => s;
    const actives = clearAll ? [] : this._store.query(getActiveIds);
    const isActive = actives.indexOf(id) < 0;

    if (!isActive || clearAll) {
      this._store.update(clearActives(), setActiveIds([...actives, id]));
    }
  }

  /**********************************************
   * Status Features
   **********************************************/

  /**
   * Create RxJS operator to easily track REST calls
   * Specify a 'mapError' function to transform or log the error
   * NOTE: this is used in the Facade with HTTP service calls
   */
  public trackLoadStatus(
    mapError?: (error: any) => any
  ): MonoTypeOperatorFunction<any> {
    mapError = mapError || ((error: any) => error);
    return trackRequestStatus(this._store, { mapError });
  }

  /**
   * Easily update the status of the ReactiveStore
   * 'busy'|'succes'|'initializing'|'error' for store activity
   *
   * @see https://ngneat.github.io/elf/docs/features/requests/requests-status/#updaterequestsstatus
   */
  public updateStatus(
    flag: 'success' | 'initializing' | 'pending' | 'error',
    error?: any
  ) {
    this._store.update(updateRequestStatus(this.storeName, flag, error)); // eslint-disable prefer-spread
  }

  /**
   * 'busy' | 'success' for store activity
   */
  public setLoading(isLoading = true) {
    this._store.update(
      updateRequestStatus(this.storeName, isLoading ? 'pending' : 'success')
    );
  }
}

/**
 * Instead of using spread operators i.e. - store.update(state => ({...state})),
 * we can guarantee immutability using ImmerJS
 * @see https://ngneat.github.io/elf/docs/immer
 * @param updater
 */
export function immutable<S>(updater: (state: S) => void): (state: S) => S {
  return (state) => {
    return produce(state, (draft) => {
      updater(draft as S);
    });
  };
}
