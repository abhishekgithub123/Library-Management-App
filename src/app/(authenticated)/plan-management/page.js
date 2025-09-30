"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Grid,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import axiosClient from "../../../lib/api";
import { useAuth } from "../../../contexts/AuthContext";

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`plan-tabpanel-${index}`}
      aria-labelledby={`plan-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PlanManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for shift management
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftForm, setShiftForm] = useState({
    name: '',
    startTime: '',
    endTime: '',
    userLimit: 30,
    status: 'A'
  });
  
  // State for fee plan management
  const [feePlanDialogOpen, setFeePlanDialogOpen] = useState(false);
  const [editingFeePlan, setEditingFeePlan] = useState(null);
  const [feePlanForm, setFeePlanForm] = useState({
    name: '',
    duration: 'MONTHLY',
    amount: '',
    shiftId: '',
    status: 'A'
  });
  
  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'shift' or 'feePlan'

  // Fetch shifts for the current library
  const { data: shiftsData, isLoading: shiftsLoading, error: shiftsError } = useQuery({
    queryKey: ['shifts', user?.libraryId],
    queryFn: async () => {
      const response = await axiosClient.get(`/libraryShift/${user?.libraryId}`);
      if (response.data.success) {
        return response.data.detail || [];
      }
      return [];
    },
    enabled: !!user?.libraryId,
  });

  // Fetch fee plans
  const { data: feePlansData, isLoading: feePlansLoading, error: feePlansError } = useQuery({
    queryKey: ['feePlans'],
    queryFn: async () => {
      const response = await axiosClient.get('/libraryFeePlan/');
      if (response.data.success) {
        return response.data.detail?.rows || [];
      }
      return [];
    },
  });

  // Create shift mutation
  const createShiftMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        libraryId: user.libraryId,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        userLimit: parseInt(data.userLimit),
        status: data.status
      };
      return axiosClient.post('/libraryShift/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shifts']);
      toast.success('Shift created successfully!');
      handleCloseShiftDialog();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create shift');
    },
  });

  // Update shift mutation
  const updateShiftMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const payload = {
        libraryId: user.libraryId,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        userLimit: parseInt(data.userLimit),
        status: data.status
      };
      return axiosClient.put(`/libraryShift/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shifts']);
      toast.success('Shift updated successfully!');
      handleCloseShiftDialog();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update shift');
    },
  });

  // Delete shift mutation
  const deleteShiftMutation = useMutation({
    mutationFn: async (id) => {
      return axiosClient.delete(`/libraryShift/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shifts']);
      queryClient.invalidateQueries(['feePlans']);
      toast.success('Shift deleted successfully!');
      handleCloseDeleteDialog();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete shift');
    },
  });

  // Create fee plan mutation
  const createFeePlanMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        name: data.name,
        duration: data.duration,
        amount: parseFloat(data.amount),
        shiftId: parseInt(data.shiftId),
        status: data.status
      };
      return axiosClient.post('/libraryFeePlan/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['feePlans']);
      toast.success('Fee plan created successfully!');
      handleCloseFeePlanDialog();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create fee plan');
    },
  });

  // Update fee plan mutation
  const updateFeePlanMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const payload = {
        name: data.name,
        duration: data.duration,
        amount: parseFloat(data.amount),
        shiftId: parseInt(data.shiftId),
        status: data.status
      };
      return axiosClient.put(`/libraryFeePlan/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['feePlans']);
      toast.success('Fee plan updated successfully!');
      handleCloseFeePlanDialog();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update fee plan');
    },
  });

  // Delete fee plan mutation
  const deleteFeePlanMutation = useMutation({
    mutationFn: async (id) => {
      return axiosClient.delete(`/libraryFeePlan/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['feePlans']);
      toast.success('Fee plan deleted successfully!');
      handleCloseDeleteDialog();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete fee plan');
    },
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Shift dialog handlers
  const handleOpenShiftDialog = (shift = null) => {
    if (shift) {
      setEditingShift(shift);
      setShiftForm({
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        userLimit: shift.userLimit,
        status: shift.status
      });
    } else {
      setEditingShift(null);
      setShiftForm({
        name: '',
        startTime: '',
        endTime: '',
        userLimit: 30,
        status: 'A'
      });
    }
    setShiftDialogOpen(true);
  };

  const handleCloseShiftDialog = () => {
    setShiftDialogOpen(false);
    setEditingShift(null);
    setShiftForm({
      name: '',
      startTime: '',
      endTime: '',
      userLimit: 30,
      status: 'A'
    });
  };

  const handleShiftSubmit = (e) => {
    e.preventDefault();
    if (editingShift) {
      updateShiftMutation.mutate({ id: editingShift.id, data: shiftForm });
    } else {
      createShiftMutation.mutate(shiftForm);
    }
  };

  // Fee plan dialog handlers
  const handleOpenFeePlanDialog = (feePlan = null) => {
    if (feePlan) {
      setEditingFeePlan(feePlan);
      setFeePlanForm({
        name: feePlan.name,
        duration: feePlan.duration,
        amount: feePlan.amount.toString(),
        shiftId: feePlan.shiftId.toString(),
        status: feePlan.status
      });
    } else {
      setEditingFeePlan(null);
      setFeePlanForm({
        name: '',
        duration: 'MONTHLY',
        amount: '',
        shiftId: '',
        status: 'A'
      });
    }
    setFeePlanDialogOpen(true);
  };

  const handleCloseFeePlanDialog = () => {
    setFeePlanDialogOpen(false);
    setEditingFeePlan(null);
    setFeePlanForm({
      name: '',
      duration: 'MONTHLY',
      amount: '',
      shiftId: '',
      status: 'A'
    });
  };

  const handleFeePlanSubmit = (e) => {
    e.preventDefault();
    if (editingFeePlan) {
      updateFeePlanMutation.mutate({ id: editingFeePlan.id, data: feePlanForm });
    } else {
      createFeePlanMutation.mutate(feePlanForm);
    }
  };

  // Delete dialog handlers
  const handleOpenDeleteDialog = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
    setDeleteType('');
  };

  const handleDelete = () => {
    if (deleteType === 'shift') {
      deleteShiftMutation.mutate(itemToDelete.id);
    } else if (deleteType === 'feePlan') {
      deleteFeePlanMutation.mutate(itemToDelete.id);
    }
  };

  // Get fee plans for a specific shift
  const getFeePlansForShift = (shiftId) => {
    return feePlansData?.filter(plan => plan.shiftId === shiftId) || [];
  };

  // Get shift name by ID
  const getShiftNameById = (shiftId) => {
    const shift = shiftsData?.find(s => s.id === shiftId);
    return shift?.name || 'Unknown Shift';
  };

  if (shiftsLoading || feePlansLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (shiftsError || feePlansError) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading data: {shiftsError?.message || feePlansError?.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: isMobile ? '100%' : 1200, mx: "auto", p: isMobile ? 1 : 2 }}>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3, textAlign: 'center', color: '#374151' }}>
        Plan Management
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant={isMobile ? "fullWidth" : "standard"}>
          <Tab label="Shifts" icon={<ScheduleIcon />} iconPosition="start" />
          <Tab label="Fee Plans" icon={<PaymentIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Shifts Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={500}>
            Library Shifts
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenShiftDialog()}
            sx={{ bgcolor: '#2563EB' }}
          >
            Add Shift
          </Button>
        </Box>

        <Grid container spacing={2}>
          {shiftsData?.map((shift) => (
            <Grid item xs={12} sm={6} md={4} key={shift.id}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      {shift.name}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenShiftDialog(shift)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteDialog(shift, 'shift')}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {shift.startTime} - {shift.endTime}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      User Limit: {shift.userLimit}
                    </Typography>
                  </Box>

                  <Chip
                    label={shift.status === 'A' ? 'Active' : 'Inactive'}
                    color={shift.status === 'A' ? 'success' : 'default'}
                    size="small"
                  />

                  {/* Fee Plans for this shift */}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Available Plans:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {getFeePlansForShift(shift.id).map((plan) => (
                      <Chip
                        key={plan.id}
                        label={`${plan.duration} - ₹${plan.amount}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                    {getFeePlansForShift(shift.id).length === 0 && (
                      <Typography variant="caption" color="text.secondary">
                        No plans configured
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Fee Plans Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={500}>
            Fee Plans
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenFeePlanDialog()}
            sx={{ bgcolor: '#2563EB' }}
          >
            Add Fee Plan
          </Button>
        </Box>

        <Grid container spacing={2}>
          {feePlansData?.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      {plan.name}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenFeePlanDialog(plan)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteDialog(plan, 'feePlan')}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>
                      ₹{plan.amount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Duration: {plan.duration}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Shift: {getShiftNameById(plan.shiftId)}
                    </Typography>
                  </Box>

                  <Chip
                    label={plan.status === 'A' ? 'Active' : 'Inactive'}
                    color={plan.status === 'A' ? 'success' : 'default'}
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Add/Edit Shift Dialog */}
      <Dialog open={shiftDialogOpen} onClose={handleCloseShiftDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingShift ? 'Edit Shift' : 'Add New Shift'}
        </DialogTitle>
        <form onSubmit={handleShiftSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Shift Name"
              value={shiftForm.name}
              onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
              margin="normal"
              required
              placeholder="e.g., Morning, Evening, Full Day"
            />
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  value={shiftForm.startTime}
                  onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  value={shiftForm.endTime}
                  onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="User Limit"
              type="number"
              value={shiftForm.userLimit}
              onChange={(e) => setShiftForm({ ...shiftForm, userLimit: e.target.value })}
              margin="normal"
              required
              inputProps={{ min: 1 }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={shiftForm.status}
                label="Status"
                onChange={(e) => setShiftForm({ ...shiftForm, status: e.target.value })}
              >
                <MenuItem value="A">Active</MenuItem>
                <MenuItem value="I">Inactive</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseShiftDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createShiftMutation.isPending || updateShiftMutation.isPending}
            >
              {createShiftMutation.isPending || updateShiftMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add/Edit Fee Plan Dialog */}
      <Dialog open={feePlanDialogOpen} onClose={handleCloseFeePlanDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingFeePlan ? 'Edit Fee Plan' : 'Add New Fee Plan'}
        </DialogTitle>
        <form onSubmit={handleFeePlanSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Plan Name"
              value={feePlanForm.name}
              onChange={(e) => setFeePlanForm({ ...feePlanForm, name: e.target.value })}
              margin="normal"
              required
              placeholder="e.g., Monthly Plan, Quarterly Plan"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Duration</InputLabel>
              <Select
                value={feePlanForm.duration}
                label="Duration"
                onChange={(e) => setFeePlanForm({ ...feePlanForm, duration: e.target.value })}
                required
              >
                <MenuItem value="MONTHLY">Monthly</MenuItem>
                <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                <MenuItem value="YEARLY">Yearly</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Amount (₹)"
              type="number"
              value={feePlanForm.amount}
              onChange={(e) => setFeePlanForm({ ...feePlanForm, amount: e.target.value })}
              margin="normal"
              required
              inputProps={{ min: 0, step: 0.01 }}
              placeholder="0.00"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Shift</InputLabel>
              <Select
                value={feePlanForm.shiftId}
                label="Shift"
                onChange={(e) => setFeePlanForm({ ...feePlanForm, shiftId: e.target.value })}
                required
              >
                {shiftsData?.map((shift) => (
                  <MenuItem key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime} - {shift.endTime})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={feePlanForm.status}
                label="Status"
                onChange={(e) => setFeePlanForm({ ...feePlanForm, status: e.target.value })}
              >
                <MenuItem value="A">Active</MenuItem>
                <MenuItem value="I">Inactive</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseFeePlanDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createFeePlanMutation.isPending || updateFeePlanMutation.isPending}
            >
              {createFeePlanMutation.isPending || updateFeePlanMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <strong>
              {deleteType === 'shift' 
                ? `shift "${itemToDelete?.name}"` 
                : `fee plan "${itemToDelete?.name}"`
              }
            </strong>
            ?
          </Typography>
          {deleteType === 'shift' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This will also delete all fee plans associated with this shift.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteShiftMutation.isPending || deleteFeePlanMutation.isPending}
          >
            {deleteShiftMutation.isPending || deleteFeePlanMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
