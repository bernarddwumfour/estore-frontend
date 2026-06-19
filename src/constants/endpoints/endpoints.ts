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

  common: {
    logs: '/common/admin/logs',
    logsStats: '/common/admin/logs/stats',
    logsApps: '/common/admin/logs/apps',
    logsDetail: "/common/admin/logs/:id"
    // logsActions: '/common/admin/logs/actions',
    // logsExport: '/common/admin/logs/export',
  },


  products: {
    analytics: {
      overview: '/products/admin/products/analytics/overview',
      salesPerformance: '/products/admin/products/analytics/sales-performance',
      productFunnel: '/products/admin/products/analytics/product-funnel',
      inventoryHealth: '/products/admin/products/analytics/inventory-health',
      pricing: '/products/admin/products/analytics/pricing',
      categories: '/products/admin/products/analytics/categories',
      topProducts: '/products/admin/products/analytics/top-products',
      categoryPerformance: '/products/admin/products/analytics/category-performance',
      variants: '/products/admin/products/analytics/variants',
      inventory: '/products/admin/products/analytics/inventory',
      priceDistribution: '/products/admin/products/analytics/price-distribution',
      reviews: '/products/admin/products/analytics/reviews',

    },

    reviews: {
      adminReviewsList: '/products/admin/reviews',
      adminReviewApprove: '/products/admin/reviews/:id/approve',
      adminReviewReject: '/products/admin/reviews/:id/reject',
      adminReviewsBulkAction: '/products/admin/reviews/bulk-action',
      adminOrderReviewResponse: '/products/admin/reviews/order',
      orderReviewCreate: "/products/orders/:id/reviews/create",
      productReviewCreate: "/products/:slug/reviews/create",
      productReviewHelpful: "/products/reviews/product/:id/helpful",
      getReviews: "/products/:slug/reviews",


    }
    ,
    adminlistCategories: "/products/admin/categories",
    adminGetCategoryDetails: "/products/admin/categories/:id",
    adminUpdateCategory: "/products/admin/categories/:id/update",
    adminAddCategory: "/products/admin/categories/create",
    adminDeleteCategory: "/products/admin/categories/:id/delete",
    adminBulkCategoryAction: "/products/admin/categories/bulk-action",


    adminUpdateVariant: "/products/admin/variants/:id/update",
    adminDeleteVariant: "/products/admin/variants/:id/delete",
    adminGetVariantDetails: "/products/admin/variants/:id",
    adminBulkVariantActions: "/products/admin/variants/bulk-action",
    adminListVariants: "/products/admin/variants",
    adminCreateVariant: "/products/admin/products/:id/variants",


    adminListProducts: "/products/admin/products",
    AdminGetProductDetails: "/products/admin/products/:id",
    adminBulkProductActions: "/products/admin/products/bulk-action",
    adminUpdateProduct: "/products/admin/products/:id/update",
    adminAddProduct: "/products/admin/products/create",
    adminDeleteProduct: "",


    listProductsWeb: "/products",
    searchProducts: "/products/search",
    listCategories: "/products/categories",
    listBrands: "/products/brands",
    getProductDetailsWeb: "/products/:slug",
    listWishList: "/products/wishlist",
    addToWishList: "/products/wishlist",
    removeFromWishList: "/products/wishlist/:id",
    createReview: "/products/:slug/reviews/create",
    listcategories: "/products/categories",

  },
  promotions: {
    listPromotions: "/promotions",
    promotionDetails: "/promotions/:slug",
    adminDetails: "/promotions/admin/promotions/:id",
    adminList: '/promotions/admin/promotions',
    create: '/promotions/admin/promotions/create',
    bulkAction: '/promotions/admin/promotions/bulk-action',
    activate: '/promotions/admin/promotions/:id/activate',
    pause: '/promotions/admin/promotions/:id/pause',
    refreshStock: '/promotions/admin/promotions/:id/refresh-stock',
    update: '/promotions/admin/promotions/:id/update',
    delete: ""
  },
  orders: {
    analytics: {
      summary: '/orders/admin/orders/analytics/summary',
      salesTrends: '/orders/admin/orders/analytics/sales-trends',
      statusDistribution: '/orders/admin/orders/analytics/status-distribution',
      paymentStatusDistribution: '/orders/admin/orders/analytics/payment-status-distribution',
      topCustomers: '/orders/admin/orders/analytics/top-customers',
      fulfillment: '/orders/admin/orders/analytics/fulfillment',
      refunds: '/orders/admin/orders/analytics/refunds',
      customerRetention: '/orders/admin/orders/analytics/customer-retention',
      hourlyDistribution: '/orders/admin/orders/analytics/hourly-distribution',
      dayOfWeekDistribution: '/orders/admin/orders/analytics/day-of-week-distribution',
    }
    ,
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
    analytics: {
      overview: '/users/admin/users/analytics/overview',
      growthTrends: '/users/admin/users/analytics/growth-trends',
      engagement: '/users/admin/users/analytics/engagement',
      geographic: '/users/admin/users/analytics/geographic',
      activity: '/users/admin/users/analytics/activity',
      affiliates: '/users/admin/users/analytics/affiliates',
      affiliateGrowth: '/users/admin/users/analytics/affiliate-growth',
      customerDemographics: '/users/admin/users/analytics/customer-demographics',
      topCustomers: '/users/admin/users/analytics/top-customers',
    }

    ,
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