import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import axios from 'axios';
import { customStyles } from '../../Bussiness/AddBussiness/PersonNameSelect';

const OfferSelect = ({ formik }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingOfferDetails, setFetchingOfferDetails] = useState(false);

  // Extract formik values and methods for stable references
  // Use optional chaining for safety
  const offerUid = formik?.values?.offer_uid || '';
  const spUid = formik?.values?.sp_uid || '';
  const setFieldValue = formik?.setFieldValue;
  const setFieldTouched = formik?.setFieldTouched;

  // Fetch offers based on selected business
  useEffect(() => {
    const fetchOffers = async () => {
      // Don't fetch if no business is selected
      if (!spUid) {
        setOptions([]);
        // Reset offer selection when business is cleared
        if (setFieldValue) {
          setFieldValue('offer_uid', '');
          setFieldValue('offerData', null);
          setFieldValue('selectedOptions', []);
        }
        return;
      }

      setLoading(true);
      try {
        const token = JSON.parse(localStorage.getItem(
          import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
        ))?.access_token;
    
        let allOffers = [];
        let page = 1;
        let lastPage = 1;
    
        do {
          const res = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/provider/offers?filter[sp_uid]=${spUid}&page=${page}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
    
          const offers = res.data?.data || [];
          lastPage = res.data?.pagination?.last_page || 1;
          allOffers = allOffers.concat(offers);
          page++;
        } while (page <= lastPage);
    
        setOptions(allOffers.map((offer) => ({
          value: offer.id.toString(),
          label: offer.title,
        })));

        // Reset offer selection when business changes (if current offer is not in new list)
        if (setFieldValue && offerUid) {
          const currentOfferExists = allOffers.some(offer => offer.id.toString() === offerUid);
          if (!currentOfferExists) {
            setFieldValue('offer_uid', '');
            setFieldValue('offerData', null);
            setFieldValue('selectedOptions', []);
          }
        }
      } catch (error) {
        console.error("Failed to load offers", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOffers();
  }, [spUid, setFieldValue, offerUid]);

  // Fetch full offer details when offer is selected
  useEffect(() => {
    const fetchOfferDetails = async () => {
      if (!offerUid || !setFieldValue) {
        if (setFieldValue) {
          setFieldValue('offerData', null);
          setFieldValue('selectedOptions', []);
        }
        return;
      }

      setFetchingOfferDetails(true);
      try {
        const token = JSON.parse(localStorage.getItem(
          import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
        ))?.access_token;

        const res = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/offer/${offerUid}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const offerData = res.data?.data;
        if (offerData && setFieldValue) {
          setFieldValue('offerData', offerData);
          // Reset selected options when offer changes
          setFieldValue('selectedOptions', []);
        }
      } catch (error) {
        console.error("Failed to load offer details", error);
        if (setFieldValue) {
          setFieldValue('offerData', null);
          setFieldValue('selectedOptions', []);
        }
      } finally {
        setFetchingOfferDetails(false);
      }
    };

    fetchOfferDetails();
  }, [offerUid, setFieldValue]);

  // Memoize change handler to prevent unnecessary re-renders
  const handleChange = useCallback((selected) => {
    if (!setFieldValue) return;
    const selectedValue = selected?.value || '';
    setFieldValue('offer_uid', selectedValue);
    // Reset offer data and selected options when changing offer
    setFieldValue('offerData', null);
    setFieldValue('selectedOptions', []);
  }, [setFieldValue]);

  // Memoize blur handler
  const handleBlur = useCallback(() => {
    if (setFieldTouched) {
      setFieldTouched('offer_uid', true);
    }
  }, [setFieldTouched]);

  // Early return if formik is invalid (after all hooks)
  if (!formik || !setFieldValue || !formik.values) {
    return null;
  }

  const selected = options.find(opt => opt.value === offerUid);

  return (
    <Select
      options={options}
      isLoading={loading || fetchingOfferDetails}
      placeholder={spUid ? "Select Offer" : "Select Business First"}
      isDisabled={!spUid}
      styles={customStyles}
      value={selected || null}
      onChange={handleChange}
      onBlur={handleBlur}
      noOptionsMessage={() => {
        if (loading) return 'Loading offers...';
        if (!spUid) return 'Please select a business first';
        return 'No offers available for this business';
      }}
    />
  );
};


export {OfferSelect};

// Props validation
OfferSelect.propTypes = {
  formik: PropTypes.shape({
    setFieldValue: PropTypes.func.isRequired,
    setFieldTouched: PropTypes.func,
    values: PropTypes.shape({
      offer_uid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      sp_uid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
  }).isRequired,
};
