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
  Snackbar,
  Typography,
  Icon,
  LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAvailableFilterOptions } from '../../utils/AudienceFilterBuilder';
import { splitLandingPages, minifyLandingPages } from '../../utils/urlPatternUtils';
import { createAudience } from '../../Services/audienceService';
import { getCachedData } from '../../Services/dataService';
import conditionsData from '../../utils/conditions.json';
import { AudienceBuilderService } from '../../Services/audienceBuilderService';
import AudienceTemplateSelector from './AudienceTemplateSelector';

// Define this function at the top level, outside the component
const getPropertyNamePath = (propertyPath) => {
  if (!propertyPath) return null;
  
  const { properties: propertiesMap } = getCachedData();
  if (!propertiesMap) return null;
  
  const propertyId = propertyPath.split('/').pop();
  
  for (const accountProperties of Object.values(propertiesMap)) {
    if (!Array.isArray(accountProperties)) continue;
    
    const property = accountProperties.find(p => p?.name && p.name.endsWith(propertyId));
    if (property) {
      return 'properties/' + propertyId;
    }
  }
  
  // Return the original ID if we can't resolve it
  return 'properties/' + propertyId;
};

const AudienceForm = ({ audience = null, properties = [], onSubmit, darkMode }) => {
  // Create theme based on dark mode preference
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const [formData, setFormData] = useState({
    name: audience ? audience.name : '',
    displayName: audience ? audience.displayName : '',
    description: audience ? audience.description : '',
    propertyId: '',
    membershipLifeSpan: 30,
    conditions: audience?.conditions || [{ type: 'event', eventName: '', operator: 'equal', value: '' }],
    urlPatterns: audience?.urlPatterns || [''],  // Initialize with empty array or from audience
    generatedPatterns: audience?.generatedPatterns || [],  // Initialize empty array
    properties: properties.map(p => getPropertyNamePath(p))  // Add properties to formData
  });

  // New state to track if templates view is showing
  const [showTemplates, setShowTemplates] = useState(!audience);

  // Handler for template selection
  const handleTemplateSelect = (template) => {
    if (template) {
      // First ensure we have valid property paths
      const validProperties = properties.filter(Boolean).map(p => {
        const path = getPropertyNamePath(p);
        return path ? path : null;
      }).filter(Boolean);
      
      // Apply template data to form
      setFormData({
        ...formData,
        name: template.config.displayName,
        displayName: template.config.displayName, // Ensure displayName is set too
        description: template.config.description,
        membershipLifeSpan: template.config.membershipLifeSpan || 30,
        conditions: template.config.conditions || [],
        urlPatterns: template.config.urlPatterns || [''],
        generatedPatterns: template.config.generatedURLPatternRegex ? 
          [template.config.generatedURLPatternRegex] : [],
        properties: validProperties.length > 0 ? validProperties : []
      });
    } else {
      // Reset to default form for "create from scratch"
      setFormData({
        name: '',
        displayName: '',
        description: '',
        propertyId: '',
        membershipLifeSpan: 30,
        conditions: [{ type: 'event', eventName: '', operator: 'equal', value: '' }],
        urlPatterns: [''],
        generatedPatterns: [],
        properties: properties.filter(Boolean).map(p => getPropertyNamePath(p)).filter(Boolean)
      });
    }
    
    // Hide template selector after selection
    setShowTemplates(false);
  };

  // Return to template selection
  const handleReturnToTemplates = () => {
    setShowTemplates(true);
  };

  const [urlError, setUrlError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Add to your existing state declarations
  const [progress, setProgress] = useState({
    total: 0,
    current: 0,
    property: ''
  });

  const validateForm = () => {
    if (!formData.name) return false;
    if (!formData.urlPatterns.length) return false;
    if (!formData.conditions.length) return false;
    if (!formData.membershipLifeSpan) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // Check if we have multiple properties
      if (!formData.properties || formData.properties.length === 0) {
        throw new Error("No properties selected for audience creation");
      }

      const results = [];
      const propertiesToProcess = formData.properties.length;
      
      // Create progress tracking
      setProgress({
        total: propertiesToProcess,
        current: 0,
        property: ''
      });

      // Create the audience for each property
      for (let i = 0; i < formData.properties.length; i++) {
        const propertyPath = formData.properties[i];
        
        // Extract property ID from path
        const propertyId = propertyPath.includes('/') 
          ? propertyPath.split('/').pop() 
          : propertyPath;
        
        // Update progress
        setProgress(prev => ({
          ...prev,
          current: i + 1,
          property: propertyId
        }));

        // Create a modified formData for this specific property
        const propertyFormData = {
          ...formData,
          propertyId: propertyPath
        };

        // Create audience for this property
        const result = await AudienceBuilderService.buildAndCreateAudience(propertyFormData);
        results.push(result);
      }
      
      setSuccess(true);
      onSubmit(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Simplify handleConditionChange to only store the name
  const handleConditionChange = (index, value) => {
    const newConditions = [...formData.conditions];
    newConditions[index] = value;
    setFormData({ ...formData, conditions: newConditions });
  };

  // Update addCondition to only add the name
  const addCondition = () => {
    const firstConditionName = Object.keys(conditionsData)[0];
    setFormData({
      ...formData,
      conditions: [...formData.conditions, firstConditionName]
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
  
  // Add function to handle closing error messages
  const handleCloseError = () => {
    setError(null);
  };

  // Add function to handle closing success messages
  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  // Update the MultipleConditionsSelector component
  const MultipleConditionsSelector = () => (
    <Box sx={{ mb: 2 }}>
      {formData.conditions.map((conditionName, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, mt: 1 }}>
          <FormControl 
            fullWidth
            variant="outlined"
            sx={{ 
              mt: 1,  // Add top margin for the floating label
              '& .MuiInputLabel-root': {
                // Ensure label has proper spacing when floating
                transform: 'translate(14px, -6px) scale(0.75)'
              }
            }}
          >
            <InputLabel id={`condition-type-label-${index}`}>Condition Type</InputLabel>
            <Select
              labelId={`condition-type-label-${index}`}
              label="Condition Type"  // Important: adds space for the floating label
              value={conditionName}
              onChange={(e) => handleConditionChange(index, e.target.value)}
            >
              {Object.keys(conditionsData).map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {formData.conditions.length > 1 && (
            <IconButton 
              onClick={() => removeCondition(index)}
              sx={{ mt: 1 }}  // Align with the select input
            >
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
        sx={{ mt: 1 }}
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
          {showTemplates ? (
            <AudienceTemplateSelector onSelectTemplate={handleTemplateSelect} />
          ) : (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Audience Configuration</Typography>
                {!audience && (
                  <Button 
                    startIcon={<Icon>arrow_back</Icon>} 
                    onClick={handleReturnToTemplates}
                    variant="outlined"
                    size="small"
                  >
                    Back to Templates
                  </Button>
                )}
              </Box>
              
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
              {loading && progress.total > 0 && (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Typography variant="caption">
                    Creating audience for property {progress.current} of {progress.total}
                    {progress.property && `: ${progress.property}`}
                  </Typography>
                  <LinearProgress 
                    variant="determinate"
                    value={(progress.current / progress.total) * 100} 
                  />
                </Box>
              )}
            </>
          )}

          <Snackbar 
            open={!!error} 
            autoHideDuration={6000} 
            onClose={handleCloseError}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}

          >
            <Alert 
              severity="error" 
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={handleCloseError}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          </Snackbar>

          <Snackbar
            open={success}
            autoHideDuration={6000}
            onClose={handleCloseSuccess}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <Alert 
              severity="success"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={handleCloseSuccess}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              Audience successfully {audience ? 'updated' : 'created'}!
            </Alert>
          </Snackbar>
        </Box>
      </Paper>
    </ThemeProvider>
  );
};

export default AudienceForm;