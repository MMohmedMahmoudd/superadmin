import { useMemo, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@/components';
import PropTypes from 'prop-types';

const ReservationTap = ({ providerId }) => {
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refetchKey] = useState(0);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchReservationDetails = async (id) => {
    try {
      const token = JSON.parse(localStorage.getItem(
        import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
      ))?.access_token;

      const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/reservation/list${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSelectedReservation(res.data.data);
      setModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch reservation details', err);
    }
  };

  const fetchReservations = async ({ pageIndex, pageSize, sorting }) => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem(
        import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
      ))?.access_token;

      const sort = sorting?.[0]?.id;
      const url = `${import.meta.env.VITE_APP_API_URL}/reservations/list` +
        `?perPage=${pageSize}&page=${pageIndex + 1}` +
        (sort ? `&sort=${sort}` : '') +
        `&filter[sp_uid]=${providerId}`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.data ?? [];
      const total = res.data?.pagination?.total ?? 0;

      return { data, totalCount: total };
    } catch (err) {
      console.error('Error fetching reservations:', err);
      return { data: [], totalCount: 0 };
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'booking_uid',
      header: 'Booking ID',
      accessorKey: 'booking_uid',
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.booking_uid}</span>
      ),
      enableSorting: true,
    },
    {
      id: 'offer',
      header: 'Offer',
      cell: ({ row }) => (
        <div className="text-sm">
          <strong>{row.original.offer_title}</strong>
          <br />
          <span className="text-muted">${row.original.offer_price}</span>
        </div>
      ),
      meta: { className: 'min-w-[300px]' },
      enableSorting: true,
    },

    {
      id: 'customer',
      header: 'Customer',
      accessorKey: 'person_name',
      cell: ({ row }) => {
        const { person_name, person_image } = row.original;
        return (
          <div className="flex items-center gap-3">
            <img src={person_image} alt={person_name} className="w-9 h-9 rounded-full object-cover" />
            <div className="text-sm font-medium">{person_name}</div>
          </div>
        );
      },
      enableSorting: true,
      meta: { className: 'min-w-[220px]' },
    },
    {
      id: 'booking_date',
      header: 'booking date',
      accessorKey: 'booking_date',
      cell: ({ row }) => {
        const date = new Date(row.original.booking_date);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
      enableSorting: true,
      meta: { className: 'min-w-[150px]' },
    },
    {
      id: 'order_date',
      header: 'Order Date',
      accessorKey: 'order_date',
      cell: ({ row }) => {
        const date = new Date(row.original.order_date);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
      enableSorting: true,
      meta: { className: 'min-w-[150px]' },
    },
    {
      id: 'coupons.expire_date',
      header: 'Expires At',
      accessorKey: 'coupons.expire_date',
      cell: ({ row }) => {
        const firstCoupon = row.original.coupons && row.original.coupons.length > 0 ? row.original.coupons[0] : null;
        if (!firstCoupon || !firstCoupon.expire_date) return "-";
        const date = new Date(firstCoupon.expire_date);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
      enableSorting: true,
      meta: { className: 'min-w-[150px]' },
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status_name',
      cell: ({ row }) => (
          <span className={`badge badge-${row.original.status_name === 'Waiting Payment' ? 'warning' : row.original.status_name === 'confirmed' ? 'success' : row.original.status_name === 'cancelled' ? 'danger' : row.original.status_name === 'expired' ? 'danger' : row.original.status_name === 'completed' ? 'success' : 'danger'} badge-outline capitalize`}>
            ● {row.original.status_name }
          </span>
      ),
      meta: { className: 'min-w-[120px]' },
      enableSorting: true,
    },
    {
      id: 'coupons',
      header: 'Coupons',
      accessorKey: 'num_coupons',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.num_coupons}</span>
      ),
      meta: { className: 'min-w-[100px]' },
      enableSorting: true,
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <button
          className="px-2 py-1 text-blue-500"
          onClick={() => fetchReservationDetails(row.original.booking_uid)}
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
        serverSide
        onFetchData={fetchReservations}
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
          empty: 'No reservations available',
          loading: 'Loading reservations...'
        }}
      />
      {loading && (
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-2 dark:bg-black/50 bg-white/90 rounded-lg shadow-lg">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">Loading reservations...</span>
          </div>
        </div>
      )}
      {modalOpen && selectedReservation && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-100 w-full max-w-md rounded-lg p-6 shadow-lg relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 border-b border-gray-200 pb-3">
              <h2 className="text-xl font-bold">Reservation Details</h2>
              <button className="text-xl" onClick={() => setModalOpen(false)}><i className="ki-duotone ki-cross-circle"></i></button>
            </div>

            {/* Content */}
            <div className="divide-y divide-gray-200 space-y-5 text-base">
              <div>
                <div className="font-semibold text-gray-700">Customer</div>
                <div className="flex items-center gap-3 mt-2">
                  <img src={selectedReservation.person_image} alt={selectedReservation.person_name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-medium">{selectedReservation.person_name}</div>
                    <div className="text-sm text-muted">{selectedReservation.city}</div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="font-semibold text-gray-700">Offer Details</div>
                <div className="mt-2">
                  <div><strong>Title:</strong> {selectedReservation.offer_title}</div>
                  <div><strong>Price:</strong> ${selectedReservation.offer_price}</div>
                  <div><strong>Commission:</strong> {selectedReservation.commission_percentage}%</div>
                </div>
              </div>

              <div className="pt-2">
                <div className="font-semibold text-gray-700">Dates</div>
                <div className="mt-2">
                  <div><strong>Order Date:</strong> {new Date(selectedReservation.order_date).toLocaleDateString()}</div>
                  <div><strong>Expires At:</strong> {new Date(selectedReservation.expired_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="pt-2">
                <div className="font-semibold text-gray-700">Status</div>
                <div className="mt-2">
                  <span className="badge badge-outline capitalize">
                    {selectedReservation.status_name}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <div className="font-semibold text-gray-700">Coupons</div>
                <div className="mt-2">
                  <div><strong>Number of Coupons:</strong> {selectedReservation.num_coupons}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ReservationTap.propTypes = {
  providerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export { ReservationTap };
