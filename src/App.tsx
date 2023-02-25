/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';

import { useMovieFacade } from './data-access';

import { CheckGroup, PaginationBar, MovieCard, HeaderBar, FilterInput } from './components';

function App() {
  const [highlights, highlightGenres] = useState([]);
  const [vm, genres] = useMovieFacade();

  /**
   * Whenever the selected genres change, then clear the highlighted genres.
   */
  useEffect(() => {
    highlightGenres([]);
  }, [genres.selected]);

  return (
    <div className="p-3">
      <HeaderBar searchFor={vm.searchBy} onSearch={(criteria) => vm.searchMovies(criteria)}></HeaderBar>

      <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-8 w-full h-full">
        <div className="sm:col-span-2 lg:col-span-3">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[632px] overflow-y-auto p-1">
            {vm.filteredMovies.map((it) => (
              <MovieCard movie={it} key={it.id} onHover={() => highlightGenres(it.genre_ids)}></MovieCard>
            ))}
          </div>
          <PaginationBar pagination={vm.pagination}></PaginationBar>
        </div>
        <div className="col-span-1">
          <div className="genres px-2 space-y-0 w-full border-dashed border-2 border-[#d3dce6] rounded-xl flex-1 mb-2 -ml-2">
            <FilterInput
              filterBy={vm.filterBy}
              onFilter={(criteria: string) => vm.updateFilter(criteria)}
              onClear={() => vm.updateFilter('')}
            ></FilterInput>
          </div>
          <CheckGroup
            title="Genres"
            list={genres.list}
            selected={genres.selected}
            highlighted={highlights}
            onSelectionChange={(selections: string[]) => vm.selectGenresById(selections)}
          ></CheckGroup>
        </div>
      </div>
    </div>
  );
}

export default App;
