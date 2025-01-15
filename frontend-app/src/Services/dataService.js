import axios from 'axios';

let accountsCache = null;
let propertiesCache = {};
let isFetching = false;

export const fetchAllAccountsAndProperties = async () => {
  if (isFetching) return;
  isFetching = true;

  try {
    const accountsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/accounts`);
    accountsCache = accountsResponse.data;
    console.log('accountsCache',accountsCache);
    const propertiesPromises = accountsCache.map(account => 
      axios.get(`${process.env.REACT_APP_API_URL}/${account.name}/properties`)
        .then(response => ({
          accountId: account.name,
          properties: response.data
        }))
    );

    const propertiesResponses = await Promise.all(propertiesPromises);
    propertiesCache = propertiesResponses.reduce((acc, { accountId, properties }) => {
      acc[accountId] = properties;
      return acc;
    }, {});

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
};

export const getCachedData = () => ({
  accounts: accountsCache,
  properties: propertiesCache
});