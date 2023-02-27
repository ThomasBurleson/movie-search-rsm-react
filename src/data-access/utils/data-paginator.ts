export const PAGE_SIZE = 20;

export interface Entity {
  id: string;
}
type EntityMap<T extends Entity> = { [id: string]: T };
type IdentityMap = { [page: number]: string[] };

export interface PaginatorData<T extends Entity> {
  paginatedList: T[];
  perPage: number;
  total: number; // total number of items in the FULL dataset
  lastPage: number;
  currentPage: number;
  start: number;
  end: number;
}

export interface Pagination extends PaginatorData<Entity> {
  showPage: (page: number) => Promise<boolean>;
  setPageSize: (numRowsPerPage: number) => void;
}

/**
 * Easily add in-memory Pagination features to a dataset.
 * This wrapper will internally manage pagination settings
 * and publish result page-set of data.
 *
 * @Sample:
 *
 *  // Do not use inside state management/reducers where
 *  // only 'objects' are expected during mutation
 *
 *  const paginator = new DataPaginator<PersonSummary>();
 *
 *  // Later when processing actions:
 *
 *  paginator.goToPage((action as NavigateToPage).page);
 *  const { lastPage, currentPage, paginatedList, perPage } = paginator;
 *
 *  state = {
 *    ...state,
 *    paginator: {
 *     paginatedList,
 *      currentPage,
 *      lastPage,
 *      perPage
 *    }
 *  };
 */

export class DataPaginator<T extends Entity> {
  private _rawList: T[] = [];
  private _entities: EntityMap<T> = {};
  private _pages: IdentityMap = {};
  private _total = 0;

  /**
   * Pagination ViewModel (read-only data + API)
   */
  get pagination(): Pagination {
    return {
      setPageSize: this.setPageSize.bind(this),
      showPage: this.showPage.bind(this),
      total: this.total,
      perPage: this.perPage,
      lastPage: this.lastPage,
      currentPage: this.currentPage,
      start: this.total ? this.perPage * this.currentPage - this.perPage : 0,
      end: this.perPage * this.currentPage,
      paginatedList: this.paginatedList,
    };
  }

  set total(val: number) {
    this._total = val;
  }
  get total(): number {
    return this._total || this._rawList.length;
  }

  /**
   * Read-only accessor
   */
  get lastPage(): number {
    return this.total ? Object.keys(this._pages).length : 0;
  }

  /**
   * Read-only accessor to 1-based page marker
   */
  get currentPage(): number {
    return this._currentPage;
  }

  get paginatedList(): T[] {
    return this.itemsForPage(this.currentPage);
  }

  /**
   * Always return immutable list
   */
  get rawList(): T[] {
    return [...this._rawList];
  }

  get perPage(): number {
    return this._perPage;
  }

  set perPage(val: number) {
    if (val !== this._perPage) {
      this._currentPage = 1;
      this._perPage = Math.max(0, Math.round(val));

      this.goToPage(1);
    }
  }

  /**
   * Construct with rawList and options
   */
  constructor(list: T[] = [], private _perPage: number = PAGE_SIZE, private _currentPage: number = 1) {
    this._perPage = Math.max(1, Math.round(this._perPage));

    this.upsertPage(this._currentPage, list);
    this.goToPage(_currentPage);
  }

  /**
   * Quickly reset the Paginator data
   */
  reset(source: T[] = []) {
    this._rawList = source;
    this._pages = {};
    this._entities = {};

    this.goToPage(1);
  }
  /**
   * Is data already in-memory
   */
  hasPage(page: number): boolean {
    return !!this._pages[page];
  }

  /**
   * Add items to full list, ensure no duplicates
   * create/update pageset, and return the items for the page
   *
   * @param page 1-based page number
   * @param list T[]
   * @returns T[]
   */
  upsertPage(page: number, list: T[]): T[] {
    const pageIDs: string[] = getEntityIds(list);
    if (pageIDs.length) {
      // To upsert, you must have 1..n items
      this._pages[page] = pageIDs;
    }

    const [allItems] = mergeEntityArrays(this._rawList, list);
    this._rawList = allItems;
    this._entities = arrayToEntities(allItems);

    return this.itemsForPage(page);
  }

  /**
   * While `gotoPage()` has fallback to closest page,
   * `showPage()` will not navigate to a page that is out-of-bounds.
   *
   */
  async showPage(page: number, totalAvailable?: number): Promise<boolean> {
    if (!!totalAvailable) this.total = totalAvailable;

    return !!this.goToPage(page);
  }

  /**
   * External users use 1-based values,
   * internal usages maintain 0-based values
   */
  goToPage(page: number): T[] {
    if (this.hasPage(page)) {
      this._currentPage = page;
    }
    return this.hasPage(page) ? this.paginatedList : null;
  }

  /**
   * Needed for the 'Paginator' API
   */
  setPageSize(numRowsPerPage: number) {
    this.perPage = numRowsPerPage || PAGE_SIZE;
  }

  /**
   * Builds a list of paged items in the order listed in the page IDs
   */
  private itemsForPage(page: number): T[] {
    const ids = this._pages[page];
    return ids ? ids.map((id) => this._entities[id]) : [];
  }
}

// ****************************************************************
// Entity Utils
// ****************************************************************

function getEntityIds<T extends Entity>(source: T[]): string[] {
  return source.map((item) => item.id);
}

function arrayToEntities<T extends Entity>(source: T[]): EntityMap<T> {
  return source.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}

/**
 * With two arrays of Entity objects: `existing`: T[] and `incoming`: T[]
 *
 *  merge these two arrays, and
 *  merge duplicate objects, and
 *    `incoming` properties will ‘override’ `existing`
 *    is duplicate if `existing.id === incoming.id`
 *  ensure no duplicates in final T[]
 */

function mergeEntityArrays<T extends Entity>(existing: T[], incoming: T[]): [T[], string[]] {
  const ids: string[] = getEntityIds(existing);
  const entities = arrayToEntities(existing);

  incoming.forEach((it) => {
    const idx = ids.indexOf(it.id);
    const alreadyExists = idx > -1;
    if (!alreadyExists) ids.push(it.id);

    entities[it.id] = alreadyExists ? { ...entities[it.id], ...it } : it;
  });

  return [ids.map((id) => entities[id]), ids];
}
