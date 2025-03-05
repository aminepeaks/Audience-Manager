import { client, dataClient } from "../config/oauth.js";
import fs from 'fs';
import { getFilterClausesByCondition } from '../config/index.js';

const createAudienceObject = (conditions, generatedPatterns, name, membershipLifeSpan) => {
  try {
    // Debug log
    fs.writeFileSync(
      'audienceRequest.json', 
      JSON.stringify({ conditions, generatedPatterns, name, membershipLifeSpan }, null, 2)
    );
  } catch (error) {
    console.warn('Failed to write debug file:', error);
  }

  // Validate inputs
  if (!conditions || !conditions.length || !generatedPatterns || !generatedPatterns.length) {
    throw new Error('Invalid conditions or patterns');
  }

  // Create filter expressions based on generated patterns
  const filterExpressions = generatedPatterns.map(pattern => ({
    dimensionOrMetricFilter: {
      fieldName: "landingPagePlusQueryString",
      stringFilter: {
        matchType: "FULL_REGEXP",
        value: pattern
      },
      atAnyPointInTime: true
    }
  }));

  // Get filter clauses using the condition and replace placeholders
  const filterClauses = getFilterClausesByCondition(conditions[0], filterExpressions);

  return {
    description: 'Audience created by the Audience Builder',
    displayName: name,
    filterClauses: filterClauses,
    membershipDurationDays: membershipLifeSpan
  };
};

// **Create Audience**
export const createAudience = async (req, res) => {
  try {
    const { conditions, properties, generatedPatterns, name, membershipLifeSpan, description } = req.body;

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