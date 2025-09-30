"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import axiosClient from "../../../lib/api";
import { ApiPaths } from "../../../constants/api-paths";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema } from "../../../utils/validation";
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";

const planOptions = ["Basic", "Standard", "Premium", "Enterprise"];

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: 'N/A',
    mobile: 'N/A',
    addLine1: 'N/A',
    addLine2: 'N/A',
    subscriptionPlan: 'Basic plan'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form setup with validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: '',
      mobile: '',
      addLine1: '',
      addLine2: '',
      subscriptionPlan: 'Basic plan',
    },
  });

  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.userId) {
        setError("User ID not available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        // Call the get user by ID API using the same client as user registration
        const response = await axiosClient.get(ApiPaths.USER_BY_ID(user.userId));
        
        if (response.data.success && response.data.detail) {
          setProfile(response.data.detail);
        } else {
          setError(response.data.message || "Failed to load profile");
          // Keep the default fallback values
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err.response?.data?.message || "Failed to load profile data");
        // Keep the default fallback values
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.userId]);

  const handleEditOpen = () => {
    // Clear any previous messages
    setError("");
    setSuccess("");
    
    // Set form values with current profile data
    setValue('name', profile?.name || '');
    setValue('mobile', profile?.mobile || '');
    setValue('addLine1', profile?.addLine1 || '');
    setValue('addLine2', profile?.addLine2 || '');
    setValue('subscriptionPlan', profile?.subscriptionPlan || 'Basic plan');
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    reset(); // Reset form when closing
  };

  const onSubmit = async (data) => {
    if (!user?.userId) {
      setError("User ID not available");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      
      // Call the update user API using the same client
      const response = await axiosClient.put(ApiPaths.USER_UPDATE(user.userId), data);
      
      if (response.data.success) {
        // Update the profile with the new data we just sent
        // Don't use response.data.detail as it's null
        setProfile(prevProfile => ({
          ...prevProfile,
          ...data
        }));
        setEditOpen(false);
        reset(); // Reset form after successful save
        setSuccess("Profile updated successfully!");
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 1.5, mt: 5 }}>
      {/* Show loading indicator only during initial load */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', mb: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Show error message if any, but don't block the UI */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Show success message if any */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Always show the profile UI */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" fontWeight={600}>Librarian Profile</Typography>
          <Button variant="contained" onClick={handleEditOpen} disabled={loading}>
            Edit
          </Button>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Name</Typography>
          <Typography variant="body1" fontWeight={500}>{profile?.name || 'N/A'}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Mobile Number</Typography>
          <Typography variant="body1" fontWeight={500}>{profile?.mobile || 'N/A'}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Address</Typography>
          <Typography variant="body1" fontWeight={500}>{profile?.addLine1 || profile?.address || 'N/A'}</Typography>
          {profile?.addLine2 && (
            <Typography variant="body1" fontWeight={500}>{profile.addLine2}</Typography>
          )}
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Subscription Plan</Typography>
          <Typography variant="body1" fontWeight={500}>{profile?.subscriptionPlan || 'Basic plan'}</Typography>
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <TextField
            margin="normal"
            label="Name"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            label="Mobile Number"
            {...register("mobile")}
            error={!!errors.mobile}
            helperText={errors.mobile?.message || "Enter 10-digit mobile number"}
            fullWidth
            required
            sx={{ mb: 2 }}
            inputProps={{
              maxLength: 10,
              pattern: "[0-9]{10}"
            }}
          />
          <TextField
            margin="normal"
            label="Address Line 1"
            {...register("addLine1")}
            error={!!errors.addLine1}
            helperText={errors.addLine1?.message}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            label="Address Line 2 (Optional)"
            {...register("addLine2")}
            error={!!errors.addLine2}
            helperText={errors.addLine2?.message}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="normal"
            label="Subscription Plan"
            {...register("subscriptionPlan")}
            error={!!errors.subscriptionPlan}
            helperText={errors.subscriptionPlan?.message}
            fullWidth
            sx={{ mb: 2 }}
          >
            {planOptions.map((option) => (
              <MenuItem key={option} value={option + ' plan'}>
                {option + ' plan'}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} disabled={saving}>Cancel</Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            variant="contained" 
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 