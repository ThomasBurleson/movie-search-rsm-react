/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint prefer-spread: "off" */
import { Observable, EMPTY, MonoTypeOperatorFunction } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { emitOnce, Store, createStore, withProps, select } from '@ngneat/elf';
import {
  withEntities,
  withActiveIds,
  upsertEntities,
  getAllEntities,
  deleteAllEntities,
  selectAllEntities,
  selectActiveEntities,
  resetActiveIds,
  setActiveIds,
  getActiveIds,
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

import { initStoreState, StoreState, Entity } from './store.model';

function isUndefined(value: any): value is undefined {
  return value === undefined;
}

export interface ReactiveListVM<T extends Entity> {
  list: T[];
  selected: T[];
  totalCount: number;
  status: StatusState;
  isReady: boolean;
  isLoading: boolean;
  showSkeleton: boolean;
  hasError: boolean;
}

export interface ListState extends StoreState {
  totalAvailable: number;
}
/**
 * 'ReactiveList' is a Reactive EntityCollection that supports:
 *   - 0..n selections of items in a list.
 *   - status tracking for pending|success|idle|error
 *
 *  NOTE:
 *     Pagination is not supported: Use a PaginatedStore instance
 *     Extra state is not supported: Use a ReactiveStore
 */

export class ReactiveList<K extends Entity, T extends ListState = ListState> {
  private _store: Store;

  readonly list$: Observable<K[]>;
  readonly selected$: Observable<K[]>;
  readonly vm$: Observable<ReactiveListVM<K>>;

  readonly status$: Observable<StatusState>;
  readonly isLoading$: Observable<boolean> = EMPTY; // pending activity
  readonly isReady$: Observable<boolean> = EMPTY; // initial loads and full refreshes
  readonly showSkeleton$: Observable<boolean> = EMPTY; // store never 'loaded', show idle!

  get total(): number {
    return this._store.query((state) => state.totalAvailable);
  }

  /**
   * Create RxJS operator to easily track REST calls
   */
  public trackLoadStatus: MonoTypeOperatorFunction<any>;

  constructor(private storeName: string) {
    this._store = createStore(
      { name: storeName },
      withProps<ListState>({ totalAvailable: 0, ...initStoreState() }), // Store State
      withEntities<K>(), // entity collection for K
      withActiveIds() // support selections of K
    );

    this.list$ = this._store.pipe(selectAllEntities());
    this.selected$ = this._store.pipe(selectActiveEntities());

    this.status$ = this._store.pipe(map(getRequestStatus));
    this.isReady$ = this._store.pipe(selectReadyStatus(storeName), startWith(false));
    this.isLoading$ = this._store.pipe(selectLoadingStatus(storeName), startWith(false));
    this.showSkeleton$ = this._store.pipe(selectInitializingStatus(storeName), startWith(true));

    this.trackLoadStatus = trackRequestStatus(this._store);

    this.vm$ = this._store.pipe(
      select((s) => {
        const list: K[] = getAllEntities()(s);
        const selectedIds = getActiveIds(s);
        const selected = list.filter((it) => selectedIds.indexOf(it.id) > -1);
        const status = getRequestStatus(s);
        const totalCount = s.totalAvailable;

        return {
          list,
          totalCount,
          selected,
          // full status info
          status,
          // quick accessor
          isReady: status.value === 'success',
          isLoading: status.value === 'pending',
          showSkeleton: status.value === 'initializing',
          hasError: status.value === 'error',
        };
      })
    );
  }

  /**********************************************
   * List Item Features
   **********************************************/

  /**
   * Add items to list; either merge into existing or clear first
   * Allow a 'totalAvailable" to override current list amount loaded...
   */
  public addItems(list: K[], reset = false, totalAvailable?: number) {
    const hasTotals = !isUndefined(totalAvailable);
    const updateTotals = (s: ListState) => {
      totalAvailable = hasTotals ? totalAvailable : s['ids'].length;
      return { ...s, totalAvailable };
    };

    emitOnce(() => {
      if (reset === true) this.reset();
      // prettier-ignore
      this._store.update(
        upsertEntities(list),
        updateTotals,
        updateRequestStatus(this.storeName, 'success')
      );
    });
  }

  public reset() {
    // prettier-ignore
    this._store.update(
      resetActiveIds(),
      deleteAllEntities(),
      (s: T) => ({ ...s, ...initStoreState(), totalAvailable: 0 }),
      updateRequestStatus(this.storeName, 'initializing')
    );
  }

  /**
   * Add specific items as selected... either add to existing or
   * set as current selected group
   */
  public selectItems(list: K[], reset = false) {
    const ids = this.toIDs(list);
    this.selectItemsById(ids, reset);
  }

  /**
   * Add specific items as selected... either add to existing or
   * set as current selected group
   */
  public selectItemsById(list: K['id'][], reset = false) {
    const current = !reset ? this._store.query(getActiveIds) : [];
    const difference = list.filter((x) => !current.includes(x)).concat(current.filter((x) => !list.includes(x)));
    const merged = [...new Set([...current, ...list])];

    if (difference.length > 0) {
      this._store.update(setActiveIds(merged));
    }
  }

  /**
   * Easily selectAll or none
   */
  public selectAll(flag = true) {
    const list: K[] = this._store.query<K[]>(getAllEntities());
    const ids = list.map((it) => it.id);

    this._store.update(setActiveIds(flag ? ids : []));
  }

  /**********************************************
   * Status Features
   **********************************************/

  /**
   * Easily update the status of the data store
   * 'busy'|'succes'|'initializing'|'error' for store activity
   *
   * @see https://ngneat.github.io/elf/docs/features/requests/requests-status/#updaterequestsstatus
   */
  public updateStatus(flag: 'success' | 'initializing' | 'pending', error?: any) {
    this._store.update(updateRequestStatus(this.storeName, flag, error)); // eslint-disable prefer-spread
  }

  /**
   * 'busy' | 'success' for store activity
   */
  public setLoading(isLoading = true) {
    this.updateStatus(isLoading ? 'pending' : 'success');
  }

  /**********************************************
   * Private Features
   **********************************************/

  private toIDs(list: K[]) {
    return list?.map((it) => it.id);
  }
}
