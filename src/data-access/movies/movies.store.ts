import { EMPTY, Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

import { emitOnce } from '@ngneat/elf';
import { upsertEntities, deleteAllEntities } from '@ngneat/elf-entities';
import { updateRequestStatus } from '@ngneat/elf-requests';
import { updatePaginationData, setPage, setCurrentPage, selectCurrentPageEntities, deleteAllPages } from '@ngneat/elf-pagination';

import { Pagination, PaginatedStore } from '../utils/rsm';
import { initState, MovieItem, MovieState } from './movies.model';
import { readFirst } from '../utils';

const MOVIES = 'movies';

/**
 * Reactive Store for 'movies'
 */
export class MovieStore extends PaginatedStore<MovieState, MovieItem> {
  public movies$: Observable<MovieItem[]>;
  public override state$: Observable<MovieState> = EMPTY;

  constructor() {
    super('movies', initState);

    this.movies$ = this._store.pipe<MovieItem[]>(selectCurrentPageEntities());
    this.state$ = this._store.pipe(
      withLatestFrom(this.movies$),
      map(([state, allMovies]) => {
        return {
          ...state,
          allMovies,
          pagination: readFirst(this.pagination$),
        };
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
      const pagination = { ...readFirst<Pagination>(this.pagination$), ...paging };
      if (clearCache) {
        // If the searchBy criteria changes CLEAR ALL primary caches!
        this._store.update(deleteAllPages());
        this._store.update(deleteAllEntities());
      }
      this._store.update(
        updateSearchBy,
        upsertEntities(movies),
        updateRequestStatus(MOVIES, 'success'),
        updatePaginationData(pagination),
        setPage(
          pagination.currentPage,
          movies.map((it) => it.id)
        ),
        setCurrentPage(paging.currentPage)
      );
      if (!!filterBy) this.updateFilter(filterBy);
    });
  }

  /**
   * Update 'filterBy' criteria and emit filteredMovies update
   */
  updateFilter(filterBy?: string) {
    this._store.update((state) => ({
      ...state,
      filterBy: filterBy || '',
    }));
  }
}
