// import { getData, setData } from '@/utils';
// const AUTH_LOCAL_STORAGE_KEY = `${import.meta.env.VITE_APP_NAME}-auth-v${import.meta.env.VITE_APP_VERSION}`;
// const getAuth = () => {
//   try {
//     const auth = getData(AUTH_LOCAL_STORAGE_KEY);
//     if (auth) {
//       return auth;
//     } else {
//       return undefined;
//     }
//   } catch (error) {
//     console.error('AUTH LOCAL STORAGE PARSE ERROR', error);
//   }
// };
// const setAuth = auth => {
//   setData(AUTH_LOCAL_STORAGE_KEY, auth);
// };
// const removeAuth = () => {
//   if (!localStorage) {
//     return;
//   }
//   try {
//     localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
//   } catch (error) {
//     console.error('AUTH LOCAL STORAGE REMOVE ERROR', error);
//   }
// };
// export function setupAxios(axios) {
//   axios.defaults.headers.Accept = 'application/json';
//   axios.interceptors.request.use(config => {
//     const auth = getAuth();
//     if (auth?.access_token) {
//       config.headers.Authorization = `Bearer ${auth.access_token}`;
//     }
//     return config;
//   }, async err => await Promise.reject(err));
// }
// export { AUTH_LOCAL_STORAGE_KEY, getAuth, removeAuth, setAuth };


import { getData, setData } from '@/utils';

const AUTH_LOCAL_STORAGE_KEY = `${import.meta.env.VITE_APP_NAME}-auth-v${import.meta.env.VITE_APP_VERSION}`;

const getAuth = () => {
  try {
    const auth = getData(AUTH_LOCAL_STORAGE_KEY);
    return auth || null; // Return null if auth is falsy (e.g., null or undefined)
  } catch (error) {
    console.error('AUTH LOCAL STORAGE PARSE ERROR', error);
    return null; // Return null if parsing fails
  }
};

const setAuth = (auth) => {
  if (auth === undefined || auth === null) {
    removeAuth(); // Remove the key if auth is undefined or null
  } else {
    setData(AUTH_LOCAL_STORAGE_KEY, auth);
  }
};

const removeAuth = () => {
  if (!localStorage) {
    return;
  }
  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error('AUTH LOCAL STORAGE REMOVE ERROR', error);
  }
};

export function setupAxios(axios) {
  // Set default security headers for all requests
  axios.defaults.headers.common['Accept'] = 'application/json';
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  
  // Request interceptor - add auth and security headers
  axios.interceptors.request.use(
    (config) => {
      const auth = getAuth();
      if (auth?.access_token) {
        config.headers.Authorization = `Bearer ${auth.access_token}`;
      }
      
      // Ensure Content-Type is set appropriately
      // For FormData, let axios set it automatically (with boundary)
      // For JSON, explicitly set it
      if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }
      
      // Add security headers that we can control on the client side
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
      
      return config;
    },
    async (err) => await Promise.reject(err)
  );
  
  // Response interceptor - validate security and handle errors
  axios.interceptors.response.use(
    (response) => {
      // Ensure response data is valid
      if (response.data && typeof response.data === 'string') {
        try {
          // Attempt to parse if it's a JSON string
          response.data = JSON.parse(response.data);
        } catch (e) {
          // Not JSON, keep as string
        }
      }
      
      return response;
    },
    async (error) => {
      // Security: Don't expose sensitive error information in production
      if (!import.meta.env.DEV && error.response) {
        // Sanitize error messages
        const status = error.response.status;
        if (status >= 500) {
          error.message = 'An internal server error occurred. Please try again later.';
        } else if (status === 401) {
          error.message = 'Authentication required. Please log in again.';
        } else if (status === 403) {
          error.message = 'You do not have permission to perform this action.';
        }
      }
      
      return Promise.reject(error);
    }
  );
}

export { AUTH_LOCAL_STORAGE_KEY, getAuth, removeAuth, setAuth };