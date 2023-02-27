import create from 'zustand/vanilla';
import { StoreApi } from 'zustand/vanilla';
import { devtools, persist } from 'zustand/middleware';

import { immer } from 'zustand/middleware/immer';

import { firstValueFrom, map, pipe } from 'rxjs';
import { MoviesDataService, PaginatedMovieResponse } from './movies.api';
import { initState, MovieAPI, MovieState, MovieViewModel, MovieComputedState } from './movies.model';
import { computeMatchedMovies } from './movies.filters';
import { computeWith } from '../utils/computed';
import { syncUrlToStore } from './movies.bookmarks';

const extractMovieItems = pipe(map((response: PaginatedMovieResponse) => response.list));

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
   * Factory to create a Reactive movie Store
   */
  const buildStoreFn = (set, get, store): MovieViewModel => {
    set = computeWith<MovieViewModel>(buildComputedFn, store);

    const data: MovieState = initState();
    const api: MovieAPI = {
      // Load movies based on searchBy and page
      searchMovies: async (searchBy: string, page = 1, filterBy = ''): Promise<boolean> => {
        if (!!searchBy) {
          const request$ = movieAPI.searchMovies(searchBy, page || 1).pipe(extractMovieItems);
          const allMovies = await firstValueFrom(request$);

          filterBy = filterBy || get().filterBy;
          set({ allMovies, searchBy, filterBy });
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
      selectGenresById: (): void => {
        console.warn('Not implemented yet!');
      },
    };

    // a store view model is both 'data' + 'api' + 'computed props'
    return {
      ...data,
      ...api,
      ...buildComputedFn(data),
    };
  };

  // Return entire MovieViewModel
  const store = create<MovieViewModel>()(
    // prettier-ignore
    devtools(
      persist(
        immer(buildStoreFn), 
        { name: 'movieSearch' }
      ),
      { name: 'movieSearch' }
    )
  );

  // Capture initial URL to update application state
  syncUrlToStore(store.getState());

  return store;
}
