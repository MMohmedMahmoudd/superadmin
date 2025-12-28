import { Fragment } from 'react';
import { Container } from '@/components/container';
import { UserProfileHero } from './heros';
import { ProfileUserContent } from '.';
import { useParams } from 'react-router-dom';
import { useEffect, useState,useRef  } from 'react';
import axios from 'axios';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { useLayout } from '@/providers';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

const ProfileUserPage = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const formikRef = useRef();
  const [formikMeta, setFormikMeta] = useState({ errors: {}, touched: {} });
  const navigate = useNavigate();
  const {
    currentLayout
  } = useLayout();

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

      // 🔁 Only update the status here so we don't overwrite
      // any edited name/email/phone from the form with old provider data
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('person_status', person_status);
      formData.append('is_customer', '1');
      formData.append('is_provider', '0');

      await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/user/${id}/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      enqueueSnackbar('user status updated successfully!', { variant: 'success' });
      navigate(`/Users`);
  
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
  <ProfileUserContent
    ref={formikRef}
    providerId={id}
    provider={provider}
    profileImage={selectedImage}
    setFormikMeta={setFormikMeta}

  />
      </Container>
    </Fragment>;
};
export { ProfileUserPage };