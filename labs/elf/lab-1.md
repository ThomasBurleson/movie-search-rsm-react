![](https://user-images.githubusercontent.com/210413/220787979-7c594623-1902-4c0e-a99c-bea0e06d8981.png)

## Lab 1 - Implement Elf `MovieStore.ts`

Implement the Elf store `/data-access/movies.store.ts` using the template below.

- Review the API published by MovieStore
- Fix implementation of `state$`
- Finish implementation of `updateMovies()`
- Finish implementation of `updateFilter()`

---

![](https://user-images.githubusercontent.com/210413/220697616-0559ac4d-2f2b-494f-8c0e-b7305b8eab9d.png)

#### Template `movies.store.ts`

```ts
import { EMPTY, Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

import { emitOnce } from '@ngneat/elf';
import { upsertEntities, deleteAllEntities } from '@ngneat/elf-entities';
import { updateRequestStatus } from '@ngneat/elf-requests';
import { updatePaginationData, setPage, setCurrentPage, selectCurrentPageEntities, deleteAllPages } from '@ngneat/elf-pagination';

import { Pagination, PaginatedStore } from '../utils/rsm';
import { initState, MovieItem, MovieState } from './movies.model';
import { readFirst } from '../utils';

/**
 * Reactive Store for 'movies'
 *
 * Note: `MovieStore` extends `PaginatedStore<MovieState, MovieItem>`
 */
export class MovieStore extends PaginatedStore<MovieState, MovieItem> {
  public movies$: Observable<MovieItem[]>;
  public override state$: Observable<MovieState> = EMPTY;

  constructor() {
    super('movies', initState);

    this.movies$ = ...;
    this.state$ = this._store.pipe(
      withLatestFrom(this.movies$),
      map(([state, allMovies]) => {
        // Finish...
        // return MovieState instance
      })
    );
  }

  /**********************************************
   * Store Methods
   **********************************************/

  /**
   * Set cache and page information for remote search
   */
  updateMovies(movies: MovieItem[], paging: Partial<Pagination>, searchBy?: string, filterBy?: string) {
    const hasSearchBy = searchBy !== undefined && searchBy !== null;
    const clearCache = hasSearchBy ? this._store.query((s) => s.searchBy) !== searchBy : false;
    const updateSearchBy = (state) => {
      return {
        ...state,
        searchBy: hasSearchBy ? searchBy : state.searchBy,
      };
    };

    emitOnce(() => {
      // Finish...
      // 1) Conditionally clear cache
      // 2) Update store
      //    entities,
      //    state (searchBy, filterBy), and
      //    pagination + currentPage
      //    status 'success'
    });
  }

  /**
   * Update 'filterBy' criteria and emit filteredMovies update
   */
  updateFilter(filterBy?: string) {
    // Finish...
    // update state
  }
}

```
