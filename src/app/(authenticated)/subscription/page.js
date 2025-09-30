"use client"

import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";
import PaymentDialog from "@/components/subscription/PaymentDialog";

export default function SubscriptionPage({
  user,
  subscription,
  onPrepay,
  onViewPlans,
}) {
  const router = useRouter();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleViewPlans = () => {
    router.push("/subscription/subscription-plan");
  };

  const handlePrepay = () => {
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = (data) => {
    setSnackbar({
      open: true,
      message: "Payment successful! Your subscription has been renewed.",
      severity: "success",
    });
  };

  const handlePaymentError = (error) => {
    setSnackbar({
      open: true,
      message: "Payment failed. Please try again.",
      severity: "error",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Static subscription data for payment
  const staticSubscriptionPlan = {
    planId: 1,
    planName: "Gold Monthly Plan",
    price: "Rs 400.00",
    durationInDays: "30",
    userLimit: "200",
    type: "A",
  };

  return (
    <Box
      sx={{
        maxWidth: 480,
        mx: "auto",
        px: 2,
        py: 4,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* User Info */}
      <Typography variant="h5" fontWeight="bold" align="center">
        Hello, Abhishek{/*{user.name}*/}
      </Typography>

      {/* Subscription Card */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Subscription
          </Typography>

          <Box display="flex" justifyContent="space-between" my={1}>
            <Typography variant="body1">Type:</Typography>
            <Typography variant="body1" fontWeight="bold">
              Gold
              {/*{subscription.type}*/}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" my={1}>
            <Typography variant="body1">Amount:</Typography>
            <Typography variant="body1" fontWeight="bold">
              400 / Monthly
              {/*{subscription.expirationDate}*/}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" my={1}>
            <Typography variant="body1">Renewal Payment:</Typography>
            <Typography variant="body1" fontWeight="bold">
              Recurring
              {/*{subscription.expirationDate}*/}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Button
            variant="contained"
            fullWidth
            onClick={handlePrepay}
            sx={{ backgroundColor: "#d32f2f" }}
          >
            Renew subscription
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={handleViewPlans}
            sx={{ mt: 1 }}
          >
            View All Plans
          </Button>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        selectedPlan={staticSubscriptionPlan}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
