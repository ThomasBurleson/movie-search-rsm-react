![](https://user-images.githubusercontent.com/210413/220787979-7c594623-1902-4c0e-a99c-bea0e06d8981.png)

## Lab 3 - Implement `movies.hook.ts`

Implement the React Hook `/data-access/movies.hook.ts` using the template below.

- Fix factory to instantiate `movieFacade`
- Finish definition of Hook function results `UseMovieFacadeResults`
- Finish implementation of `useMovieFacade()`

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

// eslint-disable-next-line
let movieFacade: MoviesFacade;

const makeFacade = (): MoviesFacade => {
  if (!movieFacade) {
    // Finish
    // 1) Manual construct an instance of MoviesFacade
    //    save as internal singleton
  }

  return movieFacade;
};

/**
 * Tuple response from the useMovieFacade hook
 */
export type UseMovieFacadeResult = [/* Finish (2) */];

/**
 * Hook that returns the MovieViewModel from the singleton facade + reactive store
 * @returns MovieViewModel
 */
export function useMovieFacade(): UseMovieFacadeResult {
  const [facade] = useState(/* Finish (3) build instance*/);
  const [vm] = useObservable<MovieViewModel, unknown>(/* Finish (4)) use facade.vm$ */);

  return [vm];
}
```
