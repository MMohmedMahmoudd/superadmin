import { Fragment } from 'react';
import { Container } from '@/components/container';
import { UserProfileHero } from './heros';
import { MemberProfileContent } from '.';
import { useParams } from 'react-router-dom';
import { useEffect, useState,useRef  } from 'react';
import axios from 'axios';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { useLayout } from '@/providers';
import { useSnackbar } from 'notistack';


const MemberProfilePage = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const formikRef = useRef();
  const [formikMeta, setFormikMeta] = useState({ errors: {}, touched: {} });

  const {
    currentLayout
  } = useLayout();

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION))?.access_token;
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/team/list?filter[admin_uid]=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Handle the new API response structure - data is an array, get the first item
        const memberData = res.data.data && res.data.data.length > 0 ? res.data.data[0] : null;
        setMember(memberData);
        
        if (!memberData) {
          enqueueSnackbar('Member not found', { variant: 'error' });
        }
      } catch (error) {
        console.error('Failed to fetch member profile', error);
        enqueueSnackbar('Failed to fetch member profile', { variant: 'error' });
      }
    };
    fetchMember();
  }, [id, enqueueSnackbar]);
  if (!member) return <div className="flex justify-center items-center min-h-[250px]">
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

  initialImage={member?.person?.person_image}
  name={member?.person?.person_name}
  onImageChange={setSelectedImage}
  info={[
    { icon: 'sms', label: member?.person?.person_email || '' },
    { icon: 'whatsapp', label: member?.person?.person_mobile || '' }
  ]}
  person_status={member?.person?.person_status} // ✅ Send current status
  onStatusChange={async (newStatus) => {
    try {
      const token = JSON.parse(localStorage.getItem(
        import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
      ))?.access_token;

      const updateData = {
        _method: 'PUT',
        person_status: parseInt(newStatus),
        person_name: member?.person?.person_name,
        person_email: member?.person?.person_email,
        person_mobile: member?.person?.person_mobile,
        country_code: member?.person?.country_code,
        group_uid: member?.group?.group_uid,
        is_customer: '0',
        is_provider: '0',
      };
        
      await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/team/${id}/update`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      enqueueSnackbar('Member status updated successfully!', { variant: 'success' });
  
      // Update local state with numeric status
      setMember(prev => ({
        ...prev,
        person: {
          ...prev.person,
          person_status: parseInt(newStatus)
        }
      }));
  
    } catch (error) {
      console.error('Failed to update member status:', error);
      enqueueSnackbar('Failed to update member status.', { variant: 'error' });
    }
  }}

/>
      
      <Container>
  <MemberProfileContent
    ref={formikRef}
    memberId={id}
    member={member}
    profileImage={selectedImage}
    setFormikMeta={setFormikMeta}

  />
      </Container>
    </Fragment>;
};
export { MemberProfilePage };