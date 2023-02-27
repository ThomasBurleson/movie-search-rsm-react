import { MovieViewModel } from '../movies.model';

// **********************************************************
// Utils to persist paginated state to/from local storage
// **********************************************************

/**
 * Due to pagination complexities, we on persist ONLY the URL-related params.
 *
 * These params are merged with current URL params on page load and
 * then used to requery the API for the specified page of movies.
 */
export const partialize = ({ searchBy, filterBy, pagination }: MovieViewModel) => ({ searchBy, filterBy, page: pagination.currentPage });
export const merge = ({ searchBy, filterBy, page }, currentState) => {
  return {
    ...currentState,
    searchBy,
    filterBy,
    pagination: { ...currentState.pagination, currentPage: page },
  };
};
