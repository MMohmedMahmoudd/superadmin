import { Navigate, Route, Routes } from "react-router";
import { DefaultPage, Demo1DarkSidebarPage } from "@/pages/dashboards";
import {
  NetworkGetStartedPage,
  BussinessPage,
  OffersPage,
  LocationsPage,
} from "@/pages/network";
import { AuthPage } from "@/auth";
import { RequireAuth } from "@/auth/RequireAuth";
import { Demo1Layout } from "@/layouts/demo1";
import { ErrorsRouting } from "@/errors";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AddProviderPage } from "@/pages/network/get-started/AddProvider";
import { ProfileDefaultPage } from "@/pages/network/get-started/ProviderProfile";
import { AddBussinessPage } from "@/pages/network/Bussiness/AddBussiness";
import { BussinessDefaultPage } from "@/pages/network/Bussiness/BussinessProfile";
import { OfferProfileDefaultPage } from "@/pages/network/Offers/OfferProfile";
import { AddOffersPage } from "@/pages/network/Offers/AddOffers";
import { CitiesPage } from "@/pages/network/Locations/Cities";
import { AddCityPage } from "@/pages/network/Locations/Cities/AddCity";
import { ZonesPage } from "@/pages/network/Locations/Zones";
import { AddZonePage } from "@/pages/network/Locations/Zones/AddZone";
import { ReservationsPage } from "@/pages/network/Reservations";
import { ReservationDefaultPage } from "@/pages/network/Reservations/ReservationProfile";
import { BrancheDefaultPage } from "@/pages/network/Bussiness/BrancheProfile";
import { AddBrancheDefaultPage } from "@/pages/network/Bussiness/AddBranche";
import { AddReservationPage } from "@/pages/network/Reservations/AddReservation";
import { EditOffersPage } from "@/pages/network/Offers/EditOffer";
import { EditCityPage } from "@/pages/network/Locations/Cities/EditCity";
import { EditZonePage } from "@/pages/network/Locations/Zones/EditZone";
import { UsersPage } from "@/pages/network/Users";
import { AddUserPage } from "@/pages/network/Users/AddUser";
import { ProfileUserPage } from "@/pages/network/Users/UserProfile";
import { TeamPage } from "@/pages/network/Teams";
import { MemberProfilePage } from "@/pages/network/Teams/MemberProfile";
import { AddMemberPage } from "@/pages/network/Teams/AddMember";
import { SettingsPage } from "@/pages/network/Settings";
import { BundlesPage } from "@/pages/network/Settings/Bundles";
import { AddBundlesPage } from "@/pages/network/Settings/Bundles/AddBundles";
import { CategoriesPage } from "@/pages/network/Settings/Categories";
import { AddCategoryPage } from "@/pages/network/Settings/Categories/AddCategory";
import { EditBundlePage } from "@/pages/network/Settings/Bundles/EditBundle";
import { EditCategoryPage } from "@/pages/network/Settings/Categories/EditCategory";
import { SupCategoriesPage } from "@/pages/network/Settings/SupCategories";
import { EditSupCategoryPage } from "@/pages/network/Settings/SupCategories";
import { AddSupCategoryPage } from "@/pages/network/Settings/SupCategories";
import { PaymentMethodPage } from "@/pages/network/Settings/PaymentMethod";
import { AddPaymentMethodPage } from "@/pages/network/Settings/PaymentMethod/AddPaymentMethod/AddPaymentMethodPage";
import { EditPaymentMethodPage } from "@/pages/network/Settings/PaymentMethod/EditPaymentMethod/EditPaymentMethodPage";
import { CurrenciesPage } from "@/pages/network/Settings/Currencies";
import { AddCurrencyPage } from "@/pages/network/Settings/Currencies/AddCurrency";
import { EditCurrencyPage } from "@/pages/network/Settings/Currencies/EditCurrency";
import { PromococesPage } from "@/pages/network/Settings/Promocodes";
import { EditPromocodePage } from "@/pages/network/Settings/Promocodes/EditPromocode";
import { AddPromocodePage } from "@/pages/network/Settings/Promocodes/AddPromocode";
import { AmenitiesPage } from "@/pages/network/Settings/Amenities";
import { AddAmenityPage } from "@/pages/network/Settings/Amenities/AddAmenity";
import { EditAmenityPage } from "@/pages/network/Settings/Amenities/EditAmenity";
import { RoleProfilePage } from "@/pages/network/Teams/RoleProfile/RoleProfilePage";
import { AddRolePage } from "@/pages/network/Teams/AddRole/AddRolePage";

const AppRoutingSetup = () => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<Demo1Layout />}>
          <Route path="/" element={<DefaultPage />} />
          <Route path="/dark-sidebar" element={<Demo1DarkSidebarPage />} />
          <Route
            path="/ProviderProfile/:id"
            element={
              <ProtectedRoute permissionKey="Provider-profile" action="edit">
                <ProfileDefaultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/businessprofile/:id"
            element={
              <ProtectedRoute permissionKey="Bussiness-Profile" action="view">
                <BussinessDefaultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/OfferProfile/:id"
            element={
              <ProtectedRoute permissionKey="Offer-Profile" action="edit">
                <OfferProfileDefaultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservationprofile/:id"
            element={
              <ProtectedRoute permissionKey="reservation-profile" action="edit">
                <ReservationDefaultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/branchprofile/:id"
            element={
              <ProtectedRoute permissionKey="Branche-Profile" action="view">
                <BrancheDefaultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addBranche/:id"
            element={
              <ProtectedRoute permissionKey="Add-Branche" action="add">
                <AddBrancheDefaultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/EditOffer/:id"
            element={
              <ProtectedRoute permissionKey="EditOffer" action="edit">
                <EditOffersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/EditCity/:id"
            element={
              <ProtectedRoute permissionKey="Edit-City" action="edit">
                <EditCityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/UserProfile/:id"
            element={
              <ProtectedRoute permissionKey="User-profile" action="edit">
                <ProfileUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/MemberProfile/:id"
            element={
              <ProtectedRoute permissionKey="MemberProfile" action="edit">
                <MemberProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editbundle/:id"
            element={
              <ProtectedRoute permissionKey="Edit-Bundle" action="edit">
                <EditBundlePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editcategory/:id"
            element={
              <ProtectedRoute permissionKey="Edit-Category" action="edit">
                <EditCategoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editsubcategory/:id"
            element={
              <ProtectedRoute permissionKey="Edit-Sub-category" action="edit">
                <EditSupCategoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editpaymentmethod/:id"
            element={
              <ProtectedRoute permissionKey="Edit-Payment-Method" action="edit">
                <EditPaymentMethodPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editpromocode/:id"
            element={
              <ProtectedRoute permissionKey="Edit-Promocode" action="edit">
                <EditPromocodePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/addpromocode"
            element={
              <ProtectedRoute permissionKey="add-Promocode" action="add">
                <AddPromocodePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editamenity/:id"
            element={
              <ProtectedRoute permissionKey="Edit-Amenity" action="edit">
                <EditAmenityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AddAmenity"
            element={
              <ProtectedRoute permissionKey="Add-Amenity" action="add">
                <AddAmenityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/amenities"
            element={
              <ProtectedRoute permissionKey="Amenities" action="list">
                <AmenitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/promocodes"
            element={
              <ProtectedRoute permissionKey="Promocodes" action="list">
                <PromococesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/currencies"
            element={
              <ProtectedRoute permissionKey="Currencies" action="list">
                <CurrenciesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addcurrency"
            element={
              <ProtectedRoute permissionKey="Add-Currency" action="add">
                <AddCurrencyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editcurrency/:id"
            element={
              <ProtectedRoute permissionKey="Edit-Currency" action="edit">
                <EditCurrencyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addpaymentmethod"
            element={
              <ProtectedRoute permissionKey="add-Payment-Method" action="add">
                <AddPaymentMethodPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paymentmethod"
            element={
              <ProtectedRoute permissionKey="Payment-Method" action="list">
                <PaymentMethodPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addsubcategory"
            element={
              <ProtectedRoute permissionKey="Add-Sub-category" action="add">
                <AddSupCategoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subcategory"
            element={
              <ProtectedRoute permissionKey="Sub-category" action="list">
                <SupCategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AddCategory"
            element={
              <ProtectedRoute permissionKey="Add-Category" action="add">
                <AddCategoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maincategories"
            element={
              <ProtectedRoute permissionKey="Categories" action="list">
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AddBundles"
            element={
              <ProtectedRoute permissionKey="AddBundles" action="add">
                <AddBundlesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Bundles"
            element={
              <ProtectedRoute permissionKey="Bundles" action="list">
                <BundlesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Amenities"
            element={
              <ProtectedRoute permissionKey="Amenities" action="list">
                <AmenitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AddAmenity"
            element={
              <ProtectedRoute permissionKey="Add-Amenity" action="add">
                <AddAmenityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editamenity/:id"
            element={
              <ProtectedRoute permissionKey="Edit-Amenity" action="edit">
                <EditAmenityPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Settings"
            element={
              <ProtectedRoute permissionKey="Settings" action="list">
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Teams"
            element={
              <ProtectedRoute permissionKey="Teams" action="list">
                <TeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AddMember"
            element={
              <ProtectedRoute permissionKey="Add-member" action="add">
                <AddMemberPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/RoleProfile/:id"
            element={
              <ProtectedRoute permissionKey="Role-Profile" action="edit">
                <RoleProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AddRole"
            element={
              <ProtectedRoute permissionKey="Add-Role" action="add">
                <AddRolePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Users"
            element={
              <ProtectedRoute permissionKey="users" action="list">
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AddUser"
            element={
              <ProtectedRoute permissionKey="add-User" action="add">
                <AddUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/providers"
            element={
              <ProtectedRoute permissionKey="providers" action="list">
                <NetworkGetStartedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AddProvider"
            element={
              <ProtectedRoute permissionKey="add-provider" action="add">
                <AddProviderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bussiness"
            element={
              <ProtectedRoute permissionKey="Bussiness" action="list">
                <BussinessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Addbussiness"
            element={
              <ProtectedRoute permissionKey="add-Bussiness" action="add">
                <AddBussinessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Offers"
            element={
              <ProtectedRoute permissionKey="offers" action="list">
                <OffersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addOffer"
            element={
              <ProtectedRoute permissionKey="add-Offer" action="add">
                <AddOffersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Countries"
            element={
              <ProtectedRoute permissionKey="Countries" action="list">
                <LocationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Cities"
            element={
              <ProtectedRoute permissionKey="Cities" action="list">
                <CitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addCity"
            element={
              <ProtectedRoute permissionKey="add-City" action="add">
                <AddCityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Zones"
            element={
              <ProtectedRoute permissionKey="Zones" action="list">
                <ZonesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AddZone"
            element={
              <ProtectedRoute permissionKey="add-Zone" action="add">
                <AddZonePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/EditZone/:id"
            element={
              <ProtectedRoute permissionKey="Edit-Zone" action="edit">
                <EditZonePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute permissionKey="reservations" action="list">
                <ReservationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addreservation"
            element={
              <ProtectedRoute permissionKey="add-reservation" action="add">
                <AddReservationPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};
export { AppRoutingSetup };
