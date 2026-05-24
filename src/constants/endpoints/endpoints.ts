export const endpoints = {
  auth: {
    login: "/users/login",
    signup: "/users/register/customer",
    registerUser: "/users/register/user",
    resetPassword: "/users/password-reset/confirm",
    forgotPassword: "/users/password-reset/request",
    verifyOtp: "/users/otp/verify",
    verifyEmail: "/users/verify-email",
    resendEmailVerificationLink: "/users/resend-verification",
    resendOTPVerificationCode: "/users/otp/resend",
    logout: "/users/logout",
    refreshToken: "/users/refresh-token",
    getProfile: "/users/profile",
    updateProfile: "/users/profile/update",

    // Guest checkout endpoints
    guestCheckout: "/users/guest-checkout",
    guestConvert: "/auth/guest-convert",
  },

  products: {
    adminlistProducts: "/products/admin/products",
    listProductsWeb: "/products",
    listCategories: "/products/categories",
    addProduct: "/products/admin/products/create",
    updateProduct: "/products/admin/:id/update",
    createVariant: "/products/admin/products/:id/variants",
    getProductDetails: "/products/admin/products/:id",
    getProductDetailsWeb: "/products/:slug",
    listWishList: "/products/wishlist",
    addToWishList: "/products/wishlist",
    removeFromWishList: "/products/wishlist/:id",
    createReview: "/products/:slug/reviews/create",
    getReviews: "/products/:slug/reviews",
    analytics: "/products/admin/analytics",
    bulkProductAction: "/products/admin/products/bulk-action",

    listVariants: "/products/admin/variants",
    updateVariant: "/products/admin/variants/:id/update",
    deleteVariant: "/products/admin/variants/:id/delete",
    getVariantDetails: "/products/admin/variants/:id",
    bulkVariantAction: "/products/admin/variants/bulk-action",

    adminlistCategories: "/products/admin/categories",
    listcategories: "/products/categories",
    getCategoryDetails: "/products/admin/categories/:id",
    addCategory: "/products/admin/categories/create",
    updateCategory: "/products/admin/categories/:id/update",
    deleteCategory: "/products/admin/categories/:id/delete",
    bulkCategoryAction: "/products/admin/categories/bulk-action",
    adminDeleteProduct: ""
  },
  orders: {
    listOrders: "/orders/admin/orders",
    listUserOrders: "/orders",
    createOrder: "/orders/create",
    orderDetails: "/orders/:id",
    cancelOrder: "/orders/:id/cancel",
    updateStatus: "/orders/admin/orders/:id/status",
    updatePaymentStatus: "/orders/admin/orders/:id/payment-status",
    getOrderDetails: "/orders/admin/orders/:id",
    bulkOrderAction: "/orders/admin/orders/bulk-action",

    verifyPayment: "/orders/verify-payment",
    paymentCallback: "/orders/payment/callback",

    adminShipments: "/orders/admin/shipments",
    adminShipmentDetail: "/orders/admin/shipments/:id",
    updateShipmentStatus: "/orders/admin/shipments/:id/update-status",
    bulkUpdateShipments: "/orders/admin/shipments/bulk-update",
    shippingOptions: "/orders/shipping/options",

    // Transaction endpoints
    adminTransactions: "/orders/admin/transactions",
    adminTransactionDetail: "/orders/admin/transactions/:id",
  },
  users: {
    // Analytics
    listUsersCardAnalytics: "/analytics/overall?module=user_management",

    // Admin User Management
    listAllUsers: "/users/admin/users",
    userDetail: "/users/admin/users/:id",
    userStatistics: "/users/admin/users/statistics",
    bulkUserAction: "/users/admin/users/bulk-action",

    // Customer Management
    listCustomers: "/users/admin/customers",

    // Staff Management
    listStaffUsers: "/users/admin/staff",
    createStaffUser: "/users/admin/staff/create",
    bulkStaffAction: "/users/admin/staff/bulk-action",
    deleteStaffUser: "/users/admin/staff/:id/delete",

    // Guest Management
    listGuestUsers: "/users/admin/guests",

    // Affiliate Management
    listAffiliateUsers: "/users/admin/affiliates",
    makeAffiliate: "/users/admin/affiliates/:id/make",
    removeAffiliate: "/users/admin/affiliates/:id/remove",

    // Existing endpoints
    addUsers: "/user/staff/register",
    listUsers: "/auth/admin/users",
    activateOrDeactivate: "/user/update/is-active/:id",
  },

  logs: {
    userLogs: "/audit/logs/filter",
    djangoAdminLogs: "/audit/logs/filter",
    scholarshipLogs: "/audit/logs/filter",
    logsBaseUrl: "/audit/logs/filter"
  },
  profile: {
    retrieve: "/profile/retrieve",
    update: "/profile/update",
    addExtracurriculum: "/profile/extracurricular/add",
    updateExtracurriculum: "/profile/extracurricular/update/:id",
    listExtracurriculum: "/profile/extracurricular/list"
  },
};