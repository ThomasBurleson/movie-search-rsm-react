import { FC } from 'react';

const isEscapeKey = (event?: React.KeyboardEvent<HTMLInputElement>) => !event || event.keyCode === 27;

export const FilterInput: FC<{ filterBy: string; onFilter: (filterBy: string) => void; onClear: () => void }> = ({
  filterBy,
  onFilter,
  onClear,
}) => {
  const onEscapeToClear = (e: React.KeyboardEvent<HTMLInputElement>) => isEscapeKey(e) && onClear();

  return (
    <form className="block pt-4 pb-4" onSubmit={(e) => e.preventDefault()}>
      <div className="shadow-sm">
        <label htmlFor="inputFilter" className="ml-1 block text-sm font-medium text-neutral-700">
          Filter movies to find:
        </label>
        <div className="mt-1 relative flex items-center">
          <input
            type="text"
            name="inputFilter"
            id="inputFilter"
            value={filterBy}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => onEscapeToClear(e)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFilter(e.target.value)}
            className="p-3 shadow-sm focus:ring-neutral-500 focus:border-neutral-500 block w-full pr-12 sm:text-sm border-neutral-300 bg-emerald-50 rounded-md font-extrabold"
          />
          <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
            <button
              type="button"
              className="inline-flex items-center border border-stone-400/30 rounded px-2 text-sm font-sans font-medium text-neutral-400"
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => onEscapeToClear(e)}
              title="Filter Movies By"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
