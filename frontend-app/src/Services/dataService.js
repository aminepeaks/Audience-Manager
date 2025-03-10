import axios from 'axios';

// Initialize cache from localStorage or set to default values
const loadFromStorage = () => {
  try {
    const cachedData = localStorage.getItem('ga4_audience_cache');
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      accountsCache = parsedData.accounts;
      propertiesCache = parsedData.properties || {};
      return true;
    }
  } catch (error) {
    console.error('Error loading cache from localStorage:', error);
  }
  return false;
};

// Save cache to localStorage
const saveToStorage = () => {
  try {
    localStorage.setItem('ga4_audience_cache', JSON.stringify({
      accounts: accountsCache,
      properties: propertiesCache,
      timestamp: new Date().getTime()
    }));
  } catch (error) {
    console.error('Error saving cache to localStorage:', error);
  }
};

// Cache variables with persistence
let accountsCache = null;
let propertiesCache = {};
let isFetching = false;

// Load cache from localStorage on module initialization
loadFromStorage();

export class DataService {
  static async fetchAllAccountsAndProperties() {
    // Check if data is already cached before making API calls
    if (accountsCache && Object.keys(propertiesCache).length > 0) {
      return { accounts: accountsCache, properties: propertiesCache };
    }
    
    if (isFetching) return { accounts: accountsCache, properties: propertiesCache };
    isFetching = true;

    try {
      const accountsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/accounts`);
      accountsCache = accountsResponse.data;
      
      const propertiesPromises = accountsCache.map(account => 
        axios.get(`${process.env.REACT_APP_API_URL}/${account.name}/properties`)
          .then(response => ({
            accountId: account.name,
            properties: response.data
          }))
      );

      const propertiesResponses = await Promise.all(propertiesPromises);
      
      // Update the properties cache with the fetched data
      propertiesResponses.forEach(({ accountId, properties }) => {
        propertiesCache[accountId] = properties;
      });
      
      // Save updated cache to localStorage
      saveToStorage();

      return {
        accounts: accountsCache,
        properties: propertiesCache
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    } finally {
      isFetching = false;
    }
  }

  static async fetchPropertiesForAccount(accountName) {
    // Check if already in cache before fetching
    if (propertiesCache[accountName]) {
      console.log(`Using cached properties for ${accountName}`);
      return propertiesCache[accountName];
    }

    try {
      console.log(`Fetching properties for ${accountName}`);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/accounts/${accountName}/properties`);
      propertiesCache[accountName] = response.data;
      
      // Save updated cache to localStorage
      saveToStorage();
      
      return propertiesCache[accountName];
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  static getCachedData() {
    // Try to load from storage if cache is empty
    if (!accountsCache && !Object.keys(propertiesCache).length) {
      loadFromStorage();
    }
    
    return {
      accounts: accountsCache,
      properties: propertiesCache
    };
  }

  // New method to filter properties by selected accounts without API calls
  static getFilteredProperties(selectedAccounts) {
    if (!selectedAccounts || selectedAccounts.length === 0) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(propertiesCache).filter(([accountId]) => 
        selectedAccounts.includes(accountId)
      )
    );
  }
  
  // Method to clear the cache (useful for logout or forced refresh)
  static clearCache() {
    accountsCache = null;
    propertiesCache = {};
    localStorage.removeItem('ga4_audience_cache');
  }
  
  // Method to check if cache is stale (older than specified minutes)
  static isCacheStale(minutes = 60) {
    try {
      const cachedData = localStorage.getItem('ga4_audience_cache');
      if (!cachedData) return true;
      
      const { timestamp } = JSON.parse(cachedData);
      const now = new Date().getTime();
      const staleTime = minutes * 60 * 1000; // Convert minutes to milliseconds
      
      return !timestamp || (now - timestamp > staleTime);
    } catch (error) {
      console.error('Error checking cache age:', error);
      return true; // If there's an error, consider cache stale
    }
  }
  // Add a method to force refresh
  static async refreshData() {
    return this.fetchAllAccountsAndProperties(true);
  }
}

// Keep backward compatibility for existing code
export const fetchAllAccountsAndProperties = DataService.fetchAllAccountsAndProperties;
export const getCachedData = DataService.getCachedData;