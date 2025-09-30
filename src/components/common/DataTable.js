"use client";

import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

const DataTable = ({
  headers = [],
  data = [],
  renderCell = null,
  emptyMessage = "No data found.",
  headerStyle = {},
  containerStyle = {},
  getRowStyle = null,
}) => {
  // Default cell renderer
  const defaultRenderCell = (item, headerKey) => {
    return item[headerKey];
  };

  // Use custom renderer if provided, otherwise use default
  const cellRenderer = renderCell || defaultRenderCell;

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, ...containerStyle }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell 
                key={header.key} 
                align="center"
                sx={{ 
                  background: '#d32f2f', 
                  color: '#fff',
                  ...headerStyle
                }}
              >
                {header.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={headers.length} align="center">
                <Typography variant="body2" color="text.secondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow 
                key={item.id || index}
                sx={getRowStyle ? getRowStyle(item, index) : {}}
              >
                {headers.map((header) => (
                  <TableCell key={header.key} align="center">
                    {cellRenderer(item, header.key)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable; 