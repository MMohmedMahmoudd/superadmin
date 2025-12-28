import { useMemo, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { DataGrid } from '@/components';

const ProviderPaymentsTable = ({ providerId }) => {
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refetchKey] = useState(0);

  const fetchPayments = async ({ pageIndex, pageSize, sorting }) => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem(
        import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
      ))?.access_token;

      const sort = sorting?.[0]?.id;
      const url = `${import.meta.env.VITE_APP_API_URL}/provider/${providerId}/payments` +
        `?perPage=${pageSize}&page=${pageIndex + 1}` +
        (sort ? `&sort=${sort}` : '');

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.data ?? [];
      const total = res.data?.pagination?.total ?? 0;

      return { data, totalCount: total };
    } catch (err) {
      console.error('Error fetching payments:', err);
      return { data: [], totalCount: 0 };
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'invoice_uid',
      header: 'Invoice',
      accessorKey: 'invoice_uid',
      cell: ({ row }) => (
        <span className="font-semibold text-sm">#{row.original.invoice_uid}</span>
      ),
    },
    {
      id: 'offer',
      header: 'Offer',
      accessorFn: row => row.offer?.title,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.offer?.title}</span>
      ),
    },
    {
      id: 'invoice_total',
      header: 'Amount',
      accessorKey: 'invoice_total',
      cell: ({ row }) => (
        <span className="text-sm font-medium">${row.original.invoice_total.toFixed(2)}</span>
      ),
    },
    {
      id: 'invoice_issuance_date',
      header: 'Issuance Date',
      accessorKey: 'invoice_issuance_date',
      cell: ({ row }) => {
        const date = new Date(row.original.invoice_issuance_date);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
    },
    {
      id: 'invoice_payment_date',
      header: 'Payment Date',
      accessorKey: 'invoice_payment_date',
      cell: ({ row }) => {
        const date = new Date(row.original.invoice_payment_date);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
    },
    {
      id: 'invoice_status',
      header: 'Status',
      accessorKey: 'invoice_status',
      cell: ({ row }) => {
        const status = row.original.invoice_status.toLowerCase();
        const label = status === 'paid' ? 'Paid' : 'Not Paid';
        const color = status === 'paid' ? 'success' : 'danger';
        return (
          <span className={`badge badge-${color} badge-outline capitalize`}>
            ● {label}
          </span>
        );
      },
    },
  ], []);
  
  return (
    <div className="card-body p-0 overflow-x-auto relative">
      <DataGrid
        key={refetchKey}
        columns={columns}
        serverSide
        onFetchData={fetchPayments}
        isLoading={loading}
        // layout={{
        //   cellsBorder: true,
        //   tableSpacing: 'sm',
        // }}
        pagination={{
          page: pageIndex,
          size: pageSize,
          onPageChange: setPageIndex,
          onPageSizeChange: setPageSize,
        }}
        messages={{
          empty: 'No payments available',
          loading: 'Loading payments...'
        }}
      />

      {loading && (
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-2 dark:bg-black/50 bg-white/90 rounded-lg shadow-lg">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">Loading payments...</span>
          </div>
        </div>
      )}
    </div>
  );
};

ProviderPaymentsTable.propTypes = {
  providerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export { ProviderPaymentsTable };
