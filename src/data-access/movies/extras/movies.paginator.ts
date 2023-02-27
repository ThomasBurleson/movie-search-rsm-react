import { firstValueFrom, Observable } from 'rxjs';

import { DataPaginator, Pagination } from '../../utils';
import { PaginatedMovieResponse } from '../movies.api';
import { MovieState, MovieViewModel, MovieItem } from '../movies.model';

// **************************************************
// Special Pagination
// Factory provides integrations between the DataPaginator, Zustand, and MoviesDataService
// **************************************************

export interface StorePaginator {
  buildPagination: () => Pagination;
  prefetch: (searchBy: string, filterBy: string, page: number) => Promise<boolean>;
  updatePagination: (searchBy: string, filterBy: string, response: PaginatedMovieResponse, reset: boolean) => Promise<boolean>;
}

export type LoadItemsCallback = (searchBy: string, page: number, filterBy: string) => Observable<PaginatedMovieResponse>;

/**
 * Build a PaginatorViewModel that integrates with the store
 *
 *  - With Zustand `get(): MovieViewModel` we can build a PaginatorAPI that
 *    updates the store when the pagination data is updated or pages are changed
 *  - With `set()` we can trigger the store to re-emit updates
 *
 */
export function makeStorePaginator(
  get: () => MovieViewModel, // get store state
  set: (state: MovieState) => void, // update store state
  loadItems: LoadItemsCallback // load
): StorePaginator {
  const paginator: DataPaginator<MovieItem> = new DataPaginator([]);

  /**
   * Hook pagination API to intercept showPage and setPageSize calls
   */
  const buildPagination = (): Pagination => ({
    ...paginator.pagination, // pagination viewmodel
    showPage, // special showPage() interceptor
  });

  /**
   * Background load next page
   */
  const prefetch = async (searchBy: string, filterBy: string, page: number): Promise<boolean> => {
    if (!paginator.hasPage(page) && page <= paginator.total) {
      const request$ = loadItems(searchBy, page, filterBy);
      const response = await firstValueFrom(request$);

      // Only update the paginator, don't trigger store to re-emit
      paginator.upsertPage(page, response.list);
    }
    return true;
  };

  /**
   * Request paginator to show a page and rebuild the pagination
   * then trigger the store to re-emit updates
   */
  const showPage = async (page: number): Promise<boolean> => {
    const hasPage = await paginator.showPage(page);
    const filterBy = ''; // NOTE: clear filterBy when paging
    const { searchBy } = get();

    if (!hasPage) {
      // Load more movies from the server if we don't have the page in-memory
      const request$ = loadItems(searchBy, page, filterBy);
      const response = await firstValueFrom(request$);

      paginator.upsertPage(page, response.list);
      paginator.showPage(page, response.pagination.total);

      prefetch(searchBy, filterBy, page + 1);
    }

    // Force paginator updates + store must re-emit updates
    const pagination = buildPagination();
    const allMovies = paginator.paginatedList;

    // Trigger store to remit
    set({ allMovies, searchBy, filterBy, pagination });

    return Promise.resolve(true);
  };

  /**
   * Update paginator with data from the server API response, rebuild pagination,
   * and trigger store to re-emit updates.
   */
  const updatePagination = async (
    searchBy: string,
    filterBy: string,
    response: PaginatedMovieResponse,
    reset = false
  ): Promise<boolean> => {
    const { currentPage, total: totalAvailable } = response.pagination;

    // Reset the pagination cache if the `searchBy` term has changed
    if (reset) paginator.reset(response.list);
    else paginator.upsertPage(currentPage || 1, response.list);

    paginator.showPage(currentPage || 1, totalAvailable);

    const pagination = buildPagination();
    const allMovies = paginator.paginatedList;

    // Trigger store to remit
    set({ searchBy, filterBy, allMovies, pagination });

    return true;
  };

  return { buildPagination, updatePagination, prefetch };
}
