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
    this.vm$ = state$.pipe(this.addComputedState(), this.addViewModelAPI());

    // Genres
    // We manage this directly BECAUSE the movies shown are affected by genre selection
    this._genre = new ReactiveList<MovieGenre>('genres');
    this.genres$ = this._genre.vm$;

    this.loadGenres();
  }

  /**
   * Search movies
   *
   * Use cache to skip remote load
   * Auto-save to cache; based on specified search keys
   * Also smart prefetch next page...
   */
  loadMovies(searchBy: string, page = 1, filterBy = '', updateFirst = false): Observable<MovieViewModel> {
    if (!!searchBy) {
      this._store.setLoading(true);
      if (updateFirst) {
        const pagination = { ...this.snapshot.pagination, currentPage: page };
        this._store.updateMovies([], pagination, searchBy, filterBy);
      }

      this._api
        .searchMovies(searchBy, page)
        .pipe(this._store.trackLoadStatus())
        .subscribe((response: PaginatedMovieResponse) => {
          const { list, pagination } = response;
          this._store.updateMovies(list, pagination, searchBy, filterBy);
          this.prefetchPage(searchBy, page + 1);

          this.autoSelectGenres(list);

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
    this._store.updateFilter(filterBy);
    return this.vm$;
  }

  // *******************************************************
  // Genre features
  // *******************************************************

  selectGenresById(selectedIds: string[], clearOthers = true): Observable<ReactiveListVM<MovieGenre>> {
    this._genre.selectItemsById(selectedIds, clearOthers);
    return this._genre.vm$;
  }

  /**
   * Load list of all movie genres
   * @see `vm.genres` or `store.state$.genres`
   */
  private loadGenres(): void {
    const isReady = this._genre.total > 0;
    if (!isReady) {
      this._api
        .loadGenres()
        .pipe(
          this._genre.trackLoadStatus,
          tap((list: MovieGenre[]) => {
            return this._genre.addItems(list, true);
          })
        )
        .subscribe(() => {
          this.autoSelectGenres(this.snapshot.filteredMovies);
        });
    }
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
      const fromCache = this._store.selectPage(page);

      if (fromCache) {
        const movies = readFirst<MovieItem[]>(this._store.movies$);
        this.autoSelectGenres(movies);

        // Should silently auto load next page?
        if (!this._store.hasPage(page + 1)) {
          this.prefetchPage(searchBy, page + 1);
        }
      }
      return fromCache ? this.vm$ : this.loadMovies(searchBy, page);
    }

    return this.vm$;
  }

  // *******************************************************
  // Private Methods
  // *******************************************************

  /**
   * For all loaded movies, gather ALL associated genres
   * then auto-select those genres
   */
  private autoSelectGenres(movies: MovieItem[]) {
    let allGenreIds: number[] = [];
    movies.forEach((it: MovieItem) => {
      allGenreIds = [...allGenreIds, ...it.genre_ids];
    });
    allGenreIds = [...new Set(allGenreIds)]; // only unique ids; no duplicates

    this._genre.selectItemsById(allGenreIds.map(String), true);
  }

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
    return pipe(
      map((state) => {
        const genres = readFirst<ReactiveListVM<MovieGenre>>(this.genres$);
        const selectedIDs = genres.selected.map((it) => it.id);
        const filteredMovies = computeFilteredMovies(state.allMovies, state.filterBy);
        const filteredByGenre = useFilterByGenre(filteredMovies, selectedIDs);

        return {
          ...state,
          filteredMovies: filteredByGenre,
        };
      })
    );
  }

  /**
   * Add the view model proxy API to the state
   * NOTE: this returns an rxjs-like 'operator' function; not an observable
   */
  private addViewModelAPI(): UnaryFunction<Observable<MovieState & MovieComputedState>, Observable<MovieViewModel>> {
    return pipe(
      map((state) => {
        const api = {
          searchMovies: this.loadMovies.bind(this),
          selectGenresById: this.selectGenresById.bind(this),
          clearFilter: () => this.updateFilter(''),
          updateFilter: this.updateFilter.bind(this),
        };

        // !! Override default showPage with custom functionality to prefetch next page
        state.pagination.showPage = this.showPage.bind(this);

        return {
          ...state,
          ...api,
        };
      })
    );
  }
}
