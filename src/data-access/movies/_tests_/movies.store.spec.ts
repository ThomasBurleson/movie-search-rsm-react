import { PaginatedMovieResponse } from './../movies.api';
import { first } from 'rxjs/operators';
import { getRequestStatus, StatusState } from '@ngneat/elf-requests';

import { readFirst, Selector } from '../../utils';
import { PAGES, MoviesDataService } from './_mocks_';

import { MovieStore, MovieState } from '..';

jest.useFakeTimers();

describe('MovieStore', () => {
  let store: MovieStore;
  beforeEach(() => {
    store = new MovieStore();
  });

  describe('initialization', () => {
    it('should have API', () => {
      expect(store).toBeTruthy();
      expect(store).toHaveObservables(['state$', 'status$']);
      expect(store).toHaveMethods(['updateMovies', 'updateFilter']);
    });

    it('should initialize with correct state', () => {
      const state = store.useQuery((s) => s);
      const { searchBy, filterBy, allMovies } = state;

      expect(searchBy).toBe('dogs'); // Default startup value for the movie search
      expect(filterBy).toBe('');
      expect(allMovies).toEqual([]);

      // Do the emitted stream values match the snapshot values?
      const state$ = store.state$.pipe(first());
      state$.subscribe((s: MovieState) => {
        expect(s.searchBy).toEqual(searchBy);
        expect(s.filterBy).toBe(filterBy);
        expect(s.allMovies).toEqual(allMovies);
      });
    });
  });

  describe('updateMovides', () => {
    const findStatus = getRequestStatus('movies') as Selector<StatusState>;
    const status = () => store.useQuery<StatusState>(findStatus).value;
    const api = new MoviesDataService();

    it('should update search and allMovies', () => {
      const findSearchCriteria = (s: MovieState) => s.searchBy;
      const findNumMoviesShown = (s: MovieState) => s.allMovies.length;
      const findNumMoviesAvailable = (s: MovieState) => s.pagination.total;
      const findCurrentPage = (s: MovieState) => s.pagination.currentPage;

      const page1 = PAGES[0];
      const page2 = PAGES[1];

      expect(page2.pagination.currentPage).not.toBe(page1.pagination.currentPage);

      // Add 1st page
      store.updateMovies(page1.list, page1.pagination, 'canine');

      expect(store.state$).toEmit('canine', findSearchCriteria);
      expect(store.state$).toEmit(page1.list.length, findNumMoviesShown);
      expect(store.state$).toEmit(page1.pagination.total, findNumMoviesAvailable);
      expect(store.state$).toEmit(page1.pagination.currentPage, findCurrentPage);

      // Add 2nd page
      store.setLoading();
      store.updateMovies(page2.list, page2.pagination, 'canine');

      expect(store.state$).toEmit('canine', findSearchCriteria);
      expect(store.state$).toEmit(page2.list.length, findNumMoviesShown);
      expect(store.state$).toEmit(page2.pagination.total, findNumMoviesAvailable);
      expect(store.state$).toEmit(page2.pagination.currentPage, findCurrentPage);

      expect(store.hasPage(2)).toBe(true);
      expect(store.hasPage(3)).toBe(false);

      // Adding page auto-selects that page
      // Expect currentPage to be emitted as #2
      expect(store.state$).toEmit(2, findCurrentPage);
    });

    it('should clear all pages when the search criteria changes', () => {
      const findCurrentPage = (s: MovieState) => s.pagination.currentPage;
      const findSearchCriteria = (s: MovieState) => s.searchBy;

      [0, 1].map((i) => store.updateMovies(PAGES[i].list, PAGES[i].pagination, 'dogs'));
      expect(store.useQuery(findSearchCriteria)).toBe('dogs');
      expect(store.state$).toEmit(2, findCurrentPage);
      expect(store.hasPage(1)).toBe(true);
      expect(store.hasPage(2)).toBe(true);

      // Add movies with NEW search criteria
      store.updateMovies(PAGES[0].list, PAGES[0].pagination, 'snakes');

      expect(store.useQuery(findSearchCriteria)).toBe('snakes');
      expect(store.state$).toEmit(1, findCurrentPage);
      expect(store.hasPage(1)).toBe(true);
      expect(store.hasPage(2)).toBe(false);
    });

    it('should set status == "success"', () => {
      const { pagination, list } = readFirst<PaginatedMovieResponse>(api.searchMovies('dogs', 1));

      store.setLoading();
      expect(status()).toBe('pending');

      store.updateMovies(list, pagination);
      expect(status()).toBe('success');
    });

    it('trackLoadStatus() should set status == "error" for API fails', () => {
      store.setLoading();
      expect(status()).toBe('pending');

      const request$ = api.searchWithError('dogs', 1).pipe(store.trackLoadStatus());

      readFirst(request$);
      expect(status()).toBe('error');
    });
  });

  it('filterBy', () => {
    const selectFilterBy = (s: MovieState) => s.filterBy;
    expect(store.useQuery(selectFilterBy)).toBe('');

    const filterBy = 'siberian';
    store.updateFilter(filterBy);
    expect(store.useQuery(selectFilterBy)).toBe('siberian');
    expect(store.state$).toEmit(filterBy, selectFilterBy);

    store.reset();
    expect(store.useQuery(selectFilterBy)).toBe('');
    expect(store.state$).toEmit('', selectFilterBy);
  });
});
