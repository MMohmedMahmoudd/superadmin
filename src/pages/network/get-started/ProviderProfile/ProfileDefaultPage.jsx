import { Fragment } from 'react';
import { Container } from '@/components/container';
import { UserProfileHero } from './heros';
import { ProfileDefaultContent } from '.';
import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { useLayout } from '@/providers';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from '@/components';
import { usePermissionsContext } from '@/providers/PermissionsProvider';

const ProfileDefaultPage = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const formikRef = useRef();
  const [formikMeta, setFormikMeta] = useState({ errors: {}, touched: {} });
  const navigate = useNavigate();
  const { hasPermission, isAuthenticated, isLoading } = usePermissionsContext();
  const hasShownSnackbarRef = useRef(false);
  const {
    currentLayout
  } = useLayout();

  // Check permissions and show snackbar if denied
  useEffect(() => {
    const hasEditPermission = hasPermission('Provider-profile', 'edit');
    
    if (!isLoading && isAuthenticated && !hasShownSnackbarRef.current) {
      if ( !hasEditPermission) {
        enqueueSnackbar(
          'Access denied: You don\'t have permission to access this page (Provider-profile).', 
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
        const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION))?.access_token;
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/user/${id}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProvider(res.data.data);
      } catch (error) {
        console.error('Failed to fetch provider profile', error);
      }
    };
    fetchProvider();
  }, [id]);
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

  <PermissionGuard permissionKey="Provider-profile" action="edit">
    <UserProfileHero
      formikErrors={formikMeta.errors}
      formikTouched={formikMeta.touched}

      initialImage={provider?.image}
      name={provider?.name}
      onImageChange={setSelectedImage}
      info={[
        { icon: 'sms', label: provider.email || '' },
        { icon: 'whatsapp', label: provider.mobile || '' }
      ]}
      person_status={provider?.person_status} // ✅ Send current status
      onStatusChange={async (newStatus) => {
        try {
          const token = JSON.parse(localStorage.getItem(
            import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
          ))?.access_token;
    
          const statusMap = {
            active: 1,
            inactive: 2,
            blocked: 0
          };
    
          const person_status = statusMap[newStatus.toLowerCase()] ?? 0;
    
          const updateData = {
            _method: 'PUT',
            person_status: person_status,
            person_name:provider.name ,
            person_email:provider.email,
            person_mobile:provider.mobile,
            country_code: provider?.country_code ,
            is_customer: 0,
            is_provider: 1,

          };
            
          await axios.post(
            `${import.meta.env.VITE_APP_API_URL}/user/${id}/update`,
            updateData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );
    
          enqueueSnackbar('user status updated successfully!', { variant: 'success' });
          navigate(`/Providers`);
          // Locally update status
          setProvider(prev => ({
            ...prev,
            person_status: newStatus
          }));
    
        } catch (error) {
          console.error('❌ Failed to update user status:', error);
          enqueueSnackbar('Failed to update user status.', { variant: 'error' });
        }
      }}

    />
        
        <Container>
    <ProfileDefaultContent
      ref={formikRef}
      providerId={id}
      provider={provider}
      profileImage={selectedImage}
      setFormikMeta={setFormikMeta}

    />
        </Container>
  </PermissionGuard>
    </Fragment>;
};
export { ProfileDefaultPage };