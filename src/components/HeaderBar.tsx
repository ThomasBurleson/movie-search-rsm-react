import { FC } from 'react';

export const HeaderBar: FC<{ searchFor: string; onSearch: (criteria: string) => void }> = ({ searchFor, onSearch }) => {
  return (
    <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-8 w-full  pb-4">
      <div className="sm:col-span-2 lg:col-span-3 flex flex-row">
        <img src="assets/movie-search.jpg" className="block h-10 mt-6 ml-4" />
        <h1 className="text-3xl font-bold pl-5 mt-8 text-slate-600">Movie Search</h1>
      </div>
      <div className="col-span-1 pr-[20px]">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="shadow-sm">
            <label htmlFor="searchQuery" className="ml-1 block text-sm font-medium text-neutral-700">
              Search for movies with title:
            </label>
            <div className="mt-1 relative flex items-center">
              <input
                type="text"
                id="searchQuery"
                value={searchFor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
                className="p-3 shadow-sm focus:ring-neutral-500 focus:border-neutral-500 block w-full pr-12 sm:text-sm border-neutral-300 bg-emerald-50 rounded-md font-extrabold"
              />
              <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <button
                  type="button"
                  className="inline-flex items-center border border-stone-400/30 rounded px-2 text-sm font-sans font-medium text-neutral-400"
                  onClick={() => onSearch('')}
                  title="Search for Movies"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-search"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
