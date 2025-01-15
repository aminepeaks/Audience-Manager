import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import { fetchAllAccountsAndProperties, getCachedData } from '../Services/dataService'

const AudienceManager = () => {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [propertiesMap, setPropertiesMap] = useState({});
  const [selectedProperties, setSelectedProperties] = useState([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check for cached data first
        const cachedData = getCachedData();
        if (cachedData.accounts && cachedData.properties) {
          setAccounts(cachedData.accounts);
          setPropertiesMap(cachedData.properties);
          setLoading(false);
          // Fetch fresh data in background
          fetchAllAccountsAndProperties();
          return;
        }

        // If no cache, fetch fresh data
        const data = await fetchAllAccountsAndProperties();
        console.log('data',data);
        setAccounts(data.accounts);
        setPropertiesMap(data.properties);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleAccountChange = (event) => {
    const selectedAccountIds = event.target.value;
    setSelectedAccounts(selectedAccountIds);
    // Don't need to fetch properties anymore as we already have them
    setSelectedProperties([]); 
  };
  const handlePropertyChange = (event) => {
    setSelectedProperties(event.target.value);
  };

  const getFilteredProperties = () => {
    return Object.entries(propertiesMap)
      .filter(([accountId]) => selectedAccounts.includes(accountId))
      .reduce((acc, [accountId, properties]) => {
        acc[accountId] = properties;
        return acc;
      }, {});
  };

  // Update handleSelectAllProperties to only select properties from selected accounts
  const handleSelectAllProperties = () => {
    const filteredProperties = Object.entries(propertiesMap)
      .filter(([accountId]) => selectedAccounts.includes(accountId))
      .flatMap(([_, properties]) => properties.map(property => property.name));
    setSelectedProperties(filteredProperties);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Audience Manager
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Account Selection */}
          <FormControl fullWidth>
            <InputLabel>Select Accounts</InputLabel>
            <Select
              multiple
              value={selectedAccounts}
              onChange={handleAccountChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const account = accounts.find(acc => acc.name === value);
                    return (
                      <Chip 
                        key={value} 
                        label={account ? account.displayName : value} 
                      />
                    );
                  })}
                </Box>
              )}
            >
              {accounts.map((account) => (
                <MenuItem key={account.name} value={account.name}>
                  <Checkbox checked={selectedAccounts.indexOf(account.name) > -1} />
                  <ListItemText primary={account.displayName} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Property Selection */}
          {selectedAccounts.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Select Properties</Typography>
                <Button onClick={handleSelectAllProperties}>
                  Select All Properties
                </Button>
              </Box>
              
              <FormControl fullWidth>
                <Select
                  multiple
                  value={selectedProperties}
                  onChange={handlePropertyChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const property = Object.values(propertiesMap)
                          .flat()
                          .find(prop => prop.name === value);
                        return (
                          <Chip 
                            key={value} 
                            label={property ? property.displayName : value} 
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {Object.entries(getFilteredProperties()).map(([accountId, properties]) => (
                    <Box key={accountId}>
                      <Typography variant="subtitle2" sx={{ p: 1, bgcolor: 'grey.100' }}>
                        {accounts.find(acc => acc.name === accountId)?.displayName}
                      </Typography>
                      {properties.map((property) => (
                        <MenuItem key={property.name} value={property.name}>
                          <Checkbox checked={selectedProperties.indexOf(property.name) > -1} />
                          <ListItemText primary={property.displayName} />
                        </MenuItem>
                      ))}
                    </Box>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default AudienceManager;