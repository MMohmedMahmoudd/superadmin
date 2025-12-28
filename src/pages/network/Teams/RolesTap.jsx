import { useEffect, useState } from 'react';
import axios from 'axios';
import { KeenIcon } from '@/components';
import { CommonHexagonBadge } from '@/partials/common/CommonHexagonBadge';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const roleIcons = {
  "Super Admin": "abstract-13",
  "Content Manager": "eye",
  "Service provider admin": "face-id",
  "Branch manager": "chart-line-up-2",
  "Employee": "design-1",
  "Default": "user",
  // Add more mappings as needed
};

const roleDescriptions = {
  "Super Admin": "Full access to all system features and settings.",
  "Content Manager": "Manages content and resources.",
  "Service provider admin": "Administers service providers.",
  "Branch manager": "Manages branch operations.",
  "Employee": "Regular employee access.",
  "Default": "Default role.",
  // Add more descriptions as needed
};

// Color and icon mappings
const roleColors = {
  "Super Admin": "primary",
  "Content Manager": "danger",
  "Service provider admin": "success",
  "Branch manager": "info",
  "Employee": "warning",
  default: "gray"
};

const hexColors = {
  primary: {
    stroke: "stroke-primary-clarity",
    fill: "fill-primary-light",
    icon: "text-primary"
  },
  danger: {
    stroke: "stroke-danger-clarity",
    fill: "fill-danger-light",
    icon: "text-danger"
  },
  success: {
    stroke: "stroke-success-clarity",
    fill: "fill-success-light",
    icon: "text-success"
  },
  info: {
    stroke: "stroke-info-clarity",
    fill: "fill-info-light",
    icon: "text-info"
  },
  warning: {
    stroke: "stroke-warning-clarity",
    fill: "fill-warning-light",
    icon: "text-warning"
  },
  dark: {
    stroke: "stroke-dark-clarity",
    fill: "fill-dark-light",
    icon: "text-dark"
  },
  gray: {
    stroke: "stroke-gray-clarity",
    fill: "fill-light",
    icon: "text-gray"
  }
};

const RolesTab = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
        const authData = storedAuth ? JSON.parse(storedAuth) : null;
        const token = authData?.access_token;
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/roles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(res.data.data || []);
      } catch (error) {
        console.error('Error fetching roles:', error);
        enqueueSnackbar(error.response.data.message || 'Failed to fetch roles', { variant: 'error' });
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  if (loading) return (
    <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 dark:bg-black/50 bg-white/90 rounded-lg shadow-lg">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">Loading roles...</span>
            </div>
          </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
      {roles.map(role => (
        <div key={role.id} className="card p-4 flex flex-col items-start shadow-md">
          <div className="flex justify-between w-full items-center gap-2">
          <div className="mb-2 flex items-center gap-2">
            <CommonHexagonBadge
              size="size-[50px]"
              stroke={hexColors[roleColors[role.name] || roleColors.default]?.stroke}
              fill={hexColors[roleColors[role.name] || roleColors.default]?.fill}
              badge={
                <KeenIcon
                  icon={roleIcons[role.name] || "user"}
                  className={`text-1.5xl ${hexColors[roleColors[role.name] || roleColors.default]?.icon}`}
                />
              }
            />
          <div className="font-semibold text-lg">{role.name}</div>
          </div>
          <button className="text-gray-500" onClick={() => navigate(`/RoleProfile/${role.id}`)}>
            <KeenIcon
                  icon="dots-vertical"
                  className={`text-1.5xl`}
                />
          </button>

          </div>  
          <div className="text-sm text-gray-500 mb-2">{roleDescriptions[role.name] || "No description."}</div>
          <div className="text-xs text-gray-400">{role.users_count} {role.users_count === 1 ? "person" : "people"}</div>
        </div>
      ))}
      {/* Add New Role Card */}
      <div className="card p-4 flex flex-col items-center justify-center border-dashed border-2 border-gray-300">
      <CommonHexagonBadge
    size="size-[50px]"
    stroke="stroke-warning-clarity"
    fill="fill-warning-light"
    badge={
      <KeenIcon
        icon="rocket"
        className="text-[28px] text-warning"
      />
    }
  />

        <div className="font-semibold">Add New Role</div>
        <div className="text-xs text-gray-400">Ignite Professional Adventures</div>
      </div>
    </div>
  );
};

export { RolesTab };