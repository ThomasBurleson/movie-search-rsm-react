import { FC, useCallback } from 'react';
import { cva } from 'class-variance-authority';

/**
 * Styles to conditional highlight a Genre row using TailwindCSS
 */
const rowStyles = cva(['relative flex items-start'], {
  variants: {
    highlighted: {
      true: 'bg-lime-200',
      false: 'hover:bg-lime-200',
    },
  },
});

export interface ListItem {
  id: string;
  name: string;
}
export interface CheckGroupProps {
  onSelectionChange: (selected: string[]) => void;
  title: string;
  highlighted: number[];
  list: ListItem[];
  selected: ListItem[];
}

export const CheckGroup: FC<CheckGroupProps> = ({ title, list, selected, highlighted, onSelectionChange }) => {
  const isSelected = useCallback(
    ({ id }: ListItem) => {
      return !!selected.find((it) => it.id === id);
    },
    [selected]
  );
  const onToggleSelect = useCallback((item: ListItem) => {
    const selectedIds = selected.map((it) => it.id);
    const checked = !(selectedIds.indexOf(item.id) > -1);
    const selections = checked ? [...selectedIds, item.id] : selectedIds.filter((current: string) => current !== item.id);

    onSelectionChange(selections);
  }, []);
  const rowHover = (target: ListItem) => {
    const showHighlight = (item: ListItem) => !!highlighted?.find((id) => parseInt(item.id) == id);
    return rowStyles({ highlighted: showHighlight(target) });
  };

  return (
    <div className="genres px-2 space-y-1 w-full border-dashed border-2 border-[#d3dce6] rounded-xl flex-1 pt-5 pb-8 -ml-2">
      <div className="flex-shrink-0 flex items-center px-4 mt-3">
        <a href="#">
          <img className="block h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-mark.svg?color=gray&shade=600" alt="Workflow" />
        </a>
        <h1 className="text-lg font-bold px-3">{title}</h1>
      </div>
      <nav aria-label="Genres" className="mt-5 pt-5">
        <div className="px-2 space-y-1">
          {list.map((item) => (
            <div key={item.id} className={rowHover(item)} onChange={() => onToggleSelect(item)}>
              <div className="flex items-center h-5 px-4 select-none">
                <input
                  id={item.id}
                  type="checkbox"
                  checked={isSelected(item)}
                  onChange={() => onToggleSelect(item)}
                  className="focus:ring-slate-400 h-4 w-4 text-slate-400 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm select-none">
                <label htmlFor="item.id" className="font-medium text-gray-700">
                  {item.name}
                </label>
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};
