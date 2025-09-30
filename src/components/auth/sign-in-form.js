"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Alert,
  InputAdornment,
  IconButton,
  Box,
  Link,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { signInSchema } from "../../utils/validation";

export default function SignInForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(data.username, data.password);
      
      if (result.success) {
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        fullWidth
        label="Username"
        {...register("username")}
        error={!!errors.username}
        helperText={errors.username?.message}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person sx={{ color: "#F44336" }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Password"
        {...register("password")}
        error={!!errors.password}
        helperText={errors.password?.message}
        type={showPassword ? "text" : "password"}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock sx={{ color: "#F44336" }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleTogglePasswordVisibility}
                edge="end"
                sx={{ color: "#F44336" }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <FormControlLabel
        control={
          <Checkbox
            {...register("rememberMe")}
            color="primary"
            sx={{
              "&.Mui-checked": {
                color: "#F44336",
              },
            }}
          />
        }
        label="Remember me"
        sx={{ mb: 2 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting}
        sx={{
          backgroundColor: "#F44336",
          "&:hover": {
            backgroundColor: "#d32f2f",
          },
          py: 1.5,
          fontSize: "1.1rem",
          fontWeight: 600,
          textTransform: "none",
          borderRadius: 2,
        }}
      >
        {isSubmitting ? "Signing In..." : "Sign In"}
      </Button>

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{" "}
          <Link
            href="/auth/sign-up"
            sx={{
              color: "#F44336",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>
    </form>
  );
}
