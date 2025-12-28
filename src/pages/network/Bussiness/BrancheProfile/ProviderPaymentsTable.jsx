import { useMemo, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { DataGrid } from '@/components';
import { KeenIcon } from '@/components';
import { useEffect } from 'react';

const ProviderPaymentsTable = ({ providerId , provider}) => {
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refetchKey, setRefetchKey] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [providerEmail, setProviderEmail] = useState(null);
  const [providerPhone, setProviderPhone] = useState(null);
  useEffect(() => {
    setProviderEmail(provider.user?.email);
    setProviderPhone(provider.user?.mobile);
  }, [provider]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPageIndex(0);
      setRefetchKey(prev => prev + 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPayments = async ({ pageIndex, pageSize, sorting }) => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem(
        import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
      ))?.access_token;

      const sort = sorting?.[0]?.id;
      const sortOrder = sorting?.[0]?.desc ? '-' : '';
      const allowedSorts = ['invoice_uid', 'invoice_add_date', 'invoice_payment_date'];
      const sortParam = sort && allowedSorts.includes(sort) ? `${sortOrder}${sort}` : '';
      
      let filterParam = '';
      if (debouncedSearch) {
        const cleanedSearch = debouncedSearch.trim();
        const formattedTotal = (cleanedSearch).trim();
      
        // Check if it's a valid number (to prevent unnecessary requests)
        if (/^\d+(\.\d{1,2})?$/.test(cleanedSearch)) {
          // 1. Try filtering by invoice_uid first
          const tryIdUrl = `${import.meta.env.VITE_APP_API_URL}/provider/${providerId}/payments?perPage=1&page=1&filter[invoice_uid]=${cleanedSearch}`;
          const idResponse = await axios.get(tryIdUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
      
          const idResults = idResponse.data?.data ?? [];
      
          if (idResults.length > 0) {
            // ID match found
            filterParam = `&filter[invoice_uid]=${cleanedSearch}`;
          } else {
            // No ID match — fallback to total
            filterParam = `&filter[invoice_total]=${formattedTotal}`;
          }
        }
      }
              const url = `${import.meta.env.VITE_APP_API_URL}/provider/${providerId}/payments` +
        `?perPage=${pageSize}&page=${pageIndex + 1}` +
        (sortParam ? `&sort=${sortParam}` : '') +
        filterParam;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.data ?? [];
      const total = res.data?.pagination?.total ?? 0;
      setTotalCount(total);
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
      enableSorting: true,
    },
    {
      id: 'offer',
      header: 'Offer',
      accessorFn: row => row.offer?.title,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.offer?.title}</span>
      ),
      enableSorting: false,
    },
    {
      id: 'invoice_total',
      header: 'Amount',
      accessorKey: 'invoice_total',
      cell: ({ row }) => (
        <span className="text-sm font-medium">${row.original.invoice_total.toFixed(2)}</span>
      ),
      enableSorting: false,
    },
    {
      id: 'invoice_add_date',
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
      enableSorting: true,
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
      enableSorting: true,
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
      meta: {className: 'w-[100px]'},
    },
    {
      id: 'actions',
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            className="btn btn-sm btn-outline btn-primary"
            onClick={() => {
              setSelectedRow(row.original);
              setModalOpen(true);
            }}
          >
            <KeenIcon icon="eye" />
          </button>
        </div>
      ),
      enableSorting: false,
    }
  ], []);
  
  return (
    <div className="card p-6">
    <div className="card-header px-2 flex-wrap gap-2 justify-between">
        <h3 className="card-title">
          Showing {totalCount} Payments
        </h3>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="input input-sm w-72 h-9 hover:text-primary">
            <KeenIcon icon="magnifier" className='hover:text-primary text-gray-500' />
            <input
              type="text"
              placeholder="Search by ID or Amount"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </div>

    <div className="card-body p-0 overflow-x-auto relative">
      <DataGrid
        key={refetchKey}
        columns={columns}
        serverSide
        onFetchData={fetchPayments}
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

    {modalOpen && selectedRow && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white dark:bg-gray-100 p-6 rounded-xl shadow-lg min-w-[400px] max-w-[90vw]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title text-lg font-bold">#{selectedRow.invoice_uid}</h2>
            <button className="btn btn-sm btn-outline btn-secondary " onClick={() => setModalOpen(false)}>Close</button>
          </div>
          <div className="mb-4 card ">
            <div className="card-header">
            <h3 className=" card-title ">Payment sent to {selectedRow.provider?.name}</h3>
            </div>
            <div className="card-body">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>Date: <b>{new Date(selectedRow.invoice_issuance_date).toLocaleDateString()}</b></div>
              <div>Transaction Type: <b>{selectedRow.invoice_type}</b></div>
              <div>Gross Amount: <b>${selectedRow.invoice_total}</b></div>
              <div>Invoice Id: <b>#{selectedRow.invoice_uid}</b></div>
              <div>Status: <b>{selectedRow.invoice_status}</b></div>
            </div>
            </div>
          </div>
          <div className="mb-4 card pb-0">
            <div className="card-header">
            <h3 className=" card-title ">Bill Details</h3>
            </div>
            <div className="card-body px-0 py-0">
            <table className="w-full text-sm  border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-200 ">
                <tr>
                  <th className="px-7 py-2 border-b border-gray-200 text-left font-semibold">Invoice ID</th>
                  <th className="px-4 py-2 border-b border-gray-200 text-left font-semibold">Name</th>
                  <th className="px-4 py-2 border-b border-gray-200 text-left font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-100">
                  <td className="px-7 py-2 border-b border-gray-200">#{selectedRow.invoice_uid}</td>
                  <td className="px-4 py-2 border-b border-gray-200">{selectedRow.provider?.name}</td>
                  <td className="px-4 py-2 border-b border-gray-200">${selectedRow.invoice_total}</td>
                </tr>
              </tbody>
              <tfoot className='bg-gray-100 dark:bg-gray-200 w-full ' >
                <tr className='w-full'>
                  <td className="px-7 w-1/2 py-2 border-b border-gray-200">Net Amount</td>
                  <td className="px-4 w-1/2 py-2 border-b border-gray-200">${selectedRow.invoice_total}</td>
                  <td className="px-4 w-1/2 py-2 border-b border-gray-200"></td>
                </tr>
              </tfoot>
            </table>
            </div>
          </div>
          <div className="card mb-4  ">
            <div className="card-header">
            <h3 className=" card-title ">Amount Details</h3>
            </div>
            <div className="card-body ">
            <div className="grid grid-cols-2  gap-2 text-sm">
              <p className='font-medium '>Net Amount: </p>
              <b className='text-end'>${selectedRow.invoice_total}</b>
            </div>
            </div>
          </div>
          <div className="mb-4 card">
            <div className="card-header">
            <h3 className=" card-title ">Customer Details</h3>
            </div>
            <div className="card-body">
            <div className="grid grid-cols-3  gap-2 text-sm">
            <div className='flex  gap-x-10'>
              <p>Name: </p>
              <b>{selectedRow.provider?.name}</b>
            </div>
            <div className='flex  gap-4'>
              <p>Email: </p>
              <b>{providerEmail}</b>
            </div>
            <div className='flex  gap-4'>
              <p>Phone Number: </p>
              <b>{providerPhone}</b>
            </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

ProviderPaymentsTable.propTypes = {
  providerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  provider: PropTypes.object.isRequired,
};

export { ProviderPaymentsTable };
