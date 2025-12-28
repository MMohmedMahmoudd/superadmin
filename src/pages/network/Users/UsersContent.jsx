import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { DataGrid, KeenIcon } from '@/components';
import { useNavigate } from 'react-router-dom';
import { toAbsoluteUrl } from '@/utils';
const UsersContent = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refetchKey, setRefetchKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPageIndex(0);
      setRefetchKey(prev => prev + 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRowClick = (providerId) => {
    navigate(`/UserProfile/${providerId}`);
  };

  const columns = useMemo(() => [
    {
      id: 'id',
      header: 'ID',
      accessorKey: 'id',
      enableSorting: true,
      cell: ({ row }) => row.original.id ?? '—',
      meta: { className: 'min-w-[100px]' },
    },
    {
      id: 'provider_name',
      header: 'User Name',
      accessorKey: 'name',
      enableSorting: true,
      cell: ({ row }) => {
        const { name, image,email} = row.original;
        return (
          <div className="flex items-center gap-3">
            <img src={image || toAbsoluteUrl('/media/avatars/blank.png')} 
            className="w-9 h-9 rounded-full object-cover" 
            alt={name} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = toAbsoluteUrl('/media/avatars/blank.png');
            }}
            />
            <div>
              <div className="text-sm font-semibold">{name}</div>
              <div className="text-xs text-muted">{email}</div>
            </div>
          </div>
        );
      },
    },
    {
      id: 'mobile',
      header: 'mobile number',
      accessorFn: row => row.mobile,
      enableSorting: true,
      cell: ({ row }) => row.original.mobile ?? '—',
    },
    {
      id: 'person_add_date',
      header: 'Created Date',
      accessorFn: row => row.person_add_date,
      enableSorting: true,
      cell: ({ row }) => {
        const date = new Date(row.original.person_add_date);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        return formattedDate;
      },
      meta: { className: 'min-w-[190px]' },
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: row => row.person_status,
      enableSorting: true,
      cell: ({ row }) => {
        const person_status = row.original.person_status;
        const color =
          person_status === "active" ? 'success' :
          person_status === "inactive" ? 'danger' :
          'warning';
        return (
          <span className={`badge badge-${color} badge-outline capitalize`}>
            ● {person_status === "active" ? 'Active' : person_status === "inactive" ? 'Inactive' : 'Blocked'}
          </span>
        );
      },
      meta: { className: 'min-w-[102px]' },
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <button
          className="px-2 py-1 text-blue-500"
          onClick={() => handleRowClick (row.original.id)}
        >
          <i className="ki-filled ki-notepad-edit"></i>
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
        navigate('/auth/login');
        return { data: [], totalCount: 0 };
      }
  
      const sort = sorting?.[0]?.id ?? 'person_uid';
      const sortDirection = sorting?.[0]?.desc ? '' : '-';
  
      let url = `${import.meta.env.VITE_APP_API_URL}/users/list?filter[is_customer]=1&sort=${sortDirection}${sort}&perPage=${pageSize}&page=${pageIndex + 1}`;
  
      // 👇 Updated search logic
      if (debouncedSearch) {
        if (/^\d+$/.test(debouncedSearch)) {
          // If only numbers
          if (debouncedSearch.length <= 3) {
            // 1, 2, or 3 digits → search by person_uid
            url += `&filter[person_uid]=${debouncedSearch}`;
          } else {
            // 4 or more digits → search by person_mobile
            url += `&filter[person_mobile]=${debouncedSearch}`;
          }
        } else if (debouncedSearch.includes('@')) {
          // Contains "@" → email
          url += `&filter[person_email]=${debouncedSearch}`;
        } else {
          // Otherwise → name
          url += `&filter[person_name]=${debouncedSearch}`;
        }
      }
        
      if (statusFilter) {
        url += `&filter[person_status]=${statusFilter}`;
      }
  
      if (sort) {
        url += `&sort=${sortDirection}${sort}`;
      }
  
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const providers = res.data?.data ?? [];
      const total = res.data?.pagination?.total ?? 0;
  
      setTotalCount(total);
      console.log('providers:', providers);
  
      return { data: providers, totalCount: total };
    } catch (err) {
      console.error('❌ Error fetching providers:', err);
      return { data: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  };
    
  return (
    <div className="card card-grid min-w-full relative">
      <div className="card-header flex-wrap gap-2 justify-between">
        <h3 className="card-title font-medium text-sm">
          Showing {totalCount} Users
        </h3>
        <div className="flex items-center gap-2 w-full md:w-auto">
    <label className="input input-sm w-72">
      <KeenIcon icon="magnifier" />
      <input
        type="text"
        placeholder="Search by Name or Email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </label>

    <select
      className="select select-sm w-28"
      value={statusFilter}
      onChange={(e) => {
        setStatusFilter(e.target.value);
        setPageIndex(0);
        setRefetchKey(prev => prev + 1);
      }}
    >
      <option value="">All Statuses</option>
      <option value="0">Blocked</option>
      <option value="1">Active</option>
      <option value="2">Inactive</option>
    </select>
  </div>
      </div>
      <div className="card-body">
        <DataGrid
          key={refetchKey}
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
        {loading && (
          <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 dark:bg-black/50 bg-white/90 rounded-lg shadow-lg">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">Loading businesses...</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export { UsersContent };
