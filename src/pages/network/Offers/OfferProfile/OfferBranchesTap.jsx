import { useMemo, useState } from 'react';
import { DataGrid } from '@/components';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const OfferBranchesTap = ({ provider }) => {
  if (!provider || !Array.isArray(provider.branches)) {
    return <div className="p-4 text-center text-gray-500">No branches data available.</div>;
  }

  const [loading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refetchKey] = useState(0);
  const navigate = useNavigate();

  const branches = provider.branches;
  const providerId=provider.business_id
  const paginatedData = branches.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const columns = useMemo(() => [
    {
      id: 'id',
      header: 'ID',
      accessorKey: 'id',
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.id}</span>,
      enableSorting: false,
    },
    {
      id: 'name',
      header: 'Branch Name',
      accessorKey: 'name',
      enableSorting: true,
    },
    {
      id: 'phone',
      header: 'Phone',
      accessorKey: 'phone',
      enableSorting: true,
    },
    {
      id: 'address',
      header: 'Address',
      accessorKey: 'address',
      enableSorting: false,
      meta: { className: 'min-w-[200px]' },
    },
    {
      id: 'city',
      header: 'City',
      accessorFn: row => row.city?.name || '-',
      enableSorting: true,
    },
    {
      id: 'zone',
      header: 'Zone',
      accessorFn: row => row.zone?.name || '-',
      enableSorting: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'main_branch',
      cell: ({ row }) => (
        <span className={`badge badge-${row.original.status === 1 ? 'success' : 'secondary'} badge-outline capitalize`}>
          ● {row.original.main_branch}
        </span>
      ),
      enableSorting: true,
    }
    ,
    {
        id: 'actions',
        header: 'Action',
        enableSorting: false,

        cell: ({ row }) => (
            <button
              className="px-2 py-1 btn btn-sm btn-outline btn-primary text-blue-500"
              onClick={() => navigate(`/branchprofile/${providerId}?branch=${row.original.id}`)}
            >
              <i className="ki-filled ki-notepad-edit"></i>
            </button>
          ),
    }
  ], []);

  return (
    <div className="card-body p-0 overflow-x-auto relative">
      <DataGrid
        key={refetchKey}
        columns={columns}
        serverSide={false}
        data={paginatedData}
        isLoading={loading}
        layout={{
          cellsBorder: true,
          tableSpacing: 'sm',
        }}
        pagination={{
          page: pageIndex,
          size: pageSize,
          onPageChange: setPageIndex,
          onPageSizeChange: setPageSize,
          total: branches.length,
        }}
        messages={{
          empty: 'No branches available',
          loading: 'Loading branches...'
        }}
      />
    </div>
  );
};

OfferBranchesTap.propTypes = {
  provider: PropTypes.object.isRequired,
};

export { OfferBranchesTap };
