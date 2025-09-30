import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import {
  CheckCircle,
  CalendarToday,
  People,
  Receipt,
  Close,
} from "@mui/icons-material";

const PaymentSuccessDialog = ({ open, onClose, subscriptionData, selectedPlan }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEndDate = () => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + selectedPlan.durationInDays * 24 * 60 * 60 * 1000);
    return formatDate(endDate);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" fontWeight="bold" color="#059669">
            Payment Successful!
          </Typography>
          <Button onClick={onClose} size="small">
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Success Icon */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <CheckCircle sx={{ fontSize: 80, color: "#059669" }} />
        </Box>

        {/* Subscription Details */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: "#f8f9fa" }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Subscription Details
          </Typography>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Receipt sx={{ color: "#6366f1" }} />
            <Typography variant="body1" fontWeight="bold">
              {selectedPlan?.planName}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <CalendarToday sx={{ color: "#059669" }} />
            <Typography variant="body2">
              Valid until: {getEndDate()}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <People sx={{ color: "#dc2626" }} />
            <Typography variant="body2">
              User Limit: {selectedPlan?.userLimit} users
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Amount Paid:
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="#059669">
              {selectedPlan?.price}
            </Typography>
          </Box>

          {subscriptionData?.paymentReference && (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Payment ID:
              </Typography>
              <Chip 
                label={subscriptionData.paymentReference} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            </Box>
          )}
        </Paper>

        {/* Next Steps */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            What's Next?
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Your subscription is now active and ready to use
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              You can start adding users up to your plan limit
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Access all premium features immediately
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              You'll receive renewal reminders before expiry
            </Typography>
          </Box>
        </Box>

        {/* Support Info */}
        <Paper sx={{ p: 2, backgroundColor: "#e0f2fe" }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Need help? Contact our support team at{" "}
            <Typography component="span" color="primary" fontWeight="bold">
              support@libraryadmin.com
            </Typography>
          </Typography>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onClose();
            // You can add navigation to dashboard or user management here
          }}
          sx={{
            backgroundColor: "#059669",
            "&:hover": { backgroundColor: "#047857" },
          }}
        >
          Go to Dashboard
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentSuccessDialog; 