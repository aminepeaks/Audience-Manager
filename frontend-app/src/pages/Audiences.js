// src/pages/Audiences.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const Audiences = () => {
  const { accountName, propertyId } = useParams();
  const [audiences, setAudiences] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState([propertyId]);
  const [properties, setProperties] = useState([]);
  const [newAudience, setNewAudience] = useState({
    name: '',
    description: '',
    filter: '',
    membershipLifeSpan: '30'
  });

  // Fetch audiences
  useEffect(() => {
    fetchAudiences();
    fetchProperties();
  }, [accountName, propertyId]);

  const fetchAudiences = async () => {
    console.log('fetchAudiences',accountName);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/accounts/${accountName}/properties/${propertyId}/audiences`);
      setAudiences(response.data);
    } catch (error) {
      console.error('Error fetching audiences:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/accounts/${accountName}/properties`);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleCreateAudience = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/accounts/${accountName}/audiences`, {
        audienceDefinition: newAudience,
        selectedProperties: selectedProperties
      });
      setOpenDialog(false);
      fetchAudiences();
      setNewAudience({
        name: '',
        description: '',
        filter: '',
        membershipLifeSpan: '30'
      });
    } catch (error) {
      console.error('Error creating audience:', error);
    }
  };

  const handleDeleteAudience = async (audienceId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/accounts/${accountName}/audiences/${audienceId}`);
      fetchAudiences();
    } catch (error) {
      console.error('Error deleting audience:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Manage Audiences</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Create Audience
        </Button>
      </Box>

      <List>
        {audiences.map((audience) => (
          <ListItem key={audience.name} divider>
            <ListItemText 
              primary={audience.displayName}
              secondary={audience.description}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleDeleteAudience(audience.name.split('/').pop())}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Audience</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={newAudience.name}
              onChange={(e) => setNewAudience({ ...newAudience, name: e.target.value })}
            />
            <TextField
              label="Description"
              multiline
              rows={2}
              value={newAudience.description}
              onChange={(e) => setNewAudience({ ...newAudience, description: e.target.value })}
            />
            <TextField
              label="Filter Expression"
              multiline
              rows={3}
              value={newAudience.filter}
              onChange={(e) => setNewAudience({ ...newAudience, filter: e.target.value })}
            />
            <TextField
              label="Membership Lifespan (days)"
              type="number"
              value={newAudience.membershipLifeSpan}
              onChange={(e) => setNewAudience({ ...newAudience, membershipLifeSpan: e.target.value })}
            />
            <FormControl>
              <InputLabel>Target Properties</InputLabel>
              <Select
                multiple
                value={selectedProperties}
                onChange={(e) => setSelectedProperties(e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {properties.map((property) => (
                  <MenuItem key={property.name} value={property.name}>
                    {property.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAudience} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Audiences;