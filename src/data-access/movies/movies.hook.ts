/* eslint-disable @typescript-eslint/no-empty-function */
import { useEffect } from 'react';
import { StoreApi, useStore } from 'zustand';

import { GENRES } from './_tests_/_mocks_/movies.data';

import { MoviesDataService } from './movies.api';
import { buildStore} from './movies.store'
import { MovieViewModel, MovieGenreViewModel } from './movies.model';
import { syncStoreToUrl } from './movies.bookmarks';


 const genres: MovieGenreViewModel = {
  list: GENRES.genres,
  selected: [],
  totalCount: 0,
  isReady: false,
  isLoading: false,
  showSkeleton: true,
  hasError: false,
  status: { value: 'initializing' },
};


// ************************************************************************
// Factory function to inject a API service into the store
// NOTE: private singleton cache. Use `@mindspace-io/react-store` DI instead
// ************************************************************************

let store: StoreApi<MovieViewModel>;
function makeViewModel() {
  if (!store) {
    const api = new MoviesDataService();
    store = buildStore(api);
  }
  return store
}

// ************************************************************************
// ************************************************************************

/**
 * Tuple response from the useMovieFacade hook
 */
export type MovieFacadeResults = [MovieViewModel, MovieGenreViewModel];

/**
 * Hook that returns the MovieViewModel from the singleton facade + reactive store
 * @returns MovieViewModel
 */
export function useMovieFacade(): MovieFacadeResults {
  const vm = useStore(makeViewModel());

  useEffect(() => { 
    const unsubscribe = store.subscribe(syncStoreToUrl);
    return () => unsubscribe();    
   }, []);  // update URL from store

  return [ vm, genres ];
}
