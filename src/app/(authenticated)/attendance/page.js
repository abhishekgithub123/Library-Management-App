"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { CheckCircle, Cancel, RemoveCircle } from "@mui/icons-material";
import DataTable from "../../../components/common/DataTable";

// All registered users (from user management)
const allRegisteredUsers = [
  // Morning Shift Users
  { id: 1, name: "Alice Johnson", mobile: "1234567890", shift: "Morning", plan: "monthly" },
  { id: 2, name: "Bob Smith", mobile: "234567891", shift: "Morning", plan: "quarterly" },
  { id: 3, name: "Charlie Brown", mobile: "3456789012", shift: "Morning", plan: "monthly" },
  { id: 4, name: "David Wilson", mobile: "456789123", shift: "Morning", plan: "yearly" },
  { id: 5, name: "Emma Davis", mobile: "5678901234", shift: "Morning", plan: "monthly" },
  { id: 6, name: "Frank Miller", mobile: "6789012345", shift: "Morning", plan: "quarterly" },
  { id: 7, name: "Grace Lee", mobile: "7890123456", shift: "Morning", plan: "monthly" },
  { id: 8, name: "Henry Taylor", mobile: "8901234567", shift: "Morning", plan: "yearly" },
  { id: 9, name: "Ivy Chen", mobile: "9012345678", shift: "Morning", plan: "monthly" },
  { id: 10, name: "Jack Anderson", mobile: "0123456789", shift: "Morning", plan: "quarterly" },
  { id: 11, name: "Kate Rodriguez", mobile: "1122334455", shift: "Morning", plan: "monthly" },
  { id: 12, name: "Liam Garcia", mobile: "2233445566", shift: "Morning", plan: "yearly" },
  { id: 13, name: "Maya Patel", mobile: "3344556677", shift: "Morning", plan: "monthly" },
  { id: 14, name: "Noah Thompson", mobile: "4455667788", shift: "Morning", plan: "quarterly" },
  { id: 15, name: "Olivia White", mobile: "5566778899", shift: "Morning", plan: "monthly" },
  { id: 16, name: "Paul Martinez", mobile: "667788990", shift: "Morning", plan: "yearly" },
  { id: 17, name: "Quinn Johnson", mobile: "778899011", shift: "Morning", plan: "monthly" },
  { id: 18, name: "Ruby Davis", mobile: "8899001122", shift: "Morning", plan: "quarterly" },
  { id: 19, name: "Sam Wilson", mobile: "9900112233", shift: "Morning", plan: "monthly" },
  { id: 20, name: "Tina Brown", mobile: "0011223344", shift: "Morning", plan: "quarterly" },

  // Evening Shift Users
  { id: 21, name: "Alex Turner", mobile: "1112223333", shift: "Evening", plan: "monthly" },
  { id: 22, name: "Bella Clark", mobile: "2223334444", shift: "Evening", plan: "yearly" },
  { id: 23, name: "Chris Evans", mobile: "3334445555", shift: "Evening", plan: "monthly" },
  { id: 24, name: "Diana Foster", mobile: "4445556666", shift: "Evening", plan: "quarterly" },
  { id: 25, name: "Ethan Green", mobile: "5556667777", shift: "Evening", plan: "monthly" },
  { id: 26, name: "Fiona Hall", mobile: "6667778888", shift: "Evening", plan: "yearly" },
  { id: 27, name: "George King", mobile: "7778889999", shift: "Evening", plan: "monthly" },
  { id: 28, name: "Hannah Lewis", mobile: "88899900", shift: "Evening", plan: "quarterly" },
  { id: 29, name: "Ian Moore", mobile: "9990001111", shift: "Evening", plan: "monthly" },
  { id: 30, name: "Julia Nelson", mobile: "0001112222", shift: "Evening", plan: "yearly" },
  { id: 31, name: "Kevin Perez", mobile: "1112223333", shift: "Evening", plan: "monthly" },
  { id: 32, name: "Lisa Roberts", mobile: "2223334444", shift: "Evening", plan: "quarterly" },
  { id: 33, name: "Mike Scott", mobile: "3334445555", shift: "Evening", plan: "monthly" },
  { id: 34, name: "Nina Adams", mobile: "4445556666", shift: "Evening", plan: "monthly" },
  { id: 35, name: "Oscar Baker", mobile: "5556667777", shift: "Evening", plan: "quarterly" },

  // Full Day Shift Users
  { id: 36, name: "Pamela Carter", mobile: "6667778888", shift: "Full Day", plan: "monthly" },
  { id: 37, name: "Quentin Davis", mobile: "7778889999", shift: "Full Day", plan: "yearly" },
  { id: 38, name: "Rachel Edwards", mobile: "88899900", shift: "Full Day", plan: "monthly" },
  { id: 39, name: "Steven Fisher", mobile: "9990001111", shift: "Full Day", plan: "quarterly" },
  { id: 40, name: "Tracy Gordon", mobile: "0001112222", shift: "Full Day", plan: "monthly" },
  { id: 41, name: "Ulysses Harris", mobile: "1112223333", shift: "Full Day", plan: "yearly" },
  { id: 42, name: "Victoria Irwin", mobile: "2223334444", shift: "Full Day", plan: "monthly" },
  { id: 43, name: "Walter Jackson", mobile: "3334445555", shift: "Full Day", plan: "monthly" },
  { id: 44, name: "Xena Kelly", mobile: "4445556666", shift: "Full Day", plan: "quarterly" },
  { id: 45, name: "Yves Lambert", mobile: "5556667777", shift: "Full Day", plan: "yearly" },
];

// Sample attendance data
const initialAttendanceRecords = [
  { userId: 1, date: "2024-07-15", punchIns: ["08:00"], punchOuts: ["17:00"], status: "present" },
  { userId: 2, date: "2024-07-15", punchIns: ["08:15"], punchOuts: ["17:30"], status: "present" },
  { userId: 3, date: "2024-07-16", punchIns: ["08:30"], punchOuts: [], status: "present" },
  // Example with multiple punch-ins
  { userId: 4, date: "2024-07-17", punchIns: ["09:00", "14:00"], punchOuts: ["12:00", "17:00"], status: "present" },
];

export default function AttendanceMonthlyReport() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [attendanceData, setAttendanceData] = useState(initialAttendanceRecords);
  
  // Dialog state for punch-in
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Dialog state for hours details
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false);
  const [hoursInfo, setHoursInfo] = useState(null);

  const yearOptions = [];
  for (let y = 2020; y <= now.getFullYear() + 1; y++) yearOptions.push(y);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const monthShort = monthNames[selectedMonth];
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Handle opening the punch-in dialog
  const handleOpenDialog = (user, dateStr) => {
    setSelectedUser(user);
    setSelectedDate(dateStr);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setSelectedDate(null);
  };

  // Handle opening the hours details dialog
  const handleOpenHoursDialog = (user, dateStr) => {
    const record = attendanceData.find(r => r.userId === user.id && r.date === dateStr);
    if (record) {
      // Get the latest punch-in and punch-out times
      const latestPunchIn24 = record.punchIns && record.punchIns.length > 0 
        ? record.punchIns[record.punchIns.length - 1]
        : null;
      const latestPunchOut24 = record.punchOuts && record.punchOuts.length > 0 
        ? record.punchOuts[record.punchOuts.length - 1]
        : null;
      
      // Check if attendance is complete (has both punch-in and punch-out)
      const isComplete = latestPunchIn24 && latestPunchOut24;
      
      // Check if this is a past date
      const cellDate = new Date(dateStr);
      const isPast = cellDate < today;
      
      // Calculate hours worked based on latest punch-in and punch-out
      let hoursWorked = "Incomplete";
      if (isComplete) {
        const [inHour, inMinute] = latestPunchIn24.split(':').map(Number);
        const [outHour, outMinute] = latestPunchOut24.split(':').map(Number);
        
        let totalMinutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
        
        if (totalMinutes > 0) {
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          hoursWorked = `${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
        } else {
          hoursWorked = "Invalid time range";
        }
      }
      
      // Convert to 12-hour format for display
      const latestPunchIn = latestPunchIn24 ? convertTo12HourFormat(latestPunchIn24) : null;
      const latestPunchOut = latestPunchOut24 ? convertTo12HourFormat(latestPunchOut24) : null;
      
      setHoursInfo({ 
        name: user.name, 
        date: dateStr, 
        hours: hoursWorked,
        latestPunchIn,
        latestPunchOut,
        isComplete,
        isPast
      });
      setHoursDialogOpen(true);
    }
  };

  const handleCloseHoursDialog = () => {
    setHoursDialogOpen(false);
    setHoursInfo(null);
  };

  // Function to convert 24-hour format to 12-hour format with AM/PM
  const convertTo12HourFormat = (time24) => {
    if (!time24) return null;
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Function to calculate total hours from punch-in/out pairs
  const calculateTotalHours = (punchIns = [], punchOuts = []) => {
    if (punchIns.length !== punchOuts.length) return "Incomplete";

    let totalMinutes = 0;
    for (let i = 0; i < punchIns.length; i++) {
      const [inHour, inMinute] = punchIns[i].split(':').map(Number);
      const [outHour, outMinute] = punchOuts[i].split(':').map(Number);
    
    let hours = outHour - inHour;
    let minutes = outMinute - inMinute;
    
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
      totalMinutes += hours * 60 + minutes;
    }

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  // Handle the punch-in action
  const handlePunchIn = () => {
    if (!selectedUser || !selectedDate) return;

    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    setAttendanceData(prev => {
      const newRecord = {
        userId: selectedUser.id,
        date: selectedDate,
        punchIns: [currentTime],
        punchOuts: [],
        status: 'present',
      };
      return [...prev, newRecord];
    });

    handleCloseDialog();
  };

  const monthlyAttendanceData = allRegisteredUsers.map(user => {
    let presentCount = 0;
    const attendanceByDay = monthDays.map(day => {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = attendanceData.find(r => r.userId === user.id && r.date === dateStr);
      let status = 'absent';

      if (record && record.status === 'present') {
        const hasPunchIns = record.punchIns?.length > 0;
        const hasCompletedDay = hasPunchIns && record.punchOuts?.length === record.punchIns.length;
        if (hasCompletedDay) status = 'complete';
        else if (hasPunchIns) status = 'incomplete';
      }
      
      if (status === 'complete' || status === 'incomplete') presentCount++;
      return { day, status, dateStr };
    });
    return { ...user, attendance: attendanceByDay, presentCount };
  });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build headers for DataTable
  const attendanceHeaders = [
    { key: "name", label: "Student Name" },
    ...monthDays.map(day => ({ key: `day_${day}`, label: `${day}-${monthShort}` })),
    { key: "presentCount", label: "Present Count" },
  ];

  // Transform data for DataTable
  const dataTableRows = monthlyAttendanceData.map(user => {
    const row = {
      id: user.id,
      name: user.name,
      presentCount: user.presentCount,
    };
    user.attendance.forEach(({ day, status, dateStr }) => {
      row[`day_${day}`] = { status, dateStr, user };
    });
    return row;
  });

  // Custom cell renderer for DataTable
  const renderCell = (row, key) => {
    if (key === "name" || key === "presentCount") return row[key];
    const cell = row[key];
    if (!cell) return null;
    const { status, dateStr, user } = cell;
    const cellDate = new Date(dateStr);
    const isPast = cellDate < today;

    if (isPast) {
      return (
        <Box
          onClick={() => (status === 'complete' || status === 'incomplete') && handleOpenHoursDialog(user, dateStr)}
          sx={{
            cursor: (status === 'complete' || status === 'incomplete') ? 'pointer' : 'default',
            '&:hover': {
              bgcolor: (status === 'complete' || status === 'incomplete') ? 'action.hover' : 'transparent',
            },
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {status === 'complete' && <CheckCircle sx={{ color: '#4CAF50' }} />}
          {status === 'incomplete' && <RemoveCircle sx={{ color: '#FFC107' }} />}
          {status === 'absent' && <Cancel sx={{ color: '#F44336' }} />}
        </Box>
      );
    }
    // For today and future dates
    if (status === 'absent') {
      return (
        <Box
          onClick={() => handleOpenDialog(user, dateStr)}
          sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, minHeight: 32, display: 'flex', justifyContent: 'center' }}
        />
      );
    }
    // Already punched in today or complete for today
    return (
      <Box
        onClick={() => (status === 'complete' || status === 'incomplete') && handleOpenHoursDialog(user, dateStr)}
        sx={{
          cursor: (status === 'complete' || status === 'incomplete') ? 'pointer' : 'default',
          '&:hover': {
            bgcolor: (status === 'complete' || status === 'incomplete') ? 'action.hover' : 'transparent',
          },
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {status === 'complete' && <CheckCircle sx={{ color: '#4CAF50' }} />}
        {status === 'incomplete' && <RemoveCircle sx={{ color: '#FFC107' }} />}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', p: 2, overflowX: 'auto' }}>
      <Typography variant="h5" fontWeight={500} sx={{ mb: 2 }}>
        Monthly Attendance Report
      </Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Select size="small" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
          {monthNames.map((name, idx) => <MenuItem key={name} value={idx}>{name}</MenuItem>)}
        </Select>
        <Select size="small" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
          {yearOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
      </Box>

      <DataTable
        headers={attendanceHeaders}
        data={dataTableRows}
        renderCell={renderCell}
        emptyMessage="No attendance data for this month."
      />

      {/* Punch-in Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent>
          <Typography>
            Punch in for **{selectedUser?.name}** on **{selectedDate}**?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handlePunchIn} variant="contained" color="primary">
            Punch In
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hours Details Dialog */}
      <Dialog open={hoursDialogOpen} onClose={handleCloseHoursDialog}>
        <DialogTitle>Attendance Details</DialogTitle>
        <DialogContent>
          {hoursInfo && (
            <Box>
              {hoursInfo.isComplete ? (
                // Complete attendance - show both times and hours
                <>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>{hoursInfo.name}</strong> was present for <strong>{hoursInfo.hours}</strong> on <strong>{hoursInfo.date}</strong>.
                  </Typography>
                  
                  {hoursInfo.latestPunchIn && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Punch-In Time:</strong> {hoursInfo.latestPunchIn}
                    </Typography>
                  )}
                  
                  {hoursInfo.latestPunchOut && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Punch-Out Time:</strong> {hoursInfo.latestPunchOut}
                    </Typography>
                  )}
                </>
              ) : (
                // Incomplete attendance - show only punch-in time
                <>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>{hoursInfo.name}</strong> punched in on <strong>{hoursInfo.date}</strong>.
                  </Typography>
                  
                  {hoursInfo.latestPunchIn && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Punch-In Time:</strong> {hoursInfo.latestPunchIn}
                    </Typography>
                  )}
                  
                  <Typography variant="body2" color="warning.main">
                    <strong>Status:</strong> {hoursInfo.isPast ? "Didn't punch out" : "Still working (not punched out yet)"}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHoursDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
