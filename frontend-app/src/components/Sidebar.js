import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import HomeIcon from '@mui/icons-material/Home';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CloseIcon from '@mui/icons-material/Close';
import { DataService } from '../Services/dataService';

const drawerWidth = 240;

const Sidebar = ({ history, onNavigate, onClearHistory }) => {
  const [cacheStatus, setCacheStatus] = useState({
    loading: false,
    message: null,
    type: 'info'
  });

  // Handle cache refresh
  const handleRefreshCache = async () => {
    try {
      setCacheStatus({
        loading: true,
        message: 'Refreshing cache...',
        type: 'info'
      });
      
      await DataService.refreshData();
      
      setCacheStatus({
        loading: false,
        message: 'Cache refreshed successfully!',
        type: 'success'
      });
    } catch (error) {
      setCacheStatus({
        loading: false,
        message: `Failed to refresh cache: ${error.message}`,
        type: 'error'
      });
    }
    
    // Auto-hide message after 3 seconds
    setTimeout(() => {
      setCacheStatus(prev => ({
        ...prev,
        message: null
      }));
    }, 3000);
  };

  // Handle cache clear
  const handleClearCache = () => {
    try {
      DataService.clearCache();
      setCacheStatus({
        loading: false,
        message: 'Cache cleared successfully!',
        type: 'success'
      });
    } catch (error) {
      setCacheStatus({
        loading: false,
        message: `Failed to clear cache: ${error.message}`,
        type: 'error'
      });
    }
    
    // Auto-hide message after 3 seconds
    setTimeout(() => {
      setCacheStatus(prev => ({
        ...prev,
        message: null
      }));
    }, 3000);
  };

  // Handle message close
  const handleCloseMessage = () => {
    setCacheStatus(prev => ({
      ...prev,
      message: null
    }));
  };

  const renderCacheActions = () => {
    return (
      <Box sx={{ mt: 2, px: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Cache Management
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={cacheStatus.loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleRefreshCache}
            disabled={cacheStatus.loading}
          >
            Refresh Cache
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="secondary"
            startIcon={<DeleteSweepIcon />}
            onClick={handleClearCache}
            disabled={cacheStatus.loading}
          >
            Clear Cache
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => onNavigate('/', 'Home')}>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => onNavigate('/properties', 'Properties')}>
                <ListItemIcon>
                  <BarChartIcon />
                </ListItemIcon>
                <ListItemText primary="Properties" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => onNavigate('/audience-manager', 'Audience Manager')}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Audience Manager" />
              </ListItemButton>
            </ListItem>
          </List>
          
          <Divider />
          
          {renderCacheActions()}
          
          <Box sx={{ flexGrow: 1 }} />
          
          {history.length > 0 && (
            <>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Recent Pages
                  </Typography>
                  <Button 
                    startIcon={<ClearAllIcon />}
                    size="small"
                    onClick={onClearHistory}
                  >
                    Clear
                  </Button>
                </Box>
                <List dense>
                  {history.map((item, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemButton onClick={() => onNavigate(item.path, item.label)}>
                        <ListItemIcon>
                          <DashboardIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
      
      {/* Snackbar for cache status messages */}
      <Snackbar
        open={Boolean(cacheStatus.message)}
        autoHideDuration={3000}
        onClose={handleCloseMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity={cacheStatus.type} 
          onClose={handleCloseMessage}
          sx={{ width: '100%' }}
        >
          {cacheStatus.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Sidebar;