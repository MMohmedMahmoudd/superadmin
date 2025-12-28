import { Tabs,Tab, TabsList, TabPanel } from "@/components/tabs";
import {  useState, useEffect } from "react";
import { ReservationTap } from "./ReservationTap";
import { OfferDetailsTap } from "./OfferDetailsTap";
import axios from "axios";
import { OfferBranchesTap } from "./OfferBranchesTap";
import PropTypes from 'prop-types';

const OfferProfileDefaultContent = ({ provider }) => {
  const [activeTab, setActiveTab] = useState("OfferDetails");
  const [offerEn, setOfferEn] = useState(null);
  const [offerAr, setOfferAr] = useState(null);

  useEffect(() => {
    if (!provider?.id) return;
    const fetchOffer = async (lang, setter) => {
      try {
        const token = JSON.parse(localStorage.getItem(
          import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
        ))?.access_token;

        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/offer/${provider.id}`, {
          headers: { 
            Authorization: token ? `Bearer ${token}` : undefined,
            "Accept-Language": lang,
            'Accept': 'application/json',
          }
        });
        setter(res.data.data);
      } catch (error) {
        // Security: Don't expose detailed error info in production
        const errorMessage = import.meta.env.DEV
          ? `Failed to fetch offer (${lang}): ${error.message || 'Unknown error'}`
          : `Failed to fetch offer details`;
        console.error(errorMessage);
        if (import.meta.env.DEV && error.response) {
          console.error('Error response:', error.response.data);
        }
      }
    };
    fetchOffer("en", setOfferEn);
    fetchOffer("ar", setOfferAr);
  }, [provider]);

  if (!offerEn || !offerAr) return <div className="flex justify-center items-center min-h-[250px]">
    <div
      className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary"
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  </div>;

  return (
    <>
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-lg font-semibold card-title">Offer Information</h1>
          <span className="text-base font-semibold ">ID #{provider.id}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex gap-2 mb-2">
              <span className={`badge badge-outline px-3 rounded-lg capitalize ${provider.offer_status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                {provider.offer_status}
              </span>
              <span className={`badge badge-outline px-3 rounded-lg capitalize ${provider.type.title === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                {provider.type.title}
              </span>
              <span className={`badge badge-outline px-3 rounded-lg capitalize ${provider.city.name === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                {provider.city.name}
              </span>
              {/* Add more badges if needed, e.g. offer type */}
            </div>
            <h2 className="text-2xl font-bold mb-2 max-w-xl">{provider.title}</h2>
            <div className="flex flex-wrap gap-8 mt-4">
              <div>
                <div className="text-xs text-gray-500">Price</div>
                <div className="font-semibold">{provider.offer_price}{provider.currency_name ? ` ${provider.currency_name}` : ''}</div>
              </div>
              <div className="border-l-2 border-gray-200 h-auto"></div>
              <div>
                <div className="text-xs text-gray-500">Coupon Quantity</div>
                <div className="font-semibold">{provider.options[0].offer.offer_copouns_qty}</div>
              </div>
              <div className="border-l-2 border-gray-200 h-auto"></div>

              {/* <div>
                <div className="text-xs text-gray-500">Coupon End Date</div>
                <div className="font-semibold">{provider.coupon_end_date}</div>
              </div>
              <div className="border-l-2 border-gray-200 h-auto"></div> */}

              <div>
                <div className="text-xs text-gray-500">Offer End Date</div>
                <div className="font-semibold">{provider.offer_end_date}</div>
              </div>
              <div className="border-l-2 border-gray-200 h-auto"></div>
              <div>
                <div className="text-xs text-gray-500">Earning</div>
                <div className="font-semibold">{provider.net_profit}</div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <TabsList className="flex flex-wrap">
            <Tab value="OfferDetails">Offer Details</Tab>
            <Tab value="Reservations">Reservations</Tab>
            <Tab value="OfferBranches">OfferBranches</Tab>
          </TabsList>
          <TabPanel value="Reservations">
          <div className="mt-5  gap-5 lg:gap-7.5">

            <ReservationTap offerId={provider.id} />
            </div>
          </TabPanel>
          <TabPanel value="OfferDetails">
            <div className="mt-5  gap-5 lg:gap-7.5">
                {/* Add your customers content here */}
                <OfferDetailsTap offerEn={offerEn} offerAr={offerAr} />

            </div>
          </TabPanel>
          <TabPanel value="OfferBranches">
          <div className="mt-5  gap-5 lg:gap-7.5">
                {/* Add your customers content here */}
                <OfferBranchesTap provider={provider} />

            </div>

          </TabPanel>

        </Tabs>
      </div>

    </>
  );
};
OfferProfileDefaultContent.propTypes = {
  provider: PropTypes.shape({
    id: PropTypes.number.isRequired,
    offer_status: PropTypes.string.isRequired,
    type: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }),
    city: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
    title: PropTypes.string.isRequired,
    offer_price: PropTypes.number.isRequired,
    currency_name: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      offer: PropTypes.shape({
        offer_copouns_qty: PropTypes.number.isRequired,
      }),
    })),
    coupon_end_date: PropTypes.string.isRequired,
    offer_end_date: PropTypes.string.isRequired,
    net_profit: PropTypes.number.isRequired,
  }).isRequired,
};
export { OfferProfileDefaultContent };