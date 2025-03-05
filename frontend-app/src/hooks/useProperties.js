import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../state/store';
import { DataService } from '../Services/dataService';

export const useProperties = (selectedAccounts = []) => {
  const { setProperties: setGlobalProperties, setLoading, setError } = useStore();
  const [properties, setProperties] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const fetchProperties = useCallback(async () => {
    if (!selectedAccounts || selectedAccounts.length === 0) {
      setProperties({});
      return;
    }

    try {
      setLocalLoading(true);
      setLoading(true);
      
      // First check if we already have cached data
      const cachedData = DataService.getCachedData();
      
      // If we have complete cache data, just filter it
      if (cachedData.accounts && Object.keys(cachedData.properties).length > 0) {
        console.log("Using cached properties data");
        const filteredProperties = DataService.getFilteredProperties(selectedAccounts);
        setProperties(filteredProperties);
        setGlobalProperties(filteredProperties);
      } else {
        // Otherwise fetch the data
        console.log("Fetching all accounts and properties");
        const { properties: allProperties } = await DataService.fetchAllAccountsAndProperties();
        
        const filteredProperties = Object.fromEntries(
          Object.entries(allProperties).filter(([accountId]) => 
            selectedAccounts.includes(accountId)
          )
        );
        
        setProperties(filteredProperties);
        setGlobalProperties(filteredProperties);
      }
      
      setLocalError(null);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setLocalError(error.message);
      setError(error.message);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  }, [selectedAccounts, setGlobalProperties, setLoading, setError]);

  // Fetch properties when selected accounts change
  useEffect(() => {
    fetchProperties();
  }, [selectedAccounts, fetchProperties]);

  return {
    properties,
    loading: localLoading,
    error: localError,
    fetchProperties
  };
};