import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { DataGrid, KeenIcon } from '@/components';
import { useNavigate } from 'react-router-dom';
import { DateRangeFilter } from '@/components';
import { toAbsoluteUrl } from '@/utils';
const ReservationsContent = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [triggerFetch, setTriggerFetch] = useState(0);

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const navigate = useNavigate();

  // Debounce logic
  useEffect(() => {
    setTriggerFetch((prev) => prev + 1);
  }, [fromDate, toDate, searchStatus, debouncedSearch]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // debounce delay

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const columns = useMemo(() => [
    {
      id: 'booking_uid',
      header: 'ID',
      accessorKey: 'booking_uid',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="text-sm font-medium">{row.original.booking_uid}</div>
      ),
    },
    {
      enableSorting: true,
      header: 'Person',
      accessorKey: 'person_name',
      cell: ({ row }) => (<>
        <div className="flex items-center gap-3">
          <img
            src={row.original.person_image || toAbsoluteUrl('/media/avatars/blank.png')}
            alt={row.original.person_name}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = toAbsoluteUrl('/media/avatars/blank.png')      ;
            }}
          />
          <div className="flex flex-col">
          <span className="font-medium">{row.original.person_name}</span>
          <span className="font-medium ">{row.original.person_phone}</span>

          </div>
        </div>
        </>
      ),
      meta:{className:"min-w-[180px]"}
    },
    {
      id:"business_name",
      header:"Business",
      accessorKey:"sp_name",
      enableSorting:true,
      cell:({row})=>{
        return <span className="text-sm">{row.original.sp_name}</span>
      },
      meta:{className:"min-w-[150px]"}
    },
    {
      enableSorting: true,
      header: 'Offer Title',
      accessorKey: 'offer_title',
      cell:({row})=>{
        return <span className="text-sm">{row.original.offer_title}</span>
      },
      meta:{className:"min-w-[320px]"}
    },
    {
      enableSorting: true,
      header: 'Coupons',
      accessorKey: 'num_coupons',
    },
    {
      id: 'offer.offer_price',
      enableSorting: true,
      header: 'Price',
      accessorKey: 'offer_price',
    },
    {
      id: 'order_date',
      header: 'Order Date',
      accessorKey: 'order_date',
      enableSorting: true,
      cell:({row})=>{
        return <span className="text-sm">{row.original.order_date}</span>
      },
      meta: { className: 'min-w-[190px]' },
    },

    {
      id: 'booking_date',
      header: 'Reservation Date',
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
      meta: { className: 'min-w-[180px]' },
    },
    {
      id: 'coupons.expire_date',
      header: 'Coupons Expired',
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
      meta: { className: 'min-w-[160px]' },
    },
    {
      id: 'booking_status',
      enableSorting: true,
      header: 'Status',
      accessorKey: 'status_name',
      cell: ({ row }) => (
        <span className={`badge badge-outline ${row.original.status_name === 'COMPLETED' ? 'badge-success' : row.original.status_name === 'ACTIVE' ? 'badge-success' : row.original.status_name === 'CANCELED' ? 'badge-danger' : row.original.status_name === 'WAITING PAYMENT' ? 'badge-primary' : row.original.status_name === 'WAITING CONFIRMATION' ? 'badge-warning' : row.original.status_name === 'WAITING CONFIRMATION FROM CUSTOMER' ? 'badge-warning': row.original.status_name === 'NEW ARRIVAL DATE AWAITS YOUR APPROVAL' ? 'badge-warning':  ""} `}>
        ● {row.original.status_name}
        </span>
      ),
      meta: {className: 'min-w-[200px]'},
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => (
        <button
          className="px-2 btn btn-sm btn-outline btn-primary py-1"
          onClick={() => navigate(`/reservationprofile/${row.original.booking_uid}`, { state: { reservation: row.original } })}
        >
          <i className="ki-filled text-blue-500 ki-notepad-edit"></i>
        </button>
      ),
    },
  ], []);
  
  const fetchBookings = async ({ pageIndex, pageSize, sorting = [{ id: 'booking_uid', desc: true }] }) => {
    try {
      setLoading(true);
  
      const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
      const authData = storedAuth ? JSON.parse(storedAuth) : null;
      const token = authData?.access_token;
      if (!token) {
        window.location.href = '/auth/login';
        return { data: [], totalCount: 0 };
      }
  
      const sortKey = sorting?.[0]?.id ?? 'booking_uid';
      const sortKey2 = sorting?.[1]?.id ?? 'offer.offer_price';
      const sortKey3 = sorting?.[2]?.id ?? 'booking_status';
      const sortKey4 = sorting?.[3]?.id ?? 'booking_add_date';
      const sortKey5 = sorting?.[4]?.id ?? 'offer_qty';

      const sortDir = sorting?.[0]?.desc ? '' : '-';
      const sortDir2 = sorting?.[1]?.desc ? '-' : '';
      const sortDir3 = sorting?.[2]?.desc ? '-' : '';
      const sortDir4 = sorting?.[3]?.desc ? '-' : '';
      const sortDir5 = sorting?.[4]?.desc ? '-' : '';
      const baseFilters = [
        fromDate ? `&filter[from_booking_date]=${fromDate}` : '',
        toDate ? `&filter[to_booking_date]=${toDate}` : '',
        searchStatus ? `&filter[booking_status]=${encodeURIComponent(searchStatus)}` : '',
      ].join('');
  
      const baseUrl = `${import.meta.env.VITE_APP_API_URL}/reservations/list?sort=${sortDir}${sortKey}&sort2=${sortDir2}${sortKey2}&sort3=${sortDir3}${sortKey3}&sort4=${sortDir4}${sortKey4}&sort5=${sortDir5}${sortKey5}&perPage=${pageSize}&page=${pageIndex + 1}${baseFilters}`;
  
      let url = baseUrl;
  
      if (debouncedSearch) {
        const isBookingUid = debouncedSearch.startsWith('RES');
        const isPhoneNumber = /^\d{8,}$/.test(debouncedSearch);
        const isPureNumber = /^\d+$/.test(debouncedSearch);
      
        if (isBookingUid) {
          url += `&filter[booking_uid]=${debouncedSearch}`;
        } else if (isPhoneNumber) {
          url += `&filter[person_phone]=${debouncedSearch}`;
        } else if (isPureNumber) {
          url += `&filter[booking_uid]=${debouncedSearch}`;
        } else {
          url += `&filter[offer_title]=${debouncedSearch}`;
        }
      }
        
      // First API try
      let response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      let bookings = response?.data?.data ?? [];
      let total = response?.data?.pagination?.total ?? 0;
  
      // Smart Retry Logic:
      if (debouncedSearch && !bookings.length) {
        let retryUrl = baseUrl + `&filter[person_name]=${debouncedSearch}`;
  
        const retryResponse = await axios.get(retryUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        bookings = retryResponse?.data?.data ?? [];
        total = retryResponse?.data?.pagination?.total ?? 0;
      }
  
      setTotalCount(total);
      return { data: bookings, totalCount: total };
    } catch (err) {
      console.error('❌ Error fetching bookings:', err);
      return { data: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="card card-grid min-w-full">
      <div className="card-header flex-wrap gap-2 justify-between">
        <h3 className="card-title font-medium text-sm">
          Showing {totalCount} Reservation
        </h3>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="custom-datepicker-wrapper ">
          <DateRangeFilter
            onChange={({ from, to }) => {
              setFromDate(from || "");
              setToDate(to || "");
            }}
          />

          </div>
    <label className="input input-sm w-40 h-10">
      <KeenIcon icon="magnifier" />
      <input
        type="text"
        placeholder="Search by Name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </label>



<select
  className="select select-md"
  value={searchStatus}
  onChange={(e) => setSearchStatus(e.target.value)}
>
  <option value="">Status</option>
  <option value="1">Active</option>
  <option value="2">Completed</option>
  <option value="3">Cancelled</option>
  <option value="4">Waiting Payment</option>
  <option value="5">Waiting Confirmation</option>
</select>


  </div>
      </div>
      <div className="card-body">
        <DataGrid
          key={triggerFetch}
          columns={columns}
          serverSide
          onFetchData={fetchBookings}
          isLoading={loading}
          defaultSorting={[{ id: 'booking_uid', desc: true }]}
          pagination={{
            page: pageIndex,
            size: pageSize,
            onPageChange: setPageIndex,
            onPageSizeChange: setPageSize,
          }}
        />
      </div>
    </div>
  );
};

export { ReservationsContent };
