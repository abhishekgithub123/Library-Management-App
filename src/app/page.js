"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { Box, CircularProgress } from "@mui/material";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // If user is authenticated, redirect to dashboard
        router.push("/dashboard");
      } else {
        // If user is not authenticated, redirect to sign-in page
        router.push("/auth/sign-in");
      }
    }
  }, [user, loading, router]);

  // Show loading spinner while checking authentication
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
