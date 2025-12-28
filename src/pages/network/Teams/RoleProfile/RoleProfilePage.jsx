import { Fragment } from 'react';
import { Container } from '@/components/container';
import { RoleProfileContent } from '.';
import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { useLayout } from '@/providers';
import { useSnackbar } from 'notistack';

const RoleProfilePage = () => {
  const { id } = useParams();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const formikRef = useRef();

  const { currentLayout } = useLayout();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoading(true);
        const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION))?.access_token;
        
        if (!token) {
          enqueueSnackbar('Authentication token not found', { variant: 'error' });
          return;
        }

        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/roles/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          setRole(res.data.data);
        } else {
          enqueueSnackbar(res.data.message || 'Failed to fetch role', { variant: 'error' });
        }
      } catch (error) {
        console.error('Failed to fetch role profile', error);
        enqueueSnackbar(error.response?.data?.message || 'Failed to fetch role profile', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRole();
    }
  }, [id, enqueueSnackbar]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[250px]">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
            </ToolbarHeading>
          </Toolbar>
        </Container>
      )}

      <Container>
        <RoleProfileContent
          ref={formikRef}
          roleId={id}
          role={role}
        />
      </Container>
    </Fragment>
  );
};

export { RoleProfilePage };