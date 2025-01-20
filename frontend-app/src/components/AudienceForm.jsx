import React from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Typography,
  Switch,
  FormControlLabel
} from '@mui/material';

const AudienceForm = ({ audience, properties, onSubmit }) => {
  const [formData, setFormData] = React.useState({
    displayName: audience?.displayName || '',
    description: audience?.description || '',
    membershipDurationDays: audience?.membershipDurationDays || 60,
    adsPersonalizationEnabled: audience?.adsPersonalizationEnabled || true,
    filterScope: 'AUDIENCE_FILTER_SCOPE_WITHIN_SAME_SESSION',
    urlPatterns: audience?.urlPatterns || '',
    eventName: audience?.eventName || '',
    exclusionDurationMode: audience?.exclusionDurationMode || 'AUDIENCE_EXCLUSION_DURATION_MODE_UNSPECIFIED'
  });

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build the audience filter structure based on audiences.json pattern
    const audienceDefinition = {
      filterClauses: [{
        clauseType: "INCLUDE",
        simpleFilter: {
          scope: formData.filterScope,
          filterExpression: {
            andGroup: {
              filterExpressions: []
            }
          }
        }
      }],
      displayName: formData.displayName,
      description: formData.description,
      membershipDurationDays: parseInt(formData.membershipDurationDays),
      adsPersonalizationEnabled: formData.adsPersonalizationEnabled,
      exclusionDurationMode: formData.exclusionDurationMode,
      eventTrigger: null
    };

    // Add URL patterns if specified
    if (formData.urlPatterns) {
      const urlPatterns = formData.urlPatterns.split('\n').filter(p => p.trim());
      if (urlPatterns.length) {
        audienceDefinition.filterClauses[0].simpleFilter.filterExpression.andGroup.filterExpressions.push({
          orGroup: {
            filterExpressions: urlPatterns.map(pattern => ({
              dimensionOrMetricFilter: {
                fieldName: "landingPagePlusQueryString",
                atAnyPointInTime: true,
                inAnyNDayPeriod: 0,
                stringFilter: {
                  matchType: "FULL_REGEXP",
                  value: pattern,
                  caseSensitive: false
                },
                oneFilter: "stringFilter"
              },
              expr: "dimensionOrMetricFilter"
            }))
          },
          expr: "orGroup"
        });
      }
    }

    // Add event filter if specified
    if (formData.eventName) {
      audienceDefinition.filterClauses[0].simpleFilter.filterExpression.andGroup.filterExpressions.push({
        orGroup: {
          filterExpressions: [{
            eventFilter: {
              eventName: formData.eventName,
              eventParameterFilterExpression: null
            },
            expr: "eventFilter"
          }]
        },
        expr: "orGroup"
      });
    }

    onSubmit(audienceDefinition);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Display Name"
              value={formData.displayName}
              onChange={handleChange('displayName')}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="URL Patterns (one per line)"
              value={formData.urlPatterns}
              onChange={handleChange('urlPatterns')}
              multiline
              rows={4}
              helperText="Use regular expressions, one pattern per line"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Event Name"
              value={formData.eventName}
              onChange={handleChange('eventName')}
              helperText="Optional event to track"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Membership Duration (days)"
              value={formData.membershipDurationDays}
              onChange={handleChange('membershipDurationDays')}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Filter Scope</InputLabel>
              <Select
                value={formData.filterScope}
                onChange={handleChange('filterScope')}
                label="Filter Scope"
              >
                <MenuItem value="AUDIENCE_FILTER_SCOPE_WITHIN_SAME_SESSION">Within Same Session</MenuItem>
                <MenuItem value="AUDIENCE_FILTER_SCOPE_ACROSS_ALL_SESSIONS">Across All Sessions</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.adsPersonalizationEnabled}
                  onChange={(e) => setFormData({...formData, adsPersonalizationEnabled: e.target.checked})}
                />
              }
              label="Enable Ads Personalization"
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {audience ? 'Update Audience' : 'Create Audience'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default AudienceForm;
