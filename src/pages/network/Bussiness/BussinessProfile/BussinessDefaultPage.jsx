// AddBranchPage.jsx
import { Fragment, useEffect, useState, useRef } from 'react';
import { Container } from '@/components/container';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BussinessDefaultContent } from './BussinessDefaultContent';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { useLayout } from '@/providers';
import { UserProfileHero } from './heros';
import { useSnackbar } from 'notistack';
import { PermissionGuard } from '@/components';
import { usePermissionsContext } from '@/providers/PermissionsProvider';

const BussinessDefaultPage = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);
  const { currentLayout } = useLayout();
  const { enqueueSnackbar } = useSnackbar();
  const { hasPermission, isAuthenticated, isLoading } = usePermissionsContext();
  const hasShownSnackbarRef = useRef(false);

  // Check permissions and show snackbar if denied
  useEffect(() => {
    const hasViewPermission = hasPermission('Bussiness-Profile', 'view');
    const hasEditPermission = hasPermission('Bussiness-Profile', 'edit');
    
    if (!isLoading && isAuthenticated && !hasShownSnackbarRef.current) {
      if (!hasViewPermission && !hasEditPermission) {
        enqueueSnackbar(
          'Access denied: You don\'t have permission to access this page (Bussiness-Profile).', 
          { 
            variant: 'error',
            autoHideDuration: 4000
          }
        );
        hasShownSnackbarRef.current = true;
      }
    }
  }, [hasPermission, enqueueSnackbar, isLoading, isAuthenticated]);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const token = JSON.parse(localStorage.getItem(
          import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
        ))?.access_token;

        const res = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/provider/${id}/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProvider(res.data?.data || null);
      } catch (err) {
        setError(err.message || 'Failed to load provider');
      }
    };

    if (id) fetchProvider();
  }, [id]);

  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!provider) return <div className="flex justify-center items-center min-h-[250px]">
  <div
    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary"
    role="status"
  >
    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
      Loading...
    </span>
  </div>
</div>

  return <Fragment>
      {currentLayout?.name === 'demo1-layout' && <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
            </ToolbarHeading>
          </Toolbar>
        </Container>}
        
      <PermissionGuard permissionKey="Bussiness-Profile" action="view">
        <UserProfileHero
          initialImage={provider?.image}
          name={provider?.name}
          info={[
            { icon: 'abstract-41', label: provider.type?.name || '' },
            { icon: 'geolocation', city: provider.main_branch?.city.name || '' },
            { icon: 'shop', label: provider.statistics?.branches_count + " Branch" || '' }
          ]}
          status={provider?.status}
          onStatusChange={async (newStatus) => {
            // Check edit permission before allowing status change
            try {
              const token = JSON.parse(localStorage.getItem(
                import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
              ))?.access_token;
        
              const statusMap = {
                active: 1,
                inactive: 0,
                'waiting confirmation': 2
              };
        
              const sp_status = statusMap[newStatus.toLowerCase()] ?? 0;
        
              const updateData = {
                _method: 'PUT',
                sp_name_english: provider?.name || '',
                sp_name_arabic: provider?.name || '',
                sp_description_english: provider?.description || '',
                sp_description_arabic: provider?.description || '',
                sp_type_uid: provider?.type?.id || '',
                city_uid: provider?.main_branch?.city?.id || '',
                zone_uid: provider?.main_branch?.zone?.id || '',
                person_uid: provider?.user?.id || '',
                branch_name_english: provider?.main_branch?.name || '',
                branch_name_arabic: provider?.main_branch?.name_both_lang.ar || '',
                branch_email: provider?.main_branch?.email || '',
                branch_phone: provider?.main_branch?.phone || '',
                branch_address_english: provider?.main_branch?.address || '',
                branch_address_arabic: provider?.main_branch?.address_both_lang.ar || '',
                branch_latitude: provider?.main_branch?.latitude || '',
                branch_longitude: provider?.main_branch?.longitude || '',
                sp_status: sp_status
              };
              await axios.post(
                `${import.meta.env.VITE_APP_API_URL}/provider/${provider.id}/update`,
                updateData,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                  }
                }
              );
        
              enqueueSnackbar('Business status updated successfully!', { variant: 'success' });
        
              // Locally update status
              setProvider(prev => ({
                ...prev,
                status: newStatus
              }));
        
            } catch (error) {
              console.error('❌ Failed to update Business status:', error);

              // Check if the error response contains validation errors
              if (
                error.response &&
                error.response.data &&
                error.response.data.errors
              ) {
                const errors = error.response.data.errors;
                // Loop through each field's error messages
                Object.values(errors).forEach((messages) => {
                  // Each messages is an array, show each one
                  messages.forEach((msg) => {
                    enqueueSnackbar(msg, { variant: 'error' });
                  });
                });
              } else {
                enqueueSnackbar('Failed to update Business status.', { variant: 'error' });
              }
            }
          }}
          onImageChange={(file) => {
            // Pass the image change to BussinessDefaultContent
            if (file) {
              setProvider(prev => ({
                ...prev,
                image: file
              }));
            } else {
              // When image is removed, set to null to indicate no image
              setProvider(prev => ({
                ...prev,
                image: null
              }));
            }
          }}
        />
    
        <Container>
          <BussinessDefaultContent provider={provider} />
        </Container>
      </PermissionGuard>
    </Fragment>
};

export { BussinessDefaultPage  };
