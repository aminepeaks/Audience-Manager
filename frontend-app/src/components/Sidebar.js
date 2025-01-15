import React from 'react';
import { Drawer, List, ListItem, ListItemText, Toolbar, Box, Divider, Typography, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

const Sidebar = ({ history, onNavigate, onClearHistory }) => {
  const menuItems = [
    { label: 'Accounts', path: '/' },
    { label: 'Audience Manager', path: '/audience-manager' },
  ];

  const listItemStyle = {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      cursor: 'pointer'
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item, index) => (
            <ListItem 
              button 
              key={index} 
              onClick={() => onNavigate(item.path, item.label)}
              sx={listItemStyle}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
          <Typography variant="h6">
            History
          </Typography>
          <IconButton 
            color="secondary" 
            onClick={onClearHistory}
            sx={{ cursor: 'pointer' }}
          >
            <ClearIcon />
          </IconButton>
        </Box>
        <List>
          {history.map((item, index) => (
            <ListItem 
              button 
              key={index} 
              onClick={() => onNavigate(item.path, item.label)}
              sx={listItemStyle}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;