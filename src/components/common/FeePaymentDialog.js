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
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemIcon,
  ListItemButton,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  Image,
  Description,
  CalendarMonth,
} from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../lib/api";
import { ApiPaths } from "../../constants/api-paths";
import { feePaymentSchema } from "../../utils/validation";

const FeePaymentDialog = ({ open, onClose, user, onPaymentSuccess }) => {
  console.log(user,"ye meri user details hai")
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [unpaidMonths, setUnpaidMonths] = useState([]);
  const [selectedUnpaidMonths, setSelectedUnpaidMonths] = useState([]);

  // Form setup with validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    trigger,
  } = useForm({
    resolver: zodResolver(feePaymentSchema),
    defaultValues: {
      paymentMode: "CASH",
      transactionId: "",
      remarks: "",
      paymentScreenshot: null,
      unpaidMonths: [],
    },
  });

  const watchedPaymentMode = watch("paymentMode");

  // Calculate unpaid months based on validFrom date and feePlanId
  useEffect(() => {
    if (user?.validFrom && user?.feePlanId) {
      calculateUnpaidMonths();
    }
  }, [user]);

  const calculateUnpaidMonths = () => {
    const validFromDate = new Date(user.validFrom);
    const months = [];
    
    // Get fee plan duration based on feePlanId
    let durationInMonths = 1; // Default to monthly
    if (user.feePlanId === 2) durationInMonths = 3; // Quarterly
    else if (user.feePlanId === 3) durationInMonths = 12; // Yearly
    
    // Calculate only the plan duration months from validFrom
    for (let i = 0; i < durationInMonths; i++) {
      const monthDate = new Date(validFromDate);
      monthDate.setMonth(validFromDate.getMonth() + i);
      
      const monthName = monthDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      months.push({
        value: monthName,
        date: monthDate,
        label: monthName
      });
    }
    
    setUnpaidMonths(months);
    // Set first month as default selection
    if (months.length > 0) {
      setSelectedUnpaidMonths([months[0].value]);
      setValue('unpaidMonths', [months[0].value]);
    }
  };

  // Handle month selection
  const handleMonthSelection = (monthValue) => {
    setSelectedUnpaidMonths([monthValue]);
    setValue('unpaidMonths', [monthValue]);
  };

  // Handle select all months
  const handleSelectAllMonths = () => {
    if (selectedUnpaidMonths.length === unpaidMonths.length) {
      setSelectedUnpaidMonths([]);
      setValue('unpaidMonths', []);
    } else {
      setSelectedUnpaidMonths(unpaidMonths.map(m => m.value));
      setValue('unpaidMonths', unpaidMonths.map(m => m.value));
    }
  };

  // Handle payment mode change
  const handlePaymentModeChange = (event) => {
    const mode = event.target.value;
    setValue("paymentMode", mode);
    
    // Clear transaction ID when payment mode changes
    setValue("transactionId", "");
    
    // Trigger validation
    trigger("transactionId");
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);

      // Create preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target.result);
          setValue("paymentScreenshot", { file, preview: e.target.result });
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
        setValue("paymentScreenshot", { file, preview: null });
      }
      
      // Trigger validation
      trigger("paymentScreenshot");
    }
  };

  // Handle file removal
  const handleFileRemove = () => {
    setUploadedFile(null);
    setFilePreview(null);
    setValue("paymentScreenshot", null);
    trigger("paymentScreenshot");
  };

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: async (paymentData) => {
      const response = await axiosClient.patch(ApiPaths.STUDENT_FEE, paymentData);
      return response.data;
    },
    onSuccess: () => {
      onPaymentSuccess();
      onClose();
      // Reset form
      reset();
      setUploadedFile(null);
      setFilePreview(null);
      setSelectedUnpaidMonths([]);
    },
    onError: (error) => {
      console.error('Payment failed:', error);
      setIsProcessing(false);
    }
  });

  // Handle payment submission
  const onSubmit = async (data) => {
    setIsProcessing(true);

    try {
      const paymentData = {
        studentFeeId: user.studentFeeId || 22, // Default value, should come from user data
        studentId: user.id,
        status: "PAID",
        paidOn: new Date().toISOString().split('T')[0],
        paymentMode: data.paymentMode,
        transactionId: data.transactionId,
        remarks: data.remarks || "",
        paymentScreenshot: data.paymentScreenshot?.file?.name || null,
        unpaidMonths: data.unpaidMonths || []
      };

      // Here you would typically upload the file to your server
      if (data.paymentScreenshot?.file) {
        console.log('File to upload:', data.paymentScreenshot.file);
        // You can implement file upload logic here
        // const formData = new FormData();
        // formData.append('paymentScreenshot', data.paymentScreenshot.file);
        // await uploadFile(formData);
      }

      await paymentMutation.mutateAsync(paymentData);
    } catch (error) {
      console.error('Payment submission failed:', error);
      setIsProcessing(false);
    }
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      reset();
      setUploadedFile(null);
      setFilePreview(null);
      setSelectedUnpaidMonths([]);
    }
  }, [open, reset]);

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Process Payment</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* User Information */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>
            User Information
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Name" secondary={user.name} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Mobile" secondary={user.mobile} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Shift" secondary={user.shiftName || user.shift} />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Plan" 
                secondary={
                  user.feePlanId === 1 ? "Monthly" :
                  user.feePlanId === 2 ? "Quarterly" :
                  user.feePlanId === 3 ? "Yearly" :
                  `Plan ID: ${user.feePlanId}`
                } 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Valid From" 
                secondary={user.validFrom ? new Date(user.validFrom).toLocaleDateString() : 'N/A'} 
              />
            </ListItem>
          </List>
        </Box>

        {/* Unpaid Months Selection */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#fff3e0', borderRadius: 1, border: '1px solid #ffb74d' }}>
          <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonth sx={{ color: '#f57c00' }} />
            Select Unpaid Months
          </Typography>
          
          {unpaidMonths.length > 0 ? (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedUnpaidMonths.length} of {unpaidMonths.length} months selected
                </Typography>
                <Button
                  size="small"
                  onClick={handleSelectAllMonths}
                  variant="outlined"
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  {selectedUnpaidMonths.length === unpaidMonths.length ? 'Deselect All' : 'Select All'}
                </Button>
              </Box>
              
              <FormControl fullWidth error={!!errors.unpaidMonths}>
                <InputLabel id="unpaid-months-label">Select Months</InputLabel>
                <Select
                  labelId="unpaid-months-label"
                  multiple
                  value={selectedUnpaidMonths}
                  onChange={(event) => {
                    const newSelection = event.target.value;
                    setSelectedUnpaidMonths(newSelection);
                    setValue('unpaidMonths', newSelection);
                  }}
                  label="Select Months"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip 
                          key={value} 
                          label={value} 
                          size="small" 
                          sx={{ backgroundColor: '#ffb74d', color: '#fff' }}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {unpaidMonths.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      <Checkbox 
                        checked={selectedUnpaidMonths.includes(month.value)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.unpaidMonths && (
                  <FormHelperText error>{errors.unpaidMonths.message}</FormHelperText>
                )}
              </FormControl>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Selected months will be marked as paid after successful payment
              </Typography>
            </>
          ) : (
            <Alert severity="info">
              No unpaid months calculated. Please check the user's valid from date and fee plan.
            </Alert>
          )}
        </Box>

        {/* Payment Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>
            Payment Details
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Payment Mode</Typography>
            <RadioGroup
              row
              value={watchedPaymentMode}
              onChange={handlePaymentModeChange}
            >
              <FormControlLabel value="CASH" control={<Radio />} label="Cash" />
              <FormControlLabel value="CARD" control={<Radio />} label="Card" />
              <FormControlLabel value="ONLINE" control={<Radio />} label="Online" />
            </RadioGroup>
            {errors.paymentMode && (
              <FormHelperText error>{errors.paymentMode.message}</FormHelperText>
            )}
          </Box>

          <TextField
            label={watchedPaymentMode === "CASH" ? "Receipt ID" : "Transaction ID"}
            {...register("transactionId")}
            fullWidth
            margin="normal"
            placeholder={watchedPaymentMode === "CASH" ? "Enter Receipt ID" : "Enter Transaction ID"}
            error={!!errors.transactionId}
            helperText={errors.transactionId?.message}
          />

          {/* File Upload Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Payment Screenshot <span style={{ color: '#F44336' }}>*</span>
            </Typography>
            
            {!uploadedFile ? (
              <Paper
                sx={{
                  border: errors.paymentScreenshot ? '2px dashed #F44336' : '2px dashed #F44336',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: errors.paymentScreenshot ? 'rgba(244, 67, 54, 0.05)' : 'rgba(244, 67, 54, 0.02)',
                  '&:hover': {
                    borderColor: '#D32F2F',
                    backgroundColor: 'rgba(244, 67, 54, 0.05)',
                  },
                }}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <CloudUpload sx={{ fontSize: 48, color: '#F44336', mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Click to upload payment screenshot
                </Typography>
                <Typography variant="caption" color="#F44336" fontWeight="bold">
                  Required - Supported formats: JPEG, PNG, GIF, PDF (Max 5MB)
                </Typography>
              </Paper>
            ) : (
              <Paper sx={{ p: 2, border: '1px solid #4CAF50', borderRadius: 2, backgroundColor: 'rgba(76, 175, 80, 0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {uploadedFile.type.startsWith('image/') ? (
                      <Image sx={{ color: '#4CAF50' }} />
                    ) : (
                      <Description sx={{ color: '#4CAF50' }} />
                    )}
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="#4CAF50">
                        {uploadedFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton 
                    onClick={handleFileRemove}
                    size="small"
                    sx={{ color: '#F44336' }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
                
                {/* File Preview for Images */}
                {filePreview && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <img 
                      src={filePreview} 
                      alt="Payment Screenshot Preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        borderRadius: '4px',
                        border: '1px solid #4CAF50'
                      }} 
                    />
                  </Box>
                )}
              </Paper>
            )}
            
            {errors.paymentScreenshot && (
              <FormHelperText error sx={{ mt: 1 }}>
                {errors.paymentScreenshot.message}
              </FormHelperText>
            )}
          </Box>

          <TextField
            label="Remarks"
            {...register("remarks")}
            fullWidth
            margin="normal"
            multiline
            rows={2}
            placeholder="Any additional notes..."
            error={!!errors.remarks}
            helperText={errors.remarks?.message}
          />
        </Box>

        {/* Payment Summary */}
        <Box sx={{ p: 2, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
          <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
            Payment Summary
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Payment Mode: {watchedPaymentMode}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Transaction ID: {watch("transactionId") || "Not entered yet"}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Screenshot: {uploadedFile ? (
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>✓ {uploadedFile.name}</span>
            ) : (
              <span style={{ color: '#F44336', fontWeight: 'bold' }}>✗ Required</span>
            )}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Months to Pay: {selectedUnpaidMonths.length} month(s)
          </Typography>
          <Typography variant="h6" color="primary" fontWeight={500}>
            Status: PENDING → PAID
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          disabled={isProcessing || selectedUnpaidMonths.length === 0}
          startIcon={isProcessing ? <CircularProgress size={16} /> : null}
        >
          {isProcessing ? "Processing..." : "Update Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeePaymentDialog; 