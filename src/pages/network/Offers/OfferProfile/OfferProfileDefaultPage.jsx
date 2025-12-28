import { Fragment } from 'react';
import { Container } from '@/components/container';
import { OfferProfileDefaultContent } from '.';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle,ToolbarActions } from '@/partials/toolbar';
import { useLayout } from '@/providers';
import { PermissionGuard } from '@/components/PermissionGuard';

const OfferProfileDefaultPage = () => {
  const {
    currentLayout
  } = useLayout();
  const { id } = useParams();
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION))?.access_token;
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/offer/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        setProvider(res.data.data);
      } catch (error) {
        // Security: Don't expose detailed error info in production
        const errorMessage = import.meta.env.DEV
          ? `Failed to fetch offer: ${error.message || 'Unknown error'}`
          : 'Failed to fetch offer details. Please try again.';
        console.error(errorMessage);
        if (import.meta.env.DEV && error.response) {
          console.error('Error response:', error.response.data);
        }
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
  {currentLayout?.name === 'demo1-layout' &&
   <Container>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle />
        </ToolbarHeading>
        <ToolbarActions>
          <PermissionGuard permissionKey="EditOffer" action="edit">
          <Link to={`/EditOffer/${id}`} className="btn btn-outline btn-primary cursor-pointer">
            Edit Offer
            <i className="ki-filled ki-plus-squared"></i>
          </Link>
          </PermissionGuard>
        </ToolbarActions>
      </Toolbar>
    </Container>}

      
      <Container>
      <OfferProfileDefaultContent provider={provider}  />
      </Container>
    </Fragment>;
};
export { OfferProfileDefaultPage };