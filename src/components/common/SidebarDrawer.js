"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { SideBarNavItems } from "../../constants/navItem";

export default function SidebarDrawer({ open, onClose }) {
  const router = useRouter();
  const pathname = usePathname();

  // Find the active index based on the current route
  const activeDrawer = SideBarNavItems.findIndex(item => pathname.startsWith(item.href));

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '70vw',
          maxWidth: 320,
          borderTopRightRadius: 16,
          borderBottomRightRadius: 16,
          boxShadow: 6,
          background: '#fff',
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <Box sx={{ width: '70vw', maxWidth: 320, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={600}>Menu</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {SideBarNavItems.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <ListItem
                button
                key={item.id}
                selected={activeDrawer === idx}
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
                sx={{
                  bgcolor: activeDrawer === idx ? 'rgba(244,67,54,0.08)' : 'inherit',
                  color: activeDrawer === idx ? 'primary.main' : 'inherit',
                  borderLeft: activeDrawer === idx ? '4px solid #F44336' : '4px solid transparent',
                  pl: 3,
                }}
              >
                <ListItemIcon sx={{ color: activeDrawer === idx ? '#F44336' : 'inherit' }}>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
} 