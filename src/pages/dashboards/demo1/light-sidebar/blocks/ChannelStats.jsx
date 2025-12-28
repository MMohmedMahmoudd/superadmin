import { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { toAbsoluteUrl } from '@/utils/Assets';

const API_URL = import.meta.env.VITE_APP_API_URL; // Using clean .env value
const DASHBOARD_STATS_URL = `${API_URL}/dashboard-statistics`;

const ChannelStats = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
        const authData = storedAuth ? JSON.parse(storedAuth) : null;
        const token = authData?.access_token;

        if (!token) {
          console.warn('No token found. Redirecting to login...');
          window.location.href = '/auth/login';
          return;
        }

        const { data } = await axios.get(DASHBOARD_STATS_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        setStats(data?.data?.statistics || {});
      } catch (err) {
        console.error('Error fetching stats:', err);
        if (err.response?.status === 401) {
          window.location.href = '/auth/login';
        } else {
          setError('Failed to fetch statistics');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const items = [
    {
      logo: 'users.svg',
      info: stats?.providers_count || '0',
      desc: 'Providers',
    },
    {
      logo: 'user-tick.svg',
      info: stats?.active_providers_count || '0',
      desc: 'Active Providers',
    },
    {
      logo: 'discount.svg',
      info: stats?.offers_count || '0',
      desc: 'Offers',
    },

    {
      logo: 'cheque.svg',
      info: stats?.reservations_count || '0',
      desc: 'Reservations',
    },
    {
      logo: 'price-tag.svg',
      info: stats?.used_coupons_count || '0',
      desc: 'Used Coupons',
    },
    {
      logo: 'bill.svg',
      info: stats?.total_income
        ? stats.total_income >= 1000
          ? (stats.total_income / 1000).toFixed(1) + 'k'
          : stats.total_income
        : '0',
      desc: 'Total Earning',
    },

  ];

  const renderItem = (item, index) => (
    <div key={index} className="card flex-col justify-between gap-6 h-full bg-cover rtl:bg-[left_top_-1.7rem] bg-[right_top_-1.7rem] bg-no-repeat channel-stats-bg">
      <img src={toAbsoluteUrl(`/media/brand-logos/${item.logo}`)} className="w-7 mt-4 ms-5" alt="" />
      <div className="flex flex-col gap-1 pb-4 px-5">
        <span className="text-3xl font-semibold text-gray-900">{item.info}</span>
        <span className="text-2sm font-normal text-gray-700 leading-none">{item.desc}</span>
      </div>
    </div>
  );

  return (
    <Fragment>
      <style>{`
        .channel-stats-bg {
          background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3.png')}');
        }
        .dark .channel-stats-bg {
          background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3-dark.png')}');
        }
      `}</style>

      {loading ? (
        <div className="flex justify-end items-start min-h-[250px]">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 font-medium">Error: {error}</div>
      ) : (
        items.map(renderItem)
      )}
    </Fragment>
  );
};

export { ChannelStats };
