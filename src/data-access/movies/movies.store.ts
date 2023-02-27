import { createStore } from 'zustand/vanilla';
import { StoreApi } from 'zustand/vanilla';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { firstValueFrom } from 'rxjs';

import { computeWith } from '../utils';
import { MoviesDataService } from './movies.api';
import { partialize, merge } from './extras/movies.persist';
import { computeMatchedMovies } from './extras/movies.computed';
import { makeStorePaginator, LoadItemsCallback } from './extras/movies.paginator';
import { initState, MovieAPI, MovieState, MovieViewModel, MovieComputedState } from './movies.model';

const selectGenresById = () => {
  console.warn('Not implemented yet!');
};

// *************************************************
// Zustand Store Factory
// *************************************************

/**
 * Create an instance of the Zustand store engine
 */
export function buildStore(movieAPI: MoviesDataService): StoreApi<MovieViewModel> {
  // Calculate/build our derived/computed properties
  const buildComputedFn = ({ allMovies, filterBy }: Partial<MovieState>): MovieComputedState => {
    const filteredMovies = computeMatchedMovies({ allMovies, filterBy });
    return { filteredMovies };
  };

  /**
   * Factory to create a Zustand Reactive MovieStore; which emits a MovieViewModel
   */
  const configureMovieStore = (set, get, store): MovieViewModel => {
    set = computeWith<MovieViewModel>(buildComputedFn, store);

    const loadMovies: LoadItemsCallback = movieAPI.searchMovies.bind(movieAPI);
    const paginator = makeStorePaginator(get, set, loadMovies);

    const data: MovieState = initState();
    const computed = buildComputedFn(data);
    const pagination = paginator.buildPagination();
    const api: MovieAPI = {
      // Load movies based on searchBy and page
      searchMovies: async (searchBy: string, page = 1, filterBy = ''): Promise<boolean> => {
        if (!!searchBy) {
          const reset = searchBy !== get().searchBy;
          const request$ = movieAPI.searchMovies(searchBy, page || 1);
          const response = await firstValueFrom(request$);

          paginator.updatePagination(searchBy, filterBy, response, reset);
          paginator.prefetch(searchBy, filterBy, page + 1);
        }
        return true;
      },
      // Filter movies and highlight matching text
      updateFilter: (filterBy: string): void => {
        set({ filterBy });
      },
      // Show all available movies
      clearFilter: (): void => {
        set({ filterBy: '' });
      },
      // Use a special `showPage()` interceptor in order to update store
      showPage: pagination.showPage,
      selectGenresById,
    };

    // Initial Store view model
    return {
      ...data,
      ...api,
      ...computed,
      pagination,
    };
  };

  /**
   * Enable the ReactiveStore for Redux DevTools, and persistence to localStorage,
   * and ensure the ViewModel is immutable using Immer
   */
  const store = createStore<MovieViewModel>()(
    // prettier-ignore
    devtools(
      persist(
        immer(
          configureMovieStore
        ), 
        { name: 'movieSearch', partialize, merge }
      ),
      { name: 'movieSearch' }
    )
  );

  return store;
}
