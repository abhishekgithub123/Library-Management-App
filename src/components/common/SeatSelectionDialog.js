"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const SeatSelectionDialog = ({ 
  open, 
  onClose, 
  seats = [], 
  selectedSeats = [],
  onSeatSelect,
  onBookSeats,
  shiftName = ""
}) => {
    console.log(seats,"seats hai ye meri")
  const [localSelectedSeats, setLocalSelectedSeats] = useState(selectedSeats);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    setLocalSelectedSeats(selectedSeats);
    setCurrentTab(0); // Reset to first tab when dialog opens
  }, [selectedSeats]);

  const handleSeatClick = (seat) => {
    const isSelected = localSelectedSeats.some(s => s.seatId === seat.seatId);
    
    if (isSelected) {
      // Deselect seat
      setLocalSelectedSeats(prev => prev.filter(s => s.seatId !== seat.seatId));
    } else {
      // Select seat (limit to 1 seat for now)
      setLocalSelectedSeats([seat]);
    }
  };

  const handleBookSeats = () => {
    onBookSeats(localSelectedSeats);
    onClose();
  };

  const handleClose = () => {
    setLocalSelectedSeats(selectedSeats); // Reset to original selection
    onClose();
  };

  // Generate seat labels like A-101, B-102, etc.
  const generateSeatLabel = (seat, index) => {
    // Use the actual seat number from the seat data
    if (seat.seatNumber && seat.seatNumber.includes('-')) {
      return seat.seatNumber; // Return the actual seat number like "A-015"
    }
    // Fallback to generated label
    const row = String.fromCharCode(65 + Math.floor(index / 14)); // A, B, C, etc.
    const col = String(index % 14 + 1).padStart(2, '0'); // 01, 02, 03, etc.
    return `${row}-${col}`;
  };

  // Create tabbed seat groups with max 40 seats per tab
  const createSeatTabs = (seats) => {
    // Filter out reserved seats - only show available seats
    const availableSeats = seats.filter(seat => 
      seat.isBooked === 0 || seat.isBooked === 'false' || seat.isBooked === false
    );
    
    const seatsPerTab = 40;
    const tabs = [];
    
    for (let i = 0; i < availableSeats.length; i += seatsPerTab) {
      const tabSeats = availableSeats.slice(i, i + seatsPerTab);
      const grid = [];
      const seatsPerRow = 8; // 8 seats per row for better fit
      const rows = Math.ceil(tabSeats.length / seatsPerRow);
      
      for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        const row = [];
        for (let colIndex = 0; colIndex < seatsPerRow; colIndex++) {
          const seatIndex = rowIndex * seatsPerRow + colIndex;
          if (seatIndex < tabSeats.length) {
            const seat = tabSeats[seatIndex];
            const seatNumber = seat.seatNumber || String(colIndex + 1).padStart(2, '0');
            row.push({
              ...seat,
              seatNumber: seatNumber,
              label: generateSeatLabel(seat, i + seatIndex)
            });
          }
        }
        if (row.length > 0) {
          grid.push(row);
        }
      }
      
      tabs.push({
        seats: tabSeats,
        grid: grid,
        startSeat: i + 1,
        endSeat: Math.min(i + seatsPerTab, availableSeats.length)
      });
    }
    
    return tabs;
  };

  const seatTabs = createSeatTabs(seats);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        pb: 2
      }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Select Your Seat
          </Typography>
          {shiftName && (
            <Typography variant="body2" color="text.secondary">
              {shiftName}
            </Typography>
          )}
        </Box>
        <Button
          onClick={handleClose}
          sx={{ minWidth: 'auto', p: 1 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

             <DialogContent sx={{ pt: 2, pb: 1 }}>
         <Box sx={{ mb: 2 }}>
           <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
             Available seats for {shiftName} ({seats.filter(seat => 
               seat.isBooked === 0 || seat.isBooked === 'false' || seat.isBooked === false
             ).length} seats available)
           </Typography>
          
           {/* Tab Navigation */}
           {seatTabs.length > 1 && (
             <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
               <Tabs 
                 value={currentTab} 
                 onChange={(e, newValue) => setCurrentTab(newValue)}
                 variant="scrollable"
                 scrollButtons="auto"
                 sx={{ minHeight: 'auto' }}
               >
                 {seatTabs.map((tab, index) => (
                   <Tab 
                     key={index}
                     label={`Seats ${tab.startSeat}-${tab.endSeat}`}
                     sx={{ 
                       minHeight: 'auto', 
                       py: 1,
                       fontSize: '0.8rem'
                     }}
                   />
                 ))}
               </Tabs>
             </Box>
           )}

           {/* Seat Grid - Current Tab */}
           {seatTabs.length > 0 && (
             <Box sx={{ 
               display: 'flex', 
               flexDirection: 'column', 
               gap: 0.7,
               maxHeight: '400px',
               overflowY: 'auto',
               alignItems: 'center',
               p: 1,
               width: '100%'
             }}>
               {seatTabs[currentTab]?.grid.map((row, rowIndex) => (
                 <Box key={rowIndex} sx={{ 
                   display: 'flex', 
                   gap: 0.3,
                   justifyContent: 'center'
                 }}>
                   {row.map((seat) => {
                     const isSelected = localSelectedSeats.some(s => s.seatId === seat.seatId);
                     
                     return (
                       <Box
                         key={seat.seatId}
                         onClick={() => handleSeatClick(seat)}
                         sx={{
                           width: 28,
                           height: 28,
                           border: 1,
                           borderRadius: 0.3,
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           cursor: 'pointer',
                           backgroundColor: isSelected ? '#4caf50' : '#f8f9fa',
                           borderColor: isSelected ? '#4caf50' : '#dee2e6',
                           color: isSelected ? '#ffffff' : '#495057',
                           fontWeight: isSelected ? 'bold' : 'normal',
                           fontSize: '0.6rem',
                           transition: 'all 0.15s ease',
                           '&:active': {
                             transform: 'scale(0.95)'
                           }
                         }}
                       >
                         {seat.seatNumber.split('-')[1]}
                       </Box>
                     );
                   })}
                 </Box>
               ))}
             </Box>
           )}

                     {/* Legend - BookMyShow Style */}
           <Box sx={{ 
             display: 'flex', 
             gap: 2, 
             mt: 2, 
             flexWrap: 'wrap',
             justifyContent: 'center'
           }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
               <Box sx={{ 
                 width: 12, 
                 height: 12, 
                 backgroundColor: '#f8f9fa', 
                 border: '1px solid #dee2e6', 
                 borderRadius: 0.2 
               }} />
               <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Available</Typography>
             </Box>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
               <Box sx={{ 
                 width: 12, 
                 height: 12, 
                 backgroundColor: '#4caf50', 
                 border: '1px solid #4caf50', 
                 borderRadius: 0.2 
               }} />
               <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Selected</Typography>
             </Box>
           </Box>
        </Box>

                 {/* Selected Seats Summary */}
         {localSelectedSeats.length > 0 && (
           <Box sx={{ 
             mt: 1, 
             p: 1.5, 
             backgroundColor: '#f8f9fa', 
             borderRadius: 1,
             border: '1px solid #e9ecef'
           }}>
             <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
               Selected Seats:
             </Typography>
             <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
               {localSelectedSeats.map((seat, index) => (
                 <Chip
                   key={seat.seatId}
                   label={seat.label || seat.seatNumber}
                   color="primary"
                   variant="filled"
                   size="small"
                   sx={{ fontSize: '0.7rem', height: '20px' }}
                 />
               ))}
             </Box>
           </Box>
         )}
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        borderTop: '1px solid #e0e0e0',
        justifyContent: 'space-between'
      }}>
                 <Button onClick={handleClose} variant="outlined">
           CANCEL
         </Button>
                 <Button 
           onClick={handleBookSeats}
           variant="contained"
           disabled={localSelectedSeats.length === 0}
           sx={{
             backgroundColor: '#d32f2f',
             '&:hover': {
               backgroundColor: '#b71c1c'
             }
           }}
         >
           BOOK SEAT{localSelectedSeats.length !== 1 ? 'S' : ''} ({localSelectedSeats.length})
         </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeatSelectionDialog; 