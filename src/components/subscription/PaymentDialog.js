import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  Avatar,
  Chip,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  QrCode,
  Close,
  Security,
  CheckCircle,
  PhoneAndroid,
  AccountBalance,
  Payment,
  Android,
} from "@mui/icons-material";
import PaymentSuccessDialog from "./PaymentSuccessDialog";

// UPI Apps for display
const upiApps = [
  { name: "Google Pay", icon: <Android sx={{ color: "#4285f4" }} />, color: "#4285f4" },
  { name: "PhonePe", icon: <Payment sx={{ color: "#5f259f" }} />, color: "#5f259f" },
  { name: "Paytm", icon: <PhoneAndroid sx={{ color: "#00b9f1" }} />, color: "#00b9f1" },
  { name: "BHIM", icon: <AccountBalance sx={{ color: "#1e88e5" }} />, color: "#1e88e5" },
];

const PaymentDialog = ({ open, onClose, selectedPlan, onSuccess, onError }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: "",
  });
  const [showQR, setShowQR] = useState(false);

  const handleInputChange = (field, value) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing with static data
    setTimeout(() => {
      const mockSubscriptionData = {
        subscriptionId: Math.floor(Math.random() * 10000) + 1000,
        planId: selectedPlan.planId,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + selectedPlan.durationInDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: "UPI",
        paymentReference: `UPI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: parseFloat(selectedPlan.price.replace('Rs ', '').replace(',', '')),
        status: 'ACTIVE',
        userLimit: selectedPlan.userLimit,
        planName: selectedPlan.planName,
      };

      setIsProcessing(false);
      setSubscriptionData(mockSubscriptionData);
      setShowSuccessDialog(true);
      onSuccess?.(mockSubscriptionData);
    }, 2000);
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      setPaymentDetails({
        upiId: "",
      });
      setShowQR(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    onClose();
  };

  const isFormValid = () => {
    return paymentDetails.upiId && paymentDetails.upiId.includes('@');
  };

  const formatUPIId = (value) => {
    // Remove spaces and convert to lowercase
    return value.replace(/\s+/g, '').toLowerCase();
  };

  // Don't render dialog if no plan is selected
  if (!selectedPlan) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={isMobile ? "xs" : "sm"}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 1 : 2,
            maxHeight: "90vh",
            background: "#fff",
            boxShadow: 3,
            margin: isMobile ? 1 : 2,
            width: isMobile ? 'calc(100% - 16px)' : 'auto',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ 
          background: "#d32f2f",
          color: "white",
          p: isMobile ? 2 : 3,
          pb: isMobile ? 1.5 : 2
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: isMobile ? 1.5 : 2 }}>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
              UPI Payment
            </Typography>
            <IconButton onClick={handleClose} size="small" sx={{ color: "white" }} disabled={isProcessing}>
              <Close />
            </IconButton>
          </Box>
          
          {/* Payment Summary */}
          <Paper sx={{ 
            p: isMobile ? 1.5 : 2, 
            background: "rgba(255, 255, 255, 0.95)", 
            borderRadius: isMobile ? 1 : 2,
            color: "text.primary"
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Plan
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} fontWeight="bold">
                {selectedPlan?.planName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Amount
              </Typography>
              <Typography variant={isMobile ? "h6" : "h6"} fontWeight="bold" color="#F44336">
                {selectedPlan?.price}
              </Typography>
            </Box>
          </Paper>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {/* UPI Payment Form */}
          <Box sx={{ p: isMobile ? 2 : 3 }}>
            {/* UPI Apps */}
            <Box sx={{ mb: isMobile ? 2 : 3 }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom fontWeight="bold">
                Choose UPI App
              </Typography>
              <Grid container spacing={isMobile ? 1 : 2}>
                {upiApps.map((app) => (
                  <Grid item xs={6} sm={3} key={app.name}>
                    <Paper
                      sx={{
                        p: isMobile ? 1.5 : 2,
                        textAlign: "center",
                        cursor: "pointer",
                        border: "2px solid transparent",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: app.color,
                          transform: "translateY(-2px)",
                          boxShadow: 2,
                        },
                      }}
                    >
                      <Box sx={{ mb: 1 }}>
                        {app.icon}
                      </Box>
                      <Typography variant="caption" fontWeight="bold" fontSize={isMobile ? "0.7rem" : "0.75rem"}>
                        {app.name}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider sx={{ my: isMobile ? 2 : 3 }} />

            {/* UPI ID Input */}
            <Box sx={{ mb: isMobile ? 2 : 3 }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom fontWeight="bold">
                Enter UPI ID
              </Typography>
              <TextField
                fullWidth
                label="UPI ID"
                placeholder="example@upi"
                value={paymentDetails.upiId}
                onChange={(e) => handleInputChange("upiId", formatUPIId(e.target.value))}
                size={isMobile ? "small" : "medium"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: isMobile ? 1 : 2,
                    "&:hover fieldset": {
                      borderColor: "#F44336",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#F44336",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <PhoneAndroid sx={{ mr: 1, color: "#F44336", fontSize: isMobile ? "1.2rem" : "1.5rem" }} />
                  ),
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Enter your UPI ID (e.g., username@bankname)
              </Typography>
            </Box>

            {/* QR Code Option */}
            <Box sx={{ mb: isMobile ? 2 : 3 }}>
              <Button
                fullWidth
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                startIcon={<QrCode />}
                onClick={() => setShowQR(!showQR)}
                sx={{
                  borderRadius: isMobile ? 1 : 2,
                  borderColor: "#F44336",
                  color: "#F44336",
                  "&:hover": {
                    borderColor: "#D32F2F",
                    backgroundColor: "rgba(244, 67, 54, 0.04)",
                  },
                }}
              >
                {showQR ? "Hide QR Code" : "Show QR Code"}
              </Button>
              
              {showQR && (
                <Box sx={{ 
                  mt: 2, 
                  p: isMobile ? 2 : 3, 
                  textAlign: "center",
                  backgroundColor: "#f8f9fa",
                  borderRadius: isMobile ? 1 : 2,
                  border: "2px dashed #dee2e6"
                }}>
                  <QrCode sx={{ fontSize: isMobile ? 80 : 120, color: "#F44336", mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Scan this QR code with any UPI app to pay ₹{selectedPlan?.price?.replace('Rs ', '') || '0'}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Supported Apps Info */}
            <Alert 
              severity="info" 
              sx={{ 
                mb: isMobile ? 1.5 : 2,
                borderRadius: isMobile ? 1 : 2,
                "& .MuiAlert-icon": {
                  color: "#F44336"
                }
              }}
            >
              <Typography variant="body2" fontSize={isMobile ? "0.8rem" : "0.875rem"}>
                <strong>Supported Apps:</strong> Google Pay, PhonePe, Paytm, BHIM, and 200+ other UPI apps
              </Typography>
            </Alert>

            {/* Security Notice */}
            <Box sx={{ 
              p: isMobile ? 1.5 : 2, 
              backgroundColor: "#f8f9fa", 
              borderRadius: isMobile ? 1 : 2,
              border: "1px solid #e9ecef"
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Security sx={{ fontSize: isMobile ? 14 : 16, color: "#F44336" }} />
                <Typography variant="body2" fontWeight="bold" color="#F44336" fontSize={isMobile ? "0.8rem" : "0.875rem"}>
                  Secure Payment
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" fontSize={isMobile ? "0.75rem" : "0.875rem"}>
                Your payment is secured with bank-grade encryption. We never store your UPI credentials.
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: isMobile ? 2 : 3, pt: isMobile ? 1 : 1, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 1 : 0 }}>
          <Button 
            onClick={handleClose} 
            disabled={isProcessing}
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
            sx={{ 
              color: "#F44336",
              "&:hover": {
                backgroundColor: "rgba(244, 67, 54, 0.04)",
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePayment}
            disabled={!isFormValid() || isProcessing || !selectedPlan}
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
            startIcon={isProcessing ? <CircularProgress size={isMobile ? 14 : 16} /> : <CheckCircle />}
            sx={{
              backgroundColor: "#F44336",
              borderRadius: isMobile ? 1 : 2,
              px: isMobile ? 2 : 4,
              py: isMobile ? 1 : 1.5,
              fontSize: isMobile ? "0.875rem" : "1rem",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#D32F2F",
              },
              "&:disabled": {
                backgroundColor: "#FFCDD2",
              },
            }}
          >
            {isProcessing ? "Processing..." : `Pay ${selectedPlan?.price || '0'}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <PaymentSuccessDialog
        open={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        subscriptionData={subscriptionData}
        selectedPlan={selectedPlan}
      />
    </>
  );
};

export default PaymentDialog; 