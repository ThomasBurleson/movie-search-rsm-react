import { Pagination, ReactiveListVM } from '../utils';

export interface MovieItem extends Record<string, unknown> {
  id: string;
  title: string;
  overview: string;
  poster_path: string;
  genre_ids: number[];
}

export interface MovieGenre {
  id: string;
  name: string;
}

export type MovieGenreViewModel = ReactiveListVM<MovieGenre>;

/**
 * Uniquely identify Movie in *ngFor loops
 */
export const trackByID = (m: MovieItem) => m.poster_path;

/**
 * This state is serializable
 */
export interface MovieState {
  searchBy: string;
  filterBy: string;
  allMovies: MovieItem[];
  pagination: Pagination;
}

/**
 * This is runtime 'extra' view model state
 * that includes 'filteredMovies' since we do not
 * want that serialized.
 */
export interface MovieComputedState {
  filteredMovies: MovieItem[];
}

export interface MovieGenreState {
  genres: ReactiveListVM<MovieGenre>;
}

/**********************************************
 * ViewModel published to UI layers (from Facade)
 **********************************************/

/**
 * This is a simple API meant for use within the
 * UI layer html templates
 */
export interface MovieAPI {
  updateFilter: (filterBy: string) => void;
  searchMovies: (searchBy: string, page?: number, filterBy?: string) => void;
  selectGenresById: (selectedIDs: string[]) => void;
  clearFilter: () => void;
}

export type MovieViewModel = MovieState & MovieComputedState & MovieAPI;

/**********************************************
 * State Initialization
 **********************************************/

export function initState(): MovieState {
  return {
    searchBy: '',
    filterBy: '',
    allMovies: [],
    pagination: {} as Pagination,
  };
}
