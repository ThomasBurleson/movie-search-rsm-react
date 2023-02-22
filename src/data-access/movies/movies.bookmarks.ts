/* eslint-disable @typescript-eslint/no-explicit-any */
import { MovieViewModel } from './movies.model';

/**
 * What are the possbile URL query params?
 */
const MOVIE_URL_PARAMS = ['searchBy', 'filterBy', 'page'];

// ************************************************
// Query Param Utils
// ************************************************

function toKeyVals(searchParams: any, allowedKeys?: string[]) {
  const params: Record<string, any> = {};
  searchParams.forEach((val: string, key: string) => {
    const isAllowed = !allowedKeys || allowedKeys.includes(key);
    if (isAllowed && !!val) params[key] = val;
  });

  return params;
}

/**
 * Which params in the URL should be used to update the AppStore?
 */
export function extractQueryParams(location: Location & { state?: any }): Record<string, any> {
  const { search } = location;
  const searchParams = new URLSearchParams(search || '');
  const queryParams = toKeyVals(searchParams, MOVIE_URL_PARAMS);

  const { page } = queryParams;
  // Coerce non-string values to appropriate types.
  if (page) queryParams['page'] = parseInt(page, 10);

  return queryParams;
}

/**
 * Which keys in the store should be shown on the URL?
 */
export function buildQueryParams(storeParams: Record<string, any>, urlParams: URLSearchParams): Record<string, any> {
  // Scan all allowed fields for valid values
  // NOTE: if undefined store value, then remove from URL
  MOVIE_URL_PARAMS.forEach((k: string) => {
    const value = k !== 'page' ? storeParams[k] : storeParams['pagination']['currentPage'];

    if (value) urlParams.set(k, value);
    else urlParams.delete(k);
  });

  return urlParams;
}

// **********************************************************
// Bookmark utils for bidi synchronization of URL to Store
// **********************************************************

/**
 * Gather current values in the store and reflect those
 * to show on the URL for bookmarking
 */
export function syncStoreToUrl(vm: MovieViewModel): MovieViewModel {
  const { history, location } = window;
  if (history && location) {
    const { search, origin, pathname } = location;

    const searchParams = new URLSearchParams(search);
    const urlParams = buildQueryParams(vm, searchParams);
    const newUrl = `${origin}${pathname}?${urlParams.toString()}`;

    // update the bookmark (replace so back arrow will not change state)
    history.replaceState({ path: newUrl }, '', newUrl);
  }
  return vm;
}

/**
 * Using the History location object, gather expected query params
 * and update the Store state
 *
 * NOTE: do as the 'store' is being initialized/created
 */
export function syncUrlToStore(vm: MovieViewModel): MovieViewModel {
  if (window?.location) {
    let { searchBy, filterBy, page } = extractQueryParams(window.location);

    searchBy ||= vm.searchBy || 'dogs';
    filterBy ||= vm.filterBy;
    page ||= vm.pagination.currentPage || 1;

    vm.searchMovies(searchBy, page, filterBy, true);
  }
  return vm;
}
