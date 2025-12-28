/* eslint-disable react/prop-types */

 
import { DataGridPagination, useDataGrid } from '..';
const DataGridToolbar = () => {
  const {
    table,
    props
  } = useDataGrid();
  return <div className="card-footer justify-center md:justify-between flex-col md:flex-row gap-3 text-gray-600 text-2sm font-medium">
      <div className="flex items-center gap-2">
        {/* Ensure the select has an accessible name */}
        <span>{props.pagination?.sizesLabel}</span>
        <select
          className="select select-sm w-16"
          value={table.getState().pagination.pageSize}
          onChange={e => {
        table.setPageSize(Number(e.target.value));
      }}
          aria-label="Rows per page"
          title="Rows per page"
        >
          {props.pagination?.sizes?.map((size, index) => <option key={index} value={size}>
              {size}
            </option>)}
        </select>{' '}
        {props.pagination?.sizesDescription}
      </div>
      <DataGridPagination />
    </div>;
};
export { DataGridToolbar };