import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  FormHelperText,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AudienceFilterBuilder from '../utils/AudienceFilterBuilder';

const steps = ['Select Accounts', 'Select Properties', 'Create Audience'];

const AudienceManager = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [properties, setProperties] = useState({});
  const [audienceData, setAudienceData] = useState({
    name: '',
    description: '',
    membershipDurationDays: 540, // Default from audiences.json
    adsPersonalizationEnabled: true, // Common setting from audiences.json
    filterClauses: [], // Structured filter clauses
    exclusionDurationMode: 'AUDIENCE_EXCLUSION_DURATION_MODE_UNSPECIFIED'
  });
  const navigate = useNavigate();

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAccountSelection = (event) => {
    setSelectedAccounts(event.target.value);
    setSelectedProperties([]); // Reset properties when accounts change
  };

  const handlePropertySelection = (event) => {
    setSelectedProperties(event.target.value);
  };

  const handleAudienceDataChange = (field) => (event) => {
    setAudienceData({
      ...audienceData,
      [field]: event.target.value
    });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <FormControl fullWidth>
            <InputLabel>Select Accounts</InputLabel>
            <Select
              multiple
              value={selectedAccounts}
              onChange={handleAccountSelection}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.displayName}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select one or multiple accounts</FormHelperText>
          </FormControl>
        );

      case 1:
        return (
          <FormControl fullWidth>
            <InputLabel>Select Properties</InputLabel>
            <Select
              multiple
              value={selectedProperties}
              onChange={handlePropertySelection}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={properties[value]?.displayName || value} />
                  ))}
                </Box>
              )}
            >
              {selectedAccounts.map((accountId) => 
                properties[accountId]?.map((property) => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.displayName}
                  </MenuItem>
                ))
              )}
            </Select>
            <FormHelperText>Select one or multiple properties</FormHelperText>
          </FormControl>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Audience Name"
                value={audienceData.name}
                onChange={handleAudienceDataChange('name')}
                required
                helperText="Example: All Users, Purchasers, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={audienceData.description}
                onChange={handleAudienceDataChange('description')}
                multiline
                rows={2}
                helperText="Example: Users who have purchased in the last 540 days"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Membership Duration (days)"
                value={audienceData.membershipDurationDays}
                onChange={handleAudienceDataChange('membershipDurationDays')}
                required
                helperText="Recommended: 540 days for long-term analysis"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Ads Personalization</InputLabel>
                <Select
                  value={audienceData.adsPersonalizationEnabled}
                  onChange={handleAudienceDataChange('adsPersonalizationEnabled')}
                >
                  <MenuItem value={true}>Enabled</MenuItem>
                  <MenuItem value={false}>Disabled</MenuItem>
                </Select>
                <FormHelperText>Enable personalized advertising for this audience</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Exclusion Duration Mode</InputLabel>
                <Select
                  value={audienceData.exclusionDurationMode}
                  onChange={handleAudienceDataChange('exclusionDurationMode')}
                >
                  <MenuItem value="AUDIENCE_EXCLUSION_DURATION_MODE_UNSPECIFIED">Default</MenuItem>
                  <MenuItem value="PERMANENT">Permanent</MenuItem>
                  <MenuItem value="TEMPORARY">Temporary</MenuItem>
                </Select>
                <FormHelperText>How long users should be excluded from this audience</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  const handleSubmit = async () => {
    try {
      const audienceFilter = new AudienceFilterBuilder()
        .addUrlPattern(['/produkte/sonnenschutz', '/produkte/uv-gesicht-anti-age-sonnenschutz-q10-40059004815970001\\.html', '/produkte/sonnenschutz/sonnenpflege/sonnencreme-gesicht'])
        .addEvent('buy_now_retailer')
        .build('6292114300', audienceData.name, audienceData.membershipDurationDays);

      console.log('Submitting:', {
        accounts: selectedAccounts,
        properties: selectedProperties,
        audienceData: audienceFilter
      });
      navigate('/audiences');
    } catch (error) {
      console.error('Error creating audience:', error);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New Audience
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4, mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!audienceData.name || !selectedProperties.length}
            >
              Create Audience
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && !selectedAccounts.length) ||
                (activeStep === 1 && !selectedProperties.length)
              }
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AudienceManager;
