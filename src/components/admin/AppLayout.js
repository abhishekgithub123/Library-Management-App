"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Avatar, 
  Badge, 
  Box, 
  Divider, 
  Paper, 
  BottomNavigationAction, 
  Fab,
  Menu,
  MenuItem,
  Button
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HomeIcon from "@mui/icons-material/Home";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PersonIcon from "@mui/icons-material/Person";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SidebarDrawer from "../common/SidebarDrawer";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../contexts/AuthContext";

export default function AppLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState(0); // 0 = Dashboard
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/sign-in");
    }
  }, [user, loading, router]);

  // Function to get current navigation state based on pathname
  const getCurrentNav = () => {
    switch (pathname) {
      case '/dashboard':
        return 0;
      case '/user-management':
        return 1;
      case '/expenses':
        return 2;
      case '/profile':
        return 3;
      default:
        return -1; // No active nav for other pages
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const open = Boolean(anchorEl);
  const currentNav = getCurrentNav();

  // Don't render layout if not authenticated
  if (loading || !user) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: '#F7F8FA', minHeight: '100vh', pb: 8, position: 'relative' }}>
      {/* Sidebar Drawer */}
      <SidebarDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeDrawer={activeDrawer}
        setActiveDrawer={setActiveDrawer}
      />

      {/* Blur overlay when drawer is open */}
      {drawerOpen && (
        <Box
          onClick={() => setDrawerOpen(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1200,
            backdropFilter: 'blur(6px)',
            background: 'rgba(0,0,0,0.15)',
          }}
        />
      )}

      {/* App Bar */}
      <AppBar position="static" sx={{ bgcolor: 'transparent', color: 'black', boxShadow: 'none',backgroundColor:'#fff' }}>
        <Toolbar sx={{ px: 2, py: 1 }}>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700} sx={{ ml: 2, flexGrow: 0 }}>
            Library Admin App
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={handleMenuClick}
              sx={{ p: 0 }}
            >
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  border: '2px solid #fff',
                  bgcolor: 'primary.main'
                }}
              >
                {user?.username?.charAt(0)?.toUpperCase() || 'A'}
              </Avatar>
              <ArrowDropDownIcon sx={{ ml: 0.5, fontSize: 32, color: 'text.secondary' }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={() => { handleMenuClose(); router.push('/profile'); }}>
                <PersonIcon sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content (blurred when drawer is open) */}
      <Box sx={{ filter: drawerOpen ? 'blur(6px)' : 'none', pointerEvents: drawerOpen ? 'none' : 'auto', transition: 'filter 0.2s' }}>
        {children}
      </Box>

      {/* Custom Bottom Navigation Bar */}
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderRadius: 0, boxShadow: 3, height: 64, zIndex: 1201 }} >
        <Box sx={{ display: 'flex', alignItems: 'center', height: 1, position: 'relative', justifyContent: 'space-between', px: 3 }}>
          {/* Left side icons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <BottomNavigationAction
              label="Home"
              icon={<HomeIcon sx={{ color: currentNav === 0 ? '#F44336' : '#BDBDBD' }} />}
              showLabel={true}
              sx={{ minWidth: 0 }}
              onClick={() => router.push('/dashboard')}
            />
            <BottomNavigationAction
              label="Users"
              icon={<AssignmentIndIcon sx={{ color: currentNav === 1 ? '#F44336' : '#BDBDBD' }} />}
              showLabel={true}
              sx={{ minWidth: 0 }}
              onClick={() => router.push('/user-management')}
            />
          </Box>

          {/* Center Floating Action Button */}
          <Fab
            color="error"
            aria-label="add"
            sx={{
              position: 'absolute',
              left: '50%',
              top: -32,
              transform: 'translateX(-50%)',
              zIndex: 1300,
              width: 64,
              height: 64,
              boxShadow: 3,
              border: '4px solid #fff',
            }}
            onClick={() => router.push('/user-registration')}
          >
            <AddCircleIcon sx={{ fontSize: 36, color: '#fff' }} />
          </Fab>

          {/* Right side icons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <BottomNavigationAction
              label="Expenses"
              icon={<ChatBubbleOutlineIcon sx={{ color: currentNav === 2 ? '#F44336' : '#BDBDBD' }} />}
              onClick={() => router.push('/expenses')}
              showLabel={true}
              sx={{ minWidth: 0 }}
            />
            <BottomNavigationAction
              label="Profile"
              icon={<PersonIcon sx={{ color: currentNav === 3 ? '#F44336' : '#BDBDBD' }} />}
              showLabel={true}
              sx={{ minWidth: 0 }}
              onClick={() => router.push('/profile')}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
