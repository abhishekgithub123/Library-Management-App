"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { editUserSchema } from "../../utils/validation";

const EditUserDialog = ({ 
  open, 
  onClose, 
  editingUser, 
  onSaveEdit,
  isLoadingUserDetails = false,
  isSaving = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      addLine1: "",
      addLine2: "",
      city: "",
    },
  });

  // Reset form when editingUser changes
  useEffect(() => {
    if (editingUser) {
      reset({
        name: editingUser.name || "",
        mobile: editingUser.mobile || "",
        email: editingUser.email || "",
        addLine1: editingUser.addLine1 || "",
        addLine2: editingUser.addLine2 || "",
        city: editingUser.city || "",
      });
    }
  }, [editingUser, reset]);

  const onSubmit = (data) => {
    onSaveEdit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Show loading state
  if (isLoadingUserDetails) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading user details...</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User Details</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {editingUser && (
              <>
                <TextField
                  label="Name"
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Mobile"
                  {...register("mobile")}
                  error={!!errors.mobile}
                  helperText={errors.mobile?.message}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Email"
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Address Line 1"
                  {...register("addLine1")}
                  error={!!errors.addLine1}
                  helperText={errors.addLine1?.message}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Address Line 2"
                  {...register("addLine2")}
                  error={!!errors.addLine2}
                  helperText={errors.addLine2?.message}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="City"
                  {...register("city")}
                  error={!!errors.city}
                  helperText={errors.city?.message}
                  fullWidth
                  margin="normal"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSaving}>Cancel</Button>
          <Button 
            type="submit"
            variant="contained" 
            color="primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditUserDialog;