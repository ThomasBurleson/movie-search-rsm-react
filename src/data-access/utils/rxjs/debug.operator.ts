/* eslint-disable no-restricted-syntax */
import { tap } from 'rxjs/operators';
/**
 * Make customer RxJS operator to easily log colorized output to the console.
 * @see https://netbasal.com/creating-custom-operators-in-rxjs-32f052d69457
 */
export function debugTap(tag: string) {
  return tap({
    next(value) {
      console.debug(`%c[${tag}: Next]`, DEBUG_COLORS[0], value);
    },
    error(error) {
      console.debug(`%[${tag}: Error]`, DEBUG_COLORS[1], error);
    },
    complete() {
      console.debug(`%c[${tag}]: Complete`, DEBUG_COLORS[2]);
    },
  });
}

export const DEBUG_COLORS = [
  'background: #009688; color: #fff; padding: 3px; font-size: 9px;',
  'background: #E91E63; color: #fff; padding: 3px; font-size: 9px;',
  'background: #00BCD4; color: #fff; padding: 3px; font-size: 9px;',
];

export function debug<T extends unknown[]>(context: string, term: string) {
  const color = context === 'cache' ? DEBUG_COLORS[0] : DEBUG_COLORS[1];
  return tap((results: T) => {
    console.log(`%c[${context}(${term}) = ${results.length}]`, color);
  });
}
