"use client";

import AddExpenseDialog from "@/components/expenses/addExpenseDialog";
import CategoryDisplayDialog from "@/components/expenses/categoryDialog";
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  DialogTitle,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/lib/api";

export default function ExpensePage() {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [category, setCategory] = useState("");
  const [opencategory, setOpenCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // For 3-dot menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCategory, setMenuCategory] = useState(null);

  // For Edit and Delete dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // fetch expenses from the backend
  const fetchExpenses = async () => {
    const response = await axiosClient.get("/expense");
    return response?.data?.detail?.rows;
  };
  const { data: expensesData, isLoading: expensesLoading, isError: expensesError } = useQuery({
    queryKey: ["expenseQueries"],
    queryFn: fetchExpenses,
  });



  // Fetch categories from backend
  const fetchCategories = async () => {
    const response = await axiosClient.get("/expenseType");
    return response?.data?.detail?.rows;
  };
  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ["expenseTypeQueries"],
    queryFn: fetchCategories,
  });

  const createCategory = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("access_token");
      const response = await axiosClient.post("/expenseType", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["expenseTypeQueries"]);
      setOpenCategory(false);
      setNewCategory("");
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, name }) => {
      const token = localStorage.getItem("access_token");
      const response = await axiosClient.put(`/expenseType/${id}`, { name }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["expenseTypeQueries"]);
      setEditDialogOpen(false);
      setEditCategoryName("");
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("access_token");
      const response = await axiosClient.delete(`/expenseType/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["expenseTypeQueries"]);
      setDeleteDialogOpen(false);
    },
  });

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed) {
      createCategory.mutate({ name: trimmed });
    }
  };

  const getCategoryTotal = (cat) => {
  return expensesData
    ?.filter(
      (e) =>
        e.expenseTypeId === cat.id &&
        (e.status === "PENDING" || e.status === "PAID")
    )
    .reduce((sum, curr) => sum + Number(curr.amount), 0) || 0;
};



  // Menu handlers
  const handleMenuOpen = (event, cat) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuCategory(cat);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Edit
  const handleEditCategory = () => {
    setEditCategoryName(menuCategory.name);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    if (menuCategory && editCategoryName.trim()) {
      updateCategory.mutate({ id: menuCategory.id, name: editCategoryName });
    }
  };

  const confirmDelete = () => {
    if (menuCategory) {
      deleteCategory.mutate(menuCategory.id);
    }
  };

  if (isLoading) return <div>Loading categories...</div>;
  if (isError) return <div>Error loading categories.</div>;

  return (
    <>
      {/* Add Category Button */}
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 2, p: 2 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ width: "100%", zIndex: 100 }}
        >
          <Button
            variant="contained"
            color="primary"
            sx={{
              margin: "0px 12px",
              marginBottom: "10px",
              width: "100%",
              fontSize: 18,
              backgroundImage: "linear-gradient(to right, #d51515ff, #ce3004ff)",
              height: 45,
              boxShadow: 3,
              textTransform: "none",
            }}
            onClick={() => setOpenCategory(true)}
          >
            New
          </Button>
        </Box>

        {/* Category Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            margin: "10px",
            gap: 1,
            mb: 2,
          }}
        >
          {categories?.map((cat) => (
            <Card
              key={cat.id}
              sx={{
                minWidth: 0,
                width: "100%",
                maxWidth: 260,
                mx: "auto",
                borderRadius: 3,
                boxShadow: 3,
                background: "linear-gradient(135deg, #fcfcf8ff 60%, #e3e6f3 100%)",
                p: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.04)",
                  boxShadow: 6,
                },
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              {/* 3-dot menu button */}
              <IconButton
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  zIndex: 1,
                  color: "#f61616ff",
                  backgroundColor: "transparent",
                }}
                onClick={(e) => handleMenuOpen(e, cat)}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>

              <CardContent sx={{ p: 3, width: "100%", justifyContent: "center" }}>
                <Typography variant="h6">
                  <b>{cat.name}</b>
                </Typography>
                <Typography variant="body2">
                  Total: ₹{getCategoryTotal(cat)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Menu for Add/Edit/Delete */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            setOpen(true);
            setCategory(menuCategory);
            handleMenuClose();
          }}
        >
          <Tooltip title="Add Expense">
            <AddIcon fontSize="small" style={{ marginRight: 8 }} />
          </Tooltip>
          Add
        </MenuItem>
        <MenuItem onClick={handleEditCategory}>
          <Tooltip title="Edit Category">
            <EditIcon fontSize="small" style={{ marginRight: 8 }} />
          </Tooltip>
          Edit
        </MenuItem>
        <MenuItem onClick={() => { setDeleteDialogOpen(true); handleMenuClose(); }}>
          <Tooltip title="Delete Category">
            <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
          </Tooltip>
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Category Name"
            value={editCategoryName}
            onChange={(e) => setEditCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={!editCategoryName.trim() || updateCategory.isLoading}
            sx={{ backgroundColor: "#25d506ff" }}
          >
            {updateCategory.isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <b>{menuCategory?.name}</b>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleteCategory.isLoading}
          >
            {deleteCategory.isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <CategoryDisplayDialog
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        expenses={expensesData}       
      />

      <AddExpenseDialog
        open={open}
        setOpen={setOpen}
        categoryList={categories}
        category={category}
        setCategory={setCategory}
        expenses={expensesData}    
      />

      {/* Add New Category Dialog */}
      <Dialog open={opencategory} onClose={() => setOpenCategory(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Category"
            placeholder="Enter new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Button onClick={() => setOpenCategory(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleAddCategory}
              disabled={!newCategory.trim() || createCategory.isLoading}
              sx={{ backgroundColor: "#25d506ff" }}
            >
              {createCategory.isLoading ? "Adding..." : "Add"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}