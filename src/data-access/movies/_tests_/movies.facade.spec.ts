import { CommonModule } from '@angular/common';
import { async, TestBed } from '@angular/core/testing';
import { getRequestStatus, StatusState } from '@ngneat/elf-requests';

import { MoviesDataService as MockMoviesAPI } from './_mocks_';
import { readFirst, Selector } from '../../utils';

import { MovieStore } from '../movies.store';
import { MovieState } from '../movies.model';
import { MoviesFacade } from '../movies.facade';
import { MoviesDataService } from '../movies.api';

describe('MoviesFacade', () => {
  let store: MovieStore;
  let facade: MoviesFacade;
  let api: MockMoviesAPI;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      providers: [{ provide: MoviesDataService, useClass: MockMoviesAPI }, MoviesFacade, MovieStore],
    });

    api = TestBed.inject(MoviesDataService) as unknown as MockMoviesAPI;
    store = TestBed.inject(MovieStore);
    facade = TestBed.inject(MoviesFacade);
  });

  it('instantiate', () => {
    expect(facade).toBeTruthy();
    expect(facade).toHaveObservables(['vm$', 'status$', 'isLoading$']);
    expect(facade).toHaveMethods(['loadMovies', 'loadGenres', 'updateFilter', 'selectGenresById', 'showPage']);
  });

  it('should auto-load movies for "dogs"', () => {
    expect(facade.vm$).toEmit(4, (s: MovieState) => s.allMovies.length);
    expect(facade.vm$).toEmit(1, (s: MovieState) => s.pagination.currentPage);
  });

  it('should updateFilter and emit value from vm$', () => {
    const filterBy = 'furry';
    facade.updateFilter(filterBy);
    expect(facade.vm$).toEmit(filterBy, (s: MovieState) => s.filterBy);
  });

  describe('loadMovies()', () => {
    const findSearchBy = (s: MovieState): string => s.searchBy;
    const findCurrentPage = (s: MovieState) => s.pagination.currentPage;
    const findNumPages = (s: MovieState): number => Object.keys(s.pagination['pages']).length;
    const findStatus = getRequestStatus('movies') as Selector<StatusState>;
    const status = () => store.useQuery<StatusState>(findStatus).value;

    it('should prefretch next pages with using same "searchBy"', () => {
      const searchBy = readFirst(facade.vm$, findSearchBy);

      facade.loadMovies(searchBy, 2);
      expect(facade.vm$).toEmit(2, findCurrentPage);

      facade.loadMovies(searchBy, 3);
      expect(facade.vm$).toEmit(3, findCurrentPage);

      expect(status()).toBe('idle');
    });

    it('should load more pages with using same "searchBy"', () => {
      const searchBy = readFirst(facade.vm$, findSearchBy);

      facade.loadMovies(searchBy, 2);
      expect(facade.vm$).toEmit(2, findCurrentPage);

      facade.loadMovies(searchBy, 3);
      expect(facade.vm$).toEmit(3, findCurrentPage);
    });

    it('should toggle status to "pending" and "success', () => {
      const changes = [];
      const subscription = facade.status$.subscribe((s) => changes.push(s.value));

      try {
        expect(status()).toBe('idle');

        facade.loadMovies('dogs', 3);

        // Why 4? Existing "idles" + loadMovies() generates 3 more...
        expect(changes).toEqual(['idle', 'pending', 'success', 'idle']);
      } finally {
        subscription.unsubscribe();
      }
    });

    it('should set status = "error" on API issues', () => {
      const orig = api.searchMovies;
      try {
        api.searchMovies = api.searchWithError; // switcheroo for future loadMovies()
        facade.loadMovies('dogs', 3);

        expect(status()).toBe('error');
      } finally {
        api.searchMovies = orig;
      }
    });
  });

  describe('showPage()', () => {
    it('should emit matching "currentPage" from vm$', () => {
      const findSearchBy = (s: MovieState): string => s.searchBy;
      const findCurrentPage = (s: MovieState) => s.pagination.currentPage;
      const searchBy = readFirst(facade.vm$, findSearchBy);

      facade.loadMovies(searchBy, 2);
      expect(facade.vm$).toEmit(2, findCurrentPage);

      facade.showPage(1);
      expect(facade.vm$).toEmit(1, findCurrentPage);

      facade.showPage(3);
      expect(facade.vm$).toEmit(3, findCurrentPage);
    });
  });
});
