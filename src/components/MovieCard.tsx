import { FC } from 'react';
import { MovieItem } from '../data-access';

export const MovieCard: FC<{ movie: MovieItem; onHover: () => void }> = ({ movie, onHover }) => {
  return (
    <div
      className="h-[300px] mx-auto bg-white rounded shadow-lg grid grid-cols-2 ring-1 ring-gray-light hover:bg-lime-200"
      onMouseOver={() => onHover()}
    >
      <div className="relative border-3 border-color m-3 max-w-175">
        <div className="absolute rounded-lg w-full top-[0px] bottom-[5px] bg-neutral-100 -z-1"></div>
        <img
          src={movie.poster_path ? `https://image.tmdb.org/t/p/w200/${movie.poster_path}` : 'assets/no-image.jpg'}
          alt={movie.title}
          className="absolute block object-cover object-top w-full h-full max-h-[270px] rounded-lg border-2 border-neutral-200/50 p-px"
        />
      </div>
      <div className="px-3 py-6 max-h-300">
        <div className="font-bold text-xs mb-2" dangerouslySetInnerHTML={{ __html: movie.title }}></div>
        <p className="text-slate-600 text-xs line-clamp-14" dangerouslySetInnerHTML={{ __html: movie.overview }}></p>
      </div>
    </div>
  );
};
