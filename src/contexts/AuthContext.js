"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../lib/axiosInstance";
import { ApiPaths } from "../constants/api-paths";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on app load
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userData = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");
    
    if (isAuthenticated === "true" && userData && accessToken) {
      try {
        setUser(JSON.parse(userData));
        // Set the token in axios headers for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Prepare the login payload
      const payload = {
        username: username,
        password: password,
      };

      // Make the actual API call
      const response = await axiosInstance.post(ApiPaths.LOGIN, payload);
      
      if (response.data.success) {
        const { accessToken, refreshToken, expiresIn,roleId,libraryId } = response.data.detail;
        
        // Extract user ID from the API response
        // Assuming the API response includes userId in the detail object
        const userId = response.data.detail.userId || response.data.detail.user?.userId || response.data.detail.id;
        
        // Create user data object with real user ID
        const userData = {
          username: username,
          userId: userId,
          roleId: roleId,
          libraryId: libraryId,
          // Store the real user ID from API
          // You can add more user data here if the API provides it
        };
        
        // Store authentication data
        setUser(userData);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("tokenExpiresIn", expiresIn);
        
        // Set the token in axios headers for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        return { success: true };
      } else {
        return { success: false, error: response.data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle different types of errors
      if (error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      } else if (error.response?.data?.error) {
        return { success: false, error: error.response.data.error };
      } else if (error.response?.status === 401) {
        return { success: false, error: "Invalid username or password" };
      } else if (error.response?.status === 400) {
        return { success: false, error: "Please check your credentials" };
      } else {
        return { success: false, error: "Login failed. Please try again." };
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiresIn");
    
    // Remove the token from axios headers
    delete axiosInstance.defaults.headers.common['Authorization'];
    
    router.push("/auth/sign-in");
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 