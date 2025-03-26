import { client, dataClient } from "../config/oauth.js";
import fs from 'fs';
import conditionsConfig from '../../resources/conditions.json' with { type: 'json' };

const createAudienceObject = (conditionNames, generatedPatterns, name, membershipLifeSpan) => {
  try {
    // Validate inputs
    if (!conditionNames?.length || !generatedPatterns?.length) {
      throw new Error('Missing conditions or generated patterns');
    }

    // Create URL pattern expressions
    const urlPatternExpressions = generatedPatterns.map(pattern => ({
      dimensionOrMetricFilter: {
        fieldName: "landingPagePlusQueryString",
        stringFilter: {
          matchType: "FULL_REGEXP",
          value: pattern
        },
        atAnyPointInTime: true
      }
    }));

    // Process all selected conditions
    let audienceFilterClauses = [];
    
    for (const conditionName of conditionNames) {
      if (!conditionsConfig[conditionName]) {
        console.warn(`Unknown condition: ${conditionName}`);
        continue;
      }
      
      // Get the filter clauses from the conditions config file
      let conditionClauses = structuredClone(conditionsConfig[conditionName]);
      
      // Replace $filterExpressions placeholder with actual URL patterns
      conditionClauses = JSON.parse(
        JSON.stringify(conditionClauses).replace(
          '"filterExpressions":"$filterExpressions"', 
          `"filterExpressions":${JSON.stringify(urlPatternExpressions)}`
        )
      );
      
      // Add this condition's clauses to our audience filter clauses
      audienceFilterClauses = [...audienceFilterClauses, ...conditionClauses];
    }
    
    // If no valid conditions found, throw error
    if (audienceFilterClauses.length === 0) {
      throw new Error('No valid conditions found for audience');
    }

    // Debug output
    fs.writeFileSync('conditionOutput.json', JSON.stringify({
      conditions: conditionNames,
      urlPatternExpressions,
      audienceFilterClauses
    }, null, 2));

    return {
      displayName: name,
      description: `Audience created by GA4 Audience Manager for ${name}`,
      membershipDurationDays: parseInt(membershipLifeSpan, 10),
      filterClauses: audienceFilterClauses
    };
  } catch (error) {
    console.error('Error in createAudienceObject:', error);
    throw error;
  }
};

// Helper function to retrieve condition configuration
const getConditionConfig = (conditionName) => {
  if (!conditionsConfig) {
    console.error('Conditions config is undefined or null');
    throw new Error('Conditions configuration not loaded properly');
  }
  
  if (!conditionsConfig[conditionName]) {
    console.error(`Unknown condition: ${conditionName}. Available conditions: ${Object.keys(conditionsConfig).join(', ')}`);
    throw new Error(`Unknown condition: ${conditionName}`);
  }
  console.log('conditionsConfig', conditionsConfig);
  const config = conditionsConfig[conditionName];
  
  if (!config.eventName) {
    console.error(`Missing eventName for condition: ${conditionName}`, config);
    throw new Error(`Invalid condition configuration: Missing eventName for ${conditionName}`);
  }
  
  return config;
};

// **Create Audience**
export const createAudience = async (req, res) => {
  try {
    // Get data from either the request body or path parameters
    const { conditions, generatedPatterns, name, membershipLifeSpan, description } = req.body;
    
    // Validate that conditions is an array of strings
    if (!Array.isArray(conditions) || !conditions.every(c => typeof c === 'string')) {
      return res.status(400).json({
        error: 'Conditions must be an array of condition names (strings)'
      });
    }
    
    // If properties is not in the request body, construct it from path parameters
    let properties = req.body.properties;
    console.log('Using properties from request body:', properties);
    
    // Handle route with path parameters
    if (!properties && req.params.propertyId) {
      properties = [req.params.propertyId];
      console.log('Using property from path parameters:', properties);
    }
    
    // Validate required fields
    const requiredFields = { conditions, properties, name, membershipLifeSpan };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length) {
      return res.status(400).json({
        error: 'Missing required fields',
        fields: missingFields
      });
    }

    // Create audiences in parallel
    const audiences = await Promise.all(
      properties.map(async (propertyId) => {
        console.log('Creating audience for property:', propertyId);
        const formattedPropertyId = propertyId.startsWith('properties/') 
          ? propertyId 
          : `properties/${propertyId}`;

        const audienceRequest = {
          parent: formattedPropertyId,
          audience: createAudienceObject(conditions, generatedPatterns, name, membershipLifeSpan)
        };

        // Debug log
        fs.writeFileSync('audienceRequest.json', JSON.stringify(audienceRequest, null, 2));

        const [audience] = await client.createAudience(audienceRequest);
        return audience;
      })
    );

    return res.status(201).json(audiences);

  } catch (error) {
    const errorMessage = error.message || 'An error occurred while creating the audience';
    console.error('Create audience error:', error);
    return res.status(500).json({ error: errorMessage });
  }
};

// **List Audiences**
export const listAudiences = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const formattedPropertyId = propertyId.startsWith('properties/') ? 
      propertyId : `properties/${propertyId}`;
    console.log('formattedPropertyId', formattedPropertyId);
    const [audiences] = await client.listAudiences({
      parent: formattedPropertyId
    });
    
    res.json(audiences);
  } catch (err) {
    console.error('List audiences error:', err);
    res.status(500).send('An error occurred while fetching audiences');
  }
};

// **Get Audience**
export const getAudience = async (req, res) => {
  try {
    const { accountName, audienceId } = req.params;

    const [audience] = await client.getAudience({ name: `accounts/${accountName}/audiences/${audienceId}` });
    res.json(audience);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while fetching the audience');
  }
};

// **Update Audience**
export const updateAudience = async (req, res) => {
  try {
    const { accountName, audienceId } = req.params;
    const { audienceDefinition } = req.body;

    if (!audienceDefinition) {
      return res.status(400).send('Audience definition is required');
    }

    const audienceRequest = {
      audience: {
        description: audienceDefinition.description,
        name: audienceDefinition.name,
        filterClauses: audienceDefinition.filter,
        membershipLifeSpan: audienceDefinition.membershipLifeSpan,
      },
    };

    const [audience] = await client.updateAudience({
      audience: audienceRequest.audience,
      updateMask: audienceDefinition.updateMask,
    });

    res.json(audience);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while updating the audience');
  }
};

// **Delete Audience**
export const deleteAudience = async (req, res) => {
  try {
    const { propertyId, audienceId } = req.params;
    console.log('archiveAudience', propertyId, audienceId);
    
    await client.archiveAudience({ 
      name: `properties/${propertyId}/audiences/${audienceId}` 
    });
    res.status(204).send();
  } catch (err) {
    console.error('Error archiving audience:', err);
    res.status(500).json({
      error: 'An error occurred while archiving the audience',
      details: err.message
    });
  }
};

// get audience lists using data api
export const listAudiencesDataApi = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const formattedPropertyId = propertyId.startsWith('properties/')
      ? propertyId
      : `properties/${propertyId}`;
    console.log('formattedPropertyId', formattedPropertyId);
    
    const audienceIterator = dataClient.listAudienceExportsAsync({
      parent: formattedPropertyId,
    });

    const audiences = [];
    for await (const audience of audienceIterator) {
      audiences.push(audience);
    }

    res.json({ audiences });
  } catch (err) {
    console.error('List audiences error:', err);
    res.status(500).send('An error occurred while fetching audiences');
  }
};