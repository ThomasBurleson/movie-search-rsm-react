![](https://user-images.githubusercontent.com/210413/220787979-7c594623-1902-4c0e-a99c-bea0e06d8981.png)

## Lab 2 - Implement `MoviesFacade.ts`

Implement the Reactive facade `/data-access/movies.facade.ts` using the template below.

First review the API published by MoviesFacade, then:

- Fix implementation of `vm$`
- Finish implementation of `loadMovies()`
- Finish implementation of `updateFilter()`
- Finish implementation of `showPage()`
- Finish implementation of `addComputedState()`
- Finish implementation of `addViewModelAPI()`

---

![](https://user-images.githubusercontent.com/210413/220697616-0559ac4d-2f2b-494f-8c0e-b7305b8eab9d.png)

#### Template `movies.facade.ts`

```ts
import { UnaryFunction, Observable, pipe } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { useFilterByGenre, computeFilteredMovies } from './movies.filters';
import { StatusState, ReactiveList, ReactiveListVM, readFirst } from '../utils';

import { MovieStore } from './movies.store';
import { MoviesDataService, PaginatedMovieResponse } from './movies.api';
import { MovieState, MovieComputedState, MovieGenre, MovieItem, MovieViewModel } from './movies.model';

/**
 * Load movies and cache results for similar future calls.
 *
 * Reactive Architecture:
 *       UI <-> ViewModel <-> Facade <-> Store
 *                                 |-->  DataService
 */
export class MoviesFacade {
  public genres$: Observable<ReactiveListVM<MovieGenre>>;
  public vm$: Observable<MovieViewModel>;
  public status$: Observable<StatusState>;
  public isLoading$: Observable<boolean>;

  private _genre: ReactiveList<MovieGenre>;

  public get snapshot(): MovieViewModel {
    return readFirst(this.vm$);
  }

  constructor(private _store: MovieStore, private _api: MoviesDataService) {
    const state$ = _store.state$;

    this.status$ = _store.status$; // may contain error informatoin
    this.isLoading$ = _store.isLoading$.pipe(tap((busy) => console.log(`isLoading = ${busy}`)));

    // Create a view model that is a combination of the store state + computed values + api
    this.vm$ = state$.pipe(/* Finish here... add computedState and ViewModel API */);
  }

  /**
   * Search movies
   *
   * Use cache to skip remote load
   * Auto-save to cache; based on specified search keys
   * Also smart prefetch next page...
   */
  loadMovies(searchBy: string, page = 1, filterBy = ''): Observable<MovieViewModel> {
    if (!!searchBy) {
      this._store.setLoading(true);

      this._api
        .searchMovies(searchBy, page)
        .pipe(this._store.trackLoadStatus())
        .subscribe((response: PaginatedMovieResponse) => {
          // Finish here...
          // 1) Update store
          // 2) Prefetch next page

          // reset to idle
          this._store.setLoading(false);
        });
    }

    return this.vm$;
  }

  /**
   * Update the filterBy value used to build the `filteredMovies` list
   */
  updateFilter(filterBy?: string): Observable<MovieViewModel> {
    // Finish here...
    // Update store state
    return this.vm$;
  }

  // *******************************************************
  // Pagination Methods
  // *******************************************************

  /**
   * Show movies at page #... load if not in cache already
   * Always try to prefetch next page from 'selected'
   */
  showPage(page = 1): Observable<MovieViewModel> {
    const searchBy = this._store.useQuery((s) => s.searchBy);

    if (this._store.pageInRange(page)) {
      // Finish here...
      // 1) Select page (if available)
      // 2) If in-memory, prefectch next page

      return fromCache ? this.vm$ : this.loadMovies(searchBy, page);
    }

    return this.vm$;
  }

  // *******************************************************
  // Private Methods
  // *******************************************************

  /**
   * Background prefetch for super-fast page navigation rendering
   * NOTE: do not update status for background prefetching
   */
  private prefetchPage(searchBy: string, page: number) {
    if (this._store.pageInRange(page)) {
      const request$ = this._api.searchMovies(searchBy, page);
      request$.subscribe(({ list }: PaginatedMovieResponse) => {
        this._store.addPage(list, page, false);
      });
    }
  }

  /**
   * Add computed property `filteredMovies` to state
   * This property is actually two (2) filters: using filterBy and selected genres
   *
   * NOTE: this returns an rxjs-like 'operator' function; not an observable
   */
  private addComputedState(): UnaryFunction<Observable<MovieState>, Observable<MovieState & MovieComputedState>> {
    // Finish ...
    // 1) compute filteredMovies

    return pipe(
      map((state) => {
        // Finish here...
        // 2) add `filteredMovies` (@see MovieComputedState)
      })
    );
  }

  /**
   * Add the view model proxy API to the state
   * NOTE: this returns an rxjs-like 'operator' function; not an observable
   */
  private addViewModelAPI(): UnaryFunction<Observable<MovieState & MovieComputedState>, Observable<MovieViewModel>> {
    // Finish ...
    // 1) Build public `api` methods
    return pipe(
      map((state) => {
        // Finish here...
        // 2) Add api methods to match MovieViewModel signature
      })
    );
  }
}
```
