import { getRequestStatus, StatusState } from '../utils/elf-requests';

import { ReactiveStore } from '../reactive.store';
import { StoreState } from '../store.model';
import { ListItem, DATA } from './_data_/list-item.data';

const STORE_NAME = 'myStore';
interface MyStoreState extends StoreState {
  user: string;
}

class MyStore extends ReactiveStore<MyStoreState, ListItem> {
  constructor() {
    super(STORE_NAME, () => ({ user: '' }));
  }
}

describe('ReactiveStore', () => {
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

      expect(store).toHaveMethods(['updateStatus', 'useQuery', 'setLoading', 'reset']);
      expect(store).toHaveObservables(['status$', 'isLoading$', 'showSkeleton$', 'isReady$']);

      expect(store).not.toHaveObservables(['state$']);
    });

    it('should initialize with correct state', () => {
      const state = store.useQuery((s) => s);
      const { user } = state;
      expect(user).toBe(''); // Default startup value for the movie search
    });
  });

  describe('status', () => {
    const status = () => store.useQuery<StatusState>(getRequestStatus).value;
    const flags = () => store.useQuery<StoreState>((s) => s as StoreState);

    it('should initialize as "idle"', () => {
      expect(status()).toBe('initializing');

      expect(store.isReady$).toEmit(false);

      expect(flags().showSkeleton).toBe(true);
      expect(store.showSkeleton$).toEmit(true);

      expect(flags().isLoading).toBe(false);
      expect(store.isLoading$).toEmit(false);
    });

    it('setLoading() should toggle status between "pending" or "idle"', () => {
      store.setLoading();
      expect(status()).toBe('pending');

      store.setLoading(false);
      expect(status()).toBe('success');
    });
  });

  describe('status$()', () => {
    const status = () => store.useQuery<StatusState>(getRequestStatus).value;

    it('should emit events properly', () => {
      const changes: string[] = [];
      const subscription = store.status$.subscribe((s) => changes.push(s.value));

      type Event = 'success' | 'initializing' | 'pending' | 'error';
      const events: Event[] = ['success', 'error', 'initializing', 'pending', 'success'];

      try {
        expect(status()).toBe('initializing');
        expect(changes).toEqual(['initializing']);

        events.forEach((event) => {
          store.updateStatus(event, event === 'error' ? new Error('test error') : undefined);
        });

        expect(changes).toEqual(['initializing', ...events]);
      } finally {
        subscription.unsubscribe();
      }
    });

    it('setLoading() should toggle status between "pending" or "idle"', () => {
      const changes: string[] = [];
      const subscription = store.status$.subscribe((s) => changes.push(s.value));

      store.setLoading();
      store.setLoading(false);

      expect(changes).toEqual(['initializing', 'pending', 'success']);

      subscription.unsubscribe();
    });
  });

  describe('addItems', () => {
    const findLength = (items: ListItem[]) => items.length;
    it('should append items to existing list', () => {
      store.upsertItems([DATA[0], DATA[1]]);
      expect(store.entities$).toEmit(2, findLength);

      store.upsertItems([DATA[0], DATA[1]]); // add same... should NOT change the list
      expect(store.entities$).toEmit(2, findLength);

      store.upsertItems([DATA[2], DATA[3]]); // add same... should NOT change the list
      expect(store.entities$).toEmit(4, findLength);
    });

    it('should clear existing and then addItems', () => {
      store.upsertItems([DATA[0], DATA[1]]);
      expect(store.entities$).toEmit(2, findLength);

      // Add 2 items to existing list
      store.upsertItems([DATA[2], DATA[3]]);
      expect(store.entities$).toEmit(4, findLength);

      // CLEAR exist items and then add 2 items
      const reset = true;

      store.upsertItems([DATA[4], DATA[5]], reset);
      expect(store.entities$).toEmit(2, findLength);
    });
  });
});
