import axios from 'axios';

// Cache variables
let accountsCache = null;
let propertiesCache = {};
let isFetching = false;

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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/${accountName}/properties`);
      propertiesCache[accountName] = response.data;
      return propertiesCache[accountName];
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  static getCachedData() {
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
}

// Keep backward compatibility for existing code
export const fetchAllAccountsAndProperties = DataService.fetchAllAccountsAndProperties;
export const getCachedData = DataService.getCachedData;