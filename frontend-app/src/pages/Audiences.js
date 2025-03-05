// frontend-app/src/components/Audiences.js
import React, { useEffect, useState } from 'react';
import { useAudiences } from '../hooks/useAudiences';
import { useStore } from '../state/store';
import AudienceList from '../components/audiences/AudienceList';
import { Box, Button, Typography, Dialog } from '@mui/material';
import AudienceForm from '../components/audiences/AudienceForm';

const Audiences = ({ accountName, propertyId }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { loading, error, audiences, fetchAudiences } = useAudiences(propertyId);
  const { properties } = useStore();

  useEffect(() => {
    if (propertyId) {
      fetchAudiences();
    }
  }, [propertyId, fetchAudiences]);

  const handleCreateAudience = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmitAudience = async (newAudience) => {
    setOpenDialog(false);
    await fetchAudiences(); // Refresh list after creating
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Audiences</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleCreateAudience}
          disabled={!propertyId}
        >
          Create Audience
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error loading audiences: {error}
        </Typography>
      )}

      <AudienceList 
        audiences={audiences} 
        loading={loading} 
        onRefresh={fetchAudiences}
        propertyId={propertyId}
      />

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <AudienceForm
          properties={properties}
          onSubmit={handleSubmitAudience}
          onCancel={handleCloseDialog}
        />
      </Dialog>
    </Box>
  );
};

export default Audiences;