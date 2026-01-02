export const endpoints = {
    auth: {
      login: "/auth/login/",
      signup: "/auth/register/customer/",
      registerUser :"/auth/register/user/",
      resetPassword: "/auth/password-reset/confirm/",
      forgotPassword: "auth/password-reset/request/",
      verifyOtp: "/auth/otp/verify/",
      verifyEmail: "/auth/verify-email/",
      resendEmailVerificationLink: "/auth/resend-verification/",
      resendOTPVerificationCode: "/auth/otp/resend/",
      logout: "/auth/logout/",
      refreshToken: "/auth/token/refresh/"
    },
 
    products : {
      listcategories:"/products/admin/categories/",
      addCategory :"/products/admin/categories/create/",
      deleteCategory :"/products/admin/categories/:id/",
      updateCategory :"/products/admin/categories/:id/",
      listProducts: "/products/admin/products/",
      listProductsWeb: "/products/",
      addProduct : "/products/admin/products/create/",
      createVariant : "/products/admin/products/:id/variants/" ,
      getProductDetails :"/products/admin/products/:id/",
      getProductDetailsWeb :"/products/:slug/"

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
      logsBaseUrl : "/audit/logs/filter/"
    },
    profile: {
      retrieve: "profile/retrieve/",
      update: "/profile/update/",
      addExtracurriculum: "/profile/extracurricular/add",
      updateExtracurriculum: "/profile/extracurricular/update/:id/",
      listExtracurriculum: "profile/extracurricular/list"
    },
  
  };
  