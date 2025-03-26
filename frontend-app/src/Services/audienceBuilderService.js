import axios from 'axios';

export class AudienceBuilderService {
//   static async buildAndCreateAudience(formData) {
//     try {
//       // Validate form data
//       this.validateFormData(formData);
  
//       // Extract property info from formData
//       let propertyId, accountName;
      
//       // Add defensive extraction of property path information
//       if (formData.properties && formData.properties.length > 0) {
//         const propertyPath = formData.properties[0];
        
//         // Check if it's a full path or just an ID
//         if (propertyPath.includes('/')) {
//           const pathParts = propertyPath.split('/');
//           propertyId = pathParts.pop(); // Get the last part as propertyId
          
//           // Look for "accounts" in the path to find the account name
//           const accountsIndex = pathParts.indexOf('accounts');
//           if (accountsIndex !== -1 && accountsIndex + 1 < pathParts.length) {
//             accountName = pathParts[accountsIndex + 1];
//           }
//         } else {
//           // If it's just an ID, use it directly
//           propertyId = propertyPath;
          
//           // Try to get account from formData if available
//           accountName = formData.accountName || 'default'; 
//         }
        
//         // Validate we have what we need
//         if (!propertyId) {
//           throw new Error('Could not extract property ID from provided data');
//         }
//       } else {
//         throw new Error('No properties selected for audience creation');
//       }

//       console.log(`Creating audience for property ${propertyId}`);
  
//       // Create the request payload in the format expected by the backend
//       const requestPayload = {
//         name: formData.name,
//         description: formData.description || 'Audience created by the Audience Builder',
//         membershipLifeSpan: parseInt(formData.membershipLifeSpan, 10),
//         // Simply pass the condition names array instead of objects
//         conditions: formData.conditions,
//         generatedPatterns: Array.isArray(formData.generatedPatterns) 
//           ? formData.generatedPatterns 
//           : [formData.generatedPatterns],
//         properties: [propertyId]
//       };
      
//       // Use the /createAudience endpoint instead
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL}/createAudience`,
// requestPayload
// );

//       return response.data;
//     } catch (error) {
//       throw new Error(`Failed to build audience: ${error.message}`);
//     }
//   }

  static validateFormData(formData) {
    const requiredFields = ['name', 'membershipLifeSpan', 'properties', 'conditions', 'generatedPatterns'];
    const missingFields = requiredFields.filter(field => {
      // For arrays, check if they exist and have content
      if (Array.isArray(formData[field])) {
        return !formData[field] || formData[field].length === 0;
      }
      return !formData[field];
    });
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Build and create an audience across multiple properties
   */
  static async buildAndCreateAudienceForMultipleProperties(formData) {
    try {
      console.log('Creating audience for multiple properties:', formData);
      this.validateFormData(formData);
      
      // Send a single request with all properties
      const requestPayload = {
        name: formData.name,
        description: formData.description || 'Audience created by the Audience Manager',
        membershipLifeSpan: parseInt(formData.membershipLifeSpan, 10),
        conditions: formData.conditions,
        generatedPatterns: Array.isArray(formData.generatedPatterns) 
          ? formData.generatedPatterns 
          : [formData.generatedPatterns],
        properties: formData.properties // Send all properties at once
      };
  
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/createAudience`,
        requestPayload
      );
  
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      throw new Error(errorMessage);
    }
  }
}