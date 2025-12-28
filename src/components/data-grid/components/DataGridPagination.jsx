import { Fragment } from 'react';
import { KeenIcon } from '@/components';
import { useDataGrid } from '..';
const DataGridPagination = () => {
  const {
    table,
    totalRows,
    props: gridProps
  } = useDataGrid();

  // Calculate pagination values
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  // Calculate from, to, and total count values for pagination info
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  // Replace placeholders in paginationInfo
  const paginationInfo = gridProps.pagination?.info
    ? gridProps.pagination.info
        .replace('{from}', from.toString())
        .replace('{to}', to.toString())
        .replace('{count}', totalRows.toString())
    : `${from} - ${to} of ${totalRows}`; // Default fallback format

  // Pagination limit logic
  const pageCount = table.getPageCount();
  const paginationMoreLimit = gridProps.pagination?.moreLimit || 5;

  // Determine the start and end of the pagination group
  const currentGroupStart = Math.floor(pageIndex / paginationMoreLimit) * paginationMoreLimit;
  const currentGroupEnd = Math.min(currentGroupStart + paginationMoreLimit, pageCount);

  // Render page buttons based on the current group
  const renderPageButtons = () => {
    const buttons = [];
    for (let i = currentGroupStart; i < currentGroupEnd; i++) {
      buttons.push(<button
          key={i}
          className={`btn ${pageIndex === i ? 'active' : ''}`}
          onClick={() => table.setPageIndex(i)}
          aria-label={`Go to page ${i + 1}`}
          title={`Go to page ${i + 1}`}
        >
          {i + 1}
        </button>);
    }
    return buttons;
  };

  // Render a "previous" ellipsis button if there are previous pages to show
  const renderEllipsisPrevButton = () => {
    if (currentGroupStart > 0) {
      return <button
          className="btn"
          onClick={() => table.setPageIndex(currentGroupStart - 1)}
          aria-label="Show previous pages"
          title="Show previous pages"
        >
          ...
        </button>;
    }
    return null; // No ellipsis needed if we're in the first group
  };

  // Render a "next" ellipsis button if there are more pages to show after the current group
  const renderEllipsisNextButton = () => {
    if (currentGroupEnd < pageCount) {
      return <button
          className="btn"
          onClick={() => table.setPageIndex(currentGroupEnd)}
          aria-label="Show next pages"
          title="Show next pages"
        >
          ...
        </button>;
    }
    return null; // No ellipsis needed if we're in the last group
  };
  return <div className="flex items-center gap-4 order-1 md:order-2">
      <span>{paginationInfo}</span>
      <div className="pagination">
        <button
          className="btn"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Previous page"
          title="Previous page"
        >
          <KeenIcon icon="black-left" className="rtl:transform rtl:rotate-180" />
        </button>

        {renderEllipsisPrevButton()}

        <Fragment>{renderPageButtons()}</Fragment>

        {renderEllipsisNextButton()}

        <button
          className="btn"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Next page"
          title="Next page"
        >
          <KeenIcon icon="black-right" className="rtl:transform rtl:rotate-180" />
        </button>
      </div>
    </div>;
};
export { DataGridPagination };