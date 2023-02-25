import { MovieItem } from './movies.model';

const contentHasMatch = (filterBy: string) => {
  filterBy = filterBy.toLowerCase();
  return ({ title, overview }: MovieItem) => {
    const foundInTitle = title.toLowerCase().indexOf(filterBy) > -1;
    const foundInOverview = overview.toLowerCase().indexOf(filterBy) > -1;

    return !filterBy ? true : foundInTitle || foundInOverview;
  };
};

/**
 * Why are computed properties valuable, calculated on-demand
 * and NOT serialized.
 */
export function computeFilteredMovies(allMovies: MovieItem[], filterBy: string): MovieItem[] {
  const addMatchIndicators = buildMatchIndicator(filterBy);
  const filteredMovies = useFilterBy(allMovies, filterBy);

  return addMatchIndicators(filteredMovies);
}

// Create a filter function
export function useFilterBy(allMovies: MovieItem[], filterBy: string): MovieItem[] {
  const hasMatches = contentHasMatch(filterBy);
  return allMovies.filter(hasMatches).map((m) => ({ ...m }));
}

// Each movie has 0...n associated genres,see if is part of the active genres that should be shown
export function useFilterByGenre(list: MovieItem[], activeGenres: string[]): MovieItem[] {
  const hasMatchingGenre = (it: MovieItem) => {
    const isActiveGenre = (genreId: number) => activeGenres.some((id) => id === genreId.toString());
    return it.genre_ids.some(isActiveGenre);
  };
  return list.filter(hasMatchingGenre);
}
/**
 * For the specified filter, find all matches in all movie overviews
 */
export const buildMatchIndicator =
  (filterBy: string | undefined) =>
  (source: MovieItem[]): MovieItem[] => {
    const matchIn = (s: string) => (filterBy ? s.replace(new RegExp(filterBy, 'gi'), (match) => `<span class='match'>${match}</span>`) : s);

    return source.map((m) => ({
      ...m,
      title: matchIn(m.title),
      overview: matchIn(m.overview),
    }));
  };
