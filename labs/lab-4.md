![](https://user-images.githubusercontent.com/210413/220787979-7c594623-1902-4c0e-a99c-bea0e06d8981.png)

## Lab 4 - Enforce Immutable Data in Stores

Use the Elf feature to freeze all Store data and enforce data emitted in MovieViewModel is immutable.
Let's update the `/data-access/movies.hook.ts` using the template below.

- Use `freezeStores()` in the hook initialization

---

![](https://user-images.githubusercontent.com/210413/220697616-0559ac4d-2f2b-494f-8c0e-b7305b8eab9d.png)

#### Template `movies.hook.ts`

```ts
import { useObservable } from '@ngneat/react-rxjs';
import { useState } from 'react';

import { MoviesDataService } from './movies.api';
import { MoviesFacade } from './movies.facade';
import { MovieStore } from './movies.store';
import { MovieViewModel, MovieGenreViewModel } from './movies.model';
import /* Finish (1) ... */ '../utils';

// Finish ...
// 2) Use `freezeStores()` here

// eslint-disable-next-line
let movieFacade: MoviesFacade;

const makeFacade = (): MoviesFacade => {
  if (!movieFacade) {
    const store = new MovieStore();
    const api = new MoviesDataService();

    movieFacade = new MoviesFacade(store, api);
  }

  return movieFacade;
};

/**
 * Tuple response from the useMovieFacade hook
 */
export type MovieFacadeResults = [MovieViewModel, MovieGenreViewModel];

/**
 * Hook that returns the MovieViewModel from the singleton facade + reactive store
 * @returns MovieViewModel
 */
export function useMovieFacade(): MovieFacadeResults {
  const [facade] = useState(makeFacade());
  const [vm] = useObservable<MovieViewModel, unknown>(facade.vm$, { deps: [facade], initialValue: facade.snapshot });
  const [genres] = useObservable<MovieGenreViewModel, unknown>(facade.genres$, { deps: [facade] });

  return [vm, genres];
}
```
