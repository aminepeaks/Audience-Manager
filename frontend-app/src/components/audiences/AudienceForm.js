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
import React, { useState, useEffect, useRef } from 'react';


const AudienceForm = ({ audience, properties, onSubmit }) => {
  const [formData, setFormData] = React.useState({
    name: audience?.name || '',
    description: audience?.description || '',
    filter: audience?.filter || '',
    membershipLifeSpan: audience?.membershipLifeSpan || '30',
    properties: audience?.properties || properties
  });

   const [selectedCondition, setSelectedCondition] = useState('');
      const [urlPatterns, setUrlPatterns] = useState(['']);
      const [audienceName, setAudienceName] = useState('');
      const [membershipDurationDays, setMembershipDurationDays] = useState(30);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  const handleConditionChange = (event) => {
    setSelectedCondition(event.target.value);
};

const handleUrlPatternChange = (index, value) => {
    const newPatterns = [...urlPatterns];
    newPatterns[index] = value;
    setUrlPatterns(newPatterns);
};

const ConditionSelector = () => (
    <FormControl fullWidth margin="normal">
        <InputLabel>Condition Type</InputLabel>
        <Select
            value={selectedCondition}
            onChange={handleConditionChange}
        >
            {getAvailableFilterOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
);

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
        <ConditionSelector />
        <UrlPatternInput />
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
