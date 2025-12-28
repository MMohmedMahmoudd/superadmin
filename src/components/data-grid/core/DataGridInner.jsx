import { Fragment } from 'react';
import { useDataGrid, DataGridLoader, DataGridTable, DataGridTableBody, DataGridTableBodyCell, DataGridTableBodyRow, DataGridTableHead, DataGridTableHeadCell, DataGridTableEmpty, DataGridToolbar } from '..'; // Ensure these imports are correct
import { flexRender } from '@tanstack/react-table'; // Import Row and Cell types

const DataGridInner = () => {
  const {
    loading,
    table
  } = useDataGrid();
  return <Fragment>
      <div className="grid min-w-full">
        <div className="scrollable-x-auto">
          <DataGridTable>
            <DataGridTableHead>
              {table.getHeaderGroups().map(headerGroup => headerGroup.headers.map((header, index) => <DataGridTableHeadCell key={index} header={header} />))}
            </DataGridTableHead>
            <DataGridTableBody>
              {table.getRowModel().rows.length > 0 ? table.getRowModel().rows.map((row, rowIndex) => <DataGridTableBodyRow key={rowIndex} id={row.id}>
                    {row.getVisibleCells().map((cell, cellIndex) => <DataGridTableBodyCell key={cellIndex} id={cell.id} className={cell.column.columnDef.meta?.cellClassName || ''}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </DataGridTableBodyCell>)}
                  </DataGridTableBodyRow>) : <DataGridTableEmpty />}
            </DataGridTableBody>
          </DataGridTable>
          {loading && <DataGridLoader />} {/* Show loader if loading */}
        </div>
        <DataGridToolbar />
      </div>
    </Fragment>;
};
export { DataGridInner };