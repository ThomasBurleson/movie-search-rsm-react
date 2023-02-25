import { PAGINATED_RESPONSE, MOVIEDB_REMOTE_RESPONSE } from './_mocks_';
import { buildResponseFor } from '../movies.api';

describe('MoviesDataService', () => {
  it('should build paginated data', () => {
    const data = buildResponseFor(1)(MOVIEDB_REMOTE_RESPONSE);
    expect({ ...data }).toEqual(PAGINATED_RESPONSE);
  });
});
