import axios from 'axios';

export class AudienceService {
  static async fetchAudiencesForProperty(accountName, propertyId) {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/accounts/${accountName}/properties/${propertyId}/audiences`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching audiences:', error);
      throw error;
    }
  }

  static async deleteAudience(accountName, propertyId, audienceName) {
    try {
      console.log(accountName);
      console.log(propertyId);
      console.log(audienceName);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/accounts/${accountName}/properties/${propertyId}/audiences/${audienceName}`
      );
    } catch (error) {
      console.error('Error deleting audience:', error);
      throw error;
    }
  }

  static async createAudience(formData) {
    try {
      console.log(formData);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/createAudience`,
        formData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating audience:', error);
      throw error;
    }
  }
}