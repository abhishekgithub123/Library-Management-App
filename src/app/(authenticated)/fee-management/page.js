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
import InfoIcon from "@mui/icons-material/Info";
import DataTable from "../../../components/common/DataTable";
import UserInfoDialog from "../../../components/common/UserInfoDialog";
import FeePaymentDialog from "../../../components/common/FeePaymentDialog";
import FilterSection from "../../../components/common/FilterSection";
import axiosClient from "../../../lib/api";
import { ApiPaths } from "../../../constants/api-paths";
import { useAuth } from "../../../contexts/AuthContext";
import { handleAuthError } from "../../../utils/auth";

// API function to fetch pending users with pagination and filters
const fetchPendingUsers = async ({ queryKey }) => {
  const [, currentPage, query] = queryKey;
  
  const { data } = await axiosClient.get(ApiPaths.USERS, {
    params: {
      page: currentPage,
      limit: 10,
      filters: JSON.stringify({
        ...query,
        feeStatus: 'eq:PENDING' // Only fetch pending users
      }),
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
      return user;
    }
    
    throw new Error('Failed to fetch user details');
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

const tableHeaders = [
  { key: "name", label: "Name" },
  { key: "mobile", label: "Mobile" },
  { key: "shift", label: "Shift" },
  { key: "feeStatus", label: "Fee Status" },
  { key: "actions", label: "Actions" },
];

export default function FeeManagement() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  // State for pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [rowPerPage] = useState(10);
  const [query, setQuery] = useState({
    libraryId: `eq:${user.libraryId}`,
    roleId: `eq:3`
  });
  const [sortConfig, setSortConfig] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    shiftName: '',
    paidStatus: 'all'
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
      key: 'paidStatus',
      label: 'Payment Status',
      options: [
        { value: 'PAID', label: 'Paid' },
        { value: 'PENDING', label: 'Pending' },
      ],
    },
  ];

  // Local state for UI controls
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedUserForPayment, setSelectedUserForPayment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // TanStack Query for fetching pending users
  const {
    data: usersData = { rows: [], total: 0, page: 1, limit: 10 },
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['pendingUsers', currentPage, query],
    queryFn: fetchPendingUsers,
    placeholderData: (previousData) => 
      queryClient.getQueryData(['pendingUsers', currentPage, query]),
    enabled: !!currentPage || !query,
  });

  // Get query data
  const queryData = queryClient.getQueryData(['pendingUsers', currentPage, query]) || {};
  const pendingUsersData = queryData?.rows || usersData?.rows || [];
  console.log(pendingUsersData,"ye meri users hai")

  useEffect(() => {
    const urlShift = searchParams.get("shift");
    
    if (urlShift) {
      setFilters(prev => ({ ...prev, shiftName: urlShift }));
    }
    
    // Apply filters immediately if URL parameters are present
    if (urlShift) {
      const result = {
        libraryId: `eq:${user.libraryId}`,
        roleId: `eq:3`
      };
      
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
    const sorted = [...(Array.isArray(pendingUsersData) ? pendingUsersData : [])];
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
  }, [pendingUsersData, sortConfig]);

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const handleClear = () => {
    setFilters({
      name: '',
      shiftName: '',
      paidStatus: 'all'
    });
    setQuery({ roleId: "eq:3", libraryId: `eq:${user.libraryId}` });
    setCurrentPage(1);
  };

  const applyFilters = () => {
    const result = {
      libraryId: `eq:${user.libraryId}`
    };
    if (filters.name) result.name = `like:${filters.name}`;
    if (filters.shiftName) result.shiftName = `like:${filters.shiftName}`;
    if (filters.paidStatus !== 'all') result.paidStatus = `eq:${filters.paidStatus}`;
    setQuery(result);
    setCurrentPage(1);
  };

  const handleInfoClick = async (user) => {
    try {
      // Fetch fresh user data from API
      const freshUserData = await fetchUserById(user.userId);
      setSelectedUser(freshUserData);
      setInfoDialogOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Fallback to existing user data if API call fails
      setSelectedUser(user);
      setInfoDialogOpen(true);
      setSnackbar({ open: true, message: 'Failed to load fresh user data. Using cached data.', severity: 'warning' });
    }
  };

  const handlePaymentClick = async (user,pendingUsersData) => {
    try {
      // Fetch fresh user data from API
      const freshUserData = await fetchUserById(user.userId);
      console.log(freshUserData,"ye meri freshUserData hai")
      setSelectedUserForPayment({...freshUserData,studentFeeId:pendingUsersData.find(item=>item.userId===user.userId).studentFeeId});
      setPaymentDialogOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Fallback to existing user data if API call fails
      setSelectedUserForPayment(user);
      setPaymentDialogOpen(true);
      setSnackbar({ open: true, message: 'Failed to load fresh user data. Using cached data.', severity: 'warning' });
    }
  };

  const handleCloseInfo = () => {
    setInfoDialogOpen(false);
    setSelectedUser(null);
  };

  const handleClosePayment = () => {
    setPaymentDialogOpen(false);
    setSelectedUserForPayment(null);
  };

  const handlePaymentSuccess = () => {
    setSnackbar({ open: true, message: 'Payment processed successfully!', severity: 'success' });
    refetch(); // Refresh the data
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderCellContent = (user, headerKey) => {
    switch (headerKey) {
      case "feeStatus":
        return <Chip label="Pending" color="warning" size="small" />;
      case "actions":
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <IconButton 
              color="info" 
              size="small"
              onClick={() => handleInfoClick(user)}
              title="View Details"
            >
              <InfoIcon />
            </IconButton>
            <Button
              variant="contained"
              size="small"
              onClick={() => handlePaymentClick(user,pendingUsersData)}
              sx={{
                bgcolor: '#d32f2f',
                minWidth: '40px',
                width: '40px',
                height: '20px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
                '&:hover': {
                  bgcolor: '#1D4ED8',
                  boxShadow: '0 4px 8px rgba(37, 99, 235, 0.4)',
                  // transform: 'translateY(-1px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                }
              }}
            >
              Pay
            </Button>
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
    if (handleAuthError(error)) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading pending users: {error.message}
        </Alert>
        <Typography variant="h5" fontWeight={500} sx={{ mb: 2 }}>
          Fee Management Dashboard
        </Typography>
      </Box>
    );
  }

  console.log(selectedUserForPayment,"ye meri selectedUserForPayment hai")

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
            Fee Management Dashboard
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
            emptyMessage="No pending users found."
          />
        </Box>

        {/* Pagination Section */}
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

      <UserInfoDialog
        open={infoDialogOpen}
        onClose={handleCloseInfo}
        user={selectedUser}
      />

      <FeePaymentDialog
        open={paymentDialogOpen}
        onClose={handleClosePayment}
        user={selectedUserForPayment}
        onPaymentSuccess={handlePaymentSuccess}
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