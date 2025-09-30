"use client";

import React, { useState, useEffect } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Link,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Business,
  AssignmentInd,
  PhotoCamera,
} from "@mui/icons-material";
import { ApiPaths } from "../../constants/api-paths";
import axiosInstance from "../../lib/axiosInstance";
import { signUpSchema } from "../../utils/validation";

export default function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingLibraries, setLoadingLibraries] = useState(true);
  const [identityFrontImg, setIdentityFrontImg] = useState(null);
  const [identityBackImg, setIdentityBackImg] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      roleId: "",
      libraryId: "",
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      mobile: "",
      email: "",
      identityType: "Aadhaar",
      identityNumber: "",
      agreeToTerms: false,
    },
  });

  const watchedIdentityType = watch("identityType");

  // Fetch roles and libraries from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await axiosInstance.get(ApiPaths.ROLE);
        
        if (response.data.success) {
          setRoles(response.data.detail);
        } else {
          setError("Failed to load roles");
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        setError("Failed to load roles. Please try again.");
      } finally {
        setLoadingRoles(false);
      }
    };

    const fetchLibraries = async () => {
      try {
        setLoadingLibraries(true);
        const response = await axiosInstance.get(ApiPaths.LIBRARY);
        
        if (response.data.success) {
          // Filter only active libraries (status: "A") and set them directly
          const activeLibraries = response.data.detail.filter(library => library.status === "A");
          setLibraries(activeLibraries);
        } else {
          setError("Failed to load libraries");
        }
      } catch (error) {
        console.error("Error fetching libraries:", error);
        setError("Failed to load libraries. Please try again.");
      } finally {
        setLoadingLibraries(false);
      }
    };

    fetchRoles();
    fetchLibraries();
  }, []);

  const onSubmit = async (data) => {
    setError("");
    setIsSubmitting(true);

    try {
      // Prepare the payload as a simple JSON object
      const payload = {
        roleId: parseInt(data.roleId),
        libraryId: parseInt(data.libraryId),
        username: data.username,
        password: data.password,
        confirmPassword: data.confirmPassword,
        name: `${data.firstName} ${data.lastName}`.trim(),
        mobile: data.mobile,
        email: data.email,
        identityType: data.identityType,
        identityNumber: data.identityNumber,
        identityFrontImg: identityFrontImg ? identityFrontImg.name : null,
        identityBackImg: identityBackImg ? identityBackImg.name : null,
      };
      
      // Log the payload to see what's being submitted
      console.log("API payload being submitted:", payload);
      
      // Make the actual API call with JSON payload
      const response = await axiosInstance.post(ApiPaths.REGISTER, payload);
      
      if (response.data.success) {
        setError("");
        // Show success message or redirect
        router.push("/auth/sign-in");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (fieldName === 'identityFrontImg') {
        setIdentityFrontImg(file);
      } else if (fieldName === 'identityBackImg') {
        setIdentityBackImg(file);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Role Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.roleId}>
        <InputLabel>Role</InputLabel>
        <Select
          {...register("roleId")}
          label="Role"
          disabled={loadingRoles}
          startAdornment={
            <InputAdornment position="start">
              {loadingRoles ? (
                <CircularProgress size={20} sx={{ color: "#F44336" }} />
              ) : (
                <AssignmentInd sx={{ color: "#F44336" }} />
              )}
            </InputAdornment>
          }
        >
          {roles.map((role) => (
            <MenuItem key={role.roleId} value={role.roleId}>
              {role.roleName}
            </MenuItem>
          ))}
        </Select>
        {errors.roleId && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
            {errors.roleId.message}
          </Typography>
        )}
      </FormControl>

      {/* Library Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.libraryId}>
        <InputLabel>Library</InputLabel>
        <Select
          {...register("libraryId")}
          label="Library"
          disabled={loadingLibraries}
          startAdornment={
            <InputAdornment position="start">
              {loadingLibraries ? (
                <CircularProgress size={20} sx={{ color: "#F44336" }} />
              ) : (
                <Business sx={{ color: "#F44336" }} />
              )}
            </InputAdornment>
          }
        >
          {libraries?.map((library) => (
            <MenuItem key={library.libraryId} value={library.libraryId}>
              {library.libraryName} - {library.address}
            </MenuItem>
          ))}
        </Select>
        {errors.libraryId && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
            {errors.libraryId.message}
          </Typography>
        )}
      </FormControl>

      {/* First Name Field */}
      <TextField
        fullWidth
        label="First Name"
        {...register("firstName")}
        error={!!errors.firstName}
        helperText={errors.firstName?.message}
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

      {/* Last Name Field */}
      <TextField
        fullWidth
        label="Last Name"
        {...register("lastName")}
        error={!!errors.lastName}
        helperText={errors.lastName?.message}
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

      {/* Email Field */}
      <TextField
        fullWidth
        label="Email"
        {...register("email")}
        error={!!errors.email}
        helperText={errors.email?.message}
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

      {/* Mobile Field */}
      <TextField
        fullWidth
        label="Mobile Number"
        {...register("mobile")}
        error={!!errors.mobile}
        helperText={errors.mobile?.message || "Enter 10-digit mobile number"}
        margin="normal"
        inputProps={{
          maxLength: 10,
          pattern: "[0-9]{10}"
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person sx={{ color: "#F44336" }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Identity Type Field */}
      <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.identityType}>
        <InputLabel>Identity Type</InputLabel>
        <Select
          {...register("identityType")}
          label="Identity Type"
        >
          <MenuItem value="Aadhaar">Aadhaar</MenuItem>
          <MenuItem value="PAN">PAN</MenuItem>
          <MenuItem value="Passport">Passport</MenuItem>
          <MenuItem value="Driving License">Driving License</MenuItem>
        </Select>
        {errors.identityType && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
            {errors.identityType.message}
          </Typography>
        )}
      </FormControl>

      {/* Identity Number Field */}
      <TextField
        fullWidth
        label="Identity Number"
        {...register("identityNumber")}
        error={!!errors.identityNumber}
        helperText={
          errors.identityNumber?.message || 
          (watchedIdentityType === 'Aadhaar' ? 'Enter 12-digit Aadhaar number (e.g., 123456789012)' :
           watchedIdentityType === 'PAN' ? 'Enter PAN in format: ABCDE1234F' :
           watchedIdentityType === 'Passport' ? 'Enter passport number (e.g., A1234567)' :
           watchedIdentityType === 'Driving License' ? 'Enter driving license (e.g., DL0120140147596)' :
           'Enter identity number')
        }
        margin="normal"
        inputProps={{
          style: { textTransform: 'uppercase' }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person sx={{ color: "#F44336" }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Username Field */}
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

      {/* Password Field */}
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

      {/* Confirm Password Field */}
      <TextField
        fullWidth
        label="Confirm Password"
        {...register("confirmPassword")}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        type={showConfirmPassword ? "text" : "password"}
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
                onClick={handleToggleConfirmPasswordVisibility}
                edge="end"
                sx={{ color: "#F44336" }}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Identity Front Image Upload */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Upload Identity Front Image *
        </Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<PhotoCamera />}
          fullWidth
          sx={{ mb: 1 }}
        >
          Upload Front Image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFileChange(e, 'identityFrontImg')}
          />
        </Button>
        {identityFrontImg && (
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={URL.createObjectURL(identityFrontImg)}
              alt="Identity Front"
              style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }}
            />
            <Button
              size="small"
              onClick={() => setIdentityFrontImg(null)}
              sx={{ position: 'absolute', top: -8, right: -8, minWidth: 0, p: 0, color: 'red', fontWeight: 700 }}
            >
              ×
            </Button>
          </Box>
        )}
      </Box>

      {/* Identity Back Image Upload */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Upload Identity Back Image (Optional)
        </Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<PhotoCamera />}
          fullWidth
          sx={{ mb: 1 }}
        >
          Upload Back Image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFileChange(e, 'identityBackImg')}
          />
        </Button>
        {identityBackImg && (
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={URL.createObjectURL(identityBackImg)}
              alt="Identity Back"
              style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }}
            />
            <Button
              size="small"
              onClick={() => setIdentityBackImg(null)}
              sx={{ position: 'absolute', top: -8, right: -8, minWidth: 0, p: 0, color: 'red', fontWeight: 700 }}
            >
              ×
            </Button>
          </Box>
        )}
      </Box>

      {/* Terms and Conditions */}
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              {...register("agreeToTerms")}
              sx={{
                color: '#F44336',
                '&.Mui-checked': {
                  color: '#F44336',
                },
              }}
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{" "}
              <Link
                href="#"
                sx={{
                  color: "#F44336",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Terms and Conditions
              </Link>
            </Typography>
          }
        />
        {errors.agreeToTerms && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5, display: 'block' }}>
            {errors.agreeToTerms.message}
          </Typography>
        )}
      </Box>

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
          py: 1.5,
          fontSize: "1.1rem",
          fontWeight: 600,
          textTransform: "none",
          backgroundColor: "#F44336",
          "&:hover": {
            backgroundColor: "#D32F2F",
          },
          "&:disabled": {
            backgroundColor: "#FFCDD2",
          },
        }}
      >
        {isSubmitting ? "Creating Account..." : "Sign Up"}
      </Button>

      {/* Sign In Link */}
      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            sx={{
              color: "#F44336",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Sign In
          </Link>
        </Typography>
      </Box>
    </form>
  );
}
