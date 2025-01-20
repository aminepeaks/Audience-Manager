import React from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';

const AudienceForm = ({ audience, properties, onSubmit }) => {
  const [formData, setFormData] = React.useState({
    name: audience?.name || '',
    description: audience?.description || '',
    filter: audience?.filter || '',
    membershipLifeSpan: audience?.membershipLifeSpan || '30',
    properties: audience?.properties || properties
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={2}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Filter Expression"
          multiline
          rows={3}
          value={formData.filter}
          onChange={(e) => setFormData({ ...formData, filter: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Membership Lifespan (days)"
          type="number"
          value={formData.membershipLifeSpan}
          onChange={(e) => setFormData({ ...formData, membershipLifeSpan: e.target.value })}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained">
          {audience ? 'Update' : 'Create'} Audience
        </Button>
      </Box>
    </Paper>
  );
};

export default AudienceForm;
