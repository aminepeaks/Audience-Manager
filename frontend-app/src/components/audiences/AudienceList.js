import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  LinearProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { fetchAudiencesForProperty, deleteAudience } from '../../Services/audienceService';
import { getCachedData } from '../../Services/dataService';

const AudienceList = ({ properties, onEdit }, ref) => {
  const [loading, setLoading] = useState(false);
  const [groupedAudiences, setGroupedAudiences] = useState({});
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    audience: null,
    progress: {
      current: 0,
      total: 0,
      property: ''
    }
  });
  const [deleteStatus, setDeleteStatus] = useState({
    show: false,
    success: [],
    failed: []
  });

  const getPropertyDisplayName = (propertyPath) => {
    const { properties: propertiesMap } = getCachedData();
    const propertyId = propertyPath.split('/').pop();
    
    // Search through all properties in the cache to find matching display name
    for (const accountProperties of Object.values(propertiesMap)) {
      const property = accountProperties.find(p => p.name.endsWith(propertyId));
      if (property) {
        return property.displayName;
      }
    }
    return propertyPath.split('/').pop(); // Fallback to ID if display name not found
  };

  const fetchAllAudiences = async () => {
    if (!properties || properties.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const audiencesPromises = properties.map(property => {
        const [accountName, propertyId] = property.split('/').slice(-2);
        return fetchAudiencesForProperty(accountName, propertyId)
          .then(audiences => audiences.map(audience => ({
            ...audience,
            sourceProperty: property,
            propertyDisplayName: getPropertyDisplayName(property)
          })));
      });

      const allAudiences = await Promise.all(audiencesPromises);
      const flatAudiences = allAudiences.flat();

      const grouped = flatAudiences.reduce((acc, audience) => {
        const key = audience.displayName;
        if (!acc[key]) {
          acc[key] = {
            ...audience,
            sources: [{
              path: audience.sourceProperty,
              displayName: audience.propertyDisplayName
            }]
          };
        } else {
          acc[key].sources.push({
            path: audience.sourceProperty,
            displayName: audience.propertyDisplayName
          });
        }
        return acc;
      }, {});

      setGroupedAudiences(grouped);
    } catch (error) {
      console.error('Error fetching audiences:', error);
      setError('Failed to fetch audiences');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (audience) => {
    setDeleteDialog({
      open: true,
      audience,
      progress: {
        current: 0,
        total: audience.sources.length,
        property: ''
      }
    });
  };

  const handleDeleteClose = () => {
    setDeleteDialog({
      open: false,
      audience: null,
      progress: { current: 0, total: 0, property: '' }
    });
    setDeleteStatus({ show: false, success: [], failed: [] });
  };

  const handleDeleteConfirm = async () => {
    const { audience } = deleteDialog;
    setDeleteStatus({ show: true, success: [], failed: [] });
    
    for (let i = 0; i < audience.sources.length; i++) {
      const source = audience.sources[i];
      const [accountName, propertyId] = source.path.split('/').slice(-2);
      console.log('Deleting audience:', audience.name, 'from property:', propertyId);
      
      setDeleteDialog(prev => ({
        ...prev,
        progress: {
          current: i + 1,
          total: audience.sources.length,
          property: source.displayName
        }
      }));

      try {
        await deleteAudience(propertyId, audience.name);
        setDeleteStatus(prev => ({
          ...prev,
          success: [...prev.success, source.displayName]
        }));
      } catch (error) {
        setDeleteStatus(prev => ({
          ...prev,
          failed: [...prev.failed, source.displayName]
        }));
      }
    }

    // After all deletions, refresh the audience list
    await fetchAllAudiences();
  };

  const renderDeleteDialog = () => (
    <Dialog
      open={deleteDialog.open}
      onClose={handleDeleteClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Delete Audience: {deleteDialog.audience?.displayName}
      </DialogTitle>
      <DialogContent>
        {!deleteStatus.show ? (
          <Typography>
            Are you sure you want to delete this audience from all selected properties?
            This action cannot be undone.
          </Typography>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Deleting from: {deleteDialog.progress.property}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(deleteDialog.progress.current / deleteDialog.progress.total) * 100} 
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Progress: {deleteDialog.progress.current} of {deleteDialog.progress.total}
              </Typography>
            </Box>
            
            {deleteStatus.success.length > 0 && (
              <Alert severity="success" sx={{ mb: 1 }}>
                Successfully deleted from: {deleteStatus.success.join(', ')}
              </Alert>
            )}
            
            {deleteStatus.failed.length > 0 && (
              <Alert severity="error" sx={{ mb: 1 }}>
                Failed to delete from: {deleteStatus.failed.join(', ')}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!deleteStatus.show && (
          <>
            <Button onClick={handleDeleteClose}>Cancel</Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
            >
              Delete
            </Button>
          </>
        )}
        {deleteStatus.show && deleteDialog.progress.current === deleteDialog.progress.total && (
          <Button onClick={handleDeleteClose}>Close</Button>
        )}
      </DialogActions>
    </Dialog>
  );

  useImperativeHandle(ref, () => ({
    fetchAudiences: fetchAllAudiences
  }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        {error}
      </Typography>
    );
  }

  if (Object.keys(groupedAudiences).length === 0) {
    return (
      <Typography sx={{ p: 2 }}>
        Click the refresh button to load audiences for the selected properties
      </Typography>
    );
  }

  return (
    <>
      <List>
        {Object.values(groupedAudiences).map((audience) => (
          <ListItem
            key={audience.displayName}
            divider
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemText
              primary={audience.displayName}
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {audience.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {audience.sources.map((source) => (
                      <Chip
                        key={source.path}
                        label={source.displayName}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => onEdit(audience)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDeleteClick(audience)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {renderDeleteDialog()}
    </>
  );
};

export default forwardRef(AudienceList);