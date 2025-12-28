import { Fragment, useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
import { Container } from '@/components/container';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { EditPaymentMethodContent } from './EditPaymentMethodContent';
import { useLayout } from '@/providers';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EditPaymentMethodPage = () => {
  const { id } = useParams();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    currentLayout
  } = useLayout();

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
        const authData = storedAuth ? JSON.parse(storedAuth) : null;
        const token = authData?.access_token;

        if (!token) {
          window.location.href = '/auth/login';
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/payment-methods?filter[payment_id]=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.data?.[0]) {
          setPaymentMethod(response.data.data[0]);
          console.log("paymentMethod",paymentMethod);
        }
      } catch (error) {
        console.error('Error fetching payment method:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPaymentMethod();
    }
  }, [id]);

  return <Fragment>
      {currentLayout?.name === 'demo1-layout' && <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
            </ToolbarHeading>
          </Toolbar>
        </Container>}

      <Container >
        <EditPaymentMethodContent paymentMethod={paymentMethod} loading={loading} />
      </Container>
    </Fragment>;
};
export { EditPaymentMethodPage };