import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  useTheme,
  ThemeProvider,
  createTheme,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAvailableFilterOptions } from '../../utils/AudienceFilterBuilder';
import { splitLandingPages, minifyLandingPages } from '../../utils/urlPatternUtils';
import { createAudience } from '../../Services/audienceService';
import { getCachedData } from '../../Services/dataService';
import conditionsData from '../../utils/conditions.json';

const AudienceForm = ({ audience, properties, onSubmit, darkMode }) => {
  // Create theme based on dark mode preference
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const [formData, setFormData] = useState({
    name: audience?.name || '',
    description: audience?.description || '',
    filter: audience?.filter || '',
    membershipLifeSpan: audience?.membershipLifeSpan || '30',
    properties: audience?.properties || properties,
    conditions: audience?.conditions || [{ 
      name: Object.keys(conditionsData)[0],
      key: conditionsData[Object.keys(conditionsData)[0]]
    }],
    urlPatterns: audience?.urlPatterns || [''],
    generatedPatterns: []
  });

  const [urlError, setUrlError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!formData.name) return false;
    if (!formData.urlPatterns.length) return false;
    if (!formData.conditions.length) return false;
    if (!formData.membershipLifeSpan) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      var propertiesList = [];
      for (var i = 0; i < formData.properties.length; i++) {
        propertiesList.push(getPropertyNamePath(formData.properties[i]));
      }
      formData.properties = propertiesList;
      
      const result = await createAudience(formData);
      setSuccess(true);
      onSubmit(result);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConditionChange = (index, field, value) => {
    const newConditions = [...formData.conditions];
    
    if (field === 'name') {
      // When name changes, update both name and key
      newConditions[index] = {
        name: value,
        key: conditionsData[value]
      };
    } else {
      // For other fields
      newConditions[index] = { 
        ...newConditions[index], 
        [field]: value 
      };
    }
    
    setFormData({ ...formData, conditions: newConditions });
  };

  const addCondition = () => {
    const firstConditionName = Object.keys(conditionsData)[0];
    setFormData({
      ...formData,
      conditions: [...formData.conditions, {
        name: firstConditionName,
        key: conditionsData[firstConditionName]
      }]
    });
  };

  const removeCondition = (index) => {
    const newConditions = formData.conditions.filter((_, i) => i !== index);
    setFormData({ ...formData, conditions: newConditions });
  };

  const addUrlPattern = () => {
    setFormData({
      ...formData,
      urlPatterns: [...formData.urlPatterns, '']
    });
  };

  const removeUrlPattern = (index) => {
    const newPatterns = formData.urlPatterns.filter((_, i) => i !== index);
    setFormData({ ...formData, urlPatterns: newPatterns });
  };

  const handleUrlPatternChange = (index, value) => {
    const newPatterns = [...formData.urlPatterns];
    newPatterns[index] = value;
    
    setFormData({ ...formData, urlPatterns: newPatterns });
  };

  const handleGeneratePatterns = () => {
    try {
      const validUrls = formData.urlPatterns.filter(url => url.trim() !== '');
      const splitUrls = splitLandingPages(validUrls);
      const regexPatterns = minifyLandingPages(splitUrls);
      
      setFormData(prev => ({
        ...prev,
        generatedPatterns: regexPatterns
      }));      
      setUrlError(false);
    } catch (error) {
      setUrlError(true);
      console.error('Error generating patterns:', error);
    }
  };
    const getPropertyNamePath = (propertyPath) => {
      const { properties: propertiesMap } = getCachedData();
      const propertyId = propertyPath.split('/').pop();
      
      for (const accountProperties of Object.values(propertiesMap)) {
        const property = accountProperties.find(p => p.name.endsWith(propertyId));
        if (property) {
          return 'properties/' + propertyId;
        }
      }
    };
  

  const MultipleConditionsSelector = () => (
    <Box sx={{ mb: 2 }}>
      {formData.conditions.map((condition, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Condition Type</InputLabel>
            <Select
              value={condition.name}
              onChange={(e) => handleConditionChange(index, 'name', e.target.value)}
            >
              {Object.keys(conditionsData).map((conditionName) => (
                <MenuItem key={conditionName} value={conditionName}>
                  {conditionName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {formData.conditions.length > 1 && (
            <IconButton onClick={() => removeCondition(index)}>
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={addCondition}
        variant="outlined"
        size="small"
      >
        Add Condition
      </Button>
    </Box>
  );

  const UrlPatternInput = () => (
    <Box sx={{ mb: 2 }}>
      {formData.urlPatterns.map((pattern, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            fullWidth
            label={`URL Pattern ${index + 1}`}
            value={pattern}
            onChange={(e) => handleUrlPatternChange(index, e.target.value)}
            error={urlError}
            helperText={urlError ? 'Invalid URL format' : ''}
          />
          {formData.urlPatterns.length > 1 && (
            <IconButton onClick={() => removeUrlPattern(index)}>
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={addUrlPattern}
          variant="outlined"
          size="small"
        >
          Add URL Pattern
        </Button>
        <Button
          onClick={handleGeneratePatterns}
          variant="contained"
          size="small"
        >
          Generate Regex Patterns
        </Button>
      </Box>
      {formData.generatedPatterns.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Generated Regex Patterns"
            multiline
            rows={4}
            value={formData.generatedPatterns.join('\n')}
            InputProps={{
              readOnly: true,
            }}
          />
        </Box>
      )}
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
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
          <MultipleConditionsSelector />
          <UrlPatternInput />
          <TextField
            fullWidth
            label="Membership Lifespan (days)"
            type="number"
            value={formData.membershipLifeSpan}
            onChange={(e) => setFormData({ ...formData, membershipLifeSpan: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Button 
            type="submit" 
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : audience ? 'Update' : 'Create'} Audience
          </Button>

          <Snackbar 
            open={!!error} 
            autoHideDuration={6000} 
            onClose={() => setError(null)}
          >
            <Alert severity="error">{error}</Alert>
          </Snackbar>

          <Snackbar
            open={success}
            autoHideDuration={6000}
            onClose={() => setSuccess(false)}
          >
            <Alert severity="success">
              Audience successfully {audience ? 'updated' : 'created'}!
            </Alert>
          </Snackbar>
        </Box>
      </Paper>
    </ThemeProvider>
  );
};

export default AudienceForm;