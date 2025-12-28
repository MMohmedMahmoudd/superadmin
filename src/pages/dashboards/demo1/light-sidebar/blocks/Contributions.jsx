

import { useEffect, useMemo, useState } from 'react';
import ApexChart from 'react-apexcharts';
import axios from 'axios';
import { useLanguage } from '@/i18n';
import { KeenIcon, Menu, MenuItem, MenuToggle } from '@/components';
import { DropdownCard2 } from '@/partials/dropdowns/general';
import PropTypes from 'prop-types';
const Contributions = ({ title }) => {
  const { isRTL } = useLanguage();
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const colors = useMemo(() => [
    'var(--tw-primary)',
    'var(--tw-brand)',
    'var(--tw-success)',
    'var(--tw-info)',
    'var(--tw-warning)',
  ], []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const storedAuth = localStorage.getItem(
          import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
        );
        const authData = storedAuth ? JSON.parse(storedAuth) : null;
        const token = authData?.access_token;

        if (!token) {
          window.location.href = '/auth/login';
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/dashboard-statistics`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        const types = response.data?.data?.business_types || [];
        setBusinessTypes(types);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = useMemo(() => {
    const data = businessTypes.map((item) => item.count);
    const labels = businessTypes.map((item) => item.title);
    return { data, labels };
  }, [businessTypes]);

  const options = {
    series: chartData.data,
    labels: chartData.labels,
    colors,
    fill: { colors },
    chart: { type: 'donut' },
    stroke: { show: false, width: 2 },
    dataLabels: { enabled: false },
    plotOptions: { pie: { expandOnClick: false } },
    tooltip: {
      theme: 'dark',
      style: {
        color: '#fff',
      },
    },
    legend: {
      offsetY: -10,
      offsetX: -10,
      fontSize: '10px',
      fontWeight: '500',
      itemMargin: { vertical: 1 },
      labels: {
        colors: 'var(--tw-gray-700)',
        useSeriesColors: false,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: 'bottom' },
        },
      },
    ],
  };

  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <Menu>
          <MenuItem
            toggle="dropdown"
            trigger="click"
            dropdownProps={{
              placement: isRTL() ? 'bottom-start' : 'bottom-end',
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: isRTL() ? [0, -10] : [0, 10],
                  },
                },
              ],
            }}
          >
            <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
              <KeenIcon icon="dots-vertical" />
            </MenuToggle>
            {DropdownCard2()}
          </MenuItem>
        </Menu>
      </div>

      <div className="card-body flex h-full justify-center items-center py-1">
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <ApexChart
            id="contributions_chart"
            options={options}
            series={options.series}
            type="donut"
            width="100%"
            height="178.7"
          />
        )}
      </div>
    </div>
  );
};

Contributions.propTypes = {
  title: PropTypes.string.isRequired,
};
export { Contributions };
