import { readFirst } from '../../rxjs';

import { StoreState } from '../store.model';
import { PaginatedStore, PaginationProps } from '../paginated.store';
import { ListItem, DATA } from './_data_/list-item.data';

jest.useFakeTimers();

const STORE_NAME = 'myStore';
interface MyStoreState extends StoreState {
  user: string;
}

class MyStore extends PaginatedStore<MyStoreState, ListItem> {
  constructor() {
    super(STORE_NAME, () => ({ user: '' }));
  }
}

function getDataAtPage(page: number, numPages = 4) {
  // Populate store with 2 pages of data
  const total = DATA.length;
  const pageSize = Math.ceil(total / numPages);
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);

  return DATA.slice(start, end);
}

describe('PaginatedStore', () => {
  let store: MyStore;
  beforeEach(() => {
    store = new MyStore();
  });

  describe('initialization', () => {
    it('should initialize simple  on `new PaginatedStore()`', () => {
      let store;
      try {
        store = new MyStore();
      } catch (e) {
        console.error(e);
      }
      expect(store).toBeFalsy;
    });

    it('should have API', () => {
      expect(store).toBeTruthy();

      expect(store).toHaveMethods(['selectPage', 'hasPage', 'pageInRange', 'addPage']);
      expect(store).toHaveObservables(['pagination$']);
    });

    it('should initialize with correct state', () => {
      const state = store.useQuery((s) => s);
      const { user } = state;
      expect(user).toBe(''); // Default startup value for the movie search
    });

    it('should have pagination with 0 page', () => {
      const pagination$ = store.pagination$;
      const pagination = readFirst<PaginationProps>(store.pagination$);

      expect(pagination).toBeDefined();
      expect(pagination.currentPage).toBe(0);
      expect(pagination.lastPage).toBe(0);
      expect(pagination.total).toBe(0);
      expect(pagination.perPage).toBe(0);
      expect(pagination.start).toBe(0);
      expect(pagination.end).toBe(0);
      expect(pagination).toHaveMethods(['showPage']);

      const pagination2 = readFirst(pagination$);
      expect(JSON.stringify(pagination)).toEqual(JSON.stringify(pagination2));
    });

    it('should have pagination actions report fail', () => {
      expect(store.selectPage(1)).toBe(false);
      expect(store.selectPage(2)).toBe(false);

      expect(store.hasPage(1)).toBe(false);
      expect(store.hasPage(2)).toBe(false);

      expect(store.pageInRange(1)).toBe(false);
      expect(store.pageInRange(2)).toBe(false);
    });
  });

  describe('pagination', () => {
    const findCurrentPage = (s: PaginationProps) => s.currentPage;

    beforeEach(() => {
      [1, 2].map((page) => {
        store.addPage(getDataAtPage(page), page);
      });
    });

    it('should report pages correctly', () => {
      expect(store.hasPage(1)).toBe(true);
      expect(store.hasPage(2)).toBe(true);
      expect(store.hasPage(3)).toBe(false);
      expect(store.hasPage(4)).toBe(false);

      expect(store.pagination$).toEmit(1, findCurrentPage);

      expect(store.selectPage(2)).toBe(true);
      expect(store.pagination$).toEmit(2, findCurrentPage);
    });

    it('should addPage without changing currentPage', () => {
      expect(store.hasPage(1)).toBe(true);
      expect(store.hasPage(2)).toBe(true);
      expect(store.hasPage(3)).toBe(false);

      expect(store.pagination$).toEmit(1, findCurrentPage);

      store.addPage(getDataAtPage(3), 3);
      expect(store.hasPage(3)).toBe(true);
      expect(store.pagination$).toEmit(1, findCurrentPage);

      store.selectPage(2);
      expect(store.pagination$).toEmit(2, findCurrentPage);

      store.addPage(getDataAtPage(4), 4);
      expect(store.hasPage(4)).toBe(true);
      expect(store.pagination$).toEmit(2, findCurrentPage);
    });

    it('addPage shoud not add page with empty list', () => {
      expect(store.hasPage(1)).toBe(true);
      expect(store.hasPage(2)).toBe(true);
      expect(store.hasPage(3)).toBe(false);

      store.addPage([], 3);
      expect(store.hasPage(3)).toBe(false);
    });

    it('should selectPage correctly', () => {
      expect(store.pagination$).toEmit(1, findCurrentPage);

      expect(store.selectPage(2)).toBe(true);
      expect(store.pagination$).toEmit(2, findCurrentPage);
    });
  });
});
