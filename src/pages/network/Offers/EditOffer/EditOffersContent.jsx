import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { Tabs, Tab, TabsList, TabPanel } from "@/components/tabs";
import { toAbsoluteUrl } from '@/utils';
import 'leaflet/dist/leaflet.css';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CrudMultiImageUpload } from './CrudMultiImageUpload';
import { CrudVideoUpload } from './CrudVideoUpload';
import { BusinessSelect } from './BusinessSelect';
import { CategorySelect } from './CategorySelect';
import {FlowbiteHtmlDatepicker} from '@/components';
import { BranchesSelect } from './BranchesSelect';
import { CitySelect } from './CitySelect';
import { useParams } from 'react-router-dom';
import RichTextEditor from '@/components/RichTextEditor';
import YesNoSelect from '@/components/YesNoSelect';
import { AmenitiesSidebar } from '../AddOffers/AmenitiesSidebar';
import { KeenIcon } from '@/components/keenicons';

const normalizeText = (value, fallback = '') => {
  if (!value) return fallback;
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') return value.en?.trim() || value.ar?.trim() || fallback;
  return fallback;
};

const normalizeAmenity = (amenity) => {
  if (!amenity) return amenity;
  return {
    ...amenity,
    name: normalizeText(amenity.name, amenity.name?.en || amenity.name?.ar || ''),
  };
};

const EditOffersContent = () => {
  const { id } = useParams();
  const [offer, setOffer] = useState(null);
  const [activeTab, setActiveTab] = useState("English");
  const [loading, setLoading] = useState(false);
  const [amenitiesSidebarOpen, setAmenitiesSidebarOpen] = useState(false);
  const [offerOptions, setOfferOptions] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const formikRef = useRef();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      business_id: offer?.user?.id?.toString() || '',
      businessData: {
        id: offer?.user?.id?.toString() || '',
        name: offer?.user?.name || '',
        image: offer?.user?.image || '',
        type: {
          id: offer?.type?.id?.toString() || '',     // 🟢 this is the fix
          title: offer?.type?.title || '',
        },
      },
      cat_uid:'', // ← after backend adds sub_category
      offer_price: offer?.offer_price || '',
      offer_copouns_qty: offer?.offer_copouns_qty || '',
      offer_images: offer?.offer_images || [], // You can preload these into your image uploader if needed
      offer_end_date: offer?.offer_end_date || '',
      coupon_end_date: offer?.coupon_end_date || '',
      checkAvailability: offer?.check_availability || 0,
      // English
      offer_title_english: offer?.title || '',
      offer_description_english: offer?.description || '',
      offer_cancel_policy_english: offer?.offer_cancel_policy || '',
      offer_know_before_go_english: offer?.offer_terms_conditions || '',
    
      // Arabic (fill with empty or translated later if you have Arabic fields)
      offer_title_arabic: '',
      offer_description_arabic: '',
      offer_cancel_policy_arabic: '',
      offer_know_before_go_arabic: '',
    
      branches_id: offer?.branches?.map(branch => branch.id.toString()) || [], // Initialize with branch IDs from the offer as strings
      offer_status: (() => {
        const raw = offer?.offer_status?.toString().toLowerCase();
        if (raw === '1' || raw === 'active') return '1';
        if (raw === '2' || raw === 'pending') return '2';
        if (raw === '0' || raw === 'inactive') return '0';
        return '';
      })(),
      city_name: normalizeText(offer?.city?.name, ''),
      city_uid: offer?.city?.id?.toString() || '',
      is_best_offer: offer?.options?.[0]?.offer?.is_best_offer?.toString() || '',
      offer_things_to_do: offer?.options?.[0]?.offer?.offer_things_to_do?.toString() || '',
      offer_video: offer?.offer_video || null,
    },
        validationSchema: Yup.object({
      business_id: Yup.string().required('Business is required'),
      cat_uid: Yup.string().required('Category is required'),
      offer_price: Yup.string().required('Price is required'),
      offer_copouns_qty: Yup.string().required('Coupon quantity is required'),
      offer_end_date: Yup.string().required('Offer end date is required'),
      coupon_end_date: Yup.string().required('Coupon end date is required'),
      offer_title_english: Yup.string().required('English title is required'),
      offer_description_english: Yup.string().required('English description is required'),
      offer_title_arabic: Yup.string().required('Arabic title is required'),
      offer_description_arabic: Yup.string().required('Arabic description is required'),
      offer_status: Yup.string().required('Status is required'),
      offer_images: Yup.array().of(Yup.mixed()).required('Offer images are required'),
      // offer_highlights_english: Yup.string().required('English highlights are required'),
      // offer_highlights_arabic: Yup.string().required('Arabic highlights are required'),
      // offer_inclusions_english: Yup.string().required('English inclusions are required'),
      // offer_inclusions_arabic: Yup.string().required('Arabic inclusions are required'),
      // offer_exclusions_english: Yup.string().required('English exclusions are required'),
      // offer_exclusions_arabic: Yup.string().required('Arabic exclusions are required'),
      // offer_cancel_policy_english: Yup.string().required('English cancellation policy is required'),
      // offer_cancel_policy_arabic: Yup.string().required('Arabic cancellation policy is required'),
      // offer_know_before_go_english: Yup.string().required('English terms and conditions are required'),
      // offer_know_before_go_arabic: Yup.string().required('Arabic terms and conditions are required'),
      branches_id: Yup.array().min(1, 'At least one branch must be selected').required('Branch is required'),
      city_name: Yup.string().required('City is required'),
      city_uid: Yup.string().required('City is required'),
    }),
        onSubmit: (values) => {
      console.log('Form submitted:', values);
      // your submission logic here
    },
  });

  // Store formik reference for use in useCallback
  formikRef.current = formik;

  const { offer_end_date: offerEndDate, coupon_end_date: couponEndDate } = formik.values;
  const { setFieldValue } = formik;

  useEffect(() => {
    if (offerEndDate && couponEndDate !== offerEndDate) {
      setFieldValue('coupon_end_date', offerEndDate, false);
    }
  }, [offerEndDate, couponEndDate, setFieldValue]);

  const handleVideoChange = (video) => {
    formik.setFieldValue('offer_video', video);
  };

  const handleAmenitySelect = (amenity) => {
    // If it's an offer option (has price, title, etc.)
    if (amenity.price && amenity.titleEnglish) {
      if (editingOption) {
        // Update existing option
        setOfferOptions(prev => prev.map(option => 
          option.id === editingOption.id ? amenity : option
        ));
        setEditingOption(null); // Clear editing state
      } else {
        // Create new option
        setOfferOptions(prev => [...prev, amenity]);
      }
      return;
    }
    
    // Original amenity selection logic (if needed for other purposes)
    const current = Array.isArray(formik.values.amenities) ? formik.values.amenities : [];
    const exists = current.find((a) => a.id === amenity.id);
    const next = exists ? current.filter((a) => a.id !== amenity.id) : [...current, amenity];
    formik.setFieldValue('amenities', next);
  };

  const handleDeleteOfferOption = (optionId) => {
    setOfferOptions(prev => prev.filter(option => option.id !== optionId));
    enqueueSnackbar('Offer option deleted successfully!', { variant: 'success' });
  };

  const handleEditOfferOption = (option) => {
    setEditingOption(option);
    setAmenitiesSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setAmenitiesSidebarOpen(false);
    setEditingOption(null); // Reset editing state when closing
  };

    const fetchOffer = useCallback(async () => {
      try {
        console.log('🔍 Fetching offer for ID:', id);
        const token = JSON.parse(localStorage.getItem(
          import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
        ))?.access_token;

        // Fetch English content
        const responseEn = await axios.get(`${import.meta.env.VITE_APP_API_URL}/offer/${id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Accept-Language": "en"
          },
        });

        console.log('🔍 Offer fetched successfully:', responseEn.data.data);
        setOffer(responseEn.data.data);
        
        // Set business data
        const businessData = {
          id: responseEn.data.data.user?.id?.toString() || '',
          name: responseEn.data.data.user?.name || '',
          image: responseEn.data.data.user?.image || '',
          type: {
            id: responseEn.data.data.type?.id?.toString() || '',
            title: responseEn.data.data.type?.title || '',
          },
        };
        
        // Set all form values at once to avoid multiple re-renders
        const formValues = {
          businessData,
          business_id: businessData.id,
          cat_uid: responseEn.data.data.options?.[0]?.offer?.cat_uid?.toString() || '',
          offer_price: responseEn.data.data.offer_price || '',
          offer_copouns_qty: responseEn.data.data.options?.[0]?.offer?.offer_copouns_qty?.toString() || '',
          offer_end_date: responseEn.data.data.offer_end_date || '',
          coupon_end_date: responseEn.data.data.coupon_end_date || '',
          checkAvailability: responseEn.data.data.check_availability || 0,
          offer_title_english: responseEn.data.data.title || '',
          offer_description_english: responseEn.data.data.description || '',
          offer_cancel_policy_english: responseEn.data.data.offer_cancel_policy || '',
          offer_know_before_go_english: responseEn.data.data.offer_know_before_go || '',
          city_name: normalizeText(responseEn.data.data.city?.name, ''),
          city_uid: responseEn.data.data.city?.id?.toString() || '',
          branches_id: (() => {
            // Parse branches_id from offer object (can be plain array, JSON string, or double-encoded string)
            const branchesIdRaw = responseEn.data.data.options?.[0]?.offer?.branches_id;
            console.log('🔍 Raw branches_id string:', branchesIdRaw);
            try {
              if (!branchesIdRaw) throw new Error('branches_id missing');

              // Step 1: if it's a string, try to JSON.parse it
              let parsed = typeof branchesIdRaw === 'string' ? JSON.parse(branchesIdRaw) : branchesIdRaw;
              console.log('🔍 First parse result:', parsed);

              // Step 2: handle double-encoded case where first parse returns a string
              if (typeof parsed === 'string') {
                parsed = JSON.parse(parsed);
                console.log('🔍 Second parse result:', parsed);
              }

              const result = Array.isArray(parsed) ? parsed.map((id) => id.toString()) : [];
              if (result.length === 0) throw new Error('Parsed branches_id is empty');
              console.log('🔍 Parsed branches_id:', result);
              return result;
            } catch (e) {
              console.error('❌ Error parsing branches_id:', e);
            }
            // Fallback to all branches if no specific branches_id is set or parsing fails
            const fallback = responseEn.data.data.branches?.map(branch => branch.id.toString()) || [];
            console.log('🔍 Using fallback branches_id:', fallback);
            return fallback;
          })(),
          offer_status: (() => {
            const raw = responseEn.data.data.offer_status?.toString().toLowerCase();
            if (raw === '1' || raw === 'active') return '1';
            if (raw === '2' || raw === 'pending') return '2';
            if (raw === '0' || raw === 'inactive') return '0';
            return '';
          })(),
          is_best_offer: responseEn.data.data.options?.[0]?.offer?.is_best_offer?.toString() || '',
          offer_things_to_do: responseEn.data.data.options?.[0]?.offer?.offer_things_to_do?.toString() || '',
          offer_video: responseEn.data.data.offer_video || null,
          amenities: [],
        };

        // Fetch Arabic content
        try {
          const responseAr = await axios.get(`${import.meta.env.VITE_APP_API_URL}/offer/${id}`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Accept-Language": "ar"
            },
          });

          // Set Arabic content only if they exist and are not empty
          const arabicData = responseAr.data.data;
          
          Object.assign(formValues, {
            offer_title_arabic: arabicData.title || '',
            offer_description_arabic: arabicData.description || '',
            offer_cancel_policy_arabic: arabicData.offer_cancel_policy || '',
            offer_know_before_go_arabic: arabicData.offer_know_before_go || ''
          });

        } catch (arabicError) {
          console.error('Error fetching Arabic content:', arabicError);
          // Set empty values for Arabic fields if API call fails
          Object.assign(formValues, {
            offer_title_arabic: '',
            offer_description_arabic: '',
            offer_cancel_policy_arabic: '',
            offer_know_before_go_arabic: ''
          });
        }

        const preloadedImages = (responseEn.data.data.offer_images || [])
          .filter(Boolean)
          .map((url, i) => {
            return Object.assign(new File([""], `image${i}.jpg`, { type: "image/jpeg" }), {
              preview: url
            });
          });
      
        formValues.offer_images = preloadedImages;

        // Debug: Log checkAvailability value
        console.log('🔍 checkAvailability from API:', responseEn.data.data.check_availability);
        console.log('🔍 checkAvailability in formValues:', formValues.checkAvailability);

        // Debug: Log the form values being set
        console.log('🔍 Setting form values:', {
          cat_uid: formValues.cat_uid,
          city_uid: formValues.city_uid,
          city_name: formValues.city_name,
          branches_id: formValues.branches_id,
          offer_branches_raw: responseEn.data.data.branches,
          offer_branches_id_raw: responseEn.data.data.options?.[0]?.offer?.branches_id,
          checkAvailability: formValues.checkAvailability,
          offer_copouns_qty: formValues.offer_copouns_qty,
          offer_cancel_policy_english: formValues.offer_cancel_policy_english,
          offer_know_before_go_english: formValues.offer_know_before_go_english,
        });

        // Set all form values at once
        if (formikRef.current) {
          formikRef.current.setValues(formValues);
        }

        // Initialize offer options from existing offer data
        const existingOptions = responseEn.data.data.options || [];
        const formattedOptions = existingOptions.map(option => {
          // Normalize images: accept array of { image } or raw strings
          const imagesArray = Array.isArray(option.images)
            ? option.images
                .filter(Boolean)
                .map(img => (typeof img === 'string' ? img : img?.image))
                .filter(Boolean)
            : (option.image ? [option.image] : []);

          return {
            id: option.id,
            titleEnglish: normalizeText(option.name, ''),
            titleArabic: normalizeText(option.name, ''),
            descriptionEnglish: normalizeText(option.description, ''),
            descriptionArabic: normalizeText(option.description, ''),
            price: option.price || 0,
            couponQuantity: option.qty || 0,
            amenities: (option.amenities || []).map(normalizeAmenity),
            // Prefer full images array; keep single image for legacy support
            images: imagesArray,
            image: imagesArray?.[0] || null,
          };
        });
        
        setOfferOptions(formattedOptions);
      } catch (error) {
        console.error('❌ Error fetching offer:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }
    }, [id]);

    useEffect(() => {
      fetchOffer();
    }, [fetchOffer]);

    const handleFileChange = (files) => {
      files.forEach(file => {
        if (!file.preview && typeof file !== 'string') {
          URL.revokeObjectURL(file);
        }
      });
        };
    

  
  const handleSubmit = async () => {
    try {
      // Run validation first
      const errors = await formik.validateForm();
  
      if (Object.keys(errors).length > 0) {
        formik.setTouched(
          Object.keys(errors).reduce((acc, key) => {
            acc[key] = true;
            return acc;
          }, {}),
          true
        );
        enqueueSnackbar('Please complete all required fields.', { variant: 'error' });
        return;
      }
  
      setLoading(true);
  
      const data = new FormData();

      // Add the _method=PUT parameter required by the API
      data.append('_method', 'PUT');
      data.append('cat_uid', formik.values.cat_uid);
      data.append('offer_price', formik.values.offer_price);
      data.append('offer_copouns_qty', formik.values.offer_copouns_qty);
      data.append('offer_end_date', formik.values.offer_end_date);
      data.append('coupon_end_date', formik.values.offer_end_date);
      
      // City UID and name required by API
      data.append('city_uid', formik.values.city_uid);
      data.append('city_name', formik.values.city_name);
      
      // Debug: Log city values
      console.log('🔍 Sending city_uid:', formik.values.city_uid);
      console.log('🔍 Sending city_name:', formik.values.city_name);
      
      // Multi-language
      data.append('offer_title_english', formik.values.offer_title_english);
      data.append('offer_description_english', formik.values.offer_description_english);
      data.append('offer_cancel_policy_english', formik.values.offer_cancel_policy_english);
      data.append('offer_know_before_go_english', formik.values.offer_know_before_go_english);
      
      data.append('offer_title_arabic', formik.values.offer_title_arabic);
      data.append('offer_description_arabic', formik.values.offer_description_arabic);
      data.append('offer_cancel_policy_arabic', formik.values.offer_cancel_policy_arabic);
      data.append('offer_know_before_go_arabic', formik.values.offer_know_before_go_arabic);
      
      // offer_status and check availability
      data.append('offer_status', formik.values.offer_status);
      console.log('🔍 Sending check_availability:', formik.values.checkAvailability);
      data.append('check_availability', formik.values.checkAvailability);
      data.append('offer_uid', id);
      data.append('sp_uid', formik.values.business_id);
      
      // Add the new fields
      if (formik.values.is_best_offer !== '') {
        data.append('is_best_offer', formik.values.is_best_offer);
      }
      if (formik.values.offer_things_to_do !== '') {
        data.append('offer_things_to_do', formik.values.offer_things_to_do);
      }

      // Build options as indexed multipart fields: options[0][field], options[0][amenities][], options[0][images][]
      if (offerOptions && offerOptions.length > 0) {
        offerOptions.forEach((opt, idx) => {
          if (opt.id) data.append(`options[${idx}][id]`, String(opt.id));
          if (opt.price !== undefined) data.append(`options[${idx}][price]`, String(opt.price));
          if (opt.couponQuantity !== undefined) data.append(`options[${idx}][coupons_qty]`, String(opt.couponQuantity));
          if (opt.titleEnglish !== undefined) data.append(`options[${idx}][title]`, opt.titleEnglish);
          if (opt.titleArabic !== undefined) data.append(`options[${idx}][title_ar]`, opt.titleArabic);
          if (opt.descriptionEnglish !== undefined) data.append(`options[${idx}][description]`, opt.descriptionEnglish);
          if (opt.descriptionArabic !== undefined) data.append(`options[${idx}][description_ar]`, opt.descriptionArabic);
          const amenityIds = Array.isArray(opt.amenities) ? opt.amenities.map((a) => a.id) : [];
          amenityIds.forEach((id) => data.append(`options[${idx}][amenities][]`, String(id)));

          // Images: append all imageFiles as options[idx][images][] according to backend format
          // Support both new format (imageFiles array) and legacy format (single imageFile)
          if (opt.imageFiles && Array.isArray(opt.imageFiles)) {
            opt.imageFiles.forEach((imageFile) => {
              if (imageFile instanceof File) {
                data.append(`options[${idx}][images][]`, imageFile);
              }
            });
          } else if (opt.imageFile instanceof File) {
            data.append(`options[${idx}][images][]`, opt.imageFile);
          }
        });
      }

    // Before sending form
    if (formik.values.branches_id.length === 0) {
      enqueueSnackbar('Please select at least one branch.', { variant: 'error' });
      return;
    }

    // Adjust branchesPayload based on API expectation (string "all" or JSON string array)
    const branchesPayload = formik.values.branches_id.includes('all')
      ? "all"
      : JSON.stringify(formik.values.branches_id.map(id => id.toString()));

    data.append('branches_id', branchesPayload);

      // Images - only append new File objects, not preloaded ones with a preview property
      formik.values.offer_images.forEach((file, index) => {
        // Check if it's a File object and not a preloaded file with a preview property
        if (file instanceof File && !file.preview) {
          data.append(`offer_image_${index + 1}`, file);
        }
      });

      // Video upload
      if (formik.values.offer_video) {
        data.append('offer_video', formik.values.offer_video);
      }
            
  
      const token = JSON.parse(localStorage.getItem(
        import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
      ))?.access_token;
  
      console.log('Formik Values:', formik.values); // Log formik values
      // Log the contents of the FormData object
      console.log('FormData contents before sending:');
      for (let pair of data.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }

      console.log('Offer ID:', id); // Log the offer ID before the API call
      console.log('Posting to:', `${import.meta.env.VITE_APP_API_URL}/provider/offer/${id}/update`);

      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/provider/offer/${id}/update`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        });
      console.log('✅ Offer Created:', response.data);
      enqueueSnackbar('Offer Updated successfully!', { variant: 'success' });
      navigate('/Offers');
  
    } catch (error) {
      console.error('❌ Submission failed:', error);
      const responseErrors = error?.response?.data?.errors || {};
  
      const errorMessage =
        error?.response?.data?.message ||
        Object.values(responseErrors)[0]?.[0] ||
        'Something went wrong. Please try again.';
  
      enqueueSnackbar(errorMessage, { variant: 'error' });
  
    } finally {
      setLoading(false);
    }
  };


  if (!offer) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      </div>
    );
  }
  
  
  return (
<form className="w-full" onSubmit={formik.handleSubmit}>
        {/* Dashed Line Separator Between Steps */}

      {/* Stepper Body */}
      <div className="card-body p-1 ">
  <div  className="grid grid-cols-1 xl:grid-cols-2 gap-4">

    <div className="col-span-3 xl:col-span-2 card ">
      <div className="card-header">
        <h3 className="  card-title">Business Information</h3>
      </div>
      <div className="grid card-body grid-cols-2 gap-4">
        <div>
          <label className="form-label mb-1" htmlFor="business_select">Business Name</label>
          <BusinessSelect formik={formik} id="business_select" />
        </div>
        <div className="col-span-1">
          <label className="form-label mb-1" htmlFor="offer_status">Status</label>
          <select
            id="offer_status"
            className="select"
            {...formik.getFieldProps('offer_status')}
          >
            <option value="">Select Status</option>
            <option value="1">Active</option>
            <option value="2">Pending</option>
            <option value="0">Inactive</option>
          </select>
          {formik.touched.offer_status && formik.errors.offer_status && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.offer_status}</p>
          )}
        </div>
        <div>
  <label className="form-label mb-1" htmlFor="category_select">Select Category</label>
  <CategorySelect 
    formik={formik} 
    typeId={formik.values.businessData?.type?.id || ''} 
    id="category_select"
    initialCategory={formik.values.cat_uid}
  />
  </div>
  <div>
    <label className="form-label mb-1" htmlFor="offer_price">Price</label>
    <input
      id="offer_price"
      type="number"
      className="input"
      {...formik.getFieldProps('offer_price')}
    />
    {formik.touched.offer_price && formik.errors.offer_price && (
      <p className="text-red-500 text-xs mt-1">{formik.errors.offer_price}</p>
    )}
  </div>
  <div>
          <label className="form-label mb-1" htmlFor="offer_copouns_qty">Coupon Quantity</label>
          <input
            id="offer_copouns_qty"
            type="number"
            className="input"
            {...formik.getFieldProps('offer_copouns_qty')}
          />
          {formik.touched.offer_copouns_qty && formik.errors.offer_copouns_qty && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.offer_copouns_qty}</p>
          )}
        </div>
        <div className="hidden">
          <label className="form-label mb-1" htmlFor="coupon_end_date">Coupon Valid Date</label>
          <FlowbiteHtmlDatepicker
      id="coupon_end_date"
      value={formik.values.coupon_end_date}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      name="coupon_end_date" // ✅ important for Formik
      placeholder="Select Coupon Valid Date"
    />
    {formik.touched.coupon_end_date && formik.errors.coupon_end_date && (
      <p className="text-red-500 text-xs mt-1">{formik.errors.coupon_end_date}</p>
    )}
        </div>

        <div className="col-span-1 ">
  <label className="form-label mb-1" htmlFor="offer_end_date">Offer Valid Date</label>
    <FlowbiteHtmlDatepicker
      id="offer_end_date"
      value={formik.values.offer_end_date}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      name="offer_end_date" // ✅ important for Formik
      placeholder="Select Offer Valid Date"
    />
{formik.touched.offer_end_date && formik.errors.offer_end_date && (
  <p className="text-red-500 text-xs mt-1">{formik.errors.offer_end_date}</p>
)}
</div>

        
      </div>
    </div>
    {/* End of Business Information Card */}

    {/* Offer Options Card */}
    <div className="card col-span-2">
      <div className="card-header">
        <h3 className="card-title">Offer Options</h3>
      </div>
      <div className="card-body">
        {/* Display existing offer options */}
        {offerOptions.length > 0 && (
          <div className="space-y-4 mb-6">
            {offerOptions.map((option) => (
              <div key={option.id} className="flex items-center gap-4 p-4 border rounded-lg bg-gray-200">
                {/* Drag Handle */}
                <div className="cursor-move text-gray-400">
                  <KeenIcon icon="menu" />
                </div>
                
                {/* Images Preview */}
                <div className="relative">
                  {(() => {
                    // Support both new format (images array) and legacy format (single image)
                    let images = Array.isArray(option.images) && option.images.length > 0
                      ? option.images
                      : option.image
                        ? [option.image]
                        : [];

                    // If no images on the option, try to read from localStorage (durable previews)
                    if (images.length === 0 && option?.id) {
                      try {
                        const list = JSON.parse(localStorage.getItem('offer_option_previews') || '[]');
                        const rec = Array.isArray(list) ? list.find(r => r && r.id === option.id) : null;
                        if (rec?.images && Array.isArray(rec.images) && rec.images.length > 0) {
                          images = rec.images;
                        } else if (rec?.image) {
                          images = [rec.image];
                        }
                      } catch { /* noop */ }
                    }

                    if (images.length === 0) {
                      return (
                        <img
                          src={toAbsoluteUrl('/media/avatars/blank.png')}
                          alt={option.titleEnglish || 'Option image'}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-300"
                          onError={(e) => {
                            e.currentTarget.src = toAbsoluteUrl('/media/avatars/blank.png');
                          }}
                        />
                      );
                    }

                    // Show all images in a horizontal scrollable gallery
                    return (
                      <div className="flex items-center gap-1.5 max-w-[200px] overflow-x-auto pb-1">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative flex-shrink-0">
                            <img
                              src={img || toAbsoluteUrl('/media/avatars/blank.png')}
                              alt={`${option.titleEnglish} - Image ${idx + 1}`}
                              className="w-14 h-14 rounded-lg object-cover border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                              onError={(e) => {
                                e.currentTarget.src = toAbsoluteUrl('/media/avatars/blank.png');
                              }}
                            />
                            {images.length > 1 && (
                              <div className="absolute -top-1 -right-1 bg-gray-800 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                                {idx + 1}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{option.titleEnglish}</h4>
                  <p className="text-gray-600 text-sm mb-2">{option.descriptionEnglish}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    {Array.isArray(option.amenities) && option.amenities.length > 0 ? (
                      <>
                        {option.amenities.slice(0, 5).map((amenity) => (
                          <span key={amenity.id ?? amenity.name} className="inline-flex items-center gap-1">
                            {amenity.icon ? (
                              <img
                                src={amenity.icon}
                                alt={amenity.name}
                                className="w-4 h-4 object-contain rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <KeenIcon icon="element-11" className="w-4 h-4" />
                            )}
                            {amenity.name}
                          </span>
                        ))}
                        {option.amenities.length > 5 && (
                          <span className="text-gray-400">+{option.amenities.length - 5} more</span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">No amenities selected</span>
                    )}
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    Coupon Quantity: {option.couponQuantity}
                  </div>
                </div>
                
                {/* Price and Actions */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    {option.price} EGP
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditOfferOption(option)}
                      className="btn btn-sm btn-outline btn-primary"
                    >
                      <KeenIcon icon="notepad-edit" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOfferOption(option.id)}
                      className="btn btn-sm btn-outline btn-error"
                    >
                      <KeenIcon icon="trash" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add new option button */}
        <div className="flex justify-center items-center dark:bg-gray-200 bg-gray-100 rounded-lg py-4">
          <button
            type="button"
            onClick={() => setAmenitiesSidebarOpen(true)}
            className="btn btn-outline btn-primary flex items-center gap-2"
          >
            <KeenIcon icon="plus" />
            Add new option
          </button>
        </div>
      </div>
    </div>

    {/* branche and city card */}
    <div className="card col-span-2 ">
      <div className="card-header">
        <h3 className="card-title">Branches Where the Offer is Available</h3>
      </div>
      <div className="card-body grid grid-cols-1 gap-4">
        <div className="form-group">
          <label className="form-label mb-1" htmlFor="city_select">City</label>
          <CitySelect formik={formik} id="city_select" />
          {formik.touched.city_name && formik.errors.city_name && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.city_name}</p>
          )}
        </div>
        <div className="form-group">
          <label className="form-label mb-1" htmlFor="branches_select">Branch</label>
          <BranchesSelect 
            key={`branches-${formik.values.businessData?.id || 'no-id'}`}
            providerId={formik.values.businessData?.id}
            offer={offer} 
            selectedCity={formik.values.city_name} 
            formik={formik} 
            id="branches_select"
          />
          {formik.touched.branches_id && formik.errors.branches_id && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.branches_id}</p>
          )}
        </div>
      </div>
    </div>


    {/* Start of activity Card */}
    <div className="card   col-span-2 ">
  {/* Card Header */}
  <div className=" card-header ">
    <h3 className="card-title ">
      Availability Check
    </h3>
  </div>

  {/* Card Body */}
  <div className="flex card-body flex-col gap-4 ">
    {/* Toggle Section */}
    <div className="flex items-center justify-between">
      <h4 className="text-base font-medium  ">
        Require Availability Check
      </h4>
      <label className="flex switch items-center gap-2 cursor-pointer" htmlFor="checkAvailability">
        <input
          id="checkAvailability"
          type="checkbox"
          className="toggle toggle-sm"
          checked={formik.values.checkAvailability === 1}
          onChange={(e) => {
            const newValue = e.target.checked ? 1 : 0;
            console.log('🔍 Checkbox changed. Setting checkAvailability to:', newValue);
            formik.setFieldValue('checkAvailability', newValue);
          }}
        />
      </label>
    </div>

    {/* Description Text */}
    <p className="text-sm  leading-relaxed">
      When clicked, the button in the mobile app will change to &ldquo;Check Availability&rdquo;. 
      Upon clicking, the user will be prompted to select a date, after which a request 
      will be sent to the service provider to confirm availability.
    </p>
  </div>
    </div>

    {/* End of activity Card */}

    {/* Best Offer and Things to Do Card */}
    <div className="card col-span-2">
      <div className="card-header">
        <h3 className="card-title">Offer Settings</h3>
      </div>
      <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label mb-1" htmlFor="is_best_offer">Best Offer</label>
          <YesNoSelect
            id="is_best_offer"
            name="is_best_offer"
            value={formik.values.is_best_offer}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Select if this is a best offer"
            error={formik.touched.is_best_offer && formik.errors.is_best_offer}
          />
          {formik.touched.is_best_offer && formik.errors.is_best_offer && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.is_best_offer}</p>
          )}
        </div>
        <div className="form-group">
          <label className="form-label mb-1" htmlFor="offer_things_to_do">Things to Do</label>
          <YesNoSelect
            id="offer_things_to_do"
            name="offer_things_to_do"
            value={formik.values.offer_things_to_do}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Select if this offer includes things to do"
            error={formik.touched.offer_things_to_do && formik.errors.offer_things_to_do}
          />
          {formik.touched.offer_things_to_do && formik.errors.offer_things_to_do && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.offer_things_to_do}</p>
          )}
        </div>
      </div>
    </div>

        {/* Basic Photos Card */}

        <div className="parent-cruds xl:col-span-2 col-span-3 card p-6">
          <div className="flex justify-center items-center dark:bg-gray-200 bg-gray-100 rounded-lg py-4 flex-col gap-y-4 mb-4">
            <label className="block text-sm font-medium mb-1">Offer Images (max 8)</label>
            <CrudMultiImageUpload 
              onFilesChange={(files) => {
                formik.setFieldValue("offer_images", files);
                handleFileChange(files); // optional cleanup
              }}
              initialFiles={formik.values.offer_images}
            
            />
            <p className="text-sm text-center text-gray-500 mt-1">
              Only *.png, *.jpg, and *.jpeg image files are accepted.
            </p>
          </div>
        </div>

        {/* Video Upload Card */}
        <div className="parent-cruds xl:col-span-2 col-span-3 card p-6">
          <div className="flex justify-center items-center dark:bg-gray-200 bg-gray-100 rounded-lg py-4 flex-col gap-y-4 mb-4">
            <label className="block text-sm font-medium mb-1">Offer Video (Optional)</label>
            <CrudVideoUpload 
              onVideoChange={handleVideoChange}
              initialVideo={formik.values.offer_video}
            />
          </div>
        </div>
    {/* Multi Language Content Card */}

        <div className="card col-span-2">
      <div className="card-header">
        <h3 className="card-title">
          Multi Language Content
        </h3>
      </div>
      <div className="card-body">
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
      <TabsList className="w-full mb-4">
          <Tab value="English" className="w-1/2 flex justify-center items-center gap-2">
            <img src={toAbsoluteUrl("/media/Flags-iso/us.svg")} alt="English" className="w-5 h-5" />
            English
          </Tab>
          <Tab value="Arabic" className="w-1/2 flex justify-center items-center gap-2">
            <img src={toAbsoluteUrl("/media/Flags-iso/sa.svg")} alt="Arabic" className="w-5 h-5" />
            العربية
          </Tab>
      </TabsList>
          <TabPanel value="English" className="grid  gap-4">
            <div className="form-group">
              <label className="form-label mb-1" htmlFor="offer_title_english">Offer Title</label>
              <input 
                id="offer_title_english"
                type="text" 
                className="input" 
                placeholder="Write the offer title..."
                {...formik.getFieldProps('offer_title_english')} 
              />
              {formik.touched.offer_title_english && formik.errors.offer_title_english && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.offer_title_english}</p>
              )}  
            </div>
            <div className="form-group">
              <label className="form-label mb-1" htmlFor="offer_description_english">Offer Description</label>
              <RichTextEditor
                id="offer_description_english"
                onBlur={(name) => formik.setFieldTouched(name, true)}
                name="offer_description_english"
                value={formik.values.offer_description_english}
                onChange={(name, data) => formik.setFieldValue(name, data)}
                placeholder="Write the offer description..."
              />
              {formik.touched.offer_description_english && formik.errors.offer_description_english && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.offer_description_english}</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label mb-1" htmlFor="offer_cancel_policy_english">Cancellation Policy</label>
              <RichTextEditor
                id="offer_cancel_policy_english"
                onBlur={(name) => formik.setFieldTouched(name, true)}
                name="offer_cancel_policy_english"
                value={formik.values.offer_cancel_policy_english}
                onChange={(name, data) => formik.setFieldValue(name, data)}
                placeholder="Write the offer cancellation policy..."
              />
              {formik.touched.offer_cancel_policy_english && formik.errors.offer_cancel_policy_english && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.offer_cancel_policy_english}</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label mb-1" htmlFor="offer_know_before_go_english">Know Before You Go</label>
              <RichTextEditor
                id="offer_know_before_go_english"
                onBlur={(name) => formik.setFieldTouched(name, true)}
                name="offer_know_before_go_english"
                value={formik.values.offer_know_before_go_english}
                onChange={(name, data) => formik.setFieldValue(name, data)}
                placeholder="Write the offer know before you go..."
              />
              {formik.touched.offer_know_before_go_english && formik.errors.offer_know_before_go_english && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.offer_know_before_go_english}</p>
              )}
            </div>
          </TabPanel>
          <TabPanel value="Arabic" className="grid  gap-4">
            <div className="form-group">
              <label className="form-label mb-1" htmlFor="offer_title_arabic" dir="rtl">إسم العرض</label>
              <input 
                id="offer_title_arabic"
                type="text" 
                className="input" 
                dir="rtl" 
                placeholder=" إسم العرض..."
                {...formik.getFieldProps('offer_title_arabic')} 
              />
              {formik.touched.offer_title_arabic && formik.errors.offer_title_arabic && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.offer_title_arabic}</p>
              )}  
            </div>
            <div className="form-group">
              <label className="form-label mb-1" htmlFor="offer_description_arabic" dir="rtl">وصف العرض</label>
              <RichTextEditor
                id="offer_description_arabic"
                onBlur={(name) => formik.setFieldTouched(name, true)}
                className="rtl"
                name="offer_description_arabic"
                value={formik.values.offer_description_arabic}
                onChange={(name, data) => formik.setFieldValue(name, data)}
                placeholder=" وصف العرض..."
              />
              {formik.touched.offer_description_arabic && formik.errors.offer_description_arabic && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.offer_description_arabic}</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label mb-1" htmlFor="offer_cancel_policy_arabic" dir="rtl">سياسة الإلغاء</label>
              <RichTextEditor
                id="offer_cancel_policy_arabic"
                onBlur={(name) => formik.setFieldTouched(name, true)}
                className="rtl"
                name="offer_cancel_policy_arabic"
                value={formik.values.offer_cancel_policy_arabic}
                onChange={(name, data) => formik.setFieldValue(name, data)}
                placeholder=" سياسة الإلغاء..."
              />
              {formik.touched.offer_cancel_policy_arabic && formik.errors.offer_cancel_policy_arabic && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.offer_cancel_policy_arabic}</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label mb-1" htmlFor="offer_know_before_go_arabic" dir="rtl">نصائح وإرشادات هامة</label>
              <RichTextEditor
                id="offer_know_before_go_arabic"
                onBlur={(name) => formik.setFieldTouched(name, true)}
                className="rtl"
                name="offer_know_before_go_arabic"
                value={formik.values.offer_know_before_go_arabic}
                onChange={(name, data) => formik.setFieldValue(name, data)}
                placeholder=" نصائح وإرشادات هامة..."
              />
              {formik.touched.offer_know_before_go_arabic && formik.errors.offer_know_before_go_arabic && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.offer_know_before_go_arabic}</p>
              )}
            </div>
          </TabPanel>
        </Tabs>
      </div>
      </div>
{/* end the parent card */}
  </div>


      </div>
      {/* Footer Buttons */}
<div className="card-footer py-8 flex justify-end">
<button
  type="button"
  className="btn btn-success"
  disabled={loading}
  onClick={() => {
    formik.validateForm().then(errors => {
      if (Object.keys(errors).length === 0) {
        handleSubmit(); // If valid
      } else {
        enqueueSnackbar('Please complete all required fields.', { variant: 'error' });

        // Touch all fields to show errors
        Object.keys(errors).forEach((key) => {
          formik.setFieldTouched(key, true);
        });
      }
    });
  }}
>
  {loading ? 'Saving...' : 'Submit'}
</button>
</div>

      {/* Amenities Sidebar */}
      <AmenitiesSidebar
        open={amenitiesSidebarOpen}
        onClose={handleCloseSidebar}
        spTypeUid={formik.values.businessData?.type?.id}
        onAmenitySelect={handleAmenitySelect}
        editingOption={editingOption}
      />
</form>
  );
};

export  {EditOffersContent};