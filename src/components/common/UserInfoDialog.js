"use client";

import React from "react";
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
  Chip,
} from "@mui/material";

const UserInfoDialog = ({ open, onClose, user }) => {
  console.log(user,"ye meri user details hai")
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        <List>
          <ListItem>
            <ListItemText primary="Name" secondary={user.name} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Mobile" secondary={user.mobile} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Shift" secondary={user.shift} />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Plan" 
              secondary={
                user.plan === "monthly" ? "Monthly (Rs500)" :
                user.plan === "quarterly" ? "Quarterly (Rs800)" :
                user.plan === "yearly" ? "Yearly (Rs1500)" :
                user.plan
              } 
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Payment Status" secondary={"Pending"} />
          </ListItem>
          {user.paymentDetails && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight={500}>Payment Details:</Typography>
              {user.paymentDetails.lastPaidMonth && (
                <ListItem>
                  <ListItemText primary="Last Paid Month" secondary={user.paymentDetails.lastPaidMonth} />
                </ListItem>
              )}
              {user.paymentDetails.amount && (
                <ListItem>
                  <ListItemText primary="Amount" secondary={`₹${user.paymentDetails.amount}`} />
                </ListItem>
              )}
              {user.paymentDetails.nextDueDate && (
                <ListItem>
                  <ListItemText primary="Next Due Date" secondary={user.paymentDetails.nextDueDate} />
                </ListItem>
              )}
              {user.paymentDetails.unpaidMonths && user.paymentDetails.unpaidMonths.length > 0 && (
                <ListItem>
                  <ListItemText 
                    primary="Unpaid Months" 
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {user.paymentDetails.unpaidMonths.map((month, index) => (
                          <Chip 
                            key={index}
                            label={`${month} (₹500)`} 
                            color="warning" 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    } 
                  />
                </ListItem>
              )}
              {user.paymentDetails.totalDue && (
                <ListItem>
                  <ListItemText 
                    primary="Total Due" 
                    secondary={
                      <Typography variant="h6" color="error" fontWeight={500}>
                        ₹{user.paymentDetails.totalDue}
                      </Typography>
                    } 
                  />
                </ListItem>
              )}
            </Box>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserInfoDialog; 