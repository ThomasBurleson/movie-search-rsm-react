import { useObservable } from '@ngneat/react-rxjs';
import { useEffect, useState } from 'react';

import { syncStoreToUrl, syncUrlToStore } from './movies.bookmarks';
import { MoviesDataService } from './movies.api';
import { MoviesFacade } from './movies.facade';
import { MovieStore } from './movies.store';
import { MovieViewModel, MovieGenreViewModel } from './movies.model';
import { freezeStores } from '../utils';

// !!1x time call to freeze the stores data and enfore immutability
freezeStores();

// eslint-disable-next-line
let movieFacade: MoviesFacade;
const makeFacade = (): MoviesFacade => {
  if (!movieFacade) {
    const store = new MovieStore();
    const api = new MoviesDataService();

    // Save instance and force capture application state from URL
    movieFacade = new MoviesFacade(store, api);
    syncUrlToStore(movieFacade.snapshot);
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
  const [genres] = useObservable<MovieGenreViewModel, unknown>(facade.genres$, { deps: [facade] });
  const [vm] = useObservable<MovieViewModel, unknown>(facade.vm$, { deps: [facade], initialValue: facade.snapshot });

  useEffect(() => { syncUrlToStore(vm) }, []);    // update store from URL
  useEffect(() => { syncStoreToUrl(vm) }, [vm]);  // update URL from store

  return [vm, genres];
}
