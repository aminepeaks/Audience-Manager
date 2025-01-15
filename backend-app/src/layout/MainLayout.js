import React from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Navbar />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: 30 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
