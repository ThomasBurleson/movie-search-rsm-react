/* eslint-disable @typescript-eslint/no-empty-function */
import { useEffect } from 'react';
import { StoreApi, useStore } from 'zustand';

import { GENRES } from './_tests_/_mocks_/movies.data';

import { buildStore} from './movies.store'
import { MoviesDataService } from './movies.api';
import { MovieViewModel, MovieGenreViewModel } from './movies.model';
import { syncStoreToUrl, syncUrlToStore } from './extras/movies.bookmarks';


 const genres: MovieGenreViewModel = {
  list: GENRES.genres,
  selected: [],
  totalCount: 0,
  isReady: false,
  isLoading: false,
  showSkeleton: true,
  hasError: false,
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

  return store;
}

/**
 * 1x time initialization of the store based on URL values
 * NOTE: these override any cached local storage values
 */
syncUrlToStore(makeViewModel().getState());

// ************************************************************************
// Store Slice Selectors
// Useful for optimized queries and memoization
// ************************************************************************

type ExtractState<S> = S extends { getState: () => infer T } ? T : never;
export type SliceSelector<T, U> = (state: ExtractState<T>) => U;
const IDENTITY_SELECTOR = (state: MovieViewModel) => state;

export const selectSearchBy = (state: MovieViewModel) => state.searchBy;
export const selectFilterBy = (state: MovieViewModel) => state.filterBy;
export const selectPagination = (state: MovieViewModel) => state.pagination;

export const selectAllMovies = (state: MovieViewModel) => state.allMovies;
export const selectFilteredMovies = (state: MovieViewModel) => state.filteredMovies;


// ************************************************************************
// MovieStore Hook and Results 
// ************************************************************************

/**
 * Tuple response from the useMovieFacade hook
 */
export type MovieFacadeResults<T> = [MovieViewModel | T, MovieGenreViewModel];

/**
 * Hook that returns the MovieViewModel from the singleton facade + reactive store
 * Supports optional state selectors for optimized queries and memoization
 * 
 * @returns MovieViewModel | Slice
 */
export function useMovieFacade<Slice = MovieViewModel>(
  selector?: SliceSelector<StoreApi<MovieViewModel>, Slice>
): MovieFacadeResults<Slice> {
  const fallback = (IDENTITY_SELECTOR as SliceSelector<StoreApi<MovieViewModel>, Slice>);
  const vm = useStore(makeViewModel(), selector || fallback);
  
  useEffect(() => { 
    // Update URL as store state changes
    const unsubscribe = store.subscribe(syncStoreToUrl);
    return () => unsubscribe();    
   }, []);  

  // return entire view model or selected slice
  return [ vm, genres ];
}
