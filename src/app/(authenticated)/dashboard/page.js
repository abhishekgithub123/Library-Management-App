"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import DataTable from "../../../components/common/DataTable";
import axiosClient from "../../../lib/api";
import { ApiPaths } from "../../../constants/api-paths";

// Table headers for shift summary
const shiftSummaryHeaders = [
  { key: "shift", label: "Shift" },
  { key: "users", label: "Users" },
  { key: "paid", label: "Paid" },
  { key: "pending", label: "Pending" },
  { key: "limit", label: "Limit" },
];

const monthOptions = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

// Generate dynamic years (current year + 7 past years)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  // Add current year and 7 past years (8 years total)
  for (let i = currentYear - 7; i <= currentYear; i++) {
    years.push(i.toString());
  }
  
  return years.sort((a, b) => b - a); // Sort in descending order
};

export default function Dashboard() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    return months[new Date().getMonth()];
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [yearOptions, setYearOptions] = useState(generateYearOptions());

  // Convert month name to number for API
  const getMonthNumber = (monthName) => {
    const monthMap = {
      'January': 1, 'February': 2, 'March': 3, 'April': 4,
      'May': 5, 'June': 6, 'July': 7, 'August': 8,
      'September': 9, 'October': 10, 'November': 11, 'December': 12
    };
    return monthMap[monthName] || 1;
  };

  // Function to fetch available years from existing data
  // const fetchAvailableYears = async () => {
  //   try {
  //     // Try to get years from student fees data
  //     const currentYear = new Date().getFullYear();
  //     const yearsToCheck = [];
      
  //     // Check current year and 7 past years (8 years total)
  //     for (let i = currentYear - 7; i <= currentYear; i++) {
  //       yearsToCheck.push(i);
  //     }

  //     const availableYears = new Set();
      
  //     // Check each year by making API calls to see if data exists
  //     for (const year of yearsToCheck) {
  //       try {
  //         // Check if there's any data for this year by making a test API call
  //         const response = await axiosClient.get(`${ApiPaths.DASHBOARD}count?month=${getMonthNumber(selectedMonth)}&year=${year}`);
  //         if (response.data.success && response.data.detail) {
  //           // If we get a successful response, this year has data
  //           availableYears.add(year.toString());
  //         }
  //       } catch (error) {
  //         // If API call fails, this year might not have data
  //         console.log(`No data found for year ${year}`);
  //       }
  //     }

  //     // If we found years with data, use them; otherwise use generated years
  //     const yearsWithData = Array.from(availableYears).sort((a, b) => b - a);
  //     if (yearsWithData.length > 0) {
  //       setYearOptions(yearsWithData);
  //       // Set selected year to the most recent year with data
  //       if (!yearsWithData.includes(selectedYear)) {
  //         setSelectedYear(yearsWithData[0]);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error fetching available years:', error);
  //     // Fallback to generated years if API calls fail
  //     setYearOptions(generateYearOptions());
  //   }
  // };

  // // Fetch available years on component mount
  // useEffect(() => {
  //   fetchAvailableYears();
  // }, []);

  // Fetch dashboard statistics using useQuery
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError 
  } = useQuery({
    queryKey: ['dashboard', selectedYear, selectedMonth],
    queryFn: async () => {
      const monthNumber = getMonthNumber(selectedMonth);
      const response = await axiosClient.get(`${ApiPaths.DASHBOARD}count?month=${monthNumber}&year=${selectedYear}`);
      if (response.data.success) {
        return response.data.detail;
      }
      throw new Error(response.data.message || 'Failed to fetch dashboard data');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch shift summary using useQuery
  const { 
    data: shiftSummaryData, 
    isLoading: shiftSummaryLoading, 
    error: shiftSummaryError 
  } = useQuery({
    queryKey: ['shiftSummary', selectedYear, selectedMonth],
    queryFn: async () => {
      const monthNumber = getMonthNumber(selectedMonth);
      const response = await axiosClient.get(`${ApiPaths.DASHBOARD}shift/summary?month=${monthNumber}&year=${selectedYear}`);
      if (response.data.success) {
        // Transform the data to map "unpaid" to "pending" for UI consistency
        return response.data.detail.map(item => ({
          ...item,
          pending: item.unpaid || 0 // Map "unpaid" from API to "pending" for UI
        }));
      }
      throw new Error(response.data.message || 'Failed to fetch shift summary data');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle click on pending data
  const handlePendingClick = (shiftData) => {
    // Navigate to user management with pending filter and shift filter
    const params = new URLSearchParams({
      paid: 'pending',
      shift: shiftData.shift
    });
    router.push(`/user-management?${params.toString()}`);
  };

  // Custom cell renderer for shift summary table
  const renderShiftSummaryCell = (item, headerKey) => {
    if (headerKey === "pending") {
      return (
        <Box
          sx={{
            cursor: "pointer",
            color: "#d32f2f",
            fontWeight: "bold",
            textDecoration: "underline",
            "&:hover": {
              color: "#b71c1c",
            },
          }}
          onClick={() => handlePendingClick(item)}
        >
          {item[headerKey]}
        </Box>
      );
    }
    return item[headerKey];
  };

  // Transform API data to statistics cards format
  const transformDashboardData = (data) => {
    if (!data) return [];
    
    return [
      { label: "Total Students", value: data.totalStudents || 0 },
      { label: "Paid this month", value: data.paidThisMonth || 0 },
      { label: "Unpaid this month", value: data.unpaidThisMonth || 0 },
      { 
        label: "Total Income", 
        value: data.totalIncome ? `₹${data.totalIncome.toLocaleString()}` : "₹0" 
      },
      { 
        label: "Total Expenses", 
        value: data.totalExpenses ? `₹${data.totalExpenses.toLocaleString()}` : "₹0" 
      },
      { 
        label: "Net Savings", 
        value: data.savings ? `₹${data.savings.toLocaleString()}` : "₹0" 
      },
    ];
  };

  const currentStats = transformDashboardData(dashboardData);

  // Check if either dashboard or shift summary is loading
  const isLoading = dashboardLoading || shiftSummaryLoading;
  const hasError = dashboardError || shiftSummaryError;

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      {/* Dashboard Title */}
      <Typography variant="h4" fontWeight={600} sx={{ mb: 2, color: '#374151',textAlign:'center' }}>
        Dashboard
      </Typography>

      {/* Dashboard Container with Filters and Content */}
      <Box sx={{ 
        backgroundColor: '#f8fafc', 
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        p: 3,
        mb: 3
      }}>
        {/* Filters Section */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          mb: 3, 
          pb: 2,
          borderBottom: '1px solid #e2e8f0'
        }}>
          <Typography variant="body2" fontWeight={500} sx={{ color: '#6b7280' }}>
            Filters:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Month"
              onChange={e => setSelectedMonth(e.target.value)}
            >
              {monthOptions.map(month => (
                <MenuItem key={month} value={month}>{month}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={e => setSelectedYear(e.target.value)}
            >
              {yearOptions.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading dashboard data...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {hasError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {(dashboardError?.message || shiftSummaryError?.message) || 'Failed to load dashboard data. Please try again.'}
          </Alert>
        )}

        {/* Statistics Cards Section */}
        {!dashboardLoading && !dashboardError && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight={500} sx={{ mb: 2, color: '#374151' }}>
              Statistics Cards ({selectedMonth} {selectedYear})
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
              }}
            >
              {currentStats.map((stat) => (
                <Card
                  key={stat.label}
                  sx={{
                    minWidth: 0,
                    width: '100%',
                    maxWidth: 260,
                    mx: 'auto',
                    borderRadius: 3,
                    boxShadow: 3,
                    background: 'linear-gradient(135deg, #f8fafc 60%, #e3e6f3 100%)',
                    p: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.04)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1, letterSpacing: 0.2 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#2d2d2d' }}>
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Shift-wise Summary Section */}
        <Box sx={{ mb: 0 }}>
          <Typography variant="h5" fontWeight={500} sx={{ mb: 2, color: '#374151' }}>
            Shift-wise Summary ({selectedMonth} {selectedYear})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click on pending numbers to view pending users for that shift
          </Typography>
          <DataTable
            headers={shiftSummaryHeaders}
            data={shiftSummaryData || []}
            renderCell={renderShiftSummaryCell}
            emptyMessage="No shift data available."
            containerStyle={{
              borderRadius: 3,
              boxShadow: 3,
              overflow: 'hidden',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
} 