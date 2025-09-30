export const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL;
export const SITE_PATH = process.env.NEXT_PUBLIC_SITE_URL;

export const ApiPaths = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/signup',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  
  // User Management
  USERS: '/user/',
  USER_BY_ID: (id) => `/user/${id}`,
  USER_REGISTRATION: '/user/register',
  USER_UPDATE: (id) => `/user/${id}`,
  USER_DELETE: (id) => `/user/${id}`,
  
  // Library Management
  LIBRARY: '/library',
  LIBRARY_BY_ID: (id) => `/v1/library/${id}`,
  
  // Library Subscription
  LIBRARY_SUBSCRIPTION: '/library-subscription/',
  LIBRARY_SUBSCRIPTION_BY_ID: (id) => `/library-subscription/${id}`,
  
  // Library Fee Plans
  LIBRARY_FEE_PLAN: '/library-fee-plan/',
  LIBRARY_FEE_PLAN_BY_ID: (id) => `/library-fee-plan/${id}`,
  
  // Library Shifts
  LIBRARY_SHIFT: '/library-shift/',
  LIBRARY_SHIFT_BY_ID: (id) => `/library-shift/${id}`,
  
  // Seating Plans
  SEATING_PLAN: '/seating-plan/',
  SEATING_PLAN_BY_ID: (id) => `/seating-plan/${id}`,
  
  // Seat Bookings
  SEAT_BOOKING: '/seat-booking/',
  SEAT_BOOKING_BY_ID: (id) => `/seat-booking/${id}`,
  
  // Student Fees
  STUDENT_FEE: '/studentFee',
  STUDENT_FEE_BY_ID: (id) => `/v1/studentFee/${id}`,
  
  // Subscription Plans
  SUBSCRIPTION_PLAN: '/subscription-plan/',
  SUBSCRIPTION_PLAN_BY_ID: (id) => `/subscription-plan/${id}`,
  
  // Subscription Renewals
  SUBSCRIPTION_RENEWAL: '/subscription-renewal/',
  SUBSCRIPTION_RENEWAL_BY_ID: (id) => `/subscription-renewal/${id}`,
  
  // Expenses
  EXPENSE: '/expense/',
  EXPENSE_BY_ID: (id) => `/expense/${id}`,
  
  // Expense Types
  EXPENSE_TYPE: '/expense-type/',
  EXPENSE_TYPE_BY_ID: (id) => `/expense-type/${id}`,
  
  // Documents
  DOCUMENT: '/document/',
  DOCUMENT_BY_ID: (id) => `/document/${id}`,
  
  // Roles
  ROLE: '/role',
  ROLE_BY_ID: (id) => `/v1/role/${id}`,
  
  // Dashboard
  DASHBOARD: '/dashboard/',
  
  // Profile
  PROFILE: '/profile/',
  PROFILE_UPDATE: '/profile/update',
  
  // Attendance
  ATTENDANCE: '/attendance/',
  ATTENDANCE_BY_ID: (id) => `/attendance/${id}`,
  ATTENDANCE_BY_USER: (userId) => `/attendance/user/${userId}`,
  ATTENDANCE_BY_DATE: (date) => `/attendance/date/${date}`,
};
