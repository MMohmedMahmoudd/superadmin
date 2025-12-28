import React from 'react';
import { flexRender } from '@tanstack/react-table';
import clsx from 'clsx';
const DataGridTableHeadCell = ({
  header
}) => {
  return <th key={header.id} colSpan={header.colSpan} className={clsx(header.column.columnDef.meta?.className // Simplified className logic
  )}>
      {header.column.columnDef.enableSorting ? <div className={clsx(header.column.getCanSort() ? 'cursor-pointer select-none' : '')} onClick={header.column.getToggleSortingHandler()}>
          <span className={clsx('sort', {
        [`${header.column.getIsSorted()}`]: header.column.getIsSorted()
      })}>
            <span className="sort-label">
              {flexRender(header.column.columnDef.header, header.getContext())}
            </span>
            <span className="sort-icon"></span>
          </span>
        </div> : <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>}
    </th>;
};
export { DataGridTableHeadCell };