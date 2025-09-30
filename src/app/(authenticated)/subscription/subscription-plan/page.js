"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PaymentDialog from "@/components/subscription/PaymentDialog";

const plans = [
  {
    planId: 1,
    planName: "Basic Monthly Plan",
    price: "Rs 499.00",
    durationInDays: "30",
    userLimit: "100",
    type: "A",
  },
  {
    planId: 2,
    planName: "Basic Quarterly Plan",
    price: "Rs 1299.00",
    durationInDays: "90",
    userLimit: "100",
    type: "A",
  },
  {
    planId: 3,
    planName: "Basic Annual Plan",
    price: "Rs 4999.00",
    durationInDays: "365",
    userLimit: "100",
    type: "A",
  },
  {
    planId: 4,
    planName: "Premium Monthly Plan",
    price: "Rs 799.00",
    durationInDays: "30",
    userLimit: "300",
    type: "A",
  },
  {
    planId: 5,
    planName: "Premium Quarterly Plan",
    price: "Rs 1999.00",
    durationInDays: "90",
    userLimit: "300",
    type: "A",
  },
  {
    planId: 6,
    planName: "Premium Annual Plan",
    price: "Rs 7999.00",
    durationInDays: "365",
    userLimit: "300",
    type: "A",
  },
  {
    planId: 7,
    planName: "Free Trial",
    price: "Rs 0.00",
    durationInDays: "15",
    userLimit: "50",
    type: "A",
  },
];

export default function SubscriptionPlansPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  // State for payment dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    pauseOnHover: true,
  };

  const handleSubscribeClick = (plan) => {
    setSelectedPlan(plan);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = (data) => {
    setSnackbar({
      open: true,
      message: `Successfully subscribed to ${selectedPlan?.planName}!`,
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

  return (
    <Box
      sx={{
        p: 2,
        pt: 3,
        width: "100%",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Choose Your Subscription Plan
      </Typography>

      {/* Slider spaced slightly lower */}
      <Box
        sx={{
          mt: 5, // control how far down the slider appears
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Slider {...sliderSettings}>
            {plans.map((plan, idx) => (
              <Box key={idx} px={2}>
                <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      {plan.planName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {plan.price}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      Supports {plan.userLimit} users
                    </Typography>
                    <Typography variant="subtitle2" mt={1}>
                      Duration of {plan.durationInDays} Days
                    </Typography>
                    <Typography variant="body2" mt={1}>
                      Type {plan.type}
                    </Typography>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleSubscribeClick(plan)}
                      sx={{
                        mt: 2,
                        fontWeight: "bold",
                        backgroundColor: plan.planName.includes("Premium")
                          ? "#c62828"
                          : "#1976d2",
                        "&:hover": {
                          backgroundColor: plan.planName.includes("Premium")
                            ? "#b71c1c"
                            : "#1565c0",
                        },
                      }}
                    >
                      SUBSCRIBE NOW
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>
        </Box>
      </Box>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        selectedPlan={selectedPlan}
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
