import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/lib/api";

const statusColors = {
  PENDING: "warning",
  PAID: "success",
  REJECTED: "error",
};

const AddExpenseDialog = ({ open, setOpen, category }) => {
  const [paidTo, setPaidTo] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("PENDING");

  const queryClient = useQueryClient();
  const isFormValid = category && paidTo && amount && expenseDate && status;

  const createExpense = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("access_token");
      return axiosClient.post(
        "/expense",
        {
          paidTo: paidTo,
          remarks: remarks,
          expenseDate: expenseDate,
          amount: amount,
          status: status,
          expenseTypeId: category.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["expenseQueries"]);
      resetForm();
    },
  });

  const handleAdd = () => {
    createExpense.mutate();
  };

  const resetForm = () => {
    setPaidTo("");
    setRemarks("");
    setExpenseDate("");
    setAmount("");
    setStatus("PENDING");
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
      <DialogTitle>Add Expense</DialogTitle>
      <DialogContent>
        <Typography sx={{ mt: 2, fontWeight: "bold" }}>
          Category: {category?.name}
        </Typography>

        {/* Paid To Field */}
        <TextField
          fullWidth
          margin="dense"
          label="Paid To *"
          placeholder="Enter payee name"
          value={paidTo}
          onChange={(e) => setPaidTo(e.target.value)}
        />

        {/* Remarks Field */}
        <TextField
          fullWidth
          margin="dense"
          label="Remarks"
          placeholder="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        {/* Date Field */}
        <TextField
          fullWidth
          margin="dense"
          label="Date *"
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        {/* Amount Field */}
        <TextField
          fullWidth
          margin="dense"
          label="Amount *"
          placeholder="Enter amount"
          type="text"
          value={amount}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
              setAmount(value);
            }
          }}
          onKeyDown={(e) => {
            if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
              e.preventDefault();
            }
          }}
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*",
          }}
        />

        {/* Status Dropdown */}
        <FormControl fullWidth margin="dense">
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="PAID">Paid</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}
        >
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#25d506ff" }}
            onClick={handleAdd}
            disabled={!isFormValid || createExpense.isLoading}
          >
            {createExpense.isLoading ? "Adding..." : "Add"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddExpenseDialog;