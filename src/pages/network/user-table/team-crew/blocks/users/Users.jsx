import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { DataGrid, KeenIcon } from '@/components';
import { useNavigate } from 'react-router-dom';
import { toAbsoluteUrl } from '@/utils';
const Users = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [refetchKey, setRefetchKey] = useState(0);
  const navigate = useNavigate();
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPageIndex(0); // reset to page 1 when new search
      setRefetchKey(prev => prev + 1);
    }, 300); // 300ms delay
    return () => clearTimeout(timer);
  }, [search]);

  const columns = useMemo(() => [
    {
      enableSorting: true,
      id: 'provider_name',
      header: 'Business Name',
      accessorKey: 'name',
      cell: ({ row }) => {
        const { name, image, user } = row.original;
        return (
          <div className="flex items-center gap-3">
            <img
              src={image || toAbsoluteUrl('/media/avatars/blank.png')}
              alt={name}
              className="w-9 h-9 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = toAbsoluteUrl('/media/avatars/blank.png');
              }}
            />
            <div>
              <div className="text-sm font-semibold">{name}</div>
              <div className="text-xs text-muted">{user?.email ?? '—'}</div>
            </div>
          </div>
        );
      },
    },
    {
      enableSorting: true,
      id: 'type',
      header: 'Type',
      accessorFn: row => row.type?.name,
      cell: ({ row }) => row.original.type?.name ?? '—',

    },
    {
      enableSorting: true,
      id: 'zone.name',
      header: 'City',
      accessorFn: row => row.main_branch?.city.name,
      cell: ({ row }) => row.original.main_branch?.city?.name?? '—',
    },
    {
      enableSorting: true,
      id: 'status',
      header: 'Status',
      accessorFn: row => row.status,
      cell: ({ row }) => {
        const status = row.original.status;
        const color =
          status === 'active' ? 'success' :
          status === 'inactive' ? 'danger' :
          status === 'waiting confirmation' ? 'warning' :""
        return (
          <span className={`badge  badge-${color} badge-outline capitalize`}>
            ● {status}
          </span>
        );
      },
      meta: {className: 'w-[175px]'},
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          className="px-2 btn btn-sm btn-outline btn-primary py-1"
          onClick={() => navigate(`/businessprofile/${row.original.id}`)}
          aria-label={`Edit business ${row.original.name}`}
          title="Edit business"
        >
          <i className="ki-filled text-blue-500 ki-notepad-edit" aria-hidden="true"></i>
        </button>
      ),
    },
  ], []);

  const fetchProviders = async ({ pageIndex, pageSize, sorting }) => {
    try {
      setLoading(true);
      const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
      const authData = storedAuth ? JSON.parse(storedAuth) : null;
      const token = authData?.access_token;

      if (!token) {
        window.location.href = '/auth/login';
        return { data: [], totalCount: 0 };
      }

      const sort = sorting?.[0]?.id;
      const direction = sorting?.[0]?.desc ? '-' : '';

      let url = `${import.meta.env.VITE_APP_API_URL}/providers/list?perPage=${pageSize}&page=${pageIndex + 1}`
      if (debouncedSearch) {
        const isId = debouncedSearch.startsWith('SP') || /^\d+$/.test(debouncedSearch);
        if (isId) {
          url += `&filter[sp_uid]=${debouncedSearch}`;
        } else {
          url += `&filter[sp_name]=${debouncedSearch}`;
        }
      }
      if (sort) url += `&sort=${direction}${sort}`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const providers = res.data?.data?? [];
      const total = res.data?.pagination?.total ?? 0;

      setTotalCount(total);
      return { data: providers, totalCount: total };
    } catch (err) {
      console.error('❌ Error fetching providers:', err);
      return { data: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="card card-grid min-w-full">
      <div className="card-header flex-wrap gap-2 justify-between">
        <h3 className="card-title font-medium text-sm">
          Showing {totalCount} Business
        </h3>
        <label className="input input-sm w-72">
          <KeenIcon icon="magnifier" />
          <input
            type="text"
            placeholder="Search by Name or id"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <div className="card-body">
        <DataGrid
          key={refetchKey} // 🔁 forces internal re-fetch on debounce change
          columns={columns}
          serverSide
          onFetchData={fetchProviders}
          isLoading={loading}
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

export { Users };
