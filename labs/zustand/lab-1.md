![](https://user-images.githubusercontent.com/210413/220787979-7c594623-1902-4c0e-a99c-bea0e06d8981.png)

## Lab 1 - Implement Zustand `MovieStore.ts`

Implement the Elf store `/data-access/movies.store.ts` using the template below.

- Review the API published by MovieStore
- #1 - Use `initState()` to initialize MovieState
- #2 - Finish implementation of `searchMovies()`
- #3 - Finish implementation of `updateFilter()`
- #4 - Finish implementation of `clearFilter()`
- #5 - Finish publishing the MovieViewModel

---

![](https://user-images.githubusercontent.com/210413/221956123-8e913e37-bd2e-4b75-ae93-23b221b57a5e.png)

#### Template `movies.store.ts`

```ts
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
const selectGenresById = (): void => console.warn('Not implemented yet!');
const buildComputedFn = ({ allMovies, filterBy }: Partial<MovieState>): MovieComputedState => {
  const filteredMovies = computeMatchedMovies({ allMovies, filterBy });
  return { filteredMovies };
};

/**
 * Create an instance of the Zustand store engine
 */
export function buildStore(movieAPI: MoviesDataService): StoreApi<MovieViewModel> {
  /**
   * Factory to create a Reactive movie Store
   */
  const buildStoreFn = (set, get, store): MovieViewModel => {
    set = computeWith<MovieViewModel>(buildComputedFn, store);

    const data: MovieState = // FINISH #1
    const api: MovieAPI = {
      // Load movies based on searchBy and page
      searchMovies: async (searchBy: string, page = 1, filterBy = ''): Promise<boolean> => {
        // Finish #2
        return true;
      },
      // Filter movies and highlight matching text
      updateFilter: (filterBy: string): void => {
        // Finish #3
      },
      // Show all available movies
      clearFilter: (): void => {
        // Finish #4
      },
      selectGenresById: (): void > {},
    };

    // a store view model is both 'data' + 'api' + 'computed props'
    return {
      // Finish #5
    };
  };

  // Return entire MovieViewModel
  const store = create<MovieViewModel>()(
    // prettier-ignore
    immer(buildStoreFn),
    { name: 'movieSearch' }
  );

  return store;
}
```
