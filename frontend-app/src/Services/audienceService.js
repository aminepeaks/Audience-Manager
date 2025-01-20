import axios from 'axios';

export const fetchAudiencesForProperty = async (accountName, propertyId) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/accounts/${accountName}/properties/${propertyId}/audiences`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching audiences:', error);
    throw error;
  }
};

export const deleteAudience = async (propertyId, audiencename) => {
  try {
    await axios.delete(
      `${process.env.REACT_APP_API_URL}/${audiencename}`
    );
  } catch (error) {
    console.error('Error deleting audience:', error);
    throw error;
  }
};

export const createAudience = async (accountName, audienceData) => {
  try {
    console.log('createAudience', accountName, audienceData);
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/accounts/${accountName}/audiences`,
      audienceData
    );
    return response.data;
  } catch (error) {
    
    console.error('Error creating audience:', error);
    throw error;
  }
};