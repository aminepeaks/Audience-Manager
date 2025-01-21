import { client } from "../config/oauth.js";
import fs from 'fs';


// **Create Audience**
export const createAudience = async (req, res) => {
  console.log('createAudience', req.body);
  try {
    const { accountName, audienceDefinition, selectedProperties, propertyName } = req.body;

    if (!accountName || !audienceDefinition) {
      return res.status(400).send('Account name and audience definition are required');
    }

    // Fetch properties based on selection
    let properties = selectedProperties ? selectedProperties : await client.listProperties({parent: `accounts/${accountName}`});

    const audiences = [];

    for (let property of properties) {
      const audienceRequest = {
        parent: `accounts/${accountName}/properties/${propertyName || property.property}`,
        audience: {
          description: audienceDefinition.description,
          name: audienceDefinition.name,
          filter: audienceDefinition.filter,
          membershipLifeSpan: audienceDefinition.membershipLifeSpan,
        },
      };

      const [audience] = await client.createAudience(audienceRequest);
      audiences.push(audience);
    }

    res.status(201).json(audiences);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while creating the audience');
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
    // save the audiences to a json file for debugging
    // fs.writeFileSync('audiences.json', JSON.stringify(audiences, null, 2));
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
        filter: audienceDefinition.filter,
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
