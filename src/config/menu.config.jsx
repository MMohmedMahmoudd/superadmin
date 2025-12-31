// This is a test comment to trigger hot-reloading
export const getMenuSidebar = (filterMenuByPermissions) => {
  const MENU_SIDEBAR = [
    {
      title: "Dashboards",
      icon: "element-11",
      path: "/",
    },
    {
      title: "Business",
      icon: "shop",
      key: "Bussiness",
      path: "/bussiness",
      children: [
        {
          title: "All Business",
          key: "all-Business",
          path: "/bussiness",
        },
        {
          title: "Add Business",
          key: "add-Bussiness",
          path: "/addbussiness",
        },
        {
          title: "Bussiness Profile",
          key: "Bussiness-Profile",
          path: "/businessprofile/:id",
          disabled: true,
        },
      ],
    },
    {
      title: "Providers",
      key: "providers",
      icon: "users",
      path: "/providers",
      children: [
        {
          title: "All Providers",
          key: "all-providers",
          path: "/providers",
        },
        {
          title: "Add Provider",
          key: "add-provider",
          path: "/addprovider",
        },
        {
          title: "Provider Profile",
          key: "Provider-profile",
          path: "/ProviderProfile/:id",
          disabled: true,
        },
      ],
    },
    {
      title: "Users",
      key: "users",
      icon: "user",
      path: "/Users",
      children: [
        {
          title: "All Users",
          key: "all-users",
          path: "/Users",
        },
        {
          title: "Add User",
          key: "add-User",
          path: "/AddUser",
        },
        {
          title: "User Profile",
          key: "User-profile",
          path: "/UserProfile/:id",
          disabled: true,
        },
      ],
    },
    {
      title: "Offers",
      key: "offers",
      icon: "discount",
      path: "/Offers",
      children: [
        {
          title: "All Offers",
          key: "all-Offers",
          path: "/Offers",
        },
        {
          title: "Add Offer",
          key: "add-Offer",
          path: "/addOffer",
        },
        {
          title: "Offer Profile",
          key: "Offer-Profile",
          path: "/OfferProfile/:id",
          disabled: true,
        },
        {
          title: "Edit Offer",
          key: "EditOffer",
          path: "/EditOffer/:id",
          disabled: true,
        },
      ],
    },
    {
      title: "Locations",
      key: "locations",
      icon: "geolocation",
      children: [
        {
          title: "Countries",
          key: "Countries",
          path: "/Countries",
        },
        {
          title: "Cities",
          key: "Cities",
          path: "/Cities",
          children: [
            {
              title: "All Cities",
              key: "all-Cities",
              path: "/Cities",
            },
            {
              title: "Add City",
              key: "add-City",
              path: "/addCity",
            },
            {
              title: "EditCity",
              key: "Edit-City",
              path: "/EditCity/:id",
              disabled: true,
            },
          ],
        },
        {
          title: "Zones",
          key: "Zones",
          path: "/Zones",
          children: [
            {
              title: "All Zones",
              key: "all-Zones",
              path: "/Zones",
            },
            {
              title: "Add Zone",
              key: "add-Zone",
              path: "/addzone",
            },
            {
              title: "Edit Zone",
              key: "Edit-Zone",
              path: "/editzone/:id",
              disabled: true,
            },
          ],
        },
      ],
    },
    {
      title: "Reservations",
      key: "reservations",
      icon: "cheque",
      path: "/reservations",
      children: [
        {
          title: "All Reservations",
          key: "all-reservations",
          path: "/reservations",
        },
        {
          title: "Add Reservation",
          key: "add-reservation",
          path: "/addreservation",
        },
        {
          title: "Reservation Profile",
          key: "reservation-profile",
          path: "/reservationprofile/:id",
          disabled: true,
        },
      ],
    },
    {
      title: "Teams",
      icon: "user-tick",
      key: "Teams",
      path: "/Teams",
      children: [
        {
          title: "All Member",
          key: "All-Profile",
          path: "/Teams",
        },
        {
          title: "Add Member",
          key: "Add-member",
          path: "/AddMember",
        },
        {
          title: "Member Profile",
          key: "MemberProfile",
          path: "/MemberProfile/:id",
          disabled: true,
        },
        {
          title: "Roles",
          key: "Roles",
          path: "/Roles",
          disabled: true,
        },
        {
          title: "Add Role",
          key: "Add-Role",
          path: "/AddRole",
          disabled: true,
        },
        {
          title: "Role Profile",
          key: "Role-Profile",
          path: "/RoleProfile/:id",
          disabled: true,
        },
      ],
    },
    {
      heading: "Settings",
    },
    {
      title: "Settings",
      key: "Settings",
      icon: "setting-2",
      children: [
        {
          title: "Bundles",
          key: "Bundles",
          path: "/Bundles",
          children: [
            {
              title: "All Bundles",
              key: "All-Bundles",
              path: "/Bundles",
            },
            {
              title: "Add Bundles",
              key: "AddBundles",
              path: "/AddBundles",
            },
            {
              title: "Edit Bundle",
              key: "Edit-Bundle",
              path: "/editbundle/:id",
              disabled: true,
            },
          ],
        },
        {
          title: "Main Categories",
          key: "main-categories",
          path: "/maincategories",
          children: [
            {
              title: "All Main Categories",
              key: "All-Categories",
              path: "/maincategories",
            },
            {
              title: "Add Category",
              key: "Add-Category",
              path: "/AddCategory",
            },
            {
              title: "Edit Category",
              key: "Edit-Category",
              path: "/editcategory/:id",
              disabled: true,
            },
          ],
        },
        {
          title: "Sub Category",
          key: "Sub-category",
          path: "/subcategory",
          children: [
            {
              title: "All Sub Category",
              key: "Sub-category",
              path: "/subcategory",
            },
            {
              title: "Add Sub Category",
              key: "Add-Sub-category",
              path: "/addsubcategory",
            },
            {
              title: "Edit Sub Category",
              key: "Edit-Sub-category",
              path: "/editsubcategory/:id",
              disabled: true,
            },
          ],
        },
        {
          title: "Payment Method",
          key: "Payment-Method",
          path: "/paymentmethod",
          children: [
            {
              title: "All Payment Method",
              key: "allPayment-Method",
              path: "/paymentmethod",
            },
            {
              title: "Add Payment Method",
              key: "add-Payment-Method",
              path: "/addpaymentmethod",
            },
            {
              title: "Edit Payment Method",
              key: "Edit-Payment-Method",
              path: "/editpaymentmethod/:id",
              disabled: true,
            },
          ],
        },
        {
          title: "Currencies",
          key: "Currencies",
          path: "/currencies",
          children: [
            {
              title: "All Currencies",
              key: "All-Currencies",
              path: "/currencies",
            },
            {
              title: "Add Currency",
              key: "Add-Currency",
              path: "/addcurrency",
            },
            {
              title: "Edit Currency",
              key: "Edit-Currency",
              path: "/editcurrency/:id",
              disabled: true,
            },
          ],
        },
        {
          title: "Promocodes",
          key: "Promocodes",
          path: "/promocodes",
          children: [
            {
              title: "All Promocodes",
              key: "All-Promocodes",
              path: "/promocodes",
            },
            {
              title: "Add Promocode",
              key: "Add-Promocode",
              path: "/addpromocode",
            },
            {
              title: "Edit Promocode",
              key: "Edit-Promocode",
              path: "/editpromocode/:id",
              disabled: true,
            },
          ],
        },
        {
          title: "Amenities",
          key: "Amenities",
          path: "/amenities",
          children: [
            {
              title: "All Amenities",
              key: "All-Amenities",
              path: "/amenities",
            },
            {
              title: "Add Amenity",
              key: "Add-Amenity",
              path: "/AddAmenity",
            },
            {
              title: "Edit Amenity",
              key: "Edit-Amenity",
              path: "/editamenity/:id",
              disabled: true,
            },
          ],
        },
      ],
    },
  ];

  // If filterMenuByPermissions is provided, filter the menu
  if (filterMenuByPermissions) {
    const filteredMenu = filterMenuByPermissions(MENU_SIDEBAR);
    return filteredMenu;
  }

  return MENU_SIDEBAR;
};

// Legacy export for backward compatibility
export const MENU_SIDEBAR = getMenuSidebar();

// Export empty arrays for MENU_MEGA and MENU_ROOT since they're not being used
export const MENU_MEGA = [];
export const MENU_ROOT = [];
