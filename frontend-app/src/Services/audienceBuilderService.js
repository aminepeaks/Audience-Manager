export class AudienceBuilderService {
  static async buildAndCreateAudience(formData) {
    try {
      // Validate form data
      this.validateFormData(formData);

      // Build audience object
      const audienceObject = this.buildAudienceObject(formData);

      // Create audience through API
      const response = await fetch('/api/audiences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(audienceObject)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create audience');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to build audience: ${error.message}`);
    }
  }

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

  static buildAudienceObject(formData) {
    const { 
      name, 
      description = 'Audience created by the Audience Builder', 
      membershipLifeSpan, 
      conditions, 
      generatedPatterns, 
      properties 
    } = formData;
    
    // Make sure conditions is formatted as expected by the backend
    // The backend expects an array of condition names (strings)
    const processedConditions = Array.isArray(conditions) 
      ? conditions 
      : [conditions];
    
    return {
      name,
      description,
      membershipLifeSpan: parseInt(membershipLifeSpan, 10),
      conditions: processedConditions,
      generatedPatterns: Array.isArray(generatedPatterns) ? generatedPatterns : [generatedPatterns],
      properties: Array.isArray(properties) ? properties : [properties]
    };
  }
}