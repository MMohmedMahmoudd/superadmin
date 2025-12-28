import { useMemo, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@/components';
import PropTypes from 'prop-types';
import { Rating } from '@mui/material';
import { toAbsoluteUrl } from '@/utils';
const ProviderReviewsTable = ({ providerId }) => {
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refetchKey] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchReviewDetails = async (id) => {
    try {
      const token = JSON.parse(localStorage.getItem(
        import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
      ))?.access_token;

      const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/review/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSelectedReview(res.data.data);
      setModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch review details', err);
    }
  };


  const fetchReviews = async ({ pageIndex, pageSize, sorting }) => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem(
        import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
      ))?.access_token;

      const sort = sorting?.[0]?.id;
      const url = `${import.meta.env.VITE_APP_API_URL}/provider/${providerId}/reviews` +
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
      console.error('Error fetching reviews:', err);
      return { data: [], totalCount: 0 };
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'review_uid',
      header: 'Review ID',
      accessorKey: 'review_uid',
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.review_uid}</span>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorKey: 'person_name',
      cell: ({ row }) => {
        const { person_name, person_image } = row.original;
        return (
          <div className="flex items-center gap-3">
            <img src={person_image || toAbsoluteUrl('/media/avatars/blank.png')}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = toAbsoluteUrl('/media/avatars/blank.png');
            }}
             alt={person_name} className="w-9 h-9 rounded-full object-cover" />
            <div className="text-sm font-medium">{person_name}</div>
          </div>
        );
      },
      meta: { className: 'min-w-[220px]' },
    },
    {
      id: 'comment',
      header: 'Comment',
      cell: ({ row }) => (
        <div className="text-sm whitespace-pre-line">
          <strong>{row.original.review_title}</strong>
          <br />
          {row.original.review_content}
        </div>
      ),
      meta: { className: 'min-w-[300px]' },
    },
    {
      id: 'rating',
      header: 'Rating',
      accessorKey: 'rating_rate',
      cell: ({ row }) => (
        <Rating value={parseFloat(row.original.rating_rate)} readOnly precision={0.5} size="small" />
      ),
      meta: { className: 'min-w-[120px]' },
    },
    {
      id: 'review_add_date',
      header: 'Review Date',
      accessorKey: 'review_add_date',
      cell: ({ row }) => {
        const date = new Date(row.original.review_add_date);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
      meta: { className: 'min-w-[150px]' },
    },
    {
      id: 'review_status',
      header: 'Status',
      accessorKey: 'review_status',
      cell: ({ row }) => {
        const isActive = row.original.review_status === 1;
        return (
          <span className={`badge badge-${isActive ? 'success' : 'danger'} badge-outline capitalize`}>
            ● {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
      meta: { className: 'min-w-[120px]' },
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <button
          className="px-2 py-1 text-blue-500"
          onClick={() => fetchReviewDetails(row.original.review_uid)}
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
        onFetchData={fetchReviews}
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
          empty: 'No reviews available',
          loading: 'Loading reviews...'
        }}
      />
      {loading && (
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-2 dark:bg-black/50 bg-white/90 rounded-lg shadow-lg">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">Loading reviews...</span>
          </div>
        </div>
      )}
{modalOpen && selectedReview && (
  <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-100 w-full max-w-md rounded-lg p-6 shadow-lg relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 border-b border-gray-200 pb-3">
        <h2 className="text-xl font-bold">View Rate & Comment</h2>
        <button className="text-xl" onClick={() => setModalOpen(false)}><i className="ki-duotone ki-cross-circle"></i></button>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-200 space-y-5 text-base">
        <div >
          <div className="font-semibold text-gray-700">Name</div>
          <div >{selectedReview.person_name}</div>
        </div>

        <div className='pt-2'>
          <div className="font-semibold text-gray-700">Rate</div>
          <Rating value={parseFloat(selectedReview.rating_rate)} readOnly precision={0.5} />
        </div>

        <div className='pt-2'>
          <div className="font-semibold text-gray-700">Comment</div>
          <p className=" whitespace-pre-line">{selectedReview.review_content}</p>
        </div>

        <div className='pt-2'>
          <div className="font-semibold text-gray-700">Status</div>
          <span className={`badge badge-${selectedReview.review_status === 1 ? 'success' : 'danger'}`}>
            {selectedReview.review_status === 1 ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

ProviderReviewsTable.propTypes = {
  providerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export { ProviderReviewsTable };