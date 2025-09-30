"use client";

import React from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

const FilterSection = ({
  filters = [],
  filterValues = {},
  onFilterChange,
  onApply,
  onClear,
  showFilters = false,
  onToggleFilters,
  title = "Filters",
  disabled = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleFilterChange = (filterKey, value) => {
    if (onFilterChange) {
      onFilterChange(filterKey, value);
    }
  };

  const renderFilterField = (filter) => {
    const { type, key, label, options, placeholder, searchIcon = false, fullWidth = false } = filter;
    const value = filterValues[key] || '';

    switch (type) {
      case 'text':
        return (
          <TextField
            key={key}
            label={label}
            value={value}
            onChange={(e) => handleFilterChange(key, e.target.value)}
            placeholder={placeholder}
            size="small"
            fullWidth={fullWidth || isMobile}
            disabled={disabled}
            InputProps={{
              endAdornment: searchIcon ? (
                <InputAdornment position="end">
                  <IconButton size="small" disabled>
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            }}
            sx={{ flex: fullWidth ? 'none' : 1 }}
          />
        );

      case 'select':
        return (
          <FormControl 
            key={key}
            size="small" 
            sx={{ 
              minWidth: fullWidth || isMobile ? '100%' : 120,
              flex: fullWidth ? 'none' : 1
            }}
          >
            <InputLabel>{label}</InputLabel>
            <Select
              value={value || "all"}
              label={label}
              onChange={(e) => handleFilterChange(key, e.target.value === "all" ? "" : e.target.value)}
              fullWidth={fullWidth || isMobile}
              disabled={disabled}
            >
              <MenuItem value="all">All</MenuItem>
              {options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'date':
        return (
          <TextField
            key={key}
            label={label}
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(key, e.target.value)}
            size="small"
            fullWidth={fullWidth || isMobile}
            disabled={disabled}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ flex: fullWidth ? 'none' : 1 }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      borderBottom: '1px solid #E5E7EB',
      backgroundColor: '#fafafa'
    }}>
      {/* Filter Header with Toggle Button */}
      <Box sx={{ 
        p: isMobile ? 1 : 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: showFilters ? '1px solid #E5E7EB' : 'none'
      }}>
        <Typography variant="subtitle2" fontWeight={500} color="text.secondary">
          {title}
        </Typography>
        <IconButton
          size="small"
          onClick={onToggleFilters}
          disabled={disabled}
          sx={{
            color: showFilters ? '#2563EB' : 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.1)'
            }
          }}
        >
          <FilterListIcon />
        </IconButton>
      </Box>

      {/* Collapsible Filter Fields */}
      {showFilters && (
        <Box sx={{ 
          p: isMobile ? 1 : 2,
          animation: 'slideDown 0.3s ease-out',
          '@keyframes slideDown': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-10px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}>
          <Stack 
            direction={isMobile ? "column" : "row"} 
            spacing={isMobile ? 1 : 2} 
            sx={{ mb: isMobile ? 1 : 2 }}
          >
            {/* Render all filter fields */}
            {filters.map(renderFilterField)}
            
            {/* Filter Buttons - Mobile Responsive */}
            <Stack 
              direction={isMobile ? "row" : "row"} 
              spacing={1}
              sx={{ 
                justifyContent: isMobile ? 'space-between' : 'flex-start',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <Button
                variant="contained"
                size="small"
                onClick={onApply}
                disabled={disabled}
                sx={{ 
                  bgcolor: '#2563EB',
                  flex: isMobile ? 1 : 'none',
                  minWidth: isMobile ? 'auto' : '120px'
                }}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={onClear}
                disabled={disabled}
                sx={{ 
                  flex: isMobile ? 1 : 'none',
                  minWidth: isMobile ? 'auto' : '120px'
                }}
              >
                Clear
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default FilterSection;
