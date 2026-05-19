export const endpoints = {
  auth: {
    login: "/auth/login/",
    signup: "/auth/register/customer/",
    registerUser: "/auth/register/user/",
    resetPassword: "/auth/password-reset/confirm/",
    forgotPassword: "auth/password-reset/request/",
    verifyOtp: "/auth/otp/verify/",
    verifyEmail: "/auth/verify-email/",
    resendEmailVerificationLink: "/auth/resend-verification/",
    resendOTPVerificationCode: "/auth/otp/resend/",
    logout: "/auth/logout/",
    refreshToken: "/auth/refresh-token/",
    getProfile: "auth/profile/",
    updateProfile: "auth/profile/update/"
  },

  products: {
    listProducts: "/products/admin/products/",
    listProductsWeb: "/products/",
    listCategories: "/products/categories/",
    addProduct: "/products/admin/products/create/",
    updateProduct: "/products/admin/:id/update/",
    createVariant: "/products/admin/products/:id/variants/",
    getProductDetails: "/products/admin/products/:id/",
    getProductDetailsWeb: "/products/:slug/",
    listWishList: "/products/wishlist/",
    addToWishList: "/products/wishlist/",
    removeFromWishList: "/products/wishlist/:id/",
    createReview: "/products/:slug/reviews/create/",
    getReviews: "/products/:slug/reviews/",
    analytics: "/products/admin/analytics/",
    bulkProductAction: "/products/admin/products/bulk-action/",

    updateVariant: "/products/admin/variants/:id/update/",
    deleteVariant: "/products/admin/variants/:id/delete/",
    getVariantDetails: "/products/admin/variants/:id/",

    adminlistCategories: "/products/admin/categories/",
    listcategories: "/products/categories/",
    getCategoryDetails: "/products/admin/categories/:id/",
    addCategory: "/products/admin/categories/create/",
    updateCategory: "/products/admin/categories/:id/update/",
    deleteCategory: "/products/admin/categories/:id/delete/",
    bulkCategoryAction: "/products/admin/categories/bulk-action/"
  },
  orders: {
    listOrders: "/orders/admin/orders/",
    listUserOrders: "/orders/",
    createOrder: "/orders/create/",
    orderDetails: "/orders/:id/",
    cancelOrder: "orders/:id/cancel/",
    updateStatus: "orders/admin/orders/:id/status/",
    updatePaymentStatus: "orders/admin/orders/:id/payment-status/",
    getOrderDetails: "orders/admin/orders/:id/",
    bulkOrderAction: "orders/admin/orders/bulk-action/",

    verifyPayment: "orders/verify-payment/",
    paymentCallback: "orders/payment/callback/",
  },
  users: {
    listUsersCardAnalytics: "/analytics/overall/?module=user_management",
    addUsers: "/user/staff/register/",
    listUsers: "/auth/admin/users/",
    activateOrDeactivate: "/user/update/is-active/:id/"
  },
  logs: {
    userLogs: "/audit/logs/filter/",
    djangoAdminLogs: "/audit/logs/filter/",
    scholarshipLogs: "/audit/logs/filter/",
    logsBaseUrl: "/audit/logs/filter/"
  },
  profile: {
    retrieve: "profile/retrieve/",
    update: "/profile/update/",
    addExtracurriculum: "/profile/extracurricular/add",
    updateExtracurriculum: "/profile/extracurricular/update/:id/",
    listExtracurriculum: "profile/extracurricular/list"
  },

};
