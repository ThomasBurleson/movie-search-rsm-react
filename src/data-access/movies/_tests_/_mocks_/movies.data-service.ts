import { Injectable } from '@angular/core';
import { of, Observable, throwError } from 'rxjs';

import { GENRES, PAGES } from './movies.data';
import { PaginatedMovieResponse } from '../../movies.api';
import { MovieGenre } from '../../movies.model';

/** A trivial data layer service that requests movies from a movie database API */
@Injectable()
export class MoviesDataService {
  searchMovies(query: string, page: number): Observable<PaginatedMovieResponse> {
    return page <= PAGES.length ? of(PAGES[page - 1]) : this.searchWithError(query, page);
  }

  searchWithError(query: string, page: number): Observable<never> {
    return throwError(() => new Error(`Invalid movie page requested: ${page}`));
  }

  loadGenres(): Observable<{ genres: MovieGenre[] }> {
    return of(GENRES);
  }
}
