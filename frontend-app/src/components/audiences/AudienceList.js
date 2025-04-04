import React, { useState, useEffect, useMemo } from 'react';
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
  LinearProgress,
  Checkbox,
  Tooltip,
  Divider,
  DialogContentText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { getCachedData } from '../../Services/dataService';

const AudienceList = ({ 
  audiences = [], 
  loading = false, 
  error = null,
  onEdit, 
  onDelete,
  onRefresh,
  properties
}) => {
  const [groupedAudiences, setGroupedAudiences] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    audience: null,
    isBatch: false,
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
  const [selectedAudiences, setSelectedAudiences] = useState([]);

  // Defensive property display name function
  const getPropertyDisplayName = useMemo(() => {
    const cachedData = getCachedData();
    const propertiesMap = cachedData?.properties || {};

    return (propertyPath) => {
      try {
        if (!propertyPath) return 'Unknown Property';

        const propertyId = propertyPath.split('/').pop();
        
        // Defensive check against empty or malformed propertiesMap
        if (!propertiesMap || Object.keys(propertiesMap).length === 0) {
          console.warn('Properties map is empty or undefined');
          return propertyId;
        }

        // Iterate through all accounts and their properties
        for (const [accountName, accountProperties] of Object.entries(propertiesMap)) {
          // Defensive check for each account's properties
          if (!Array.isArray(accountProperties)) {
            console.warn(`Invalid properties for account: ${accountName}`, accountProperties);
            continue;
          }

          // Find property that ends with the extracted ID
          const matchedProperty = accountProperties.find(p => 
            p?.name && p.name.endsWith(propertyId)
          );

          if (matchedProperty) {
            return matchedProperty.displayName || matchedProperty.name || propertyId;
          }
        }

        // Fallback if no match found
        console.warn(`No matching property found for path: ${propertyPath}`);
        return propertyId;
      } catch (error) {
        console.error('Error in getPropertyDisplayName:', error);
        return 'Error retrieving property name';
      }
    };
  }, []); // No dependencies to ensure stability

  // Prepare grouped audiences with extensive error handling
  const prepareGroupedAudiences = useMemo(() => {
    if (!audiences || audiences.length === 0) return {};

    const propertyNameResolver = getPropertyDisplayName;

    return audiences.reduce((acc, audience) => {
      try {
        // Defensive checks
        if (!audience || !audience.displayName) {
          console.warn('Invalid audience object', audience);
          return acc;
        }

        const key = audience.displayName;
        
        // Safely resolve property display name
        const propertyDisplayName = audience.propertyDisplayName || 
          (audience.sourceProperty 
            ? propertyNameResolver(audience.sourceProperty) 
            : 'Unknown Source');

        if (!acc[key]) {
          acc[key] = {
            ...audience,
            sources: [{
              path: audience.sourceProperty || 'unknown',
              displayName: propertyDisplayName
            }]
          };
        } else {
          acc[key].sources.push({
            path: audience.sourceProperty || 'unknown',
            displayName: propertyDisplayName
          });
        }
        return acc;
      } catch (error) {
        console.error('Error processing audience:', error);
        return acc;
      }
    }, {});
  }, [audiences, getPropertyDisplayName]);

  // Update grouped audiences with minimal state changes
  useEffect(() => {
    setGroupedAudiences(prevGrouped => {
      const newGrouped = prepareGroupedAudiences;
      
      // Only update if there's an actual change
      const hasChanged = JSON.stringify(prevGrouped) !== JSON.stringify(newGrouped);
      
      return hasChanged ? newGrouped : prevGrouped;
    });
  }, [prepareGroupedAudiences]);

  const handleDeleteClick = (audience) => {
    setDeleteDialog({
      open: true,
      audience,
      isBatch: false,
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
      isBatch: false,
      progress: { current: 0, total: 0, property: '' }
    });
    setDeleteStatus({ show: false, success: [], failed: [] });
  };

  const handleDeleteConfirm = async () => {
    const { audience } = deleteDialog;
    if (!audience) return;
  
    setDeleteStatus({ show: true, success: [], failed: [] });
  
    for (let i = 0; i < audience.sources.length; i++) {
      const source = audience.sources[i];
      const [accountName, propertyId] = source.path.split('/').slice(-2);
  
      setDeleteDialog(prev => ({
        ...prev,
        progress: {
          current: i + 1,
          total: audience.sources.length,
          property: source.displayName
        }
      }));
  
      try {
        await onDelete(propertyId, audience.name);
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
  
    if (onRefresh) {
      await onRefresh();
    }
  };

  const handleCloseDeletionMessage = () => {
    setDeleteStatus({
      show: false,
      success: [],
      failed: []
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedAudiences(Object.values(groupedAudiences).map(audience => audience.displayName));
    } else {
      setSelectedAudiences([]);
    }
  };

  const handleSelectAudience = (event, audienceName) => {
    if (event.target.checked) {
      setSelectedAudiences(prev => [...prev, audienceName]);
    } else {
      setSelectedAudiences(prev => prev.filter(name => name !== audienceName));
    }
  };

  const handleBatchDelete = () => {
    const selectedAudiencesToDelete = [...selectedAudiences]; 
    
    // Open confirmation dialog first
    setDeleteDialog({
      open: true,
      audience: null, // No specific audience - it's a batch
      isBatch: true, // Add this flag to identify batch operations
      progress: {
        current: 0,
        total: selectedAudiencesToDelete.length,
        property: ''
      }
    });
    
    // Don't set deleteStatus.show yet - wait for confirmation
    setDeleteStatus({ 
      show: false, 
      success: [], 
      failed: [] 
    });
  };

  // Add a new handler for batch delete confirmation
  const handleBatchDeleteConfirm = async () => {
    const selectedAudiencesToDelete = [...selectedAudiences];
    
    // Now show the progress indicators
    setDeleteStatus({ 
      show: true, 
      success: [], 
      failed: [] 
    });
    
    let successCount = 0;
    let failedCount = 0;
    
    // Process each audience
    for (let i = 0; i < selectedAudiencesToDelete.length; i++) {
      const audienceName = selectedAudiencesToDelete[i];
      const audience = groupedAudiences[audienceName];
      
      if (!audience) continue;
      
      // Update progress for current audience
      setDeleteDialog(prev => ({
        ...prev,
        progress: {
          current: i + 1,
          total: selectedAudiencesToDelete.length,
          property: audience.displayName
        }
      }));
      
      // Delete from all sources
      for (let j = 0; j < audience.sources.length; j++) {
        const source = audience.sources[j];
        const [accountName, propertyId] = source.path.split('/').slice(-2);
        
        try {
          await onDelete(propertyId, audience.name);
          setDeleteStatus(prev => ({
            ...prev,
            success: [...prev.success, `${audience.displayName} (${source.displayName})`]
          }));
          successCount++;
        } catch (error) {
          setDeleteStatus(prev => ({
            ...prev,
            failed: [...prev.failed, `${audience.displayName} (${source.displayName})`]
          }));
          failedCount++;
        }
      }
    }
    
    // Only refresh after all deletions are complete
    if (onRefresh) {
      await onRefresh();
    }
    
    // Clear selections but keep dialog open to show results
    setSelectedAudiences([]);
  };

  const renderDeleteDialog = () => (
    <Dialog
      open={deleteDialog.open}
      onClose={handleDeleteClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {deleteDialog.isBatch
          ? `Delete ${selectedAudiences.length} Audiences`
          : `Delete Audience: ${deleteDialog.audience?.displayName}`}
      </DialogTitle>
      <DialogContent>
        {!deleteStatus.show ? (
          <DialogContentText>
            {deleteDialog.isBatch 
              ? `Are you sure you want to delete ${selectedAudiences.length} audiences? This action cannot be undone.`
              : `Are you sure you want to delete this audience? This action cannot be undone.`}
          </DialogContentText>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {deleteDialog.isBatch
                  ? `Processing audience ${deleteDialog.progress.current} of ${deleteDialog.progress.total}`
                  : `Deleting from: ${deleteDialog.progress.property}`}
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
              <Alert 
                severity="success" 
                sx={{ mb: 1 }}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={handleCloseDeletionMessage}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                Successfully deleted: {deleteStatus.success.length} items
              </Alert>
            )}
            
            {deleteStatus.failed.length > 0 && (
              <Alert 
                severity="error" 
                sx={{ mb: 1 }}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={handleCloseDeletionMessage}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                Failed to delete: {deleteStatus.failed.length} items
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
              onClick={deleteDialog.isBatch ? handleBatchDeleteConfirm : handleDeleteConfirm} 
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
        No audiences found for the selected properties.
      </Typography>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Checkbox
          indeterminate={selectedAudiences.length > 0 && selectedAudiences.length < Object.keys(groupedAudiences).length}
          checked={selectedAudiences.length === Object.keys(groupedAudiences).length}
          onChange={handleSelectAll}
        />
        <Button
          variant="contained"
          color="error"
          onClick={handleBatchDelete}
          disabled={selectedAudiences.length === 0}
        >
          Delete Selected
        </Button>
      </Box>
      <List>
        {Object.values(groupedAudiences).map((audience) => (
          <ListItem key={audience.displayName} divider>
            <Checkbox
              checked={selectedAudiences.includes(audience.displayName)}
              onChange={(event) => handleSelectAudience(event, audience.displayName)}
            />
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

export default AudienceList;