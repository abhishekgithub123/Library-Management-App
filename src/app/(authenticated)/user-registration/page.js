"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Snackbar,
  Alert,
  FormControl,
  FormLabel,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Grid,
} from "@mui/material";
import { PhotoCamera, EventSeat } from "@mui/icons-material";
import axiosClient from "../../../lib/api";
import { userRegistrationSchema } from "../../../utils/validation";
import SeatSelectionDialog from "../../../components/common/SeatSelectionDialog";

const SEAT_LIMIT = 30; // Example seat limit
const CURRENT_SEATS = 20; // Mock: set to SEAT_LIMIT to show warning

export default function UserRegistration() {
  const queryClient = useQueryClient();

  const [identityFrontImg, setIdentityFrontImg] = useState(null);
  const [identityBackImg, setIdentityBackImg] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [seatFull, setSeatFull] = useState(CURRENT_SEATS >= SEAT_LIMIT);
  const [seatDialogOpen, setSeatDialogOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [multiplier, setMultiplier] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      libraryId: 1, // Static value - Main Library
      roleId: 3,    // Static value - Admin role
      name: "",
      mobile: "",
      email: "",
      addLine1: "",
      addLine2: "",
      city: "",
      identityType: "Aadhaar",
      identityNumber: "",
      seatId: "",
      shiftId: "",
      bookingDate: new Date().toISOString().split('T')[0], // Today's date
      isFeeCollected: 0, // Default to not collected
      paidAmount: 0,
      paidOn: "",
      validFrom: new Date().toISOString().split('T')[0], // Today's date
      paymentMode: "",
      transactionId: "",
      remarks: "",
      feePlanId: "",
    },
  });

  const watchedValues = watch();

  // Fetch shifts from API
  const { data: shiftsData, isLoading: shiftsLoading, error: shiftsError } = useQuery({
    queryKey: ['shifts', watchedValues.libraryId],
    queryFn: async () => {
      const response = await axiosClient.get(`/libraryShift/${watchedValues.libraryId}`);
      if (response.data.success) {
        // Filter only active shifts and return the detail array
        const activeShifts = response.data.detail.filter(shift => shift.status === "A");
        return activeShifts;
      }
      return [];
    },
    enabled: !!watchedValues.libraryId,
    onSuccess: (data) => {
      // Set the first shift as default if no shift is selected
      if (data && data.length > 0 && !watchedValues.shiftId) {
        setValue('shiftId', data[0].id);
      }
    },
  });

  // Fetch available seats when shift is selected
  const { data: seatsData, isLoading: seatsLoading, error: seatsError } = useQuery({
    queryKey: ['seats', watchedValues.shiftId, watchedValues.bookingDate],
    queryFn: async () => {
      // Get all seats for the selected shift
      const seatsResponse = await axiosClient.get(`/seatingPlan/${watchedValues.shiftId}`);
      const allSeats = seatsResponse.data?.detail || [];
      console.log(allSeats, "All my seatsss")

      // Return all seats with availability status, don't filter here
      return allSeats.map(seat => ({
        ...seat,
        isAvailable: (seat.isActive === 1 || seat.isActive === 'true') &&
          (seat.isBooked === 0 || seat.isBooked === 'false')
      }));
    },
    enabled: !!watchedValues.shiftId && !!watchedValues.bookingDate,
  });

  // Fetch fee plans from API
  const { data: feePlansData, isLoading: feePlansLoading, error: feePlansError } = useQuery({
    queryKey: ['feePlans'],
    queryFn: async () => {
      const response = await axiosClient.get('/libraryFeePlan/');
      if (response.data.success) {
        // Filter only active plans and return the rows array
        const activePlans = response.data.detail.rows.filter(plan => plan.status === "A");
        return activePlans;
      }
      return [];
    },
    onSuccess: (data) => {
      // Fee plans loaded successfully
      console.log('Fee plans loaded:', data);
    },
  });

  // Check if selected plan is monthly
  const isMonthlyPlan = () => {
    if (!watchedValues.feePlanId || !feePlansData) return false;
    const selectedPlan = feePlansData.find(plan => plan.id === watchedValues.feePlanId);
    return selectedPlan?.duration?.toLowerCase().includes('month') || 
           selectedPlan?.name?.toLowerCase().includes('month');
  };

  // Auto-update paid amount when fee plan changes
  useEffect(() => {
    if (watchedValues.feePlanId && feePlansData) {
      const selectedPlan = feePlansData.find(plan => plan.id === watchedValues.feePlanId);
      if (selectedPlan) {
        const baseAmount = parseFloat(selectedPlan.amount);
        const finalAmount = baseAmount * multiplier;
        setValue('paidAmount', finalAmount);
        setValue('validFrom', new Date().toISOString().split('T')[0]);
      }
    }
  }, [watchedValues.feePlanId, feePlansData, setValue, multiplier]);

  // Update paid amount when multiplier changes
  useEffect(() => {
    if (watchedValues.feePlanId && feePlansData) {
      const selectedPlan = feePlansData.find(plan => plan.id === watchedValues.feePlanId);
      if (selectedPlan) {
        const baseAmount = parseFloat(selectedPlan.amount);
        const finalAmount = baseAmount * multiplier;
        setValue('paidAmount', finalAmount);
      }
    }
  }, [multiplier, watchedValues.feePlanId, feePlansData, setValue]);

  // Reset multiplier when fee plan changes
  useEffect(() => {
    setMultiplier(1);
  }, [watchedValues.feePlanId]);

  // Generate transaction ID
  const generateTransactionId = () => {
    return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  // Get label for transaction ID field based on payment mode
  const getTransactionIdLabel = (paymentMode) => {
    switch (paymentMode) {
      case "CASH":
        return "Receipt ID";
      case "CARD":
      case "ONLINE":
        return "Transaction ID";
      default:
        return "Transaction ID";
    }
  };

  // Map feePlanId to planSelection
  const getPlanSelection = (feePlanId) => {
    switch (feePlanId) {
      case 1:
        return "Monthly";
      case 2:
        return "Quarterly";
      case 3:
        return "Yearly";
      default:
        return "";
    }
  };

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data) => {
      // Get planSelection based on feePlanId
      const planSelection = getPlanSelection(data.feePlanId);
      
      // Get selected fee plan details
      const selectedPlan = feePlansData?.find(plan => plan.id === data.feePlanId);
      
      // Prepare the payload with proper field mapping
      const payload = {
        libraryId: data.libraryId,
        roleId: data.roleId,
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        addLine1: data.addLine1,
        addLine2: data.addLine2,
        city: data.city,
        identityType: data.identityType,
        identityNumber: data.identityNumber,
        identityFrontImg: identityFrontImg ? "frontImage" : "defaultFrontImage",
        identityBackImg: identityBackImg ? "backImage" : null,
        seatId: data.seatId,
        shiftId: data.shiftId,
        bookingDate: data.bookingDate,
        isFeeCollected: data.isFeeCollected,
        feePlanId: data.feePlanId,
        planSelection: planSelection,
        // Handle payment fields based on fee collection status
        paidAmount: data.isFeeCollected === 1 ? data.paidAmount : (selectedPlan?.amount || 0),
        paidOn: data.isFeeCollected === 1 ? data.paidOn : null,
        validFrom: data.isFeeCollected === 1 ? data.validFrom : new Date().toISOString().split('T')[0],
        paymentMode: data.isFeeCollected === 1 ? data.paymentMode : null,
        transactionId: data.isFeeCollected === 1 ? data.transactionId : null,
        remarks: data.remarks
      };

      return axiosClient.post('/user/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User created successfully!');
      setShowToast(true);
      // Reset form
      reset({
        libraryId: 1, // Static value - Main Library
        roleId: 3,    // Static value - Admin role
        name: "",
        mobile: "",
        email: "",
        addLine1: "",
        addLine2: "",
        city: "",
        identityType: "Aadhaar",
        identityNumber: "",
        seatId: "",
        shiftId: "",
        bookingDate: new Date().toISOString().split('T')[0],
        isFeeCollected: 0, // Default to not collected
        paidAmount: 0,
        paidOn: "",
        validFrom: new Date().toISOString().split('T')[0],
        paymentMode: "",
        transactionId: "",
        remarks: "",
        feePlanId: "",
      });
      setIdentityFrontImg(null);
      setIdentityBackImg(null);
      setMultiplier(1);
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    },
  });

  const handleFrontImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdentityFrontImg(file);
    }
  };

  const handleBackImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdentityBackImg(file);
    }
  };

  const handleSeatSelection = (seatId) => {
    setValue('seatId', seatId);
  };

  const handleOpenSeatDialog = () => {
    setSeatDialogOpen(true);
  };

  const handleCloseSeatDialog = () => {
    setSeatDialogOpen(false);
  };

  const handleBookSeats = (seats) => {
    if (seats.length > 0) {
      const selectedSeat = seats[0]; // For now, only one seat
      setValue('seatId', selectedSeat.seatId);
      setSelectedSeats(seats);
    }
  };

  const onSubmit = async (data) => {
    // Generate transaction ID if not provided
    if (!data.transactionId) {
      data.transactionId = generateTransactionId();
    }

    createUserMutation.mutate(data);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", p: 2 }}>
      <Typography variant="h5" fontWeight={500} gutterBottom>
        User Registration
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
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
          helperText={errors.mobile?.message || "Enter 10-digit mobile number"}
          fullWidth
          margin="normal"
          inputProps={{
            maxLength: 10,
            pattern: "[0-9]{10}"
          }}
        />

        <TextField
          label="Email"
          type="email"
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message || "Enter a valid email address (optional)"}
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

        <FormControl fullWidth margin="normal" error={!!errors.identityType}>
          <InputLabel>Identity Type</InputLabel>
          <Select
            {...register("identityType")}
            label="Identity Type"
          >
            <MenuItem value="Aadhaar">Aadhaar</MenuItem>
            <MenuItem value="Driving License">Driving License</MenuItem>
            <MenuItem value="Voter Card">Voter Card</MenuItem>
          </Select>
          {errors.identityType && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
              {errors.identityType.message}
            </Typography>
          )}
        </FormControl>

        <TextField
          label="Identity Number"
          {...register("identityNumber")}
          error={!!errors.identityNumber}
          helperText={
            errors.identityNumber?.message ||
            (watchedValues.identityType === 'Aadhaar' ? 'Enter 12-digit Aadhaar number (e.g., 123456789012)' :
              watchedValues.identityType === 'Driving License' ? 'Enter driving license (e.g., DL0120140147596)' :
                watchedValues.identityType === 'Voter Card' ? 'Enter voter card number (e.g., 123456789012345)' :
                  'Enter identity number')
          }
          fullWidth
          margin="normal"
          inputProps={{
            style: { textTransform: 'uppercase' }
          }}
        />

        <FormControl fullWidth margin="normal" error={!!errors.shiftId}>
          <InputLabel>Shift</InputLabel>
          {shiftsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 50 }}>
              <CircularProgress size={20} />
            </Box>
          ) : shiftsError ? (
            <Alert severity="error" sx={{ mt: 1 }}>
              Failed to fetch shifts.
            </Alert>
          ) : shiftsData && shiftsData.length > 0 ? (
            <Select
              {...register("shiftId")}
              label="Shift"
            >
              {shiftsData.map((shift) => (
                <MenuItem key={shift.id} value={shift.id}>
                  {shift.name} ({shift.startTime} - {shift.endTime})
                </MenuItem>
              ))}
            </Select>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No shifts available for this library.
            </Typography>
          )}
          {errors.shiftId && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
              {errors.shiftId.message}
            </Typography>
          )}
        </FormControl>

        {/* Seat Selection - Only show when shift is selected */}
        {watchedValues.shiftId && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select Your Seat
            </Typography>
            {seatsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 150 }}>
                <CircularProgress />
              </Box>
            ) : seatsError ? (
              <Alert severity="error" sx={{ mt: 1 }}>
                Failed to load seats.
              </Alert>
            ) : seatsData && seatsData.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<EventSeat />}
                  onClick={handleOpenSeatDialog}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Select Seat
                </Button>

                {/* Show selected seats */}
                {selectedSeats.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Selected Seats:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedSeats.map((seat) => {
                        // Use the actual seat number from the seat data
                        const seatLabel = seat.seatNumber || seat.seatId;
                        
                        return (
                          <Chip
                            key={seat.seatId}
                            label={seatLabel}
                            color="primary"
                            variant="filled"
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {errors.seatId && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.seatId.message}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No seats available for this shift.
              </Typography>
            )}
          </Box>
        )}

        <TextField
          label="Booking Date"
          type="date"
          {...register("bookingDate")}
          error={!!errors.bookingDate}
          helperText={errors.bookingDate?.message}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />

        <TextField
          label="Remarks"
          {...register("remarks")}
          error={!!errors.remarks}
          helperText={errors.remarks?.message}
          fullWidth
          margin="normal"
          multiline
          rows={3}
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
            onChange={(e) => handleFrontImageChange(e, 'identityFrontImg')}
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
            onChange={(e) => handleBackImageChange(e, 'identityBackImg')}
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

        {/* Fee Plan Selection */}
        <FormControl fullWidth margin="normal" error={!!errors.feePlanId}>
          <InputLabel>Fee Plan</InputLabel>
          {feePlansLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 50 }}>
              <CircularProgress size={20} />
            </Box>
          ) : feePlansError ? (
            <Alert severity="error" sx={{ mt: 1 }}>
              Failed to fetch fee plans.
            </Alert>
          ) : feePlansData && feePlansData.length > 0 ? (
            <Select
              {...register("feePlanId")}
              label="Fee Plan"
              onChange={(e) => {
                const selectedPlanId = e.target.value;
                const selectedPlan = feePlansData.find(plan => plan.id === selectedPlanId);
                setValue('feePlanId', selectedPlanId);
                setValue('paidAmount', selectedPlan?.amount || 0);
                setValue('validFrom', new Date().toISOString().split('T')[0]);
              }}
            >
              {feePlansData.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.name} - {plan.duration} (₹{plan.amount})
                </MenuItem>
              ))}
            </Select>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No fee plans available.
            </Typography>
          )}
          {errors.feePlanId && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
              {errors.feePlanId.message}
            </Typography>
          )}
        </FormControl>

        {/* Fee Collection Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={watchedValues.isFeeCollected === 1}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setValue('isFeeCollected', isChecked ? 1 : 0);

                if (!isChecked) {
                  // When fee is not collected, set paidAmount to selected plan amount
                  const selectedPlan = feePlansData?.find(plan => plan.id === watchedValues.feePlanId);
                  setValue('paidAmount', selectedPlan?.amount || 0);
                  setValue('paidOn', '');
                  setValue('validFrom', new Date().toISOString().split('T')[0]);
                  setValue('paymentMode', '');
                  setValue('transactionId', '');

                  // Clear validation errors for payment fields
                  clearErrors(['paidAmount', 'paidOn', 'validFrom', 'paymentMode']);
                } else {
                  // When fee is collected, ensure paidAmount is set to selected plan amount
                  const selectedPlan = feePlansData?.find(plan => plan.id === watchedValues.feePlanId);
                  setValue('paidAmount', selectedPlan?.amount || 0);
                  setValue('validFrom', new Date().toISOString().split('T')[0]);
                }
              }}
            />
          }
          label="Fee collected"
          sx={{ mt: 2 }}
        />

        {/* Payment Details - Only show when fee is collected */}
        {watchedValues.isFeeCollected === 1 && (
          <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#fafafa' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Payment Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  label="Paid Amount"
                  type="number"
                  {...register("paidAmount")}
                  error={!!errors.paidAmount}
                  helperText={errors.paidAmount?.message}
                  fullWidth
                  margin="normal"
                  disabled={!!watchedValues.feePlanId}
                  InputProps={{
                    readOnly: !!watchedValues.feePlanId,
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                {isMonthlyPlan() && (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Months</InputLabel>
                    <Select
                      value={multiplier}
                      onChange={(e) => setMultiplier(e.target.value)}
                      label="Months"
                    >
                      <MenuItem value={1}>x1</MenuItem>
                      <MenuItem value={2}>x2</MenuItem>
                      <MenuItem value={3}>x3</MenuItem>
                      <MenuItem value={4}>x4</MenuItem>
                      <MenuItem value={5}>x5</MenuItem>
                      <MenuItem value={6}>x6</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Grid>
            </Grid>

            <TextField
              label="Paid On"
              type="date"
              {...register("paidOn")}
              error={!!errors.paidOn}
              helperText={errors.paidOn?.message || "Select the payment date"}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              label="Valid From"
              type="date"
              {...register("validFrom")}
              error={!!errors.validFrom}
              helperText={errors.validFrom?.message || "Select the validity start date"}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <FormControl component="fieldset" sx={{ mt: 2 }} error={!!errors.paymentMode}>
              <FormLabel component="legend">Payment Mode</FormLabel>
              <RadioGroup
                row
                value={watchedValues.paymentMode || ""}
                onChange={(e) => {
                  setValue('paymentMode', e.target.value);
                }}
              >
                <FormControlLabel value="CASH" control={<Radio />} label="Cash" />
                <FormControlLabel value="CARD" control={<Radio />} label="Card" />
                <FormControlLabel value="ONLINE" control={<Radio />} label="Online" />
              </RadioGroup>
              {errors.paymentMode && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.paymentMode.message}
                </Typography>
              )}
            </FormControl>

            <TextField
              label={getTransactionIdLabel(watchedValues.paymentMode)}
              {...register("transactionId")}
              error={!!errors.transactionId}
              helperText={errors.transactionId?.message}
              fullWidth
              margin="normal"
            />
          </Box>
        )}

        {/* Seat limit warning */}
        {seatFull && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Seat limit reached! No more registrations allowed for this shift.
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          disabled={seatFull || createUserMutation.isPending || !watchedValues.shiftId || !watchedValues.seatId}
        >
          {createUserMutation.isPending ? "Creating User..." : "Save"}
        </Button>
      </form>

      {/* Seat Selection Dialog */}
      <SeatSelectionDialog
        open={seatDialogOpen}
        onClose={handleCloseSeatDialog}
        seats={seatsData || []}
        selectedSeats={selectedSeats}
        onSeatSelect={handleSeatSelection}
        onBookSeats={handleBookSeats}
        shiftName={shiftsData?.find(s => s.id === watchedValues.shiftId)?.name || ""}
      />

      <Snackbar
        open={showToast}
        autoHideDuration={3000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setShowToast(false)} severity="success" sx={{ width: '100%' }}>
          Registration saved!
        </Alert>
      </Snackbar>
    </Box>
  );
} 