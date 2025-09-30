"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  TableContainer,
  Paper,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import DataTable from "../../../components/common/DataTable";
import UserInfoDialog from "../../../components/common/UserInfoDialog";
import EditUserDialog from "../../../components/common/EditUserDialog";
import FilterSection from "../../../components/common/FilterSection";
import axiosClient from "../../../lib/api";
import { ApiPaths } from "../../../constants/api-paths";
import { useAuth } from "../../../contexts/AuthContext";
import { handleAuthError } from "../../../utils/auth";

// API function to fetch users with pagination and filters
const fetchUsers = async ({ queryKey }) => {
  const [, currentPage, query] = queryKey;
  
  const { data } = await axiosClient.get(ApiPaths.USERS, {
    params: {
      page: currentPage,
      limit: 5,
      filters: JSON.stringify(query),
    },
  });
  
  return data?.detail || {};
};

// API function to fetch user by ID
const fetchUserById = async (userId) => {
  try {
    const response = await axiosClient.get(ApiPaths.USER_BY_ID(userId));
    
    if (response.data?.success && response.data?.detail) {
      const user = response.data.detail;
      // Transform API response to match our expected format
      return {
        id: user.userId,
        name: user.name || 'Unknown',
        mobile: user.mobile || 'N/A',
        shift: user.shift || 'Morning', // Default shift
        plan: user.plan || 'monthly', // Default plan
        // Map feeStatus to paid field for compatibility
        paid: user.feeStatus === "PAID",
        feeStatus: user.feeStatus,
        // Map status field properly
        status: user.status === 'A' ? 'active' : user.status === 'I' ? 'inactive' : user.status,
        paymentDetails: {
          lastPaidMonth: "May 2024", // Default values since API doesn't provide these
          amount: 500,
          nextDueDate: "June 15, 2024",
          totalDue: 0
        },
        // Additional fields from API
        userId: user.userId,
        username: user.username,
        email: user.email,
        identityType: user.identityType,
        identityNumber: user.identityNumber,
        createdAt: user.createdAt,
        roleId: user.roleId,
        libraryId: user.libraryId,
        addLine1: user.addLine1,
        addLine2: user.addLine2,
        city: user.city,
        identityFrontImg: user.identityFrontImg,
        identityBackImg: user.identityBackImg,
        createdBy: user.createdBy,
        deletedAt: user.deletedAt,
      };
    }
    
    throw new Error('Failed to fetch user details');
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

// API function to update user
const updateUser = async (userId, userData) => {
  try {
    // Prepare the payload with only allowed properties for updates
    const payload = {
      name: userData.name,
      mobile: userData.mobile,
      addLine1: userData.addLine1,
      addLine2: userData.addLine2,
      email: userData.email,
      city: userData.city,
    };

    const response = await axiosClient.put(ApiPaths.USER_UPDATE(userId), payload);
    
    if (response.data?.success) {
      return response.data;
    }
    
    throw new Error('Failed to update user');
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

const tableHeaders = [
  { key: "name", label: "Name" },
  { key: "mobile", label: "Mobile" },
  { key: "shift", label: "Shift" },
  { key: "paid", label: "Paid" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

export default function UserManagement() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  // State for pagination and filters (exactly like the DonorTable pattern)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowPerPage] = useState(10);
  const [query, setQuery] = useState({libraryId: `eq:${user.libraryId}`,roleId: `eq:3`});
  const [sortConfig, setSortConfig] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    shiftName: '',
    paid: '',
  });

  // Filter configuration for the reusable FilterSection component
  const filterConfig = [
    {
      type: 'text',
      key: 'name',
      label: 'Search by name',
      placeholder: 'Enter name to search',
      searchIcon: true,
    },
    {
      type: 'select',
      key: 'shiftName',
      label: 'Shift',
      options: [
        { value: 'Morning', label: 'Morning' },
        { value: 'Evening', label: 'Evening' },
        { value: 'Full Day', label: 'Full Day' },
      ],
    },
    {
      type: 'select',
      key: 'paid',
      label: 'Paid',
      options: [
        { value: 'PAID', label: 'Paid' },
        { value: 'PENDING', label: 'Pending' },
      ],
    },
  ];

  // Local state for UI controls
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // TanStack Query for fetching users with pagination and filters (exactly like the DonorTable pattern)
  const {
    data: usersData = { rows: [], total: 0, page: 1, limit: 10 },
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['users', currentPage, query],
    queryFn: fetchUsers,
    placeholderData: (previousData) => 
      queryClient.getQueryData(['users', currentPage, query]),
    enabled: !!currentPage || !query,
  });

  // Get query data exactly like DonorTable pattern
  const queryData = queryClient.getQueryData(['users', currentPage, query]) || {};
  const users = queryData?.rows || usersData?.rows || [];

  useEffect(() => {
    const urlPaid = searchParams.get("paid");
    const urlShift = searchParams.get("shift");
    
    if (urlPaid) {
      // Convert 'pending' to 'PENDING' for consistency
      const paidValue = urlPaid === 'pending' ? 'PENDING' : urlPaid.toUpperCase();
      setFilters(prev => ({ ...prev, paid: paidValue }));
    }
    if (urlShift) {
      setFilters(prev => ({ ...prev, shiftName: urlShift }));
    }
    
    // Apply filters immediately if URL parameters are present
    if (urlPaid || urlShift) {
      const result = {
        libraryId: `eq:${user.libraryId}`,
        roleId: `eq:3`
      };
      
      if (urlPaid) {
        const paidValue = urlPaid === 'pending' ? 'PENDING' : urlPaid.toUpperCase();
        if (paidValue === 'PAID') {
          result.feeStatus = 'eq:PAID';
        } else if (paidValue === 'PENDING') {
          result.feeStatus = 'eq:PENDING';
        }
      }
      
      if (urlShift) {
        result.shiftName = `eq:${urlShift}`;
      }
      
      setQuery(result);
      setCurrentPage(1);
    }
  }, [searchParams.toString(), user.libraryId]);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const filteredData = useMemo(() => {
    const sorted = [...(Array.isArray(users) ? users : [])];
    if (sortConfig) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bVal == null) return sortConfig.direction === 'asc' ? -1 : 1;

        const aStr =
          typeof aVal === 'string' ? aVal.toLowerCase() : aVal.toString();
        const bStr =
          typeof bVal === 'string' ? bVal.toLowerCase() : bVal.toString();

        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      });

      if (sortConfig.direction === 'desc') {
        sorted.reverse();
      }
    }
    return sorted;
  }, [users, sortConfig]);

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const handleClear = () => {
    setFilters({
      name: '',
      shiftName: '',
      paid: '',
    });
    // Reset the query state but preserve roleId and libraryId
    setQuery({ roleId: "eq:3", libraryId: `eq:${user.libraryId}` });
    // Reset to first page
    setCurrentPage(1);
  };

  const applyFilters = () => {
    const result = {
      libraryId: `eq:${user.libraryId}`
    };
    if (filters.name) result.name = `like:${filters.name}`;
    if (filters.shiftName) result.shiftName = `like:${filters.shiftName}`;
    if (filters.paid) {
      // Map filter values to API feeStatus values
      if (filters.paid === 'PAID') {
        result.feeStatus = 'eq:PAID';
      } else if (filters.paid === 'PENDING') {
        result.feeStatus = 'eq:PENDING'; // For null/unpaid status
      }
    }
    setQuery(result);
    setCurrentPage(1);
  };

  const handleEdit = async (user) => {
    setIsLoadingUserDetails(true);
    try {
      // Fetch fresh user data from API
      const freshUserData = await fetchUserById(user.userId);
      setEditingUser(freshUserData);
      setEditDialogOpen(true);
      setSnackbar({ open: true, message: 'User details loaded successfully', severity: 'success' });
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Fallback to existing user data if API call fails
      setEditingUser(user);
      setEditDialogOpen(true);
      setSnackbar({ open: true, message: 'Failed to load fresh user data. Using cached data.', severity: 'warning' });
    } finally {
      setIsLoadingUserDetails(false);
    }
  };

  const handleSaveEdit = async (formData) => {
    if (editingUser) {
      setIsSaving(true);
      try {
        // Call the update API with the validated form data
        await updateUser(editingUser.userId, formData);
        
        // Show success message
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
        
        // Close dialog and refetch data
        setEditDialogOpen(false);
        setEditingUser(null);
        refetch();
      } catch (error) {
        console.error('Error updating user:', error);
        setSnackbar({ 
          open: true, 
          message: error.response?.data?.message || 'Failed to update user', 
          severity: 'error' 
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleInfoClick = (user) => {
    setSelectedUser(user);
    setInfoDialogOpen(true);
  };

  const handleCloseInfo = () => {
    setInfoDialogOpen(false);
    setSelectedUser(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderCellContent = (user, headerKey) => {
    switch (headerKey) {
      case "paid":
        // Handle feeStatus from API response
        if (user.feeStatus === "PAID") {
          return <Chip label="Paid" color="success" size="small" />;
        } else if (user.feeStatus === null || user.feeStatus === "UNPAID") {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label="Unpaid" color="warning" size="small" />
              <IconButton 
                color="info" 
                size="small"
                onClick={() => handleInfoClick(user)}
                sx={{ p: 0.5 }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        } else {
          // Fallback for any other feeStatus values
          return <Chip label={user.feeStatus || "Unknown"} color="default" size="small" />;
        }
      case "status":
        // Handle status from API response - "A" = Active, "I" = Inactive
        if (user.status === "A") {
          return <Chip label="Active" color="success" size="small" />;
        } else if (user.status === "I") {
          return <Chip label="Inactive" color="error" size="small" />;
        } else {
          // Fallback for any other status values
          return <Chip label={user.status || "Unknown"} color="default" size="small" />;
        }
      case "actions":
        return (
          <Box sx={{ display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
            <IconButton 
              color="primary" 
              size="small"
              onClick={() => handleEdit(user)}
            >
              <EditIcon />
            </IconButton>
          </Box>
        );
      default:
        return user[headerKey];
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    // Check if it's an authentication error
    if (handleAuthError(error)) {
      // Return loading state while redirecting
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading users: {error.message}
        </Alert>
        <Typography variant="h5" fontWeight={500} sx={{ mb: 2 }}>
          User Management Dashboard
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: isMobile ? '100%' : 1200, 
      mx: "auto", 
      p: isMobile ? 1 : 2,
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        {/* Header Section */}
        <Box
          paddingY={1}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #E5E7EB',
            px: isMobile ? 1 : 2,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0,
          }}
        >
          <Typography 
            fontWeight={600} 
            fontSize={isMobile ? 20 : 24}
            sx={{ textAlign: isMobile ? 'center' : 'left' }}
          >
            User Management Dashboard
          </Typography>
        </Box>

        {/* Filter Section - Using Reusable FilterSection Component */}
        <FilterSection
          filters={filterConfig}
          filterValues={filters}
          onFilterChange={handleFilterChange}
          onApply={applyFilters}
          onClear={handleClear}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          title="Filters"
        />

        {/* Table Section */}
        <Box sx={{ 
          overflowX: 'auto',
          maxWidth: '100%'
        }}>
          <DataTable
            headers={tableHeaders}
            data={filteredData}
            renderCell={renderCellContent}
            emptyMessage="No users found."
          />
        </Box>

        {/* Pagination Section - Mobile Responsive */}
        <Box sx={{ 
          p: isMobile ? 1 : 2, 
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#fafafa'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                textAlign: isMobile ? 'center' : 'left',
                fontSize: isMobile ? '12px' : '14px'
              }}
            >
              Total: {queryData?.rows?.length || 0} users
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'flex-end',
              width: isMobile ? '100%' : 'auto'
            }}>
              <Button
                variant="outlined"
                size="small"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                sx={{ 
                  minWidth: isMobile ? '80px' : 'auto',
                  fontSize: isMobile ? '12px' : '14px'
                }}
              >
                Previous
              </Button>
              <Typography 
                variant="body2" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  px: isMobile ? 1 : 2,
                  fontSize: isMobile ? '12px' : '14px'
                }}
              >
                Page {currentPage} of {queryData?.totalPage || 1}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                disabled={currentPage >= (queryData?.totalPage || 1)}
                onClick={() => setCurrentPage(prev => prev + 1)}
                sx={{ 
                  minWidth: isMobile ? '80px' : 'auto',
                  fontSize: isMobile ? '12px' : '14px'
                }}
              >
                Next
              </Button>
            </Box>
          </Box>
        </Box>
      </TableContainer>

      <EditUserDialog
        open={editDialogOpen}
        onClose={handleCloseEdit}
        editingUser={editingUser}
        onSaveEdit={handleSaveEdit}
        isLoadingUserDetails={isLoadingUserDetails}
        isSaving={isSaving}
      />

      <UserInfoDialog
        open={infoDialogOpen}
        onClose={handleCloseInfo}
        user={selectedUser}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 