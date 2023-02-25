import { Subscription } from 'rxjs';
import { ReactiveList, ReactiveListVM } from '../reactive-list';
import { ListItem, DATA } from './_data_/list-item.data';

jest.useFakeTimers();

describe('ReactiveList<ListItem>', () => {
  const findList = (vm: ReactiveListVM<ListItem>) => vm.list;
  const findSelected = (vm: ReactiveListVM<ListItem>) => vm.selected;
  const findListLength = (vm: ReactiveListVM<ListItem>) => findList(vm).length;
  const findTotalCount = (vm: ReactiveListVM<ListItem>) => vm.totalCount;
  const findSelectedLength = (vm: ReactiveListVM<ListItem>) => findSelected(vm).length;
  const findStatusValue = (vm: ReactiveListVM<ListItem>) => vm.status.value;

  let vmChanges: string[] = [];
  let selectable: ReactiveList<ListItem>;
  let subscription: Subscription;

  beforeEach(() => {
    selectable = new ReactiveList<ListItem>('genres');

    vmChanges = [];
    subscription = selectable.vm$.subscribe((s) => vmChanges.push(s.status.value));
  });

  afterEach(() => {
    subscription.unsubscribe();
  });

  describe('initialization', () => {
    it('should have public properties', () => {
      expect(selectable).toBeTruthy();
      expect(selectable).toHaveProperty('trackLoadStatus');
      expect(selectable).toHaveObservables(['list$', 'selected$', 'status$', 'vm$']);
      expect(selectable).toHaveMethods(['addItems', 'selectItems', 'selectItemsById', 'selectAll']);
      expect(selectable).toHaveMethods(['updateStatus', 'setLoading']);

      expect(selectable.list$).toEmit([]);
      expect(selectable.selected$).toEmit([]);
      expect(selectable.status$).toEmit({ value: 'initializing' });

      expect(selectable.vm$).toEmit([], findList);
      expect(selectable.vm$).toEmit([], findSelected);
      expect(selectable.vm$).toEmit('initializing', findStatusValue);
    });
  });

  describe('vm$', () => {
    it('emit initial state', () => {
      expect(selectable.vm$).toEmit([], findList);
      expect(selectable.vm$).toEmit([], findSelected);
      expect(selectable.vm$).toEmit('initializing', findStatusValue);
      expect(selectable.vm$).toEmit(0, findTotalCount);

      expect(selectable.vm$).toEmit(false, (s) => s.isReady);
      expect(selectable.vm$).toEmit(false, (s) => s.isLoading);
      expect(selectable.vm$).toEmit(true, (s) => s.showSkeleton);
      expect(selectable.vm$).toEmit(false, (s) => s.hasError);

      expect(vmChanges).toEqual(['initializing']);
    });
  });

  describe('status', () => {
    it('should update after setLoading()', () => {
      expect(selectable.vm$).toEmit('initializing', findStatusValue);

      selectable.setLoading(true);
      expect(selectable.vm$).toEmit('pending', findStatusValue);

      selectable.setLoading(false);
      expect(selectable.vm$).toEmit('success', findStatusValue);
    });

    it('should be "success" after addItems()', () => {
      selectable.setLoading(true);

      selectable.addItems([DATA[0], DATA[1]]);
      expect(selectable.vm$).toEmit('success', findStatusValue);

      selectable.setLoading(false);
      expect(selectable.vm$).toEmit('success', findStatusValue);
    });
  });

  describe('addItems', () => {
    it('should addItems and emit total items', () => {
      selectable.addItems([DATA[0], DATA[1]]);
      expect(selectable.vm$).toEmit(2, findListLength);

      selectable.addItems([DATA[0], DATA[1]]); // add same... should NOT change the list
      expect(selectable.vm$).toEmit(2, findListLength);

      selectable.addItems([DATA[2], DATA[3]]); // add same... should NOT change the list
      expect(selectable.vm$).toEmit(4, findListLength);

      expect(selectable.vm$).toEmit(0, findSelectedLength);
    });

    it('should clear existing and then addItems', () => {
      selectable.addItems([DATA[0], DATA[1]]);
      expect(selectable.vm$).toEmit(2, findListLength);

      // Add 2 items to existing list
      selectable.addItems([DATA[2], DATA[3]]);
      expect(selectable.vm$).toEmit(4, findListLength);

      // CLEAR exist items and then add 2 items
      const reset = true;

      selectable.addItems([DATA[4], DATA[5]], reset);
      expect(selectable.vm$).toEmit(2, findListLength);
      expect(selectable.vm$).toEmit(2, findTotalCount);

      expect(vmChanges.length).toEqual(4); // includes initialization emission
    });

    it('should support adding ZERO items and isReady = true', () => {
      // Add 2 items to existing list
      selectable.addItems([], true);

      expect(selectable.vm$).toEmit(0, findListLength);
      expect(selectable.vm$).toEmit('success', findStatusValue);
      expect(vmChanges.length).toEqual(2); // includes initialization emission
    });

    it('should use totalCount override when addIteming items', () => {
      // Add 2 items
      selectable.addItems([DATA[1], DATA[2], DATA[3]]);
      expect(selectable.vm$).toEmit(3, findListLength);

      const reset = true;
      // CLEAR exist items and then add 2 items AND override totalCount
      selectable.addItems([DATA[4], DATA[5]], reset, 159);
      expect(selectable.vm$).toEmit(159, findTotalCount);
      expect(selectable.vm$).toEmit(2, findListLength);
    });

    it('should list the items added', () => {
      const findItemIds = (vm: ReactiveListVM<ListItem>) => findList(vm).map((item) => item.id);
      // Add 2 items
      selectable.addItems([DATA[1], DATA[2], DATA[3], DATA[4]]);
      expect(selectable.vm$).toEmit(4, findListLength);
      expect(selectable.vm$).toEmit(['12', '16', '35', '80'], findItemIds);

      const reset = true;
      // CLEAR exist items and then add 2 items AND override totalCount
      selectable.addItems([DATA[4], DATA[5]], reset, 159);
      expect(selectable.vm$).toEmit(159, findTotalCount);
      expect(selectable.vm$).toEmit(2, findListLength);
      expect(selectable.vm$).toEmit(['80', '99'], findItemIds);
    });
  });

  describe('selections', () => {
    beforeEach(() => {
      selectable.addItems(DATA.slice(0, 4));
    });

    it('selectItems() merge items and emit total selected items', () => {
      expect(selectable.vm$).toEmit(0, findSelectedLength);

      selectable.selectItems([DATA[1], DATA[3]]);
      expect(selectable.vm$).toEmit(2, findSelectedLength);

      selectable.selectItems([DATA[2]]);
      expect(selectable.vm$).toEmit(3, findSelectedLength);

      selectable.selectItems([DATA[2]]);
      expect(selectable.vm$).toEmit(3, findSelectedLength);
    });

    it('selectItems() should clear existing and select only new items', () => {
      expect(selectable.vm$).toEmit(0, findSelectedLength);

      selectable.selectItems([DATA[1], DATA[3]]);
      expect(selectable.vm$).toEmit(2, findSelectedLength);

      // Clear current selection and THEN select the specified items
      selectable.selectItems([DATA[2]], true);
      expect(selectable.vm$).toEmit(1, findSelectedLength);

      selectable.selectItems([DATA[1]]);
      expect(selectable.vm$).toEmit(2, findSelectedLength);
    });

    it('selectAll() should select or deselect all items', () => {
      selectable.addItems(DATA, true);

      expect(selectable.vm$).toEmit(DATA.length, findListLength);
      expect(selectable.vm$).toEmit(0, findSelectedLength);

      selectable.selectAll();
      expect(selectable.vm$).toEmit(DATA.length, findSelectedLength);

      selectable.selectAll(false);
      expect(selectable.vm$).toEmit(0, findSelectedLength);
    });
  });

  describe('setLoading', () => {
    it('should toggle status between `success` and `pending`', () => {
      expect(selectable.vm$).toEmit('initializing', findStatusValue);

      selectable.setLoading(true);
      expect(selectable.vm$).toEmit('pending', findStatusValue);

      selectable.addItems(DATA, true);
      expect(selectable.vm$).toEmit('success', findStatusValue);

      selectable.setLoading(true);
      expect(selectable.vm$).toEmit('pending', findStatusValue);

      selectable.setLoading(false);
      expect(selectable.vm$).toEmit('success', findStatusValue);
    });
  });
});
