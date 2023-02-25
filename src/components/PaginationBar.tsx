import { FC, useState } from 'react';
import { cva } from 'class-variance-authority';

import { Pagination } from '../data-access';

/**
 * Styles to conditional highlight a Pagination button using TailwindCSS
 */
const buttons = cva(['relative inline-flex items-center px-4 py-2 border text-sm font-medium'], {
  variants: {
    selected: {
      true: 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600',
      false: 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
    },
  },
});

export const PaginationBar: FC<{ pagination: Pagination }> = ({ pagination }) => {
  const [pages] = useState([1, 2, 3]);
  const buttonStyles = (page: number): string => {
    const selected = pagination.currentPage === page;
    return buttons({ selected });
  };

  return (
    <div className="bg-white pt-3 flex items-center justify-between border-t border-gray-light border-opacity-80">
      <div className="flex flex-col md:flex-row justify-center items-center md:justify-between space-y-2 md:gap-x-4 w-full">
        <div>
          <p className="text-sm text-gray-700">
            Showing
            <span className="font-medium"> {pagination.start + 1} </span>
            to
            <span className="font-medium"> {pagination.end} </span>
            of
            <span className="font-bold"> {pagination.total} </span>
            results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <>
              <a
                href="#"
                onClick={() => pagination.showPage(pagination.currentPage - 1)}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              {pages.map((v, i) => {
                return (
                  <a className={buttonStyles(i + 1)} href="#" onClick={() => pagination.showPage(i + 1)} key={i + 1}>
                    <p>{` ${i + 1} `}</p>
                  </a>
                );
              })}
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
              </span>
              {pages.map((v, i) => {
                return (
                  <a className={buttonStyles(i + 8)} href="#" onClick={() => pagination.showPage(i + 8)} key={i + 8}>
                    {' '}
                    {i + 8}{' '}
                  </a>
                );
              })}
              <a
                href="#"
                onClick={() => pagination.showPage(pagination.currentPage + 1)}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </>
          </nav>
        </div>
      </div>
    </div>
  );
};
