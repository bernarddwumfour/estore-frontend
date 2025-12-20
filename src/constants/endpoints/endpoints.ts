export const endpoints = {
    auth: {
      login: "/user/auth/login",
      signup: "/user/self-register/",
      resetPassword: "/user/password/reset/",
      forgotPassword: "/user/password/forget/",
      verifyOtp: "/user/auth/otp/verify/",
      verifyEmail: "/user/auth/email/verify/",
      resendEmailVerificationLink: "/user/auth/email/resend/",
      resendOTPVerificationCode: "/user/auth/otp/resend/",
      logout: "/user/auth/logout",
      refreshToken: "/user/auth/token/refresh/"
    },
    scholarships: {
      listScholarshipsCardAnalytics: "/analytics/overall/?module=scholarship_management",
      addScholarship: "/scholarship/add/",
      listScholarships_Dashboard: "/scholarship/filter/",
      listScholarshipsSuggessions_Dashboard: "/scholarship/suggestion/list/",
      getScholarship: "/scholarship/public/details/:id/",
      listscholarships: "/scholarship/public/filter/",
      listRecommendedScholarships : "/scholarship/recommend/",
      verifyScholarship: "/scholarship/verify/",
      reactivateScholarship: "/scholarship/reactivate/",
      deactivateScholarship: "/scholarship/deactivate/",
      suggestScholarship: "/scholarship/suggest/",
      rejectScholarshipSuggession: "/scholarship/suggestion/reject/",
      listSavedScholarships: "/scholarship/saved/list/",
      saveScholarship: "/scholarship/save/:id/",   
      deleteSavedScholarship: "/scholarship/saved/delete/:id/",
  
  
    },
    users: {
      listUsersCardAnalytics: "/analytics/overall/?module=user_management",
      addUsers: "/user/staff/register/",
      listUsers_Dashboard: "/user/list/",
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
  