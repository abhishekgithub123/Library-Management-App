import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  DialogContentText,
  IconButton,
  Chip,
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/lib/api";

const statusColors = {
  PENDING: "warning",
  PAID: "success",
  REJECTED: "error",
};

const CategoryDisplayDialog = ({ selectedCategory, setSelectedCategory, expenses }) => {
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [editDialog, setEditDialog] = useState({ open: false, expense: null });
  const queryClient = useQueryClient();


  const deleteExpense = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("access_token");
      return axiosClient.delete(`/expense/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["expenseQueries"]);
      setConfirmDelete({ open: false, id: null });
    },
  });

  const updateExpense = useMutation({
    mutationFn: async (updatedExpense) => {
      const token = localStorage.getItem("access_token");

      const payload = {
        paidTo: updatedExpense.paidTo,
        remarks: updatedExpense.remarks,
        expenseDate: updatedExpense.expenseDate,
        amount: updatedExpense.amount,
        status: updatedExpense.status,
        expenseTypeId: updatedExpense.expenseTypeId,
      };

      return axiosClient.put(`/expense/${updatedExpense.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["expenseQueries"]);
      setEditDialog({ open: false, expense: null });
    },
  });
  const filtered = expenses?.filter(
    (e) => e.expenseTypeId === selectedCategory?.id
  ) || [];

  return (
    <>
      <Dialog
        open={Boolean(selectedCategory)}
        onClose={() => setSelectedCategory("")}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ position: "relative", paddingRight: 5 }}>
          {selectedCategory?.name} - Expense Details
          <IconButton
            aria-label="close"
            onClick={() => setSelectedCategory("")}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Remark</b></TableCell>
                  <TableCell><b>Date</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell><b>Amount</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No expenses found for this category.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.paidTo}</TableCell>
                      <TableCell>{expense.remarks}</TableCell>
                      <TableCell>{expense.expenseDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={expense.status}
                          color={statusColors[expense.status]}
                          sx={{ fontWeight: "bold", borderRadius: "20px" }}
                        />
                      </TableCell>
                      <TableCell>₹{expense.amount}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => setEditDialog({ open: true, expense })} // ✅ passing expense
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() =>
                            setConfirmDelete({ open: true, id: expense.id })
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this expense?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, id: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteExpense.mutate(confirmDelete.id)}
            disabled={deleteExpense.isLoading}
          >
            {deleteExpense.isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, expense: null })}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Name"
            value={editDialog.expense?.paidTo || ""}
            onChange={(e) =>
              setEditDialog((prev) => ({
                ...prev,
                expense: { ...prev.expense, paidTo: e.target.value },
              }))
            }
          />
          <TextField
            fullWidth
            margin="dense"
            label="Remark"
            value={editDialog.expense?.remarks || ""}
            onChange={(e) =>
              setEditDialog((prev) => ({
                ...prev,
                expense: { ...prev.expense, remarks: e.target.value },
              }))
            }
          />
          <TextField
            fullWidth
            margin="dense"
            label="Date"
            type="date"
            value={editDialog.expense?.expenseDate || ""}
            onChange={(e) =>
              setEditDialog((prev) => ({
                ...prev,
                expense: { ...prev.expense, expenseDate: e.target.value },
              }))
            }
          />
          <TextField
            fullWidth
            margin="dense"
            label="Amount"
            type="number"
            value={editDialog.expense?.amount || ""}
            onChange={(e) =>
              setEditDialog((prev) => ({
                ...prev,
                expense: { ...prev.expense, amount: e.target.value },
              }))
            }
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={editDialog.expense?.status || ""}
              onChange={(e) =>
                setEditDialog((prev) => ({
                  ...prev,
                  expense: { ...prev.expense, status: e.target.value },
                }))
              }
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditDialog({ open: false, expense: null })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => updateExpense.mutate(editDialog.expense)}
            disabled={updateExpense.isLoading}
            sx={{ backgroundColor: "#25d506ff" }}
          >
            {updateExpense.isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CategoryDisplayDialog;