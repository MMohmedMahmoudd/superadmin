import { useState } from "react";
import PropTypes from "prop-types";
import { Tabs, Tab, TabsList, TabPanel } from "@/components/tabs";
import { toAbsoluteUrl } from "@/utils";

const OfferDetailsTap = ({ offerEn, offerAr }) => {
  const [activeTab, setActiveTab] = useState("en");

  if (!offerEn || !offerAr) return (
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
  

  return (
    <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 ">
                <div className="flex card p-6 flex-row items-center gap-2">
                    <img src={offerEn.user?.image || toAbsoluteUrl("/media/avatars/blank.png")}
                     alt={offerEn.user?.name}
                      className="w-14 h-14 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = toAbsoluteUrl("/media/avatars/blank.png");
                      }}
                       />
                    <div className="flex flex-col">
                        <p className="text-lg font-medium">{offerEn.business_name}</p>
                        <p className="text-md text-gray-500">{offerEn.type?.title}</p>
                    </div>
                </div>
                <div className="flex card p-6 px-10 items-center mt-4 gap-2">
                    <div className="flex flex-col w-full">
                        <div className="flex justify-between ">
                            <div className="text-center">
                                <p className="text-3xl font-bold">{offerEn.options[0].offer.offer_copouns_qty}</p>
                                <p className="text-sm text-gray-500">Coupons Quantity</p>
                            </div>
                            <div className="border-l-2 border-gray-200 h-auto"></div>
                            <div className="text-center">
                                <p className="text-3xl font-bold">{offerEn.used_coupons_count || 0}</p>
                                <p className="text-sm text-gray-500">Used Coupons</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex card p-6 items-center mt-4 gap-2">
                    <div className="flex flex-col w-full">
                        <h3 className="text-lg font-medium mb-4">Offer Images</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {offerEn.offer_images && offerEn.offer_images.map((image, index) => (
                                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                                    <img 
                                        src={image || toAbsoluteUrl("/media/avatars/blank.png")} 
                                        alt={`Offer image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = toAbsoluteUrl("/media/avatars/blank.png");
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
        </div>
        <div className="col-span-2">
                <div className="flex card p-6 items-center gap-2">
                    <div className="flex w-full flex-col items-center gap-2">
                    <Tabs value={activeTab} className="w-full" onChange={(_, v) => setActiveTab(v)}>
              <TabsList className="w-full">
                <Tab value="en" className="w-1/2 flex justify-center items-center gap-2">
                  <img src={toAbsoluteUrl("/media/Flags-iso/us.svg")} alt="English" className="w-5 h-5" />
                  English
                </Tab>
                <Tab value="ar" className="w-1/2 flex justify-center items-center gap-2">
                  <img src={toAbsoluteUrl("/media/Flags-iso/sa.svg")} alt="Arabic" className="w-5 h-5" />
                  العربية
                </Tab>
              </TabsList>
              <TabPanel value="en">
                <div className="space-y-6 mt-4 w-full">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: offerEn.description }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Cancellation Policy</h3>
                    <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: offerEn.offer_cancel_policy }} />
                  </div>
                  <div>
                  </div>
                </div>
              </TabPanel>
              <TabPanel value="ar">
                <div className="space-y-6 mt-4 w-full">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-right">الوصف</h3>
                    <div className="text-gray-600 text-right" dangerouslySetInnerHTML={{ __html: offerAr.description }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-right">سياسة الإلغاء</h3>
                    <div className="text-gray-600 text-right" dangerouslySetInnerHTML={{ __html: offerAr.offer_cancel_policy }} />
                  </div>
                  <div>
                  </div>
                </div>
              </TabPanel>
            </Tabs>
                    </div>
                </div>
        </div>
    </div>
  );
};

OfferDetailsTap.propTypes = {
  offerEn: PropTypes.object.isRequired,
  offerAr: PropTypes.object.isRequired,
};

export { OfferDetailsTap };