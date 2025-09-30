"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
} from "@mui/material";
import { useAuth } from "../../../contexts/AuthContext";
import SignUpForm from "../../../components/auth/sign-up-form";

export default function SignUpPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #F44336',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        />
      </Box>
    );
  }

  // If user is already authenticated, don't show sign-up form
  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F7F8FA",
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 450,
          borderRadius: 2,
          background: '#fff',
          boxShadow: 3,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              color: "#222",
              mb: 1,
            }}
          >
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign up to access your dashboard
          </Typography>
        </Box>

        <SignUpForm />
      </Paper>
    </Box>
  );
} 