/* eslint-disable @typescript-eslint/no-empty-function */

import { initState, MovieViewModel, MovieGenreViewModel } from './movies.model';
import { PAGES, GENRES } from './_tests_/_mocks_/movies.data';

// ************************************************************************
// Service instances with MOCK data...
// NOTE: Placeholders until Facade + Store are implemented!!
// ************************************************************************

const vm: MovieViewModel = {
  ...initState(),
  searchBy: 'dogs',
  allMovies: PAGES[0].list,
  filteredMovies: PAGES[0].list,
  pagination: PAGES[0].pagination,
  updateFilter: () => {},
  searchMovies: () => {},
  selectGenresById: () => {},
  clearFilter: () => {},
};

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
  return [vm, genres];
}
