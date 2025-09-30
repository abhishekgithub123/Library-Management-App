// Helper function to check if token is expired
export const isTokenExpired = (expiresIn) => {
  if (!expiresIn) return true;
  
  try {
    const expirationTime = new Date(expiresIn).getTime();
    const currentTime = new Date().getTime();
    return currentTime >= expirationTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};

// Helper function to clear all auth data
export const clearAuthData = () => {
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("tokenExpiresIn");
};

// Helper function to get token expiration time
export const getTokenExpirationTime = (expiresIn) => {
  const expirationTime = new Date();
  expirationTime.setSeconds(expirationTime.getSeconds() + (expiresIn || 3600)); // Default 1 hour
  return expirationTime.toISOString();
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const isAuth = localStorage.getItem("isAuthenticated");
  const userData = localStorage.getItem("user");
  const accessToken = localStorage.getItem("accessToken");
  const tokenExpiresIn = localStorage.getItem("tokenExpiresIn");
  
  return isAuth === "true" && userData && accessToken && !isTokenExpired(tokenExpiresIn);
};

// Helper function to handle authentication errors
export const handleAuthError = (error) => {
  const isAuthError = error.response?.status === 401 || 
                     error.message?.includes('Authorization token is missing') ||
                     error.response?.data?.message?.includes('Authorization token is missing');

  if (isAuthError) {
    // Clear auth data
    clearAuthData();
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/sign-in';
    }
    
    return true; // Indicates auth error was handled
  }
  
  return false; // Indicates no auth error
};

// Helper function to redirect to login
export const redirectToLogin = () => {
  clearAuthData();
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/sign-in';
  }
}; 