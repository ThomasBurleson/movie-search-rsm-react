/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import produce from 'immer';

import { Observable } from 'rxjs';
import { shareReplay, map, distinctUntilChanged } from 'rxjs/operators';

import { Store, createStore, withProps, emitOnce } from '@ngneat/elf';
import {
  withEntities,
  withActiveIds,
  upsertEntities,
  deleteAllEntities,
  resetActiveIds,
  getActiveIds,
  setActiveIds,
} from '@ngneat/elf-entities';
import {
  PaginationData,
  withPagination,
  getPaginationData,
  hasPage as pageExists,
  setPage,
  setCurrentPage,
  selectPaginationData,
  updatePaginationData,
  deleteAllPages,
} from '@ngneat/elf-pagination';

import { updateRequestStatus } from './utils/elf-requests';

export interface PaginationProps extends PaginationData {
  start: number; // 0-based index of first item in current page
  end: number; // 0-based index of last item in current page
}
// These are placeholders meant to be assigned/inject by the Facade
export interface PaginationApi {
  showPage?: (page: number) => void;
  setPageSize?: (perPage: number) => void;
}
import { initStoreState, StoreState, Entity } from './store.model';
import { ReactiveStore } from './reactive.store';

export type Pagination = PaginationProps & PaginationApi;

/**
 * Reactive Store WITH Pagination features
 * Manages construction of internal store, pagination, and status$ options
 */
export class PaginatedStore<T extends StoreState, K extends Entity> extends ReactiveStore<T, K> {
  public readonly pagination$: Observable<PaginationProps>;

  /**
   * PaginatedStore constructor
   * @param storeName string
   * @param initState Data initialization callback/function
   */
  constructor(storeName: string, initState: () => T) {
    super(storeName, initState);

    /**
     * Create store and streams for items$, status$, and state$
     * Note: state$ includes computed properties and pagination
     */
    this._store = createStore(
      { name: storeName }, // store name
      withProps<T>({ ...initState(), ...initStoreState() }), // Store State
      withEntities<K>(), // entity collection for Items
      withPagination({ initialPage: 0 }), // support Item pagination
      withActiveIds() // support selections of 0...n entity items
    );

    const showPage = (_: number) => this.selectPage.bind(this);
    const isSameData = (x: any, y: any): boolean =>
      x.currentPage === y.currentPage && x.lastPage === y.lastPage && x.perPage === y.perPage && x.total === y.total;

    this.pagination$ = this._store.pipe(
      selectPaginationData(),
      distinctUntilChanged(isSameData),
      map(({ _, ...data }) => {
        const start = data.currentPage ? (data.currentPage - 1) * data.perPage : 0;
        const end = Math.min(start + data.perPage, data.total);
        const { pages, ...pagination } = data; // exclude internal page registry...
        return {
          ...pagination, // PaginationData
          ...{
            start, // extras fields for Pagination
            end,
            showPage,
          },
        };
      }),
      shareReplay({ refCount: true, bufferSize: 1 })
    );
  }

  /**********************************************
   * Store <pagination>  const { pages, ...pagination } = data;  </pagination>
   **********************************************/

  /**
   * Immutable snapshot of current state
   * @returns
   */
  public getState(updateFn?: (draft: T) => void): T {
    const state = this._store.getValue();
    return updateFn ? produce(state, updateFn) : state;
  }

  /**
   * Clear all pages/pagination info, delete entities,
   * and re-init state.
   */
  public override reset() {
    const initState = (s: T) => ({
      ...s,
      ...initStoreState(),
      ...this.initState(),
    });

    emitOnce(() => {
      this._store.update(resetActiveIds(), deleteAllPages(), deleteAllEntities());

      this._store.update(
        initState,
        updatePaginationData({
          total: 0,
          perPage: 0,
          lastPage: 0,
          currentPage: 0,
        }),
        updateRequestStatus(this.storeName, 'initializing')
      );
    });
  }

  /**
   * Select an item as 'active'
   * Remove any other selections if clearAll === true
   */
  public override selectItem(id: string, clearAll = true): void {
    if (!id) return;

    const clearActives = clearAll ? resetActiveIds : () => (s: T) => s;
    const actives = clearAll ? [] : this._store.query(getActiveIds);
    const isActive = actives.indexOf(id) > -1;
    if (!isActive || clearAll) {
      this._store.update(clearActives(), setActiveIds([...actives, id]));
    }
  }

  /**
   * If entity is in-memory, select page associated with target entity
   * @param id
   */
  public selectPageWithItem(id: string): void {
    if (!id) return;

    this.selectItem(id);

    const state = this.getState() as T & { pagination: any };
    const target = findPage(id, state.pagination);
    const found = target > -1;

    if (found && target != state.pagination.currentPage) {
      this.selectPage(target);
    }
  }

  /**
   * Clear all paged item data WITHOUT changes to custom state
   */
  public clearAllPages() {
    emitOnce(() => {
      this._store.update(deleteAllEntities());
      this._store.update(deleteAllPages());

      this._store.update(
        updatePaginationData({
          total: 0,
          perPage: 0,
          lastPage: 0,
          currentPage: 0,
        }),
        updateRequestStatus(this.storeName, 'initializing')
      );
    });
  }

  /**********************************************
   * Pagination Methods
   **********************************************/

  public pageInRange(page: number): boolean {
    const { lastPage, total } = this._store.query(getPaginationData());
    return total < 1 ? false : page > 0 && page <= lastPage;
  }

  public hasPage(page: number): boolean {
    return this._store.query(pageExists(page));
  }

  public selectPage(page: number, clearSelections = true): boolean {
    const found = this.hasPage(page);
    if (found) {
      emitOnce(() => {
        this._store.update(setCurrentPage(page));
        if (clearSelections) this._store.update(resetActiveIds());
      });
    }

    return found;
  }

  /**
   * Add page of items WITHOUT changing active page or pagination information
   */
  public addPage(items: K[], page: number, updatePagination = true) {
    if (items.length) {
      const current: PaginationData = {
        ...this._store.query(getPaginationData()),
      };
      const data = buildPaginationData(this._store, items, page);

      this._store.update(
        upsertEntities(items),
        updatePaginationData(updatePagination ? data : current),
        setPage(
          page,
          items.map((it) => it.id)
        )
      );
    }
  }
}

/**
 * Configure pagination data (if needed) with updates
 *  - if adding and no pages, set first page
 *  - update page size if adding to same page
 *  - update lastPage
 *  - update total count (if 0)
 */
function buildPaginationData(store: Store, items: unknown[], page: number): PaginationData {
  const current: PaginationData = { ...store.query(getPaginationData()) };

  if (items.length > 0) {
    current.currentPage ||= 1;
    current.total ||= items.length;

    if (current.currentPage == page) {
      current.perPage += items.length;
      current.total += items.length;
    }
    if (page > current.lastPage) current.lastPage = page;
  }

  return { ...current };
}

type PageRegistry = Record<string, string[]>;

/**
 * Based on in-memory pages registry, find the associated page for the target rule ID.
 * Return a 1-based value that indicate the associated page; else -1 for not found.
 */
export function findPage(ruleID: string, pagination: any): number {
  let found = -1;

  const pages = pagination.pages as PageRegistry;
  Object.keys(pages).forEach((key: string) => {
    if (pages[key].indexOf(ruleID) > -1) found = parseInt(key, 10);
  });

  return found;
}
