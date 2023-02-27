import axios, { AxiosResponse } from 'axios';

import { defer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Pagination } from '../utils';
import { MovieItem, MovieGenre } from './movies.model';

const EMPTY_RESPONSE = { results: [], page: 1, total_pages: 1, total_results: 0 };

/**
 * Replace Angular HttpClient with React + Axios
 * Use `defer()` to create an Observable that waits until a subscription is made before triggers the server call
 */
const parseAxiosData = <T>(response: AxiosResponse<T>): T => response.data;
function getWithAxios<T>(url: string, params?: unknown): Observable<T> {
  const onError = (error) => {
    console.error('Error fetching data from server', error);
    return EMPTY_RESPONSE as T;
  };

  return defer(() => axios.get<T>(url, params).then(parseAxiosData).catch(onError));
}

// Formatted response for business layers
export interface PaginatedMovieResponse {
  list: MovieItem[];
  pagination: Partial<Pagination>;
}

// Response from remote endpoint
export interface RemoteMovieResponse {
  page: number;
  results: MovieItem[];
  total_pages: number;
  total_results: number;
}

const HEADERS_MOVIEDB = {
  'Content-Type': 'application/json;charset=utf-8',
};

/** A trivial data layer service that requests movies from a movie database API */
export class MoviesDataService {
  searchByAuthor(term: string, date: string, author: string) {
    term = `${term}&date=${date}&author=${author}`;
    return this.searchMovies(term, 1);
  }

  searchMovies(query: string, page: number): Observable<PaginatedMovieResponse> {
    const params = { params: { query, page, api_key: '13507fbbed7bd20be8713c10217b44e4' }, headers: HEADERS_MOVIEDB };
    const request$ = getWithAxios<RemoteMovieResponse>('https://api.themoviedb.org/3/search/movie', params);

    return request$.pipe(map(buildResponseFor(page))); // return 'results' + pagination information
  }

  /**
   * List of all movie Genres
   * @returns
   */
  loadGenres(): Observable<MovieGenre[]> {
    const params = { params: { api_key: '13507fbbed7bd20be8713c10217b44e4' }, headers: HEADERS_MOVIEDB };
    const url = 'https://api.themoviedb.org/3/genre/movie/list?api_key=13507fbbed7bd20be8713c10217b44e4&language=en-US';
    const request$ = getWithAxios<RemoteMovieResponse>(url, params);

    return request$.pipe(
      map((response) => response['genres']),
      map((list) => {
        // convert all 'id' values to strings;
        return list.map((it) => ({ ...it, id: String(it.id) }));
      })
    );
  }
}

/**
 * Extract list + pagination info from server response
 */
export function buildResponseFor(page = 1) {
  return function buildPaginatedResponses(data: RemoteMovieResponse): PaginatedMovieResponse {
    const start = (page - 1) * data.results.length;
    const end = Math.min(start + data.results.length, data.total_results);

    const pagination: Pagination = {
      currentPage: page,
      total: data.total_results,
      lastPage: data.total_pages,
      perPage: data.results.length,
      start,
      end,
    } as Pagination;

    return {
      pagination,
      list: data['results'],
    };
  };
}
