import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../state/store';
import { AudienceService } from '../Services/audienceService';
import { AudienceBuilderService } from '../Services/audienceBuilderService';

export const useAudiences = (selectedProperties = []) => {
  const { setAudiences: setGlobalAudiences, setLoading, setError } = useStore();
  const [audiences, setAudiences] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const fetchAudiences = useCallback(async () => {
    if (!selectedProperties || selectedProperties.length === 0) {
      setAudiences([]);
      return;
    }
    
    try {
      setLocalLoading(true);
      setLoading(true);
      
      const audiencesPromises = selectedProperties.map(async (propertyPath) => {
        try {
          // Extract account name and property ID from path
          const pathParts = propertyPath.split('/');
          // Format should be like "accounts/{accountName}/properties/{propertyId}"
          const propertyId = pathParts.pop(); // Last part is propertyId
          pathParts.pop(); // Remove "properties"
          const accountName = pathParts.pop(); // Get account name
          
          const audiencesData = await AudienceService.fetchAudiencesForProperty(accountName, propertyId);
          
          // Add source property to each audience for identification
          return audiencesData.map(audience => ({
            ...audience,
            sourceProperty: propertyPath
          }));
        } catch (error) {
          console.error(`Error fetching audiences for property ${propertyPath}:`, error);
          return []; // Return empty array for this property to continue with others
        }
      });
      
      const results = await Promise.all(audiencesPromises);
      const allAudiences = results.flat();
      
      setAudiences(allAudiences);
      setGlobalAudiences(allAudiences);
      
      setLocalError(null);
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch audiences';
      setLocalError(errorMessage);
      setError(errorMessage);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  }, [selectedProperties, setGlobalAudiences, setLoading, setError]);

  // Fetch audiences when selected properties change
  useEffect(() => {
    fetchAudiences();
  }, [selectedProperties, fetchAudiences]);

  const createAudience = useCallback(async (audienceData) => {
    try {
      setLocalLoading(true);
      setLoading(true);
      
      const result = await AudienceBuilderService.buildAndCreateAudience(audienceData);
      await fetchAudiences(); // Refresh the audiences list
      
      setLocalError(null);
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to create audience';
      setLocalError(errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  }, [fetchAudiences, setLoading, setError]);

  const deleteAudience = useCallback(async (propertyId, audienceName) => {
    try {
      setLocalLoading(true);
      setLoading(true);
      
      // Extract account name and property ID from path
      let accountName, propertyIdToUse;
      
      if (propertyId.includes('/')) {
        const pathParts = propertyId.split('/');
        propertyIdToUse = pathParts.pop(); // Last part is propertyId
        pathParts.pop(); // Remove "properties"
        accountName = pathParts.pop(); // Get account name
      } else {
        propertyIdToUse = propertyId;
        // This would be a fallback but is likely incorrect
        accountName = "unknown"; 
      }
      
      // Extract just the audience ID from the full path if needed
      const audienceIdOnly = audienceName.includes('/') 
        ? audienceName.split('/').pop() 
        : audienceName;
      
      await AudienceService.deleteAudience(accountName, propertyIdToUse, audienceIdOnly);
      
      setLocalError(null);
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete audience';
      setLocalError(errorMessage);
      setError(errorMessage);
      return { success: false, error };
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  }, [setLoading, setError]);

  const deleteAudienceBatch = async (propertyPath, audienceIds) => {
    setLoading(true);
    try {
      // Extract account name and property ID from path
      let accountName, propertyId;
      
      if (propertyPath.includes('/')) {
        const pathParts = propertyPath.split('/');
        propertyId = pathParts.pop(); // Last part is propertyId
        pathParts.pop(); // Remove "properties" 
        accountName = pathParts.pop(); // Get account name
      } else {
        propertyId = propertyPath;
        accountName = "unknown";
      }
      
      // Extract just the IDs from any paths in the array
      const audienceIdsOnly = audienceIds.map(id => 
        id.includes('/') ? id.split('/').pop() : id
      );
      
      await AudienceService.deleteAudienceBatch(accountName, propertyId, audienceIdsOnly);
      // Update state after successful deletion
      setAudiences(prevAudiences => prevAudiences.filter(audience => !audienceIdsOnly.includes(audience.id)));
      setGlobalAudiences(prevAudiences => prevAudiences.filter(audience => !audienceIdsOnly.includes(audience.id)));
      return { success: true };
    } catch (error) {
      setError('Failed to delete audiences: ' + error.message);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const exportAudienceBatch = (selectedAudiences) => {
    try {
      return AudienceService.exportAudienceBatch(selectedAudiences);
    } catch (error) {
      setError('Failed to export audiences: ' + error.message);
      return false;
    }
  };

  return {
    audiences,
    loading: localLoading,
    error: localError,
    fetchAudiences,
    createAudience,
    deleteAudience,
    deleteAudienceBatch,
    exportAudienceBatch
  };
};

export default useAudiences;