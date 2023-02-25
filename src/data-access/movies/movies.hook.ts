/* eslint-disable @typescript-eslint/no-empty-function */
import { useEffect, useState } from 'react';

import { PAGES, GENRES } from './_tests_/_mocks_/movies.data';
import { initState, MovieViewModel, MovieGenreViewModel } from './movies.model';
import { syncStoreToUrl, syncUrlToStore } from './movies.bookmarks';

// ************************************************************************
// Service instances with MOCK data...
// NOTE: Placeholders until Facade + Store are implemented!!
// ************************************************************************


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

/**
 * Factory to build mock ViewModel
 */
function makeViewModel(): MovieViewModel {
  const showPage = (page: number) => { vm.pagination.currentPage = page };
  let vm = {
    ...initState(),
    searchBy: 'dogs',
    allMovies: PAGES[0].list,
    filteredMovies: PAGES[0].list,
    pagination: { ...PAGES[0].pagination, showPage },
    searchMovies: () => {},
    updateFilter: () => {},
    selectGenresById: () => {},
    clearFilter: () => {},
  };

  /**
   * Special case for app startup
   */
  const searchOnStartup = (searchBy: string, page?:number, filterBy?:string) => {
    filterBy ||= vm.filterBy;
    page ||= vm.pagination.currentPage;
    searchBy ||= vm.searchBy;
    vm = ({ ...vm, searchBy, filterBy, pagination: { ...vm.pagination, currentPage: page } });
  };
  syncUrlToStore({...vm, searchMovies: searchOnStartup}); 

  return vm;
}

/**
 * Enable the updates to the VM to trigger hook re-renders
 * NOTE: only need since we are using mock data INSTEAD of a Reactive Store
 */
function onAPI(vm, setVM): MovieViewModel {
  const searchMovies = (searchBy: string, page?:number, filterBy?:string) => {    
    setVM(vm => {
      filterBy ||= vm.filterBy;
      page ||= vm.pagination.currentPage;

      return ({ ...vm, searchBy, filterBy, pagination: { ...vm.pagination, currentPage: page } })
    });
  };
  const updateFilter = (filterBy: string) => {
    setVM(vm => ({ ...vm, filterBy }));
  }
  const showPage = (page: number) => { setVM( vm => {
    return ({ ...vm, pagination: { ...vm.pagination, currentPage: page } })
  })};
  const pagination = { ...vm.pagination, showPage };

  return {...vm, pagination, searchMovies, updateFilter};
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
  const [vm, setVM] = useState(makeViewModel);
  
  useEffect(() => { syncUrlToStore(vm) }, []);    // update store from URL
  useEffect(() => { syncStoreToUrl(vm) }, [vm]);  // update URL from store

  return [ onAPI(vm, setVM), genres ];
}
